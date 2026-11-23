#!/usr/bin/env python3
"""Export every preset × IT on/off × EN/ZH as .pptx (same code as the builder) and check it.

    .venv/bin/python scripts/check_pptx.py            # checks + LibreOffice → PNG in shots/pptx/
    .venv/bin/python scripts/check_pptx.py --no-render

Checks: opens in python-pptx, slide count, no empty text boxes, font per language (Arial / Microsoft YaHei),
estimated text overflow per box, nothing outside the slide, zero raw/denylist.txt hits (terms never printed).
Needs python-pptx, Pillow, PyMuPDF (dev only) and LibreOffice (`soffice`) for the PNG render.
"""
import argparse, json, shutil, subprocess, sys, tempfile
from pathlib import Path

from PIL import ImageFont
from pptx import Presentation
from pptx.util import Emu

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "shots" / "pptx"
DECKS = ROOT / "shots" / "decks"
FONTS = {False: "/System/Library/Fonts/Supplemental/Arial.ttf", True: "/System/Library/Fonts/Supplemental/Arial Bold.ttf"}
EXPECT_FONT = {"en": "Arial", "zh": "Microsoft YaHei"}
NS = "{http://schemas.openxmlformats.org/drawingml/2006/main}"
_font_cache = {}


def font(size, bold):
    key = (round(size), bold)
    if key not in _font_cache:
        _font_cache[key] = ImageFont.truetype(FONTS[bold], max(1, round(size)))
    return _font_cache[key]


LATIN_SCALE = {"en": 1.0, "zh": 1.1}   # Microsoft YaHei's Latin glyphs run ~10% wider than Arial
_lang = ["en"]


def is_cjk(ch):
    o = ord(ch)
    return 0x2E80 <= o <= 0x9FFF or 0xAC00 <= o <= 0xD7AF or 0xF900 <= o <= 0xFAFF or 0xFE30 <= o <= 0xFE4F or 0xFF00 <= o <= 0xFFEF


def text_width(s, size, bold):
    w = 0.0
    for ch in s:
        w += size if is_cjk(ch) else font(size, bold).getlength(ch) * LATIN_SCALE[_lang[0]]
    return w


def para_lines(text, size, bold, box_w):
    tokens, cur, n = [], "", 1
    for ch in text:  # split into words, and every CJK char is its own token
        if is_cjk(ch):
            if cur: tokens.append(cur); cur = ""
            tokens.append(ch)
        else:
            cur += ch
            if ch == " ": tokens.append(cur); cur = ""
    if cur: tokens.append(cur)
    line = 0.0
    for t in tokens:
        tw = text_width(t, size, bold)
        if line + tw > box_w + 0.5 and line > 0:
            n += 1; line = text_width(t.lstrip(), size, bold)
        else:
            line += tw
    return n


def check_shape(sh, lang, sw, sh_h, where, issues):
    has_text = sh.has_text_frame and sh.text_frame.text.strip()
    if has_text and (sh.left < -9525 or sh.top < -9525 or sh.left + sh.width > sw + 9525 or sh.top + sh.height > sh_h + 9525):
        issues.append(f"{where}: text box '{sh.text_frame.text[:30]}' sits outside the slide")  # decorative shapes may bleed
    if not sh.has_text_frame:
        return
    _lang[0] = lang
    tf = sh.text_frame
    if not tf.text.strip():
        if any(r.text for p in tf.paragraphs for r in p.runs) or sh.shape_type == 17 or "Text" in sh.name:
            issues.append(f"{where}: empty text box '{sh.name}'")
        return
    # fonts
    for p in tf.paragraphs:
        for r in p.runs:
            rpr = r._r.find(f"{NS}rPr")
            latin = rpr.find(f"{NS}latin") if rpr is not None else None
            face = latin.get("typeface") if latin is not None else None
            ok = face == EXPECT_FONT[lang] or (lang == "en" and face == EXPECT_FONT["zh"] and any(is_cjk(c) for c in r.text))
            if not ok:
                issues.append(f"{where}: run '{r.text[:24]}' uses font {face!r}, expected {EXPECT_FONT[lang]!r}")
                return
    # overflow estimate (pt): sum of paragraph heights vs box height
    box_w = Emu(sh.width).pt
    box_h = Emu(sh.height).pt
    need = 0.0
    bp = tf._txBody.find(f"{NS}bodyPr")
    for p in tf.paragraphs:
        runs = [r for r in p.runs if r.text]
        if not runs:
            continue
        size = max((r.font.size.pt if r.font.size else 18) for r in runs)
        bold = any(r.font.bold for r in runs)
        lsm = p.line_spacing if isinstance(p.line_spacing, float) else 1.0
        lines = para_lines("".join(r.text for r in runs), size, bold, box_w)
        need += lines * size * 1.2 * lsm
    if bp is not None and bp.get("anchor") == "ctr":
        pass
    if need > box_h + 3:
        issues.append(f"{where}: text may overflow '{tf.text[:40]}…' (needs ~{need:.0f}pt, box {box_h:.0f}pt)")


