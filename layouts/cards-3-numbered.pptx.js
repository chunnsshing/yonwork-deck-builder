/* cards-3-numbered (PPTX) */
YW.P['cards-3-numbered'] = function(slide, s, ctx){
  var d = ctx.d, T = ctx.T, cards = s.cards || [], y = d.header(slide, s) + 4, gap = 20, w = (1112 - 40) / 3, iw = w - 56;
  var th = Math.max.apply(null, cards.map(function(c){ return d.height(c.title, 25, iw, true, 1); }));
  var wh = Math.max.apply(null, cards.map(function(c){ return d.height('→ ' + c.what, 15, iw, true, 1.1); }));
  var bh = Math.max.apply(null, cards.map(function(c){ return d.height(c.body, 18, iw, false, 1.15); }));
  var h = 28 + 56 + 14 + th + 8 + wh + 8 + bh + 46 + 26;
  cards.forEach(function(c, i){
    var x = 84 + i * (w + gap), yy = y + 28;
    d.card(slide, { x: x, y: y, w: w, h: h });
    d.text(slide, String(c.n), { x: x + 28, y: yy, w: 100, h: 56, size: 52, bold: true, color: T.red, lh: 0.9 }); yy += 70;
    d.text(slide, c.title, { x: x + 28, y: yy, w: iw, h: th, size: 25, bold: true, lh: 1 }); yy += th + 8;
    d.text(slide, [{ text: '→ ', color: T.red, bold: true }, { text: c.what, color: T.ink, bold: true }], { x: x + 28, y: yy, w: iw, h: wh, size: 15, lh: 1.1 }); yy += wh + 8;
    d.text(slide, c.body, { x: x + 28, y: yy, w: iw, h: bh, size: 18, color: T.ink2, lh: 1.15 });
    if (c.tag) d.pill(slide, c.tag, x + 28, y + h - 26 - 26, { size: 11, h: 26, pad: 20 });
  });
  d.band(slide, s.band, y + h + 20);
};
