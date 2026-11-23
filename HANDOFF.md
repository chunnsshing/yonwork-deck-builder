# HANDOFF · YonWork Deck Builder

> For Claude Code. Read this whole file before writing code, then `content/modules.seed.yaml` and
> `content/facts.seed.yaml` (the anonymised slide content). The source decks are in `raw/`
> (gitignored, contains client names). Don't copy text from `raw/` without checking it against §10.
>
> `raw/event-talk-deck.html`: event deck; the most complete deck engine to port (§12).
> `raw/working-session-deck.html`: client working-session deck (AI/RULES/PEOPLE, deployment options).
> `raw/local-vs-cloud.pdf`: AI Box vs cloud comparison. `raw/private-data-layer.pdf`: private server architecture.

---

## 0. What to build

A static website where anyone on the Yonyou Singapore sales team picks **who they're presenting to**
(a stage), ticks the **topics** they want, types the **client name**, and gets a client-specific
**sharing deck** that explains the technical side and the theory of enterprise AI.
They can **present or share it as HTML**, or **export it as an editable PowerPoint** to their own machine.

It is one of three tools in the **YonWork Starter Pack**, and each has one job:

| Tool | Answers | Lives at |
|---|---|---|
| Scenario library | "Show me it working": use cases, flows, demo videos | yonyou.com.sg/yonwork-cases (repo `yonyou-ai-cases`) |
| **Deck builder (this repo)** | "How does it work, and can we trust it?": technical + theory | `yonwork-deck-builder` → GitHub Pages |
| AI estimator | "What would it cost?" | chunnsshing.github.io/yonwork-estimator (repo `yonwork-estimator`) |

**Out of scope for this repo:** pricing, scenarios/use cases, speaker notes (sales get a separate
briefing), grant funding, any per-client text other than the client name. The deck's last slide
links to the library and the estimator with QR codes.

---

## 1. Users and goals

- **Users:** salespeople, solution consultants and pre-sales. Mixed technical depth. They present
  in **English or Chinese**.
- **Goal:** a correct, consistent, on-brand deck in under two minutes: pick a stage, type the client
  name, export.
- **Non-goals:** no login, no backend, no client data stored anywhere, no AI-generated text at runtime.
  Every word on a slide comes from approved modules, apart from the client name.

---

## 2. What the deck teaches (the knowledge points)

| Section | The client should leave knowing… | Modules |
|---|---|---|
| **Frame** | Why we're here; where to go next | cover, agenda, house-rules, thank-you (QR → library + estimator) |
| **Why** | Most companies have tried AI; few use it daily. On its own, AI drifts, forgets, guesses and can't explain itself, so business can't trust it with the accounts. | maturity-ladder, red-flags, chat-vs-agent\*, glossary\* |
| **How** | Agent = model + harness, and the harness is what makes it trustworthy. AI grows from avatar → employee → team. AI moves to the centre of your software. AI suggests, rules calculate, people decide. Three promises: no snooping, nothing changes without your yes, every step recorded. The data layer is built once and reused. | model-harness, avatar-employee-team, x-ai-to-ai-x, ai-rules-people, trust-promises, approval-gates, data-layer, build-once |
| **Where** | Local / hybrid / cloud, and what leaves your network in each. AI Box vs cloud model trade-offs and data handling. (IT) one gate, two channels, security by design. | deployment-options, box-vs-cloud-tradeoffs, data-handling, private-data-layer, two-channels, security-by-design |
| **What** | Three kinds of help: asks first, does the chores, looks out for you. You can ask your ERP in plain language. | three-patterns, ask-your-data |
| **Start** | Synced vs static data shapes the solution. What a pilot needs. Does this sound like you? Start with one task. FAQ. | synced-or-static, what-a-pilot-needs, self-check, start-small, faq |

\* `origin: proposed` = new content not taken from any source deck. These show in the builder with a
**Draft** badge and a disabled checkbox, so they can't be exported, and stay out of presets until the
owner sets `origin: approved`.

---

## 3. The builder (one page)

Look and feel: same family as the AI estimator (§11). Top bar with the starter-pack switcher
`Scenarios · Deck builder · Estimator` (current tool highlighted) and an **EN / 中文** pill that
switches the **whole builder UI and the deck content** together.

