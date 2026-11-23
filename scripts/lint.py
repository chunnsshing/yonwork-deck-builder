#!/usr/bin/env python3
"""Content lint (HANDOFF §5, §10). Called by build.py; also runs on its own:

    python scripts/lint.py

Errors: notes/inputs, prices (S$, $ amounts), hard-coded model names or % figures in modules, claim words,
denylist hits (raw/denylist.txt, if present; CI has no denylist and skips that check).
Warnings: on-slide text past the length limits (EN chars / Chinese characters).
"""
import re, sys
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
LIMITS = {  # (EN chars, ZH CJK chars)
    "heading": (70, 30),
    "lede": (160, 70), "source": (200, 120), "footnote": (200, 100), "question": (120, 60), "foundation": (110, 50),
    "_default": (110, 50),
}
NO_LIMIT = {"id", "section", "title", "title_zh", "layout", "audience", "origin", "zh_status", "url", "badge", "n", "icon", "tone", "date"}
MODEL_NAMES = re.compile(r"\b(GPT-?\d|ChatGPT|Claude|OpenAI|Anthropic|Gemini|Llama|Qwen|DeepSeek|Mistral|GB10|NVIDIA)\b", re.I)
PRICE = re.compile(r"(S\$|US\$|\$\s?\d|\d\s?(SGD|USD)\b)")
PERCENT = re.compile(r"\d\s?%")
CLAIMS = re.compile(r"\b(deployed (at|for|in)|live at|our clients (saw|got|cut|saved)|reduced .{0,20} by \d|saved \d|guarantee[sd]?)\b", re.I)


def is_cjk(ch):
    o = ord(ch)
    return 0x2E80 <= o <= 0x9FFF or 0xAC00 <= o <= 0xD7AF or 0xF900 <= o <= 0xFAFF or 0xFE30 <= o <= 0xFE4F or 0xFF00 <= o <= 0xFFEF


def cjk_len(s):
    return sum(1 for c in s if is_cjk(c))


def leaves(node, path=""):
    if isinstance(node, dict):
        for k, v in node.items():
            yield from leaves(v, f"{path}.{k}" if path else k)
    elif isinstance(node, list):
        for i, v in enumerate(node):
            yield from leaves(v, f"{path}[{i}]")
    elif isinstance(node, str):
        yield path, node


def field_of(path):
    keys = [p for p in re.split(r"[.\[\]]", path) if p and not p.isdigit()]
    return keys[-1] if keys else path


def denylist():
    p = ROOT / "raw" / "denylist.txt"
    if not p.exists():
        return None
    return [l.strip().lower() for l in p.read_text(encoding="utf-8").splitlines() if l.strip() and not l.startswith("#")]


def lint(files=None):
    errors, warnings = [], []
    terms = denylist()
    files = files or sorted((ROOT / "content/modules").glob("*/*.yaml"))
    for p in files:
        rel = p.relative_to(ROOT)
        raw = p.read_text(encoding="utf-8")
        m = yaml.safe_load(raw) or {}
        for banned in ("notes", "inputs"):
            if banned in m or banned in (m.get("slide") or {}) or banned in (m.get("zh") or {}):
                errors.append(f"{rel}: has '{banned}'")
        for block, lang in (("slide", "en"), ("zh", "zh")):
            for path, text in leaves(m.get(block) or {}):
                f = field_of(path)
                plain = re.sub(r"\{\{[^}]+\}\}", "", text)
                if PRICE.search(plain):
                    errors.append(f"{rel}: {block}.{path}: looks like a price (no prices in this repo)")
                if MODEL_NAMES.search(plain):
                    errors.append(f"{rel}: {block}.{path}: model/hardware/provider name — put it in content/facts.yaml")
                if PERCENT.search(plain):
                    errors.append(f"{rel}: {block}.{path}: % figure — put statistics in content/facts.yaml")
                if CLAIMS.search(plain):
                    errors.append(f"{rel}: {block}.{path}: reads like a deployment/result claim (HANDOFF §10.3)")
                if f in NO_LIMIT or "{{" in text:
                    continue
                en_max, zh_max = LIMITS.get(f, LIMITS["_default"])
                if lang == "en" and len(text) > en_max:
                    warnings.append(f"{rel}: slide.{path} is {len(text)} chars (limit {en_max})")
                if lang == "zh" and cjk_len(text) > zh_max:
                    warnings.append(f"{rel}: zh.{path} is {cjk_len(text)} Chinese characters (limit {zh_max})")
        if terms:
            low = raw.lower()
            if any(t in low for t in terms):
                errors.append(f"{rel}: contains a raw/denylist.txt term")
    # no prices anywhere in content/ or site.yaml
    for p in [ROOT / "site.yaml", ROOT / "content/facts.yaml"]:
        for i, line in enumerate(p.read_text(encoding="utf-8").splitlines(), 1):
            code = line.split("#", 1)[0]
            if PRICE.search(code):
                errors.append(f"{p.relative_to(ROOT)}:{i}: looks like a price")
            if terms and any(t in line.lower() for t in terms):
                errors.append(f"{p.relative_to(ROOT)}:{i}: contains a raw/denylist.txt term")
    return errors, warnings


def scan_dist(text):
    """Denylist scan for built output (dist/index.html and exported decks)."""
    terms = denylist()
    if not terms:
        return 0
    low = text.lower()
    return sum(1 for t in terms if t in low)


if __name__ == "__main__":
    e, w = lint()
    for x in w: print(f"warning: {x}")
    for x in e: print(f"ERROR: {x}")
    print(f"lint: {len(e)} error(s), {len(w)} warning(s)" + ("" if denylist() is not None else " · no raw/denylist.txt, denylist check skipped"))
    sys.exit(1 if e else 0)
