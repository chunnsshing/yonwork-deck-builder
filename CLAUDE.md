# CLAUDE.md

This repo is the **YonWork Deck Builder**, one of three tools in the YonWork Starter Pack
(scenario library · deck builder · AI estimator). Read `HANDOFF.md` fully before any work.

Most important rules:
- **Scope:** decks explain technical + theory only. No pricing (that's the estimator), no scenarios
  (that's the library), no speaker notes, no grant content. The only user input is the client name.
- **Public repo, public site.** No client names, people, client figures, emails or phone numbers
  anywhere: content, commit messages, file names, tests. Use "Acme Trading" for tests.
- The denylist is `raw/denylist.txt` (gitignored). Never commit it or repeat its terms.
- `raw/` holds the original client decks for reference only. Strip anything you take from them (HANDOFF §10).
- Model names, hardware, policies and statistics live in `content/facts.yaml` with source and review date.
  No prices anywhere in this repo.
- Every module has EN (`slide:`) and ZH (`zh:`) with identical shape. New Chinese text is `zh_status: draft`.
  Harness, Prompt engineering, Context engineering and Harness engineering stay in English in Chinese text.
- Every layout has two renderers: HTML and PPTX (PptxGenJS, native editable shapes, not images).
- Never invent figures or claim anything is deployed or measured. New content is `origin: proposed` until approved.
- Don't edit `yonyou-ai-cases` or `yonwork-estimator`. Propose changes in `docs/integration.md`.
- No CDN, external requests or analytics. The HTML export is one self-contained offline file.
- Before every push: `python scripts/build.py --strict` (0 errors, 0 warnings), `python scripts/screenshot.py`
  and `python scripts/check_pptx.py`, then look at the screenshots of every changed layout in EN and ZH.
- Show the user a local preview before pushing to `main`: Pages goes live about a minute after a push.
