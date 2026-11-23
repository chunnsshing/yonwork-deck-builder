/* foundation (PPTX) — tiles on a solid red foundation bar (PowerPoint has no gradient text; the bar is solid) */
YW.P.foundation = function(slide, s, ctx){
  var d = ctx.d, T = ctx.T, wf = s.workflows || [], y = d.header(slide, s) + 14, w = (1112 - 48) / 4, iw = w - 40;
  var th = Math.max.apply(null, wf.map(function(c){ return d.height(c.title, 21, iw, true, 1); }));
  var bh = Math.max.apply(null, wf.map(function(c){ return d.height(c.body, 15.5, iw, false, 1.15); }));
  var h = 22 + 18 + 10 + th + 6 + bh + 22;
  wf.forEach(function(c, i){
    var x = 84 + i * (w + 16);
    d.line(slide, x + w / 2, y + h, x + w / 2, y + h + 18, { color: 'C8C8CE', w: 1.5 });
    d.rect(slide, { x: x, y: y, w: w, h: h, fill: c.now ? T.hot : T.card, line: c.now ? T.red : 'E6E6EB', lineW: c.now ? 1.5 : 0.75, radius: 20, shadow: true });
    d.cap(slide, c.cap, x + 20, y + 22, iw, c.now ? T.red : T.muted);
    d.text(slide, c.title, { x: x + 20, y: y + 50, w: iw, h: th, size: 21, bold: true, lh: 1 });
    d.text(slide, c.body, { x: x + 20, y: y + 56 + th, w: iw, h: bh, size: 15.5, color: T.ink2, lh: 1.15 });
  });
  var by = y + h + 18, fh = d.height(s.foundation, 21, 1056, true, 1.1) + 44;
  d.rect(slide, { x: 84, y: by, w: 1112, h: fh, fill: T.red, radius: 22, shadow: true });
  d.text(slide, s.foundation, { x: 112, y: by, w: 1056, h: fh, size: 21, bold: true, color: 'FFFFFF', valign: 'middle', lh: 1.1 });
};