### 3.1 Step 1: Who's in the room (big stage cards)

| Stage | Card (EN / 中文) | One-liner | ~Length |
|---|---|---|---|
| 1 | **Exploring AI / 初识 AI** | Heard of AI, maybe tried ChatGPT. Show what it is and what it can do. | 20 min |
| 2 | **Using AI, new to enterprise AI / 用过 AI，未接触企业级 AI** | Uses AI tools. Show why business AI is different and how it's trusted. | 30 min |
| 3 | **Planning a project / 准备落地** | Ready to talk architecture, data and deployment. | 25 min (+15 with IT) |

Toggle under the cards: **IT in the room / 有 IT 参会** (adds the IT-only modules).
The stage also sets the cover title and subtitle (fixed text in `site.yaml`, not editable).

### 3.2 Step 2: Client name

One field: **Client name \***. It goes in `{{client}}` on the cover, thank-you, footer and file name.
The date is filled in automatically (today, formatted per language). Under the field it says
*"Nothing you type leaves this browser."*

- Required: the export buttons stay disabled until it's filled; trim whitespace; max 60 characters.
- Chinese, accented and symbol characters (e.g. `&`, `'`) are allowed. **HTML-escape** it everywhere
  it's rendered, and **sanitise** it for file names (replace `/\:*?"<>|` and spaces with `_`, keep Chinese).
- Long names must not break the cover or footer: shrink the font on the cover, truncate with an
  ellipsis in the footer. Test with `Acme Trading` and `新加坡亚太精密制造私人有限公司 (Asia-Pacific) Pte. Ltd.`.

Other fields (presenter, ERP, logo…) are **off** for now. `site.yaml` has a `fields:` block with
`enabled: false` entries so the owner can switch them on later without code changes (§14).

### 3.3 Step 3: Topics (module checklist)

- Section accordions (Why / How / Where / What / Start). Each row: checkbox, title (in the current
  language), minutes, stage dots, `IT` / `Draft` badges, a hover thumbnail.
- Drag to reorder within a section; section order is fixed. Cover + agenda are pinned first and
  thank-you last.
- **Move to appendix** toggle per module: appendix slides come after thank-you, are left out of the
  time bar, and are reachable with `O` in the HTML deck (and come last in the PPTX).
- **Time bar** (sticky): minutes stacked by section against the preset's `length_min` (plus the IT overlay's minutes when it's on); amber at +10%, red at +25%.

### 3.4 Step 4: Preview and export

- **Live preview:** the real HTML deck in a scaled iframe; step through slides; re-renders on change.
- **Buttons:**
  1. **Download PowerPoint (.pptx)**: native, editable slides (§7.2). File `YYYY-MM-DD_<Client>_YonWork_AI.pptx`.
  2. **Download HTML**: one self-contained file for sharing or presenting offline (§7.1).
  3. **Present now**: opens the HTML deck in a new tab.
  4. **Copy builder link**: the configuration in the URL hash, so a colleague opens the same selection:
     `#/b?v=1&lang=en&s=2&it=1&m=<ids>&a=<appendix ids>&c=<client>`. The hash is never sent to a
     server, but the client name is visible to whoever receives the link. Say so in a tooltip on the button.
- **Recent decks:** saved in this browser only (localStorage, wrapped in try/catch).

---

## 4. Stage presets (`site.yaml` is the only source)

