#!/usr/bin/env python3
"""Validate the content and build dist/index.html (the builder, with content + runtimes embedded).

    python scripts/build.py            # build, print warnings
    python scripts/build.py --strict   # warnings count as errors (CI and before every push)

Also writes dist/kit.js (layouts + assembler + content) so the dev scripts can render decks headless.
"""
import base64, datetime, hashlib, json, re, sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"
SECTIONS = ["frame", "why", "how", "where", "what", "start"]
LAYOUTS = {
    "cover", "agenda", "statement", "stats-ladder", "cards-3", "cards-3-numbered", "cards-4-steps", "cards-5",
    "cards-6", "engine-4", "steps-3", "steps-5", "hub-compare", "principle-3", "gates-anim", "foundation",
    "options-3", "compare-2", "compare-2-proscons", "table", "architecture", "questions", "self-check", "faq", "thanks",
}
RUNTIME_VARS = {"client", "preset.title", "preset.subtitle"}
PLACEHOLDER = re.compile(r"\{\{\s*([\w.]+)\s*\}\}")
REQUIRED = ["id", "section", "title", "layout", "audience", "minutes", "origin", "slide"]

errors, warnings = [], []
def err(msg): errors.append(msg)
def warn(msg): warnings.append(msg)


def load(p):
    with open(p, encoding="utf-8") as f:
        return yaml.safe_load(f)


# ───────────────────────── facts
def fact_lookup(facts, path, lang):
    node, parent, key = facts, None, None
    for part in path.split("."):
        if not isinstance(node, dict) or part not in node:
            return None
        parent, key, node = node, part, node[part]
    if lang == "zh" and isinstance(parent, dict) and f"{key}_zh" in parent:
        node = parent[f"{key}_zh"]
    if isinstance(node, dict):
        return None  # must point at a leaf (e.g. facts.product.local_model.value)
    return str(node)


def stale_facts(facts, today, prefix=""):
    out = []
    for k, v in (facts or {}).items():
        if isinstance(v, dict):
            rb = v.get("review_by")
            if rb and str(rb) < today:
                out.append(f"{prefix}{k}")
            out += stale_facts(v, today, f"{prefix}{k}.")
    return out


def resolve(value, facts, lang, where, used):
    """Resolve {{facts.*}} at build time; leave runtime placeholders; fail on anything unknown."""
    if isinstance(value, str):
        def sub(m):
            key = m.group(1)
            if key in RUNTIME_VARS:
                return m.group(0)
            if key.startswith("facts."):
                v = fact_lookup(facts, key[6:], lang)
                if v is None:
                    err(f"{where}: unknown fact placeholder {{{{{key}}}}}")
                    return m.group(0)
                used.add(key[6:])
                return v
            err(f"{where}: unknown placeholder {{{{{key}}}}}")
            return m.group(0)
        return PLACEHOLDER.sub(sub, value)
    if isinstance(value, list):
        return [resolve(v, facts, lang, where, used) for v in value]
    if isinstance(value, dict):
        return {k: resolve(v, facts, lang, where, used) for k, v in value.items()}
    return value


def shape(v):
    if isinstance(v, dict):
        return {k: shape(x) for k, x in v.items()}
    if isinstance(v, list):
        return [shape(x) for x in v]
    return "·"


