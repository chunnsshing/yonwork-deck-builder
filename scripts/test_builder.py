#!/usr/bin/env python3
"""Drive the built builder (dist/index.html) end to end with Playwright and check the behaviour HANDOFF §3 asks for.

    .venv/bin/python scripts/test_builder.py          # screenshots → shots/builder/

Serves dist/ on a throwaway local port, so it also checks that the page makes no other network requests.
"""
import functools, http.server, json, socketserver, sys, threading
from pathlib import Path

from playwright.sync_api import sync_playwright
from pptx import Presentation

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "shots" / "builder"
results = []


def check(name, ok, detail=""):
    results.append((name, bool(ok), detail))
    print(("PASS " if ok else "FAIL ") + name + (f" — {detail}" if detail and not ok else ""))


def serve():
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(ROOT / "dist"))
    handler.log_message = lambda *a: None
    srv = socketserver.TCPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, f"http://127.0.0.1:{srv.server_address[1]}/"


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    srv, url = serve()
    with sync_playwright() as p:
        b = p.chromium.launch(channel="chrome")
        ctx = b.new_context(viewport={"width": 1440, "height": 900}, accept_downloads=True)
        page = ctx.new_page()
        reqs = []
        page.on("request", lambda r: reqs.append(r.url))
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.goto(url)
        page.wait_for_timeout(600)
        st = lambda: page.evaluate("JSON.parse(JSON.stringify({s: YWBuilder.state.stage, it: YWBuilder.state.it, sel: YWBuilder.selection()}))")
        npv = lambda: page.evaluate("document.getElementById('pg').textContent")
        page.screenshot(path=str(OUT / "01-start-en.png"), full_page=True)

        # exports disabled until the client name is filled
        check("export buttons disabled without client", page.is_disabled("#dl-pptx") and page.is_disabled("#dl-html") and page.is_disabled("#present"))
        page.fill("#client", "   ")
        check("whitespace-only name still disabled", page.is_disabled("#dl-pptx"))
        page.fill("#client", "Acme Trading & Sons <test>")
        check("export enabled with client", page.is_enabled("#dl-pptx"))
        page.wait_for_timeout(400)
        cover_client = page.frame_locator("#pv").locator(".deck.on .slide.active .client").inner_text()
        check("client name HTML-escaped on cover", "Acme Trading & Sons <test>" in cover_client, cover_client)

        # stage 2 preset → 16 main + 2 appendix + cover/agenda/thanks
        s = st()
        check("stage 2 preset main", len(s["sel"]["main"]) == 13 and len(s["sel"]["appendix"]) == 2, json.dumps(s["sel"]))
        check("preview count matches", npv().endswith("/ 18"), npv())

        # untick a module
        page.click('.row[data-id="x-ai-to-ai-x"] input')
        page.wait_for_timeout(400)
        check("unticking removes the slide", "x-ai-to-ai-x" not in st()["sel"]["main"] and npv().endswith("/ 17"), npv())

        # move to appendix
        page.click('.row[data-id="data-layer"] .apx')
        page.wait_for_timeout(400)
        s = st()
        check("move to appendix", "data-layer" in s["sel"]["appendix"] and "data-layer" not in s["sel"]["main"])

        # drag to reorder within Why
        page.drag_to = None
        src = page.locator('.row[data-id="red-flags"]'); dst = page.locator('.row[data-id="maturity-ladder"]')
        src.drag_to(dst, target_position={"x": 40, "y": 4})
        page.wait_for_timeout(300)
        s = st()
        check("drag reorders within a section", s["sel"]["main"].index("red-flags") < s["sel"]["main"].index("maturity-ladder"), json.dumps(s["sel"]["main"][:3]))

        # no module is left as a draft
        check("no Draft badges", page.locator(".tg.draft").count() == 0)

        # switching stage after changes asks first
        page.once("dialog", lambda d: d.dismiss())
        page.click('.stage[data-s="3"]')
        check("dismissed confirm keeps stage 2", st()["s"] == 2)
        page.once("dialog", lambda d: d.accept())
        page.click('.stage[data-s="3"]')
        page.wait_for_timeout(300)
        check("accepted confirm switches to stage 3", st()["s"] == 3)

        # IT overlay adds the three IT modules at the end of Where
        page.click(".switch")
        page.wait_for_timeout(400)
        s = st()
        main = s["sel"]["main"]
        check("IT overlay adds modules", all(m in main for m in ["private-data-layer", "two-channels", "security-by-design"]), json.dumps(main))
        check("IT modules inside Where", main.index("security-by-design") < main.index("synced-or-static"))
        tb = page.inner_text("#timebar")
        check("time bar target includes IT minutes", "33" in tb, tb)
        page.screenshot(path=str(OUT / "02-stage3-it-en.png"), full_page=True)

        # over-length → amber/red
        for mid in ["maturity-ladder", "red-flags", "model-harness", "avatar-employee-team", "x-ai-to-ai-x", "approval-gates", "three-patterns", "ask-your-data", "self-check"]:
            page.click(f'.row[data-id="{mid}"] input')
        page.wait_for_timeout(300)
        cls = page.get_attribute("#timebar", "class")
        check("time bar turns red when far over", "red" in cls, cls)
        page.once("dialog", lambda d: d.accept())
        page.click('.stage[data-s="2"]')
        page.wait_for_timeout(300)

        # downloads
        with page.expect_download() as dl:
            page.click("#dl-pptx")
        d = dl.value
        pptx_path = OUT / d.suggested_filename
        d.save_as(pptx_path)
        check("pptx file name", d.suggested_filename.endswith("_Acme_Trading_&_Sons_test_YonWork_AI_EN.pptx"), d.suggested_filename)
        prs = Presentation(pptx_path)
        s = st()  # stage 2 with IT still on: 13 + 1 IT module, + cover/agenda/thank-you, + divider + 2 appendix
        n_expect = len(s["sel"]["main"]) + 3 + 1 + len(s["sel"]["appendix"])
        check("pptx slide count", len(prs.slides) == n_expect, f"{len(prs.slides)} vs {n_expect}")
        with page.expect_download() as dl:
            page.click("#dl-html")
        d = dl.value
        html_path = OUT / d.suggested_filename
        d.save_as(html_path)
        check("html file name", d.suggested_filename.endswith("_Acme_Trading_&_Sons_test_YonWork_AI.html"), d.suggested_filename)
        with ctx.expect_page() as newp:
            page.click("#present")
        pres = newp.value
        pres.wait_for_load_state()
        check("present opens the deck in a new tab", pres.evaluate("!!window.YWDeck"))
        pres.close()

        # the exported HTML opens offline with zero requests
        off = b.new_context(offline=True).new_page()
        oreq = []
        off.on("request", lambda r: oreq.append(r.url) if not r.url.startswith(("file:", "data:")) else None)
        off.goto(html_path.as_uri())
        off.wait_for_timeout(500)
        check("exported HTML works offline, zero requests", off.evaluate("YWDeck.cur === 0") and not oreq, str(oreq))
        off.context.close()

        # language
        page.click('#lang button[data-l="zh"]')
        page.wait_for_timeout(500)
        check("UI switches to Chinese", page.inner_text("h1").startswith("演示文稿生成"))
        check("preview switches to Chinese", page.frame_locator("#pv").locator(".deck.on").get_attribute("lang") == "zh")
        check("zh draft badge shown", page.locator(".tg.zh").count() > 0)
        page.screenshot(path=str(OUT / "03-stage2-zh.png"), full_page=True)
        with page.expect_download() as dl:
            page.click("#dl-pptx")
        check("pptx in Chinese is _ZH", dl.value.suggested_filename.endswith("_ZH.pptx"), dl.value.suggested_filename)

        # long Chinese client name
        page.fill("#client", "新加坡亚太精密制造私人有限公司 (Asia-Pacific) Pte. Ltd.")
        page.wait_for_timeout(500)
        with page.expect_download() as dl:
            page.click("#dl-html")
        check("file name keeps Chinese, replaces unsafe chars", "新加坡亚太精密制造私人有限公司_(Asia-Pacific)_Pte._Ltd." in dl.value.suggested_filename, dl.value.suggested_filename)

        # hover thumbnail
        page.click('#lang button[data-l="en"]')
        page.wait_for_timeout(300)
        page.hover('.row[data-id="faq"] .t')
        page.wait_for_timeout(900)
        check("hover thumbnail appears", "on" in (page.get_attribute("#thumb", "class") or ""))
        page.screenshot(path=str(OUT / "04-hover-thumb.png"))

        # recent decks: exports above were recorded in this browser
        page.wait_for_timeout(200)
        n_recent = page.locator("#recent li:not(.empty)").count()
        check("recent decks list the exports", n_recent >= 2, str(n_recent))

        # builder link: configure something unusual, copy, open in a fresh browser
        page.once("dialog", lambda d: d.accept())
        page.click('.stage[data-s="1"]')
        page.wait_for_timeout(200)
        page.click('.row[data-id="faq"] .apx')            # faq back to main
        page.fill("#client", "Acme Trading")
        page.click('#lang button[data-l="zh"]')
        page.wait_for_timeout(300)
        before = st()
        ctx.grant_permissions(["clipboard-read", "clipboard-write"])
        page.click("#copy-link")
        page.wait_for_timeout(300)
        link = page.evaluate("location.href")
        check("copy link puts the config in the hash", "#/b?v=1&lang=zh&s=1" in link and "c=Acme%20Trading" in link, link)
        fresh = b.new_context(viewport={"width": 1440, "height": 900}).new_page()
        fresh.goto(link)
        fresh.wait_for_timeout(700)
        after = fresh.evaluate("JSON.parse(JSON.stringify({s: YWBuilder.state.stage, it: YWBuilder.state.it, sel: YWBuilder.selection()}))")
        check("builder link reproduces the selection in a fresh browser", after == before, json.dumps([before, after]))
        check("link restores client and language", fresh.input_value("#client") == "Acme Trading" and fresh.evaluate("document.documentElement.lang") == "zh-Hans")
        dflt = fresh.context.new_page(); dflt.goto(url + "#/b?v=1&lang=en&s=3&it=1&m=&a="); dflt.wait_for_timeout(500)
        check("empty m= opens the stage preset", len(dflt.evaluate("YWBuilder.selection().main")) == 13, str(dflt.evaluate("YWBuilder.selection().main")))
        bad = fresh.context.new_page(); bad.goto(url + "#/b?v=9&s=7"); bad.wait_for_timeout(500)
        check("bad link falls back to defaults", bad.evaluate("YWBuilder.state.stage") == 2)
        fresh.context.close()

        # recent deck "Open" restores that configuration
        page.locator("#recent [data-open]").first.click()
        page.wait_for_timeout(300)
        check("recent deck opens", page.input_value("#client") != "")

        # phone width
        mob = ctx.new_page()
        mob.set_viewport_size({"width": 390, "height": 844})
        mob.goto(url)
        mob.wait_for_timeout(500)
        sw = mob.evaluate("document.documentElement.scrollWidth")
        check("no horizontal scroll at 390px", sw <= 390, str(sw))
        mob.screenshot(path=str(OUT / "05-phone.png"), full_page=True)

        others = sorted({r for r in reqs if not r.startswith((url, "data:", "blob:", "about:"))})
        check("builder makes no outside requests", not others, str(others))
        check("no page errors", not errors, "; ".join(errors))
        b.close()
    srv.shutdown()
    fails = [r for r in results if not r[1]]
    print(f"\n{len(results) - len(fails)}/{len(results)} checks passed · screenshots in {OUT.relative_to(ROOT)}/")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
