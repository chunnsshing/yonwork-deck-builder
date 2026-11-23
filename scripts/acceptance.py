#!/usr/bin/env python3
"""Run every HANDOFF §13 acceptance check in one go (dev machine: needs .venv, Chrome, LibreOffice).

    .venv/bin/python scripts/acceptance.py

Runs build --strict, lint, screenshot.py (EN + ZH, normal and long client name), check_pptx.py, test_builder.py,
then the checks below that the other scripts don't cover: QR codes decode to the right URLs (HTML and PPTX),
denylist scan of every export, keys, reduced motion. Prints a §13 checklist.
"""
import json, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PY = sys.executable
LONG = "新加坡亚太精密制造私人有限公司 (Asia-Pacific) Pte. Ltd."
rows = []


def run(name, cmd, timeout=900):
    r = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True, timeout=timeout)
    tail = (r.stdout + r.stderr).strip().splitlines()[-1:] or [""]
    rows.append((name, r.returncode == 0, tail[0]))
    print(("PASS " if r.returncode == 0 else "FAIL ") + name + " — " + tail[0])
    return r.returncode == 0


def ok(name, cond, detail=""):
    rows.append((name, bool(cond), detail))
    print(("PASS " if cond else "FAIL ") + name + (" — " + detail if detail else ""))


