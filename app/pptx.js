/* app/pptx.js — builds an editable PowerPoint with PptxGenJS (vendored). One language per file.
   Layout renderers (layouts/<name>.pptx.js) draw on a 1280x800 px grid; helpers convert to inches
   (13.333 x 8.333 in, same 16:10 ratio as the HTML stage). Native text boxes, shapes and tables only. */
(function(){
  var G = typeof globalThis !== 'undefined' ? globalThis : this;
  var YW = G.YW;
  var PX = 1 / 96;                         // px → in
  YW.in = function(px){ return Math.round(px * PX * 10000) / 10000; };
  YW.pt = function(px){ return Math.round(px * 0.75 * 10) / 10; };

  function tok(){
    var t = YW.CONTENT.site.brand.tokens, o = {};
    Object.keys(t).forEach(function(k){ o[k] = String(t[k]).replace('#', '').toUpperCase(); });
    return o;
  }

  /* drawing kit handed to every renderer as ctx.d */
  function kit(pptx, lang){
    var F = YW.CONTENT.site.brand.fonts, T = tok(), font = lang === 'zh' ? F.pptx_zh : F.pptx_en;
    var CJK = /[\u2E80-\u9FFF\uAC00-\uD7AF\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFFEF]/;
    function faceFor(t){ return lang === 'en' && CJK.test(t) ? F.pptx_zh : font; }   // Arial has no Chinese glyphs
    var langTag = lang === 'zh' ? 'zh-CN' : 'en-US';
    var d = { T: T, font: font, lang: lang };
    function box(o){ return { x: YW.in(o.x), y: YW.in(o.y), w: YW.in(o.w), h: YW.in(o.h) }; }
    function textOpts(o){
      var r = box(o);
      r.fontFace = font; r.lang = langTag;
      r.fontSize = YW.pt(o.size || 18); r.color = o.color || T.ink; r.bold = !!o.bold;
      r.align = o.align || 'left'; r.valign = o.valign || 'top'; r.margin = 0;
      r.lineSpacingMultiple = o.lh || d.LH;
      if (o.charSpacing) r.charSpacing = o.charSpacing;
      if (o.fit) r.fit = o.fit;
      if (o.paraSpaceAfter) r.paraSpaceAfter = o.paraSpaceAfter;
      r.wrap = o.wrap !== false;
      return r;
    }
    /* text: string, or runs [{text, color, bold, size, breakLine}] */
    d.text = function(slide, txt, o){
      if (Array.isArray(txt)) {
        txt = txt.map(function(run){
          var ro = { fontFace: faceFor(run.text), lang: langTag };
          if (run.color) ro.color = run.color;
          if (run.bold !== undefined) ro.bold = run.bold;
          if (run.size) ro.fontSize = YW.pt(run.size);
          if (run.breakLine) ro.breakLine = true;
          if (run.bullet) ro.bullet = run.bullet;
          if (run.paraSpaceAfter) ro.paraSpaceAfter = run.paraSpaceAfter;
          if (run.italic) ro.italic = true;
          return { text: String(run.text), options: ro };
        });
      } else txt = String(txt == null ? '' : txt);
      var opts = textOpts(o);
      if (typeof txt === 'string') opts.fontFace = faceFor(txt);
      slide.addText(txt, opts);
    };
    d.rect = function(slide, o){
      var r = box(o);
      r.fill = o.fill ? { color: o.fill, transparency: o.alpha || 0 } : { type: 'none' };
      r.line = o.line ? { color: o.line, width: o.lineW || 0.75, dashType: o.dash || 'solid' } : { type: 'none' };
      if (o.radius) r.rectRadius = YW.in(o.radius);
      if (o.shadow) r.shadow = { type: 'outer', blur: 10, offset: 3, angle: 90, color: '141428', opacity: 0.12 };
      slide.addShape(o.radius ? 'roundRect' : (o.shape || 'rect'), r);
    };
    d.ellipse = function(slide, o){ o.shape = 'ellipse'; o.radius = 0; d.rect(slide, o); };
    d.card = function(slide, o){ d.rect(slide, { x: o.x, y: o.y, w: o.w, h: o.h, fill: o.fill || T.card, line: o.line || 'E6E6EB', radius: o.radius || 22, shadow: true }); };
    d.image = function(slide, data, o){ var r = box(o); r.data = data; slide.addImage(r); };

    /* rough text metrics so layouts can stack blocks (PowerPoint has no auto-layout) */
    d.width = function(s, size, bold){
      var w = 0, A = YW.ARIAL[bold ? 1 : 0]; s = String(s || '');
      for (var i = 0; i < s.length; i++) {
        var c = s.charCodeAt(i);
        if (c >= 32 && c <= 126) w += A[c - 32] / 1000 * (lang === 'zh' ? 1.1 : 1);   // YaHei Latin runs ~10% wider
        else if (/[\u2E80-\u9FFF\uAC00-\uD7AF\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFFEF]/.test(s[i])) w += 1;     // CJK: one em
        else if (c >= 0xD800 && c <= 0xDBFF) w += 1.1;          // emoji (high surrogate) ≈ one em
        else if ((c >= 0xDC00 && c <= 0xDFFF) || c === 0xFE0F || c === 0x200D) w += 0;   // rest of an emoji
        else w += 0.6;                                      // ×, ·, accents, typographic quotes
      }
      return w * size * 1.02;                               // 2% safety margin
    };
    d.lines = function(s, size, boxW, bold){
      return String(s || '').split('\n').reduce(function(n, para){
        var words = para.split(/(?<=\s)|(?=[\u2E80-\u9FFF\uAC00-\uD7AF\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFFEF])/), line = 0, k = 1;
        words.forEach(function(wd){ var ww = d.width(wd, size, bold); if (line + ww > boxW && line > 0) { k++; line = ww; } else line += ww; });
        return n + k;
      }, 0);
    };
    /* PowerPoint line box ≈ 1.2 × font size × lineSpacingMultiple; pass the same multiple the text uses */
    d.LH = lang === 'zh' ? 1.25 : 1.15;
    d.height = function(s, size, boxW, bold, lsm){ return d.lines(s, size, boxW, bold) * size * 1.2 * (lsm || d.LH) + 4; };

    /* shared slide furniture: eyebrow + heading (+ lede), returns the y where content starts */
    d.header = function(slide, s, opt){
      opt = opt || {}; var x = 84, w = opt.w || 1080, y = opt.y || 72;
      if (s.eyebrow) { d.text(slide, String(s.eyebrow).toUpperCase(), { x: x, y: y, w: w, h: 22, size: 14, bold: true, color: opt.hot ? T.red : T.muted, charSpacing: 2 }); y += 34; }
      var hs = opt.size || 46, hl = lang === 'zh' ? 1.1 : 0.95, hh = d.height(s.heading, hs, w, true, hl);
      d.text(slide, s.heading, { x: x, y: y, w: w, h: hh, size: hs, bold: true, lh: hl });
      y += hh + 6;
      if (s.lede) { var lh = d.height(s.lede, 21, w - 120, false, 1.25); d.text(slide, s.lede, { x: x, y: y + 6, w: w - 120, h: lh, size: 21, color: T.ink2, lh: 1.25 }); y += lh + 14; }
      return y + 22;
    };
    d.band = function(slide, b, y){
      if (!b) return y;
      var th = d.height(b.text, 18, 900, false, 1.15);
      var h = Math.max(56, th + 26);
      d.card(slide, { x: 84, y: y, w: 1112, h: h, radius: 16 });
      var tw = d.width(String(b.tag).toUpperCase(), 12, true) + 30;
      d.rect(slide, { x: 106, y: y + h / 2 - 15, w: tw, h: 30, fill: T.red, radius: 15 });
      d.text(slide, String(b.tag).toUpperCase(), { x: 106, y: y + h / 2 - 15, w: tw, h: 30, size: 12, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle', charSpacing: 1 });
      d.text(slide, b.text, { x: 106 + tw + 18, y: y + 13, w: 1060 - tw - 40, h: h - 26, size: 18, valign: 'middle', lh: 1.15 });
      return y + h;
    };
    /* native bulleted list (editable, hanging indent). kind: 'yes' ✓ · 'no' – · default • ; returns height */
    d.listHeight = function(items, size, w){
      return (items || []).reduce(function(h, t){ return h + d.height(t, size, w - 22, false, 1.1) + 5; }, 0);
    };
    d.list = function(slide, items, o){
      var code = o.kind === 'yes' ? '2713' : o.kind === 'no' ? '2013' : '2022';
      var size = o.size || 16, h = d.listHeight(items, size, o.w);
      var runs = (items || []).map(function(t, i, a){
        return { text: t, bullet: { characterCode: code, indent: 16 }, breakLine: i < a.length - 1, paraSpaceAfter: 4 };
      });
      if (runs.length) d.text(slide, runs, { x: o.x, y: o.y, w: o.w, h: h, size: size, color: o.color || T.ink2, lh: 1.1 });
      return h;
    };
    /* straight line between two points (handles direction with flips) */
    d.line = function(slide, x1, y1, x2, y2, o){
      o = o || {};
      var r = { x: YW.in(Math.min(x1, x2)), y: YW.in(Math.min(y1, y2)), w: YW.in(Math.max(Math.abs(x2 - x1), 0.01)), h: YW.in(Math.max(Math.abs(y2 - y1), 0.01)),
                line: { color: o.color || T.red, width: o.w || 1.25, dashType: o.dash || 'solid', transparency: o.alpha || 0 } };
      if (o.end) r.line.endArrowType = 'triangle';
      if ((x2 < x1) !== (y2 < y1) && x1 !== x2 && y1 !== y2) r.flipV = true;
      slide.addShape('line', r);
    };
    /* pill label; returns its width */
    d.pill = function(slide, text, x, y, o){
      o = o || {}; var size = o.size || 12, txt = o.upper === false ? String(text) : String(text).toUpperCase();
      var w = d.width(txt, size, true) + (o.pad || 24), h = o.h || size + 16;
      d.rect(slide, { x: x, y: y, w: w, h: h, fill: o.fill || T.red_tint, line: o.line, radius: h / 2 });
      d.text(slide, txt, { x: x, y: y, w: w, h: h, size: size, bold: true, color: o.color || T.red_deep, align: 'center', valign: 'middle', lh: 1, charSpacing: o.upper === false ? 0 : 0.6 });
      return w;
    };
    d.cap = function(slide, text, x, y, w, color){ d.text(slide, String(text || '').toUpperCase(), { x: x, y: y, w: w, h: 18, size: 12, bold: true, color: color || T.red, charSpacing: 1.2, lh: 1 }); return 18; };
    d.qband = function(slide, text, y){
      var h = d.height(text, 18, 1068, true, 1.1) + 24;
      d.rect(slide, { x: 84, y: y, w: 1112, h: h, fill: T.red_tint, radius: 16 });
      d.text(slide, text, { x: 106, y: y + 12, w: 1068, h: h - 24, size: 18, bold: true, color: T.red_deep, lh: 1.1, valign: 'middle' });
      return h;
    };
    d.note = function(slide, text, y, w){ var h = d.height(text, 13.5, w || 1112, false, 1.1); d.text(slide, text, { x: 84, y: y, w: w || 1112, h: h, size: 13.5, color: T.muted, lh: 1.1 }); return h; };
    return d;
  }

  /* QR as an image (GIF data URL from the vendored encoder; no canvas, works headless) */
  YW.qrImage = function(text){
    var q = qrcode(0, 'M'); q.addData(String(text)); q.make();
    return q.createDataURL(8, 4);
  };

  function footerText(cfg, lang){
    var org = (YW.CONTENT.site.brand.org || {})[lang] || 'Yonyou Singapore';
    var c = YW.cleanClient(cfg.client) || 'Client', s = c + ' × ' + org;
    if (YW.vlen(s) > 84) { while (YW.vlen(c + '… × ' + org) > 84) c = c.slice(0, -1); s = c.trim() + '… × ' + org; }
    return s;
  }

  /* Layouts draw top-down from y = 72. Like the HTML (flex-centred), shift the finished slide down so its content
     block sits in the middle of the content area (72 → 720 px). Calls are recorded first, then replayed shifted. */
  var FIXED = ['cover', 'thanks', 'statement'];
  function centred(slide, draw){
    var calls = [], rec = {
      addText: function(t, o){ calls.push(['addText', t, o]); },
      addShape: function(k, o){ calls.push(['addShape', k, o]); },
      addImage: function(o){ calls.push(['addImage', o]); },
      addTable: function(r, o){ calls.push(['addTable', r, o]); }
    };
    draw(rec);
    var bottom = 0;
    calls.forEach(function(c){
      var o = c[c.length - 1], h = o.h || 0;
      if (c[0] === 'addTable' && o.rowH) h = o.rowH.reduce(function(a, b){ return a + b; }, 0);
      bottom = Math.max(bottom, (o.y || 0) + h);
    });
    var off = Math.max(0, (YW.in(720) - bottom) / 2);
    off = Math.min(off, YW.in(120));
    calls.forEach(function(c){
      var o = c[c.length - 1]; if (o.y != null) o.y = Math.round((o.y + off) * 10000) / 10000;
      if (c[0] === 'addText') slide.addText(c[1], o);
      else if (c[0] === 'addShape') slide.addShape(c[1], o);
      else if (c[0] === 'addImage') slide.addImage(o);
      else slide.addTable(c[1], o);
    });
  }

  YW.buildPptx = function(cfg){
    var C = YW.CONTENT;
    cfg = Object.assign({ lang: 'en', stage: 1, main: [], appendix: [], client: '', date: YW.today() }, cfg);
    var lang = cfg.lang === 'zh' ? 'zh' : 'en';
    var plan = YW.plan(cfg);
    var pptx = new G.PptxGenJS();
    pptx.defineLayout({ name: 'YW1610', width: 13.3333, height: 8.3333 });
    pptx.layout = 'YW1610';
    pptx.author = 'Yonyou Singapore'; pptx.company = 'Yonyou Singapore';
    pptx.title = (YW.cleanClient(cfg.client) || 'Client') + ' × Yonyou Singapore · YonWork AI';
    pptx.subject = 'YonWork AI'; pptx.theme = { headFontFace: kit(pptx, lang).font, bodyFontFace: kit(pptx, lang).font };
    var d = kit(pptx, lang), T = d.T, logo = YW.ASSETS.logo;

    var wash = [
      { ellipse: { x: YW.in(-260), y: YW.in(-300), w: YW.in(720), h: YW.in(620), fill: { color: 'FFD9D2', transparency: 55 }, line: { type: 'none' } } },
      { ellipse: { x: YW.in(820), y: YW.in(520), w: YW.in(760), h: YW.in(560), fill: { color: 'DDE1EE', transparency: 40 }, line: { type: 'none' } } }
    ];
    var ft = footerText(cfg, lang);
    var foot = { text: { text: ft, options: { x: YW.in(84), y: YW.in(752), w: YW.in(860), h: YW.in(22), fontFace: lang === 'en' && /[\u2E80-\u9FFF\uAC00-\uD7AF\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFFEF]/.test(ft) ? C.site.brand.fonts.pptx_zh : d.font, fontSize: 9.5, bold: true, color: T.muted, margin: 0, valign: 'middle' } } };
    var logoObj = { image: { x: YW.in(1196 - 60 - 74), y: YW.in(752), w: YW.in(74), h: YW.in(74 * 120 / 591), data: logo } };
    pptx.defineSlideMaster({ title: 'YW_CONTENT', background: { color: 'F5F5F7' }, objects: wash.concat([foot, logoObj]),
      slideNumber: { x: YW.in(1136), y: YW.in(752), w: YW.in(60), h: YW.in(22), fontFace: d.font, fontSize: 9.5, color: T.muted, bold: true, align: 'right', margin: 0 } });
    pptx.defineSlideMaster({ title: 'YW_COVER', background: { color: 'F5F5F7' }, objects: wash.concat([foot]) });

    var ctx = { lang: lang, labels: YW.labels(lang), d: d, T: T, logo: logo, date: YW.dateStr(cfg.date, lang), agenda: YW.agendaRows(plan, lang),
                client: YW.cleanClient(cfg.client), stage: cfg.stage };
    var missing = [];
    function add(id){
      var m = C.modules[id], s = YW.slideData(id, lang, cfg), fn = YW.P[m.layout];
      var slide = pptx.addSlide({ masterName: m.layout === 'cover' ? 'YW_COVER' : 'YW_CONTENT' });
      if (fn && FIXED.indexOf(m.layout) >= 0) fn(slide, s, ctx);
      else if (fn) centred(slide, function(rec){ fn(rec, s, ctx); });
      else {
        if (missing.indexOf(m.layout) < 0) missing.push(m.layout);
        var y = d.header(slide, { eyebrow: s.eyebrow, heading: s.heading || m.title });
        d.rect(slide, { x: 84, y: y, w: 1112, h: 80, line: 'C8C8CE', dash: 'dash', radius: 18 });
        d.text(slide, 'Layout “' + m.layout + '” arrives in a later milestone.', { x: 110, y: y + 26, w: 1000, h: 30, size: 18, color: T.muted, lh: 1 });
      }
    }
    plan.main.forEach(add);
    if (plan.appendix.length) {
      var div = pptx.addSlide({ masterName: 'YW_CONTENT' });
      d.text(div, YW.labels(lang).appendix, { x: 84, y: 320, w: 1112, h: 96, size: 64, bold: true, color: T.red, lh: 1 });
      d.text(div, YW.labels(lang).appendix_sub, { x: 84, y: 420, w: 1112, h: 30, size: 22, color: T.ink2 });
      plan.appendix.forEach(add);
    }
    return { pptx: pptx, plan: plan, missing: missing, filename: YW.fileName(cfg, 'pptx', true) };
  };
})();
