/* questions (PPTX) — four question bubbles */
YW.P.questions = function(slide, s, ctx){
  var d = ctx.d, T = ctx.T, qs = s.questions || [], y = d.header(slide, s) + 12, w = (1112 - 22) / 2, iw = w - 64 - 26;
  var rows = [0, 1].map(function(r){ return Math.max.apply(null, qs.slice(r * 2, r * 2 + 2).map(function(q){ return d.height(q, 21, iw, true, 1.1) + 44; })); });
  qs.forEach(function(q, i){
    var x = 84 + (i % 2) * (w + 22), yy = y + (i < 2 ? 0 : rows[0] + 18), h = rows[i < 2 ? 0 : 1];
    d.card(slide, { x: x, y: yy, w: w, h: h, radius: 22 });
    d.ellipse(slide, { x: x + 20, y: yy + 21, w: 30, h: 30, fill: T.red });
    d.text(slide, '?', { x: x + 20, y: yy + 21, w: 30, h: 30, size: 16, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle', lh: 1 });
    d.text(slide, q, { x: x + 64, y: yy + 22, w: iw, h: h - 44, size: 21, bold: true, lh: 1.1 });
  });
  d.band(slide, s.band, y + rows[0] + rows[1] + 18 + 22);
};