def main():
    sys.path.insert(0, str(ROOT / "scripts"))
    run("build.py --strict", [PY, "scripts/build.py", "--strict"])
    run("lint.py", [PY, "scripts/lint.py"])
    run("screenshots + overflow, long client name, EN+ZH", [PY, "scripts/screenshot.py", "--no-shots", "--client", LONG])
    run("PPTX checks, long client name", [PY, "scripts/check_pptx.py", "--no-render", "--client", LONG])
    run("screenshots + overflow, all presets, EN+ZH", [PY, "scripts/screenshot.py"])
    run("PPTX checks + LibreOffice render", [PY, "scripts/check_pptx.py"])
    run("builder end-to-end", [PY, "scripts/test_builder.py"])

    import cv2
    from pptx import Presentation
    from playwright.sync_api import sync_playwright
    import lint as L

    facts_links = json.loads(json.dumps(__import__("yaml").safe_load((ROOT / "content/facts.yaml").read_text())["links"]))
    want = {facts_links["scenarios_url"], facts_links["estimator_url"]}
    det = cv2.QRCodeDetector()

    # QR codes in the PPTX (images on the thank-you slide)
    found = set()
    prs = Presentation(ROOT / "shots/decks/preset2_en.pptx")
    for slide in prs.slides:
        for sh in slide.shapes:
            if sh.shape_type == 13:
                p = ROOT / "shots" / "qr.tmp"
                p.write_bytes(sh.image.blob)
                img = cv2.imread(str(p)) if sh.image.ext != "gif" else None
                if img is None:
                    from PIL import Image
                    Image.open(p).convert("RGB").save(p.with_suffix(".png"))
                    img = cv2.imread(str(p.with_suffix(".png")))
                big = cv2.resize(img, None, fx=2, fy=2, interpolation=cv2.INTER_NEAREST)
                txt, *_ = det.detectAndDecode(big)
                if txt:
                    found.add(txt)
    ok("PPTX QR codes decode to the library and estimator URLs", want <= found, str(found))

    with sync_playwright() as p:
        b = p.chromium.launch(channel="chrome")
        page = b.new_page(viewport={"width": 1280, "height": 800}, reduced_motion="reduce")
        deck = ROOT / "shots/decks/preset2.html"
        manifest = json.loads((ROOT / "shots/decks/manifest.json").read_text())
        n = len(next(m for m in manifest if m["file"] == "preset2.html")["slides"])
        page.goto(deck.as_uri() + f"#en-{n - 2}")      # thank-you is the last main slide (2 appendix after it)
        page.wait_for_timeout(300)
        shot = ROOT / "shots" / "qr-html.png"
        found = set()
        for i, el in enumerate(page.query_selector_all(".deck.on .slide.active .qr .code")):
            el.screenshot(path=str(shot))
            txt, *_ = det.detectAndDecode(cv2.resize(cv2.imread(str(shot)), None, fx=2, fy=2, interpolation=cv2.INTER_NEAREST))
            if txt:
                found.add(txt)
        ok("HTML QR codes decode to the library and estimator URLs", want <= found, str(found))

        # keys
        page.goto(deck.as_uri())
        page.wait_for_timeout(200)
        cur = lambda: page.evaluate("YWDeck.cur")
        page.keyboard.press("ArrowRight"); page.keyboard.press("PageDown"); page.keyboard.press("Space")
        a = cur(); page.keyboard.press("ArrowLeft"); bb = cur()
        page.keyboard.press("End"); e = cur(); page.keyboard.press("Home"); h = cur()
        ok("keys ← → PageDown Space Home End", (a, bb, e, h) == (3, 2, n - 1, 0), str((a, bb, e, h)))
        page.keyboard.press("o")
        apx = page.evaluate("[...document.querySelectorAll('#idx h5')].map(x => x.textContent)")
        page.locator("#idx li").last.click()
        ok("O overview lists the appendix and jumps to it", len(apx) == 2 and cur() == n - 1, str(apx))
        page.keyboard.press("o"); page.keyboard.press("Escape")
        ok("Esc closes the overview", not page.evaluate("document.getElementById('idx').classList.contains('on')"))
        page.keyboard.press("h")
        ok("H hides progress and page numbers", page.evaluate("getComputedStyle(document.getElementById('bar')).display") == "none")
        page.keyboard.press("h")

        # L on every slide (facts + agenda switch too)
        same = []
        for i in range(n):
            page.evaluate(f"YWDeck.go({i})")
            en = page.evaluate("document.querySelector('.deck.on .slide.active').innerText")
            page.keyboard.press("l")
            zh = page.evaluate("document.querySelector('.deck.on .slide.active').innerText")
            lang = page.evaluate("YWDeck.lang")
            page.keyboard.press("l")
            if en == zh or lang != "zh":
                same.append(i + 1)
        ok("L switches language on every slide", not same, f"unchanged slides: {same}")
        page.evaluate("YWDeck.go(2)"); page.keyboard.press("l")
        ok("facts switch with L (value_zh / label_zh)", "的企业已在至少一个业务环节使用 AI" in page.evaluate("document.querySelector('.deck.on .slide.active').innerText"))
        page.keyboard.press("l")

        # interactive slides don't advance on click
        sc = manifest[0]["slides"].index("self-check")
        page.goto((ROOT / "shots/decks/preset1.html").as_uri() + f"#en-{sc + 1}")
        page.wait_for_timeout(200)
        page.locator(".deck.on .slide.active .row").first.click()
        ok("clicking a self-check row ticks it and doesn't advance", page.evaluate("YWDeck.cur") == sc and page.locator(".deck.on .slide.active .row.on").count() == 1)

        # reduced motion → static
        ga = manifest[0]["slides"].index("approval-gates")
        page.evaluate(f"YWDeck.go({ga})")
        page.wait_for_timeout(50)
        ok("prefers-reduced-motion: gates show the final state at once", page.locator(".deck.on .slide.active .gate.ok").count() == 3)
        dur = page.evaluate("getComputedStyle(document.querySelector('.deck.on .slide.active [data-anim]')).transitionDuration")
        ok("prefers-reduced-motion: no transitions", dur in ("0s", "1e-05s"), dur)

        # F requests fullscreen (headless can't enter it; check the handler is wired)
        page.evaluate("document.documentElement.requestFullscreen = () => { window.__fs = 1; return Promise.resolve(); }")
        page.keyboard.press("f")
        ok("F requests full screen", page.evaluate("window.__fs === 1"))
        b.close()

    # denylist over every export
    terms = L.denylist()
    if terms is None:
        ok("denylist scan (skipped: no raw/denylist.txt)", True)
    else:
        hits = 0
        for f in list((ROOT / "shots/decks").glob("*.html")) + list((ROOT / "shots/builder").glob("*.html")):
            hits += L.scan_dist(f.read_text(encoding="utf-8"))
        hits += L.scan_dist((ROOT / "dist/index.html").read_text(encoding="utf-8"))
        ok("zero denylist hits in exports and dist", hits == 0, f"{hits} hit(s)")

    for f in ("qr.tmp", "qr.png", "qr-html.png"):
        (ROOT / "shots" / f).unlink(missing_ok=True)
    fails = [r for r in rows if not r[1]]
    print(f"\n{len(rows) - len(fails)}/{len(rows)} acceptance checks passed")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
