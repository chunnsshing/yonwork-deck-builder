/* compare-2 (PPTX) — two columns of points */
YW.P['compare-2'] = function(slide, s, ctx){
  var d = ctx.d, T = ctx.T, y = d.header(slide, s) + 6, w = 546, iw = w - 52, cols = [s.left, s.right].filter(Boolean);
  var th = Math.max.apply(null, cols.map(function(c){ return c.title ? d.height(c.title, 24, iw, true, 1) + 10 : 0; }));
  var lh = Math.max.apply(null, cols.map(function(c){ return d.listHeight(c.points, 16.5, iw); }));
  var nh = Math.max.apply(null, cols.map(function(c){ return c.note ? d.height(c.note, 15, iw, true, 1.1) + 28 : 0; }));
  var h = 24 + 20 + 10 + th + lh + nh + 22;
  cols.forEach(function(c, i){
    var x = 84 + i * (w + 20), yy = y + 24;
    d.card(slide, { x: x, y: y, w: w, h: h });
    d.cap(slide, c.cap, x + 26, yy, iw, i ? T.red : T.muted); yy += 30;
    if (c.title) { d.text(slide, c.title, { x: x + 26, y: yy, w: iw, h: th - 10, size: 24, bold: true, lh: 1 }); }
    yy += th;
    d.list(slide, c.points, { x: x + 26, y: yy, w: iw, size: 16.5, kind: i ? 'yes' : '' }); yy += lh;
    if (c.note) { d.line(slide, x + 26, yy + 12, x + w - 26, yy + 12, { color: 'E3E3E8', w: 1 }); d.text(slide, c.note, { x: x + 26, y: yy + 24, w: iw, h: nh - 28, size: 15, bold: true, color: T.ink2, lh: 1.1 }); }
  });
  if (s.question) d.qband(slide, s.question, y + h + 20);
};
