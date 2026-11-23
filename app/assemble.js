/* app/assemble.js — turns a builder configuration into one self-contained HTML deck (both languages).
   Pure JS (no DOM), so the builder and the dev scripts (node) produce byte-identical decks.
   Needs: YW.CONTENT (from build.py), YW.ASSETS {css, js, logo}, the layout renderers, and `qrcode`. */
(function(){
  var G = typeof globalThis !== 'undefined' ? globalThis : this;
  var YW = G.YW, esc = YW.esc;
  var LANGS = ['en', 'zh'];
  var FRAME_FIRST = ['cover', 'agenda'], FRAME_LAST = 'thank-you';

  YW.UI_DECK = {
    en: { slides: 'Slides', appendix: 'Appendix', min: ' min',
          keys: '<b>←</b><b>→</b> move · <b>O</b> overview · <b>F</b> full screen · <b>L</b> 中文 · <b>H</b> hide progress · <b>Esc</b> close' },
    zh: { slides: '幻灯片', appendix: '附录', min: ' 分钟',
          keys: '<b>←</b><b>→</b> 翻页 · <b>O</b> 总览 · <b>F</b> 全屏 · <b>L</b> English · <b>H</b> 隐藏进度 · <b>Esc</b> 关闭' }
  };

  /* ── small utilities ── */
  YW.fnv = function(str){
    var h = 0x811c9dc5;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0; }
    return ('0000000' + h.toString(16)).slice(-8);
  };
  YW.cleanClient = function(s){ return String(s || '').replace(/\s+/g, ' ').trim().slice(0, 60); };
  YW.fileSafe = function(s){
    return YW.cleanClient(s).replace(/[\/\\:*?"<>|\s]+/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '') || 'Client';
  };
  YW.today = function(){
    var d = new Date(), p = function(n){ return (n < 10 ? '0' : '') + n; };
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
  };
  var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  YW.dateStr = function(iso, lang){
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || ''); if (!m) return '';
    return lang === 'zh' ? (+m[1]) + '年' + (+m[2]) + '月' + (+m[3]) + '日'
                         : (+m[3]) + ' ' + MONTHS[+m[2] - 1] + ' ' + m[1];
  };
  YW.fileName = function(cfg, ext, langSuffix){
    return (cfg.date || YW.today()) + '_' + YW.fileSafe(cfg.client) + '_YonWork_AI' +
      (langSuffix ? '_' + String(cfg.lang || 'en').toUpperCase() : '') + '.' + ext;
  };

  /* QR → crisp SVG (one path), quiet zone of 2 modules */
  YW.qrSvg = function(text){
    var q = qrcode(0, 'M'); q.addData(String(text)); q.make();
    var n = q.getModuleCount(), m = 2, d = '';
    for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (q.isDark(r, c)) d += 'M' + (c + m) + ' ' + (r + m) + 'h1v1h-1z';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + (n + 2 * m) + ' ' + (n + 2 * m) +
      '" shape-rendering="crispEdges" role="img" aria-label="QR code"><path fill="#1C1C1E" d="' + d + '"/></svg>';
  };

  /* ── deck plan: which modules, in which order ── */
  YW.plan = function(cfg){
    var C = YW.CONTENT, mods = C.modules;
    var main = (cfg.main || []).filter(function(id){ return mods[id] && FRAME_FIRST.indexOf(id) < 0 && id !== FRAME_LAST; });
    var appendix = (cfg.appendix || []).filter(function(id){ return mods[id] && main.indexOf(id) < 0 && FRAME_FIRST.indexOf(id) < 0 && id !== FRAME_LAST; });
    var seq = FRAME_FIRST.concat(main, [FRAME_LAST]).filter(function(id){ return mods[id]; });
    return { main: seq, appendix: appendix, all: seq.concat(appendix), appendixFrom: seq.length };
  };

  YW.labels = function(lang){
    var L = YW.CONTENT.site.deck_labels || {}, o = {};
    Object.keys(L).forEach(function(k){ o[k] = L[k][lang] || L[k].en; });
    return o;
  };

  YW.agendaRows = function(plan, lang){
    var C = YW.CONTENT, rows = [];
    Object.keys(C.site.sections).forEach(function(sec){
      var mins = 0, any = false;
      plan.main.forEach(function(id){ var m = C.modules[id]; if (m.section === sec) { any = true; mins += m.minutes || 0; } });
      if (!any) return;
      var S = C.site.sections[sec], whole = Math.max(1, Math.round(mins));
      rows.push({ id: sec, name: S[lang] || S.en, summary: (S.summary || {})[lang] || (S.summary || {}).en || '', minutes: whole,
                  minLabel: whole + YW.UI_DECK[lang].min });
    });
    return rows;
  };

  /* replace the runtime placeholders ({{client}}, {{preset.*}}) in every string of a slide */
  function fill(v, vars){
    if (typeof v === 'string') return v.replace(/\{\{\s*([\w.]+)\s*\}\}/g, function(all, k){ return k in vars ? vars[k] : all; });
    if (Array.isArray(v)) return v.map(function(x){ return fill(x, vars); });
    if (v && typeof v === 'object') { var o = {}; for (var k in v) o[k] = fill(v[k], vars); return o; }
    return v;
  }
  YW.slideData = function(id, lang, cfg){
    var C = YW.CONTENT, m = C.modules[id], P = C.site.presets[cfg.stage] || {};
    var data = m.slide[lang] || m.slide.en;
    return fill(data, {
      client: YW.cleanClient(cfg.client) || 'Client',
      'preset.title': (P.title || {})[lang] || '',
      'preset.subtitle': (P.subtitle || {})[lang] || ''
    });
  };
  YW.title = function(id, lang){ var m = YW.CONTENT.modules[id]; return (lang === 'zh' && m.title_zh) || m.title; };

  function renderSlide(id, i, total, isApx, lang, cfg, ctx){
    var m = YW.CONTENT.modules[id], s = YW.slideData(id, lang, cfg);
    var fn = YW.L[m.layout], out;
    if (fn) out = fn(s, ctx);
    else out = { cls: 'l-pending', html: YW.eyebrow(s.eyebrow, 0) + YW.head(s.heading || m.title, 1) +
                 '<div class="box">Layout “' + esc(m.layout) + '” arrives in a later milestone.</div>' };
    var org = (YW.CONTENT.site.brand.org || {})[lang] || 'Yonyou Singapore';
    return '<section class="slide l-' + esc(m.layout) + (out.cls ? ' ' + out.cls : '') + '" data-id="' + esc(id) + '"' +
      (out.scene ? ' data-scene="' + esc(out.scene) + '"' : '') + '>' + out.html +
      '<div class="foot"><span class="who">' + esc(YW.cleanClient(cfg.client) || 'Client') + ' × ' + esc(org) + '</span>' +
      (isApx ? '<span class="apx">' + YW.UI_DECK[lang].appendix + '</span>' : '') +
      '<img src="' + ctx.logo + '" alt="">' +
      '<span class="pg">' + (i + 1) + ' / ' + total + '</span></div></section>';
  }

  /* ── the whole deck ── */
  YW.assemble = function(cfg){
    var C = YW.CONTENT, A = YW.ASSETS;
    cfg = Object.assign({ lang: 'en', stage: 1, it: false, main: [], appendix: [], client: '', date: YW.today() }, cfg);
    var plan = YW.plan(cfg), total = plan.all.length;
    var decks = '', titles = {}, missing = [];
    plan.all.forEach(function(id){ var l = C.modules[id].layout; if (!YW.L[l] && missing.indexOf(l) < 0) missing.push(l); });
    LANGS.forEach(function(lang){
      var ctx = { lang: lang, labels: YW.labels(lang), logo: A.logo, date: YW.dateStr(cfg.date, lang), agenda: YW.agendaRows(plan, lang),
                  client: YW.cleanClient(cfg.client), stage: cfg.stage };
      titles[lang] = plan.all.map(function(id){ return esc(YW.title(id, lang)); });
      decks += '<div class="deck" lang="' + lang + '">' + plan.all.map(function(id, i){
        return renderSlide(id, i, total, i >= plan.appendixFrom, lang, cfg, ctx);
      }).join('') + '</div>';
    });
    var hashCfg = { v: C.version, lang: cfg.lang, s: cfg.stage, it: !!cfg.it, m: plan.main, a: plan.appendix };
    var hash = YW.fnv(JSON.stringify(hashCfg) + '|' + C.contentHash);
    var DECK = { lang: cfg.lang, n: total, appendixFrom: plan.appendixFrom < total ? plan.appendixFrom : -1, titles: titles, ui: YW.UI_DECK };
    var js = function(o){ return JSON.stringify(o).replace(/</g, '\\u003c').replace(new RegExp('[\\u2028\\u2029]', 'g'), function(c){ return '\\u' + c.charCodeAt(0).toString(16); }); };
    var client = YW.cleanClient(cfg.client) || 'Client';
    var html = '<!DOCTYPE html>\n<html class="yw-deck" lang="' + (cfg.lang === 'zh' ? 'zh-Hans' : 'en') + '"><head><meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; img-src data:; style-src \'unsafe-inline\'; script-src \'unsafe-inline\'">' +
      '<meta name="generator" content="yonwork-deck-builder v' + esc(C.version) + ' · ' + hash + '">' +
      '<title>' + esc(client) + ' × Yonyou Singapore · YonWork AI</title>' +
      '<style>' + A.css + '</style></head><body>' +
      '<div id="fit"><div id="stage">' + decks + '</div></div>' +
      '<div id="bar"><div id="barfill"></div></div><div id="scrim"></div><div id="idx" class="pane" role="dialog"></div>' +
      '<script>window.DECK=' + js(DECK) + ';</script>' +
      '<script>' + (A.scenes || '') + '</script>' +
      '<script>' + A.js + '</script></body></html>';
    return { html: html, hash: hash, plan: plan, missing: missing, filename: YW.fileName(cfg, 'html') };
  };
})();