```yaml
presets:
  1:   # Exploring AI
    length_min: 20
    title:    { en: "AI at work, explained", zh: "一次讲清：AI 如何为企业工作" }
    subtitle: { en: "What AI can do for your business, and how it stays under control", zh: "AI 能为企业做什么，又如何做到安全可控" }
    main: [cover, agenda, house-rules, maturity-ladder, red-flags, three-patterns, ask-your-data,
           approval-gates, trust-promises, self-check, start-small, thank-you]
    appendix: [faq]
  2:   # Using AI, new to enterprise AI
    length_min: 30
    title:    { en: "From AI tools to AI you can trust at work", zh: "从 AI 工具到值得信赖的企业 AI" }
    subtitle: { en: "How enterprise AI works, and why it's different", zh: "企业级 AI 的工作原理与不同之处" }
    main: [cover, agenda, maturity-ladder, red-flags, model-harness, avatar-employee-team, x-ai-to-ai-x,
           ai-rules-people, trust-promises, approval-gates, data-layer, deployment-options,
           three-patterns, self-check, start-small, thank-you]
    appendix: [faq, box-vs-cloud-tradeoffs]
  3:   # Planning a project
    length_min: 25          # +15 when IT in the room is on (sum of the overlay modules)
    title:    { en: "Enterprise AI: architecture and deployment", zh: "企业 AI：架构与部署" }
    subtitle: { en: "How it's built, where it runs, and what a pilot needs", zh: "如何搭建、部署在哪里、试点需要什么" }
    main: [cover, agenda, ai-rules-people, trust-promises, data-layer, build-once, deployment-options,
           box-vs-cloud-tradeoffs, data-handling, synced-or-static, what-a-pilot-needs, start-small, thank-you]
    appendix: [faq, model-harness]
it_overlay:      # inserted into the Where section when "IT in the room" is on
  1: []
  2: [security-by-design]
  3: [private-data-layer, two-channels, security-by-design]
sections:        # agenda row names per language
  why:   { en: "Why AI, why now", zh: "为什么是 AI，为什么是现在" }
  how:   { en: "How enterprise AI works", zh: "企业 AI 如何工作" }
  where: { en: "Where it runs", zh: "部署在哪里" }
  what:  { en: "What it looks like", zh: "实际是什么样" }
  start: { en: "How to start", zh: "如何开始" }
```

Choosing a stage **replaces**
the selection, after a confirm prompt if the user changed anything. Stage dots on module rows are
computed from the presets. Drop the `stages:` idea entirely: there's one source.

---

## 5. Content model

### 5.1 Modules: `content/modules/<section>/<id>.yaml`
Split `modules.seed.yaml` into one file per module. The field reference is at the top of the seed.
- Short on-slide text: headings ≤ 70 chars EN / 30 Chinese characters, card bodies ≤ 110 EN / 50 Chinese characters.
  The build warns past those limits, and the PPTX renderer needs them too.
- Placeholders: `{{client}}`, `{{facts.<path>}}`, `{{preset.title}}`, `{{preset.subtitle}}`. An unknown one fails the build.
- **No `notes`, no `inputs`.** Lint fails if a module has them.

### 5.2 Facts: `content/facts.yaml`
Model names, hardware, third-party policies and statistics live here with `source`, `checked` and
`review_by`, plus `value_zh` / `label_zh` where they appear on a slide. Module files may not hard-code
them (lint: no model names, no `%` figures, no `S$` anywhere). There are **no prices** in this repo.
Past `review_by` the build warns, and the builder shows "check before use" on the affected modules.

### 5.3 Bilingual content
Every module gets a `zh:` block with exactly the same keys and list lengths as `slide:` (lint enforces
this) and `zh_status: draft | reviewed`. Write the Chinese yourself using the glossary below, as
natural business Simplified Chinese (not word-for-word). The builder shows a small "中文待审" badge on
draft modules in Chinese mode. They can still export (the owner reviews them in bulk later).

### 5.4 Glossary EN → 中文 (terms marked ? need the owner's confirmation)

| EN | 中文 | | EN | 中文 |
|---|---|---|---|---|
| AI agent | AI 智能体 | | Workflow | 工作流 |
| Model | 模型 / 大模型 | | Data layer | 数据层 |
| Harness | **Harness** (keep English) | | Ontology layer | 本体层 ? |
| Prompt / Context / Harness engineering | **Prompt engineering / Context engineering / Harness engineering** (keep English) | | Business objects | 业务对象 |
| Digital avatar | 数字分身 | | Role-based data API | 基于角色的数据接口 |
| Digital employee | 数字员工 | | Sync engine | 同步引擎 |
| Digital team | 数字团队 | | Admin portal | 管理后台 |
| Enterprise AI Box | 企业 AI 一体机 ? | | Audit trail | 审计记录 |
| Fully local / Hybrid / Cloud | 本地部署 / 混合部署 / 云端部署 | | Deny by default | 默认拒绝 |
| Red flags | 隐患 / “红旗” ? | | Approval (yes) | 人工确认 |
| Synced / Static data | 同步数据 / 静态数据 | | Pilot | 试点 |
| AI suggests · Rules calculate · People decide | AI 建议 · 规则计算 · 人来决定 | | Your ERP | 您的 ERP |

