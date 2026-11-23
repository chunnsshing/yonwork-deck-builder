#!/usr/bin/env python3
"""Screenshot decks at 1280x800 with Playwright (system Chrome) → shots/<deck>/<lang>/NN-<module>.png,
and fail on overflow: anything past the content area, or text cut off inside its box.

    .venv/bin/python scripts/screenshot.py                    # every preset × IT on/off, EN + ZH
    .venv/bin/python scripts/screenshot.py --deck all-modules --lang en
    .venv/bin/python scripts/screenshot.py --client "新加坡亚太精密制造私人有限公司 (Asia-Pacific) Pte. Ltd." --no-shots
"""
import argparse, json, subprocess, sys
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
SHOTS = ROOT / "shots"

# Runs inside the deck: returns overflow problems on the active slide.
PROBE = r"""() => {
  const sl = document.querySelector('.deck.on .slide.active'); const out = [];
  const R = sl.getBoundingClientRect(), sx = R.width / 1280, sy = R.height / 800;
  const name = el => (el.className && el.className.baseVal === undefined ? '.' + String(el.className).trim().split(/\s+/).join('.') : el.tagName.toLowerCase())
    + ' "' + (el.textContent || '').trim().slice(0, 40) + '"';
  for (const el of sl.querySelectorAll('*')) {
    if (el.closest('.foot,.orb,.ring,svg') ) continue;
    const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue;
    const x0 = (r.left - R.left) / sx, x1 = (r.right - R.left) / sx, y0 = (r.top - R.top) / sy, y1 = (r.bottom - R.top) / sy;
    if (y1 > 742 || y0 < 20 || x0 < 40 || x1 > 1240) { out.push('outside content area: ' + name(el) + ` [${x0|0},${y0|0} → ${x1|0},${y1|0}]`); continue; }
    const cs = getComputedStyle(el);
    if (el.children.length === 0 && el.textContent.trim() && (el.scrollHeight > el.clientHeight + 2 || el.scrollWidth > el.clientWidth + 2) && cs.overflow !== 'visible')
      out.push('text cut off: ' + name(el));
  }
  // siblings in a grid/flex row must not overlap (catches squeezed cards)
  return [...new Set(out)].slice(0, 6);
}"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--deck", help="deck file stem (e.g. preset2, all-modules)")
    ap.add_argument("--lang", choices=["en", "zh"])
    ap.add_argument("--only", help="slide range, e.g. 1-4 or 3")
    ap.add_argument("--client", default="Acme Trading")
    ap.add_argument("--no-shots", action="store_true", help="overflow check only")
    a = ap.parse_args()
    out = SHOTS / "decks"
    subprocess.run(["node", str(ROOT / "scripts/render_deck.js"), str(out), "--client", a.client], check=True, capture_output=True)
    manifest = json.loads((out / "manifest.json").read_text())
    problems, n = [], 0
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="chrome")
        page = browser.new_page(viewport={"width": 1280, "height": 800}, reduced_motion="reduce")
        requests = []
        page.on("request", lambda r: requests.append(r.url) if not r.url.startswith(("file:", "data:", "about:")) else None)
        for m in manifest:
            stem = m["file"][:-5]
            if (a.deck and stem != a.deck) or (not a.deck and stem == "all-modules"):
                continue
            rng = range(1, len(m["slides"]) + 1)
            if a.only:
                lo, _, hi = a.only.partition("-")
                rng = range(int(lo), int(hi or lo) + 1)
            for lang in ([a.lang] if a.lang else ["en", "zh"]):
                page.goto((out / m["file"]).as_uri() + f"#{lang}-1")
                d = SHOTS / stem / lang
                if not a.no_shots:
                    d.mkdir(parents=True, exist_ok=True)
                for i in rng:
                    page.evaluate(f"YWDeck.go({i - 1})")
                    page.wait_for_timeout(60)
                    for issue in page.evaluate(PROBE):
                        problems.append(f"{stem} {lang} slide {i} ({m['slides'][i - 1]}): {issue}")
                    if not a.no_shots:
                        page.screenshot(path=str(d / f"{i:02d}-{m['slides'][i - 1]}.png"))
                    n += 1
        browser.close()
    for pr in problems:
        print("OVERFLOW:", pr)
    if requests:
        print("NETWORK:", *sorted(set(requests)), sep="\n  ")
    print(f"{n} slides checked · {len(problems)} overflow issue(s) · {len(set(requests))} network request(s)"
          + ("" if a.no_shots else f" → {SHOTS.relative_to(ROOT)}/"))
    return 1 if problems or requests else 0


if __name__ == "__main__":
    sys.exit(main())