# ───────────────────────── modules
def load_modules(facts, today):
    mods, seen = {}, {}
    stale = set(stale_facts(facts, today))
    for p in sorted((ROOT / "content/modules").glob("*/*.yaml")):
        rel = p.relative_to(ROOT)
        m = load(p) or {}
        for f in REQUIRED:
            if f not in m:
                err(f"{rel}: missing field '{f}'")
        if errors and any(str(rel) in e for e in errors):
            continue
        mid = m["id"]
        if p.stem != mid:
            err(f"{rel}: file name must match id '{mid}'")
        if mid in seen:
            err(f"{rel}: duplicate id (also in {seen[mid]})")
        seen[mid] = rel
        if m["section"] not in SECTIONS or p.parent.name != m["section"]:
            err(f"{rel}: section '{m['section']}' must be one of {SECTIONS} and match its folder")
        if m["layout"] not in LAYOUTS:
            err(f"{rel}: unknown layout '{m['layout']}'")
        if m["origin"] not in ("extracted", "proposed", "approved"):
            err(f"{rel}: origin must be extracted | proposed | approved")
        for banned in ("notes", "inputs"):
            if banned in m or (isinstance(m.get("slide"), dict) and banned in m["slide"]):
                err(f"{rel}: modules may not have '{banned}' (HANDOFF §5.1)")
        en_raw = m["slide"]
        zh_raw = m.get("zh")
        if zh_raw is None:
            warn(f"{rel}: no zh: block yet (Chinese falls back to English)")
            zh_raw = en_raw
        elif shape(zh_raw) != shape(en_raw):
            err(f"{rel}: zh: block must have exactly the same keys and list lengths as slide:")
        if m.get("zh") is not None and m.get("zh_status") not in ("draft", "reviewed"):
            err(f"{rel}: zh_status must be draft | reviewed")
        used = set()
        en = resolve(en_raw, facts, "en", rel, used)
        zh = resolve(zh_raw, facts, "zh", rel, used)
        mods[mid] = {
            "id": mid, "section": m["section"], "title": m["title"], "title_zh": m.get("title_zh"),
            "layout": m["layout"], "audience": m["audience"], "minutes": m["minutes"], "origin": m["origin"],
            "zh_status": m.get("zh_status", "missing" if m.get("zh") is None else "draft"),
            "stale": sorted(f for f in used if any(f == s or f.startswith(s + ".") for s in stale)),
            "slide": {"en": en, "zh": zh},
        }
    return mods


def check_site(site, mods):
    ids = set(mods)
    for n, p in site["presets"].items():
        for part in ("main", "appendix"):
            for mid in p.get(part, []):
                if mid not in ids:
                    err(f"site.yaml presets.{n}.{part}: unknown module '{mid}'")
                elif mods[mid]["origin"] == "proposed":
                    err(f"site.yaml presets.{n}.{part}: '{mid}' is origin: proposed and can't be in a preset")
        if p["main"][:2] != ["cover", "agenda"] or p["main"][-1] != "thank-you":
            err(f"site.yaml presets.{n}.main must start with cover, agenda and end with thank-you")
    for n, lst in site["it_overlay"].items():
        for mid in lst:
            if mid not in ids:
                err(f"site.yaml it_overlay.{n}: unknown module '{mid}'")
            elif mods[mid]["section"] != "where":
                err(f"site.yaml it_overlay.{n}: '{mid}' must be in the Where section")


def check_renderers(mods):
    have_html = {p.name[:-8] for p in (ROOT / "layouts").glob("*.html.js")}
    have_pptx = {p.name[:-8] for p in (ROOT / "layouts").glob("*.pptx.js")}
    used = sorted({m["layout"] for m in mods.values()})
    for l in used:
        if l not in have_html:
            warn(f"layout '{l}': no HTML renderer yet (layouts/{l}.html.js)")
        if l not in have_pptx:
            warn(f"layout '{l}': no PPTX renderer yet (layouts/{l}.pptx.js)")
    return have_html, have_pptx


def resolve_site_links(site, facts):
    for item in site.get("top_links", []):
        item["url"] = resolve(item["url"], facts, "en", "site.yaml top_links", set())


# ───────────────────────── output
def read(p):
    return (ROOT / p).read_text(encoding="utf-8")


def js_literal(obj):
    s = json.dumps(obj, ensure_ascii=False, separators=(",", ":"))
    return s.replace("</", "<\\/").replace("\u2028", "\\u2028").replace("\u2029", "\\u2029")