Keep in English, including in the Chinese deck: **Harness, Prompt engineering, Context engineering, Harness engineering**, "Agent = Model + Harness" (the equation on the model-harness slide), YonWork, YonSuite, YonBIP, NC Cloud, ERP, API, OpenAI, Claude, model names. Chinese text around them is fine, e.g. 「Harness 让 AI 值得信赖」.

---

## 6. Slide layouts

Each layout has **two renderers that share one data shape**: `layouts/<name>.html.js` (HTML deck)
and `layouts/<name>.pptx.js` (PowerPoint). All are designed for the 1280×800 stage
(PPTX: custom 13.333 × 8.333 in, the same 16:10 ratio).

| Layout | Modules | HTML | PPTX |
|---|---|---|---|
| `cover` | cover | big title, client × Yonyou line, date, Yonyou logo | same, static |
| `agenda` | agenda | auto rows: number, section, summary, minutes | table-like rows |
| `statement` | house-rules | one big line | same |
| `stats-ladder` | maturity-ladder | 2 stat tiles + 4 rising bars (grow from bottom, staggered) | static bars (shapes) |
| `cards-3` / `cards-3-numbered` / `cards-4-steps` / `cards-5` / `cards-6` | many | one card component | rounded rectangles + text boxes |
| `engine-4` | model-harness | dark engine card + 2×2 cards + 3-step strip | same, static |
| `steps-3` / `steps-5` | avatar-employee-team, start-small | arrows; `future` dashed | shapes + connectors |
| `hub-compare` | x-ai-to-ai-x | app grid vs hub with animated dashed spokes | hub with static lines |
| `principle-3` | ai-rules-people | AI / RULES / PEOPLE badges in lane colours | same |
| `gates-anim` | approval-gates | self-running 10 s build; amber diamonds turn green; Replay | **final state**: all gates green |
| `foundation` | build-once | 4 tiles over a gradient foundation bar | same, static |
| `options-3` | deployment-options | "What leaves your network" box per option | same |
| `compare-2` / `compare-2-proscons` | several | two columns, ✓ / • markers | same |
| `table` | data-handling, two-channels | styled table | native PPTX table |
| `architecture` | private-data-layer | inline SVG diagram, numbered components, channels A/B | shapes + connectors (not an image), so it stays editable |
| `questions` | ask-your-data | 4 question bubbles | same |
| `self-check` | self-check | clickable rows, ticks, banner at 2+ | rows with empty tick boxes + banner text below |
| `faq` | faq | 2-column Q/A | same |
| `thanks` | thank-you | animated heading, 2 QR cards (library, estimator) | heading + 2 QR images + labels |

**QR codes:** vendor a small MIT-licensed encoder (e.g. `qrcode-generator`) into `vendor/`, render
to SVG for HTML and to PNG (canvas) for PPTX. No CDN anywhere.

---

## 7. Exports

### 7.1 HTML deck (share or present)
- **One self-contained file:** CSS, JS, logos and QR codes inline; system fonts. Opens offline with a
  double-click and makes **zero network requests**.
- **Both languages embedded:** opens in the language chosen in the builder; `L` toggles EN/中文 live.
- Fixed **1280×800 stage**, scaled and letterboxed. Calm easing motion (`cubic-bezier(.2,.9,.25,1)`,
  staggered reveals); `prefers-reduced-motion` turns it off.
- **Keys:** `← →` / Space / PageUp/PageDown · `F` fullscreen · `O` overview (jump to any slide; appendix marked)
  · `H` hide the progress bar and page counter · `L` language · `Esc` close · Home/End. Touch swipe.
  Clicks on interactive slides (self-check, gates replay) don't advance.
- **No speaker notes, no script view, no `P` key.**
- `@media print`: one slide per landscape A4 page.
- Footer on every slide: `{{client}} × Yonyou Singapore` · page number.
  `<meta name="generator" content="yonwork-deck-builder vX · <config hash>">`.