def denylist():
    p = ROOT / "raw" / "denylist.txt"
    if not p.exists():
        return []
    return [l.strip().lower() for l in p.read_text(encoding="utf-8").splitlines() if l.strip() and not l.startswith("#")]


# Render-only font stand-in: Microsoft YaHei isn't on macOS, and headless LibreOffice can't read the system's .ttc
# Chinese fonts. So the check render copies Arial Unicode (a plain .ttf with CJK) into a throwaway LibreOffice profile
# and points YaHei runs at it in a temporary copy of the file. The exported .pptx itself is never changed.
CJK_STANDIN = Path("/System/Library/Fonts/Supplemental/Arial Unicode.ttf")


def render_png(pptx_path, dest):
    soffice = shutil.which("soffice")
    if not soffice:
        return "LibreOffice not found; skipped PNG render"
    import pymupdf, zipfile
    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)
        src = tmp / pptx_path.name
        if CJK_STANDIN.exists():
            (tmp / "profile/user/fonts").mkdir(parents=True)
            shutil.copy(CJK_STANDIN, tmp / "profile/user/fonts")
            with zipfile.ZipFile(pptx_path) as zi, zipfile.ZipFile(src, "w", zipfile.ZIP_DEFLATED) as zo:
                for it in zi.infolist():
                    data = zi.read(it.filename)
                    if it.filename.endswith(".xml"):
                        data = data.replace(b"Microsoft YaHei", b"Arial Unicode MS")
                    zo.writestr(it, data)
        else:
            shutil.copy(pptx_path, src)
        subprocess.run([soffice, "--headless", f"-env:UserInstallation=file://{tmp}/profile", "--convert-to", "pdf",
                        "--outdir", str(tmp), str(src)], check=True, capture_output=True, timeout=180)
        dest.mkdir(parents=True, exist_ok=True)
        for old in dest.glob("*.png"):
            old.unlink()
        doc = pymupdf.open(tmp / (src.stem + ".pdf"))
        for i, page in enumerate(doc, 1):
            page.get_pixmap(dpi=96).save(dest / f"{i:02d}.png")
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--no-render", action="store_true")
    ap.add_argument("--client", default="Acme Trading")
    a = ap.parse_args()
    subprocess.run(["node", str(ROOT / "scripts/render_deck.js"), str(DECKS), "--pptx", "--client", a.client],
                   check=True, capture_output=True)
    manifest = json.loads((DECKS / "manifest.json").read_text())
    terms, issues, notes, n_files = denylist(), [], [], 0
    for m in manifest:
        for lang, info in (m.get("pptx") or {}).items():
            path = DECKS / info["file"]
            prs = Presentation(path)
            n_files += 1
            where0 = info["file"]
            if len(prs.slides) != info["slides"]:
                issues.append(f"{where0}: {len(prs.slides)} slides, expected {info['slides']}")
            if info["missing"]:
                notes.append(f"{where0}: placeholder slides for layouts {', '.join(info['missing'])}")
            alltext = []
            for i, slide in enumerate(prs.slides, 1):
                for sh in slide.shapes:
                    check_shape(sh, lang, prs.slide_width, prs.slide_height, f"{where0} slide {i}", issues)
                    if sh.has_text_frame:
                        alltext.append(sh.text_frame.text)
            blob = "\n".join(alltext).lower()
            hits = sum(1 for t in terms if t in blob)
            if hits:
                issues.append(f"{where0}: {hits} denylist term(s) found (see raw/denylist.txt)")
            if not a.no_render:
                msg = render_png(path, OUT / path.stem)
                if msg and msg not in notes:
                    notes.append(msg)
    for n in notes:
        print(f"note: {n}")
    for i in issues:
        print(f"ISSUE: {i}")
    print(f"\n{n_files} pptx files checked · {len(issues)} issue(s)" + ("" if a.no_render else f" · PNGs in {OUT.relative_to(ROOT)}/"))
    return 1 if issues else 0


if __name__ == "__main__":
    sys.exit(main())
