/* principle-3 (PPTX) — AI / RULES / PEOPLE in lane colours */
YW.P['principle-3'] = function(slide, s, ctx){
  var d = ctx.d, T = ctx.T, cols = s.cols || [], y = d.header(slide, s) + 14, w = (1112 - 40) / 3, iw = w - 56;
  var LANE = { AI: T.red, RULES: T.amber, PEOPLE: T.teal };
  var th = Math.max.apply(null, cols.map(function(c){ return d.height(c.title, 28, iw, true, 1); }));
  var bh = Math.max.apply(null, cols.map(function(c){ return d.height(c.body, 18, iw, false, 1.2); }));
  var h = 30 + 32 + 18 + th + 10 + bh + 32;
  cols.forEach(function(c, i){
    var x = 84 + i * (w + 20), col = LANE[String(c.badge).toUpperCase()] || T.red;
    d.card(slide, { x: x, y: y, w: w, h: h });
    d.rect(slide, { x: x + 12, y: y, w: w - 24, h: 5, fill: col });
    d.pill(slide, ctx.labels['lane_' + String(c.badge).toLowerCase()] || c.badge, x + 28, y + 30, { size: 14, h: 32, pad: 28, fill: col, color: 'FFFFFF' });
    d.text(slide, c.title, { x: x + 28, y: y + 80, w: iw, h: th, size: 28, bold: true, lh: 1 });
    d.text(slide, c.body, { x: x + 28, y: y + 90 + th, w: iw, h: bh, size: 18, color: T.ink2, lh: 1.2 });
  });
};
