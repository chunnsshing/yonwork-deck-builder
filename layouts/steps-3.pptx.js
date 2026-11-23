/* steps-3 (PPTX) — shapes + arrows; future step dashed */
YW.P['steps-3'] = function(slide, s, ctx){
  var d = ctx.d, T = ctx.T, st = s.steps || [], y = d.header(slide, s) + 4, aw = 34, w = (1112 - aw * 2) / 3, iw = w - 44;
  var th = Math.max.apply(null, st.map(function(c){ return d.height(c.title, 24, iw, true, 1); }));
  var bh = Math.max.apply(null, st.map(function(c){ return d.height(c.body, 16, iw, false, 1.15); }));
  var xh = Math.max.apply(null, st.map(function(c){ return c.example ? d.height(c.example, 14.5, iw, false, 1.15) : 0; }));
  var h = 24 + 18 + 10 + th + 8 + bh + 14 + 12 + xh + 24;
  st.forEach(function(c, i){
    var x = 84 + i * (w + aw), yy = y + 24;
    if (i) d.text(slide, '→', { x: x - aw, y: y, w: aw, h: h, size: 24, bold: true, color: 'C7C7CC', align: 'center', valign: 'middle', lh: 1 });
    if (c.future) d.rect(slide, { x: x, y: y, w: w, h: h, line: 'C8C8CE', dash: 'dash', lineW: 1.5, radius: 22 });
    else d.card(slide, { x: x, y: y, w: w, h: h });
    d.cap(slide, c.cap, x + 22, yy, iw); yy += 28;
    d.text(slide, c.title, { x: x + 22, y: yy, w: iw, h: th, size: 24, bold: true, lh: 1 }); yy += th + 8;
    d.text(slide, c.body, { x: x + 22, y: yy, w: iw, h: bh, size: 16, color: T.ink2, lh: 1.15 }); yy += bh + 14;
    if (c.example) {
      d.line(slide, x + 22, yy, x + w - 22, yy, { color: 'D1D1D6', dash: 'dash', w: 1 });
      d.text(slide, c.example, { x: x + 22, y: yy + 12, w: iw, h: xh, size: 14.5, color: T.muted, lh: 1.15, italic: true });
    }
  });
  d.band(slide, s.band, y + h + 20);
};
