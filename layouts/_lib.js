/* layouts/_lib.js — shared helpers for every layout renderer (HTML and PPTX).
   Pure JS, no DOM: runs in the builder, inside node (scripts) and nowhere else. */
var YW = (typeof globalThis !== 'undefined' ? globalThis : this).YW || {};
(typeof globalThis !== 'undefined' ? globalThis : this).YW = YW;
YW.L = YW.L || {};   // HTML renderers: YW.L[layout] = function(slide, ctx) -> { html, cls?, scene? }
YW.P = YW.P || {};   // PPTX renderers: YW.P[layout] = function(pptxSlide, slide, ctx)

YW.esc = function(s){
  return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
};
var esc = YW.esc;

/* staggered reveal attribute */
YW.anim = function(i, kind){
  return ' data-anim' + (kind ? '="' + kind + '"' : '') + ' style="--d:' + (0.08 + i * 0.09).toFixed(2) + 's"';
};

/* visual width: CJK counts as 2 */
YW.vlen = function(s){
  var n = 0; s = String(s || '');
  for (var i = 0; i < s.length; i++) n += /[\u2E80-\u9FFF\uAC00-\uD7AF\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFFEF]/.test(s[i]) ? 2 : 1;
  return n;
};

YW.eyebrow = function(t, i, hot){ return t ? '<div class="eyebrow' + (hot ? ' hot' : '') + '"' + YW.anim(i || 0, 'fade') + '>' + esc(t) + '</div>' : ''; };
YW.head = function(t, i){ return '<h2 class="head"' + YW.anim(i || 1) + '>' + esc(t) + '</h2>'; };
YW.lede = function(t, i){ return t ? '<p class="lede"' + YW.anim(i || 2) + '>' + esc(t) + '</p>' : ''; };
YW.band = function(b, i){
  if (!b) return '';
  return '<div class="band glass"' + YW.anim(i || 6) + '><span class="pilltag">' + esc(b.tag) + '</span><span class="t">' + esc(b.text) + '</span></div>';
};
YW.ul = function(items, cls){
  return '<ul class="ul' + (cls ? ' ' + cls : '') + '">' + (items || []).map(function(t){ return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>';
};
YW.cardHtml = function(c, i, opt){
  opt = opt || {};
  return '<div class="card glass' + (opt.cls ? ' ' + opt.cls : '') + (c.highlight || c.now ? ' hot' : '') + '"' + YW.anim(i + (opt.d || 3)) + '>' +
    (opt.ico === false ? '' : '<div class="ico">' + (c.icon ? esc(c.icon) : (c.n != null ? esc(c.n) : String(i + 1))) + '</div>') +
    '<h4>' + esc(c.title) + '</h4><p>' + esc(c.body) + '</p>' +
    (c.tag ? '<div class="tag"><span class="pilltag">' + esc(c.tag) + '</span></div>' : '') + '</div>';
};