def build_kit(content, have_html, have_pptx):
    logo = "data:image/png;base64," + base64.b64encode((ROOT / "assets/logo.png").read_bytes()).decode()
    parts = ["/* yonwork-deck-builder kit · generated by scripts/build.py — do not edit */"]
    parts.append(read("vendor/qrcode-generator/qrcode.js"))
    parts.append(read("layouts/_lib.js"))
    parts.append(read("layouts/_metrics.js"))
    for name in sorted(have_html):
        parts.append(read(f"layouts/{name}.html.js"))
    for name in sorted(have_pptx):
        parts.append(read(f"layouts/{name}.pptx.js"))
    parts.append(read("app/assemble.js"))
    parts.append(read("vendor/pptxgenjs/pptxgen.bundle.js"))
    parts.append(read("app/pptx.js"))
    scenes = read("runtime/scenes.js") if (ROOT / "runtime/scenes.js").exists() else ""
    assets = {"css": read("runtime/deck.css"), "js": read("runtime/deck.js"), "scenes": scenes, "logo": logo}
    parts.append("YW.CONTENT=" + js_literal(content) + ";")
    parts.append("YW.ASSETS=" + js_literal(assets) + ";")
    return "\n".join(parts)


def main():
    strict = "--strict" in sys.argv
    today = datetime.date.today().isoformat()
    site = load(ROOT / "site.yaml")
    facts = load(ROOT / "content/facts.yaml")
    for f in stale_facts(facts, today):
        warn(f"content/facts.yaml: '{f}' is past its review_by date; check it before use")
    mods = load_modules(facts, today)
    sys.path.insert(0, str(ROOT / "scripts"))
    import lint as content_lint
    le, lw = content_lint.lint()
    errors.extend(le); warnings.extend(lw)
    check_site(site, mods)
    have_html, have_pptx = check_renderers(mods)
    resolve_site_links(site, facts)

    order = [m["id"] for s in SECTIONS for m in mods.values() if m["section"] == s]
    i18n = load(ROOT / "app/i18n.yaml")
    for grp, items in i18n.items():
        for k, v in items.items():
            if not (isinstance(v, dict) and v.get("en") and v.get("zh")):
                err(f"app/i18n.yaml: {grp}.{k} needs both en and zh")
    content = {"version": str(site["version"]), "built": today, "site": site, "order": order, "i18n": i18n,
               "modules": {k: mods[k] for k in order}, "links": facts["links"]}
    content["contentHash"] = hashlib.sha1(json.dumps(content, sort_keys=True, ensure_ascii=False).encode()).hexdigest()[:8]

    for w in warnings:
        print(f"warning: {w}")
    for e in errors:
        print(f"ERROR: {e}")
    if errors or (strict and warnings):
        print(f"\nbuild failed: {len(errors)} error(s), {len(warnings)} warning(s)" + (" (strict)" if strict else ""))
        sys.exit(1)

    DIST.mkdir(exist_ok=True)
    kit = build_kit(content, have_html, have_pptx)
    (DIST / "kit.js").write_text(kit, encoding="utf-8")
    page = read("app/index.html")
    page = page.replace("/*@APP_CSS*/", read("runtime/deck.css") + "\n" + read("app/app.css"))
    page = page.replace("/*@KIT*/", kit.replace("</script", "<\\/script"))
    icon = "data:image/png;base64," + base64.b64encode((ROOT / "assets/yonwork-icon.png").read_bytes()).decode()
    word = "data:image/svg+xml;base64," + base64.b64encode((ROOT / "assets/yonwork-wordmark.svg").read_bytes()).decode()
    page = page.replace("<!--@TOPBAR-->", read("app/partials/topbar.html").replace("@ICON@", icon).replace("@WORDMARK@", word))
    page = page.replace("/*@SHARE_JS*/", read("app/share.js"))
    page = page.replace("/*@APP_JS*/", read("app/app.js"))
    if content_lint.scan_dist(page):
        print("ERROR: dist/index.html contains a raw/denylist.txt term"); sys.exit(1)
    (DIST / "index.html").write_text(page, encoding="utf-8")
    print(f"built dist/index.html ({len(page) // 1024} KB) · {len(mods)} modules · "
          f"{len(have_html)} HTML / {len(have_pptx)} PPTX layouts · {len(errors)} errors, {len(warnings)} warnings")


if __name__ == "__main__":
    main()
