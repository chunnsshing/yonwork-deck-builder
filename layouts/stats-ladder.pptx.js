/* stats-ladder (PPTX) — stat tiles + four static bars (shapes) */
YW.P['stats-ladder'] = function(slide, s, ctx){
  var d = ctx.d, T = ctx.T, H = [205, 265, 330, 400], base = 688;
  d.header(slide, s);
  var stats = s.stats || [], sy = base;
  for (var i = stats.length - 1; i >= 0; i--) {
    var t = stats[i], lh = d.height(t.label, 15, 256, false, 1.15), h = 22 + 60 + 8 + lh + 20;
    sy -= h;
    d.card(slide, { x: 84, y: sy, w: 300, h: h });
    d.text(slide, t.value, { x: 106, y: sy + 20, w: 256, h: 62, size: 56, bold: true, color: t.tone === 'accent' ? T.red : T.ink2, lh: 0.9 });
    d.text(slide, t.label, { x: 106, y: sy + 88, w: 256, h: lh, size: 15, color: T.ink2, lh: 1.15 });
    sy -= 14;
  }
  var bw = (790 - 36) / 4;
  (s.levels || []).forEach(function(l, i){
    var x = 406 + i * (bw + 12), h = H[i], y = base - h, iw = bw - 32;
    d.card(slide, { x: x, y: y, w: bw, h: h, fill: i >= 2 ? T.hot : T.card });
    d.cap(slide, l.tag, x + 16, y + 16, iw);
    var th = d.height(l.title, 19, iw, true, 1);
    d.text(slide, l.title, { x: x + 16, y: y + 38, w: iw, h: th, size: 19, bold: true, lh: 1 });
    var bh = d.height(l.body, 14, iw, false, 1.15);
    d.text(slide, l.body, { x: x + 16, y: y + 44 + th, w: iw, h: bh, size: 14, color: T.ink2, lh: 1.15 });
    d.text(slide, l.who, { x: x + 16, y: base - 32, w: iw, h: 18, size: 11, bold: true, color: T.muted, charSpacing: 1, lh: 1 });
  });
  if (s.source) d.text(slide, s.source, { x: 84, y: base + 10, w: 1112, h: 20, size: 12, color: T.muted, lh: 1 });
};