### 7.2 PowerPoint (.pptx)
- Generated **in the browser** with **PptxGenJS** (MIT), vendored and inlined. No server, no CDN.
- **Native, editable** text boxes, shapes, tables and connectors. Never a screenshot of each slide.
- **One language per file:** the current language, with the suffix `_EN` / `_ZH` in the file name.
- **Fonts:** EN `Arial`, ZH `Microsoft YaHei` (falls back to PingFang SC on Mac). No gradient text
  (PowerPoint can't render it reliably): use solid brand red instead. Shape gradients are fine.
- Animations are dropped; interactive slides are exported in their final state (§6).
- **Slide master:** a background, the footer (client · page) and the logo, so the sales team can edit
  slides without breaking the layout.
- Appendix slides come after thank-you, with a small "Appendix / 附录" divider slide.

---

## 8. Starter-pack integration

- **Shared top bar** in all three tools. In this repo it's a partial. For the other two repos, write
  the proposed patch in `docs/integration.md`. **Don't edit those repos.**
- The thank-you slide's QR codes point to `facts.links.scenarios_url` and `facts.links.estimator_url`.
- No scenario data and no pricing data is pulled into this repo.

---

## 9. Repo, build, deploy

```
yonwork-deck-builder/
  README.md            for salespeople: 4 steps with screenshots; for editors: how to add/translate a module
  CLAUDE.md
  HANDOFF.md
  site.yaml            brand, sections, presets, IT overlay, fields (enabled flags), starter-pack links
  content/facts.yaml
  content/modules/<section>/<id>.yaml
  layouts/             <name>.html.js + <name>.pptx.js per layout, shared deck.css
  runtime/             deck.js (HTML deck engine), deck.css
  app/                 builder UI: index.html, app.js, app.css, i18n.yaml (UI strings EN/ZH)
  vendor/              pptxgenjs, qr encoder (+ licence files)
  assets/logo.png      from github.com/chunnsshing/yonyou-ai-cases (assets/logo.png); if you can't fetch it, ask the user
  scripts/
    build.py           validate → dist/index.html (builder with content + runtimes embedded)
    lint.py            limits, placeholders, EN/ZH shape match, no notes/inputs, no prices/models/%, denylist
    screenshot.py      Playwright: every module EN + ZH at 1280×800, every preset × IT on/off → shots/
    check_pptx.py      python-pptx: open each exported preset, count slides, no empty text boxes;
                       LibreOffice → PNG for a visual check
  .github/workflows/pages.yml   on push to main: build --strict → deploy dist/ to Pages
  raw/                 gitignored: source decks + denylist.txt
  dist/ shots/         gitignored
```

- **Stack:** Python 3 + PyYAML for the build (same as `yonyou-ai-cases`); vanilla JS/CSS for the app
  and the deck. No framework. Playwright, python-pptx and LibreOffice are dev tools only.
- `python scripts/build.py --strict` must pass with 0 errors and 0 warnings before any push.
- **Deploy:** GitHub Pages via Actions from a public repo. Work locally first; create the GitHub repo
  and push only when the user says so (ask for the owner and repo name, default `chunnsshing/yonwork-deck-builder`).

---

## 10. Privacy and honesty rules (enforced)

1. **No client data in the repo:** no client or partner names, people, client figures, emails, phone
   numbers, document numbers. Tests use "Acme Trading".
2. **The denylist is `raw/denylist.txt` (gitignored).** Committing client names to a public repo in
   order to block them would leak them. `lint.py` uses it if present; CI skips that check.
3. **No claims:** nothing says "deployed", "live at clients" or quotes a measured result. Proof lives
   in the scenario library.
4. **The client name stays in the browser.** No analytics, fonts, CDNs or telemetry. Verify in the
   Network panel for both the builder and the exported HTML.
5. Proposed modules are never in a preset and can't be exported until approved.

---

## 11. Visual design: estimator first, deck vocabulary second

**Base it on the AI estimator** (`yonwork-estimator/index.html`, see its `:root`):
- Ink `#1C1C1E` / `#48484A` / muted `#86868B`; brand red `#E3202C`, deep `#B3121E`;
  primary gradient `linear-gradient(135deg,#FF5B48,#E3172A)`; tints `rgba(227,32,44,.09)`.
- Light background `#F4F4F6` with soft radial colour washes (warm red top-left, peach top-right,
  cool grey-blue bottom); **frosted-glass cards** (white gradient, blur, inner edge highlight, soft lift
  shadow); radius 22px; pills and segmented controls as in the estimator.
- Lane / category colours from the estimator: **AI red `#E3202C`**, **RULES/ERP amber `#D68A00`**,
  **PEOPLE teal `#0B8F80`**, extra series `#3D5AFE`, `#A64AC9`.
- Font: `-apple-system, "SF Pro Text", "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif`.

**From the source decks keep:** the 1280×800 stage, small uppercase letter-spaced eyebrows, large
tight headings, one idea per slide, cards / numbered steps / comparison columns / diagram vocabulary,
staggered reveals, and the gradient used sparingly as a highlight (key words, the "now" card, the
foundation bar). Use the estimator's red gradient instead of the decks' crimson-to-purple, with violet
`#A64AC9` as an occasional second accent.

All colours are CSS variables in one file (`runtime/deck.css`) shared by builder and deck; the PPTX
renderer reads the same tokens from `site.yaml`. Light backgrounds on every slide; bright, not grey.

---

## 12. Build order (show the user screenshots after each milestone)

1. **Skeleton:** repo, `site.yaml`, facts, build, deck runtime (ported from `raw/event-talk-deck.html`
   minus notes), layouts `cover`, `agenda`, `cards-3`, `thanks`; HTML export works.
2. **PPTX pipeline:** PptxGenJS vendored, slide master, the same 4 layouts as PPTX; `check_pptx.py`.
   Do this early: it decides how complex the other layouts can be.
3. **All modules + layouts, EN**, both renderers. `lint.py`, `screenshot.py`.
4. **Chinese:** `zh:` blocks for all modules (draft), UI strings, `L` toggle, font checks in PPTX.
5. **Builder UI:** stage cards, IT toggle, client name, checklist, appendix, time bar, preview, exports.
6. **Builder link, recent decks, starter-pack top bar** (+ `docs/integration.md` patch for the other repos).
7. **Pages deploy + README.**

---

## 13. Acceptance checks

- [ ] For every preset × IT on/off × EN/ZH with client "Acme Trading": the HTML opens offline, makes
      zero network requests, and every slide fits 1280×800 with no overflow (screenshots reviewed).
- [ ] The same configurations as .pptx open in PowerPoint (check with python-pptx + LibreOffice render),
      text is editable, nothing overflows its box, Chinese renders in YaHei, QR codes scan.
- [ ] `L` switches language on every slide, including facts (`value_zh`) and the agenda.
- [ ] Exports contain zero hits for any `raw/denylist.txt` term.
- [ ] No module has notes or inputs; there are no prices anywhere in `content/`.
- [ ] A builder link reproduces the same selection in a fresh browser.
- [ ] Keys ← → F O H L Esc work; the appendix is reachable via O; interactive slides don't advance on click.
- [ ] `prefers-reduced-motion` gives a static deck.
- [ ] `build.py --strict` passes in CI and Pages serves the builder.

---

## 14. Decisions

**Decided by the owner (23 Nov 2026):**
- No speaker notes in decks; sales are briefed separately.
- Design: a mix of the source decks and the estimator, closer to the estimator.
- English and Chinese with a toggle.
- The deck covers technical + theory only. Pricing → estimator; scenarios → library.
- No grant slide.
- PowerPoint export for the sales team to keep and edit locally; HTML for sharing.
- The only editable field is the client name.
- Harness, Prompt engineering, Context engineering and Harness engineering stay in English in the Chinese deck.
- Cover titles (§4) and the extra-field defaults (D1) are accepted as drafted for v1.

**Decided by the owner (23 Nov 2026, after v1 went live):**
- The house-rules ("No jargon") slide is removed.
- `chat-vs-agent` and `glossary` are approved (D4) and part of the stage 1 preset.
- The HTML deck fills the browser window (content column stays 1280 × 800-proportioned; backgrounds extend).

**Still open (defaults used until answered):**

| # | Question | Default |
|---|---|---|
| D1 | Turn on any extra fields? Candidates in `site.yaml` `fields:` (all `enabled: false`): presenter name + contact (cover/thank-you); client logo; ERP (YonSuite / YonBIP / NC Cloud → replaces "your ERP"); meeting date override | Client name only; date = today |
| D2 | Glossary terms still marked ? in §5.4 (本体层, 企业 AI 一体机, 隐患) | As written, flagged for review |
| D4 | Approve the 2 proposed modules (chat-vs-agent, glossary)? | Not in presets |
