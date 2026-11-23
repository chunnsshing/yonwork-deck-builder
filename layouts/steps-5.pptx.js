/* steps-5 (PPTX) */
YW.P['steps-5'] = function(slide, s, ctx){
  var d = ctx.d, T = ctx.T, st = s.steps || [], y = d.header(slide, s) + 4, aw = 22, w = (1112 - aw * 4) / 5, iw = w - 32;
  var th = Math.max.apply(null, st.map(function(c){ return d.height(c.title, 18.5, iw, true, 1); }));
  var bh = Math.max.apply(null, st.map(function(c){ return d.height(c.body, 14.5, iw, false, 1.15); }));
  var h = 20 + 30 + 10 + th + 6 + bh + 22;
  st.forEach(function(c, i){
    var x = 84 + i * (w + aw);
    if (i) d.text(slide, '→', { x: x - aw, y: y, w: aw, h: h, size: 20, bold: true, color: 'C7C7CC', align: 'center', valign: 'middle', lh: 1 });
    d.rect(slide, { x: x, y: y, w: w, h: h, fill: c.highlight ? T.hot : T.card, line: c.highlight ? T.red : 'E6E6EB', lineW: c.highlight ? 1.5 : 0.75, radius: 20, shadow: true });
    d.text(slide, '0' + (i + 1), { x: x + 16, y: y + 20, w: iw, h: 30, size: 24, bold: true, color: T.red, lh: 1 });
    d.text(slide, c.title, { x: x + 16, y: y + 60, w: iw, h: th, size: 18.5, bold: true, lh: 1 });
    d.text(slide, c.body, { x: x + 16, y: y + 66 + th, w: iw, h: bh, size: 14.5, color: T.ink2, lh: 1.15 });
  });
  d.band(slide, s.band, y + h + 20);
};
