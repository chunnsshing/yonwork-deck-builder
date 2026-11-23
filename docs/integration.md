# How the deck builder fits into the AI Sales Kit

The **AI Sales Kit** (AI 销售资料包) is the starter-pack hub. It walks a salesperson through four steps, and each step
is either a page of the kit or a separate tool:

| Kit step | What it is | Where it lives |
|---|---|---|
| **01 Pitch** (讲) | Explain how enterprise AI works and why it can be trusted | **This deck builder** (the kit's "intro deck and talk track" placeholder) |
| **02 Case library** (案例库) | Find scenarios by domain | Scenario library: https://chunnsshing.github.io/yonyou-ai-cases/ (opens in a new tab) |
| **03 Hands-on demo** (上手演示) | Sign in, tour YonWork, run a playbook live | Pages inside the kit |
| **04 Pricing** (报价) | Explain AU and quote | Pages inside the kit; the quotation tool (estimator) merges in here |

Two kinds of links:

- **Kit → deck builder:** opens in the **same tab**. The deck builder's top bar has a **‹ AI Sales Kit** button that
  goes back.
- **Anything → scenario library:** opens in a **new tab** (`target="_blank" rel="noopener"`). It's a separate site
  that people browse alongside.

This repo only changes the deck builder. The kit's source isn't in this repo, so the kit changes below are
proposals to apply in the kit's own repo.

---

## 1. Deck builder side (done here)

- Top bar: **‹ AI Sales Kit** · YonWork logo · "Deck builder" · **Scenario library ↗** (new tab) · EN / 中文.
  The old Scenarios · Deck builder · Estimator switcher is gone. Pricing now lives in the kit.
- `site.yaml` → `hub.url`: the kit's address, **still to fill in**. Until then, Back goes back in browser history when
  the builder was opened from another page, and hides when it was opened directly.
  Once the kit is live, set it to the kit's Pitch page, e.g. `https://<kit-address>/#/pitch`.
- The scenario library URL is `content/facts.yaml` → `links.scenarios_url`. It drives the top-bar link and the
  "See it working" QR code on the deck's thank-you slide.

## 2. Kit side (proposed)

1. **01 Pitch → deck builder.** Replace the Pitch placeholder with one card that opens the deck builder in the same
   tab, plus a one-line how-to. Suggested content:
   - title: 用演示文稿生成器讲清原理 / Build the pitch deck
   - line: 选听众、填客户名，两分钟导出可编辑的 PowerPoint 或 HTML。 / Pick the audience, type the client name,
     export an editable PowerPoint or HTML in two minutes.
   - link: `https://chunnsshing.github.io/yonwork-deck-builder/`. Add `#/b?v=1&lang=zh&s=2&it=0&m=&a=` to open
     in Chinese with the stage-2 preset. **Never put a client name in this link.**
   - Optionally a thumbnail: `docs/img/1-stage-and-client.png` from this repo.
2. **02 Case library → new address.** The kit's library constant still points at the old yonyou.com.sg address.
   Change it to `https://chunnsshing.github.io/yonyou-ai-cases/`. The case links already open in a new tab; keep
   that for the "Open the case library ↗" button too.
3. **04 Pricing ← quotation.** Merge the estimator into the Pricing step (replace the "quoter" placeholder),
   either as kit pages or as a link to the estimator with its own Back button to the kit.
4. **Top bar.** The kit's top bar (logo · 01–04 steps · language) is the hub's own design. The deck builder and
   estimator should look like the same family (light background, red accent, same type) without copying it exactly:
   each keeps its own layout, with a Back button to the kit.

## 3. Decide before linking

- **Public vs internal.** The deck builder and the scenario library are public sites. If the kit holds internal
  material (pricing, demo set-up), keep it off public pages:
  - the deck builder's Back button only *returns* to the kit, which is fine;
  - the deck's thank-you slide is shown to clients, so its QR codes must never point to the kit.
- **The thank-you slide's "What it would cost" QR** currently points to the public estimator
  (`facts.yaml` → `links.estimator_url`). When the estimator merges into the kit:
  - point the QR to a client-facing page instead;
  - or replace that card with a second client-facing link.

## 4. Check after applying

- Kit → 01 Pitch → deck builder → **‹ AI Sales Kit** returns to the kit, in the same language.
- Every scenario-library link opens in a new tab and lands on `chunnsshing.github.io/yonyou-ai-cases`.
- No client name appears in any link from the kit.
