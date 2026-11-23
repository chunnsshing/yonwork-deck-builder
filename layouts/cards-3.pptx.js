/* cards-3 (PPTX) — rounded cards with an index badge, title and body; optional band */
YW.P['cards-3'] = function(slide, s, ctx){
  var d = ctx.d, T = ctx.T, cards = s.cards || [];
  var y = d.header(slide, s) + 10;
  var gap = 20, w = (1112 - gap * 2) / 3, inner = w - 56;
  var titleH = Math.max.apply(null, cards.map(function(c){ return d.height(c.title, 25, inner, true, 1.0); }));
  var bodyH = Math.max.apply(null, cards.map(function(c){ return d.height(c.body, 18, inner, false, 1.2); }));
  var h = 30 + 46 + 18 + titleH + 10 + bodyH + 34;
  cards.forEach(function(c, i){
    var x = 84 + i * (w + gap);
    d.card(slide, { x: x, y: y, w: w, h: h });
    d.rect(slide, { x: x + 28, y: y + 30, w: 46, h: 46, fill: T.red_tint, radius: 14 });
    d.text(slide, c.icon || String(i + 1), { x: x + 28, y: y + 30, w: 46, h: 46, size: 20, bold: true, color: T.red, align: 'center', valign: 'middle' });
    var th = d.height(c.title, 25, inner, true, 1.0);   // body follows its own title, like the HTML card
    d.text(slide, c.title, { x: x + 28, y: y + 94, w: inner, h: th, size: 25, bold: true, lh: 1.0 });
    d.text(slide, c.body, { x: x + 28, y: y + 94 + th + 10, w: inner, h: bodyH, size: 18, color: T.ink2, lh: 1.2 });
  });
  d.band(slide, s.band, y + h + 22);
};
