/* cards-4-steps (PPTX) — four numbered cards with arrows; chips */
YW.P['cards-4-steps'] = function(slide, s, ctx){
  var d = ctx.d, T = ctx.T, cards = s.cards || [], y = d.header(slide, s) + 6, aw = 26, w = (1112 - aw * 3) / 4, iw = w - 40;
  var th = Math.max.apply(null, cards.map(function(c){ return d.height(c.title, 21, iw, true, 1); }));
  var bh = Math.max.apply(null, cards.map(function(c){ return d.height(c.body, 15, iw, false, 1.15); }));
  var h = 22 + 34 + 10 + th + 8 + bh + 24;
  cards.forEach(function(c, i){
    var x = 84 + i * (w + aw);
    if (i) d.text(slide, '→', { x: x - aw, y: y, w: aw, h: h, size: 22, bold: true, color: 'C7C7CC', align: 'center', valign: 'middle', lh: 1 });
    d.rect(slide, { x: x, y: y, w: w, h: h, fill: c.highlight ? T.hot : T.card, line: c.highlight ? T.red : 'E6E6EB', lineW: c.highlight ? 1.5 : 0.75, radius: 22, shadow: true });
    d.text(slide, String(c.n), { x: x + 20, y: y + 22, w: iw, h: 34, size: 28, bold: true, color: T.red, lh: 1 });
    d.text(slide, c.title, { x: x + 20, y: y + 66, w: iw, h: th, size: 21, bold: true, lh: 1 });
    d.text(slide, c.body, { x: x + 20, y: y + 74 + th, w: iw, h: bh, size: 15, color: T.ink2, lh: 1.15 });
  });
  var cx = 84, cy = y + h + 22;
  (s.chips || []).forEach(function(c){ cx += d.pill(slide, '✓ ' + c, cx, cy, { size: 15, h: 36, pad: 30, upper: false, fill: 'FFFFFF', line: 'E3E3E8', color: T.ink2 }) + 10; });
};
