/* faq (PPTX) — 2-column Q/A cards */
YW.P.faq = function(slide, s, ctx){
  var d = ctx.d, T = ctx.T, items = s.items || [], y = d.header(slide, s) + 4, w = (1112 - 20) / 2, iw = w - 44;
  for (var r = 0; r < Math.ceil(items.length / 2); r++) {
    var row = items.slice(r * 2, r * 2 + 2);
    var qh = Math.max.apply(null, row.map(function(q){ return d.height(q.q, 18.5, iw, true, 1.05); }));
    var ah = Math.max.apply(null, row.map(function(q){ return d.height(q.a, 15, iw, false, 1.15); }));
    var h = 18 + qh + 6 + ah + 18;
    row.forEach(function(q, k){
      var x = 84 + k * (w + 20);
      d.card(slide, { x: x, y: y, w: w, h: h, radius: 18 });
      d.text(slide, q.q, { x: x + 22, y: y + 18, w: iw, h: qh, size: 18.5, bold: true, lh: 1.05 });
      d.text(slide, q.a, { x: x + 22, y: y + 24 + qh, w: iw, h: ah, size: 15, color: T.ink2, lh: 1.15 });
    });
    y += h + 14;
  }
};
