/* architecture (PPTX) — numbered components in a dashed server frame, two channels, dashed connectors.
   All native shapes and text so the diagram stays editable. */
YW.P.architecture = function(slide, s, ctx){
  var d = ctx.d, T = ctx.T, comps = s.components || [], chans = s.channels || [], y = d.header(slide, s) + 2;
  var fw = 726, cw = (fw - 32 - 12) / 2, iw = cw - 32 - 44;
  var rowH = [0, 1].map(function(r){ return Math.max.apply(null, comps.slice(r * 2, r * 2 + 2).map(function(c){ return 18 + d.height(c.title, 19, iw, true, 1) + 6 + d.height(c.body, 15, iw, false, 1.15) + 18; })); });
  var fh = 16 + rowH[0] + 12 + rowH[1] + 16;
  d.rect(slide, { x: 84, y: y, w: fw, h: fh, line: 'C8C8CE', dash: 'dash', lineW: 1.5, radius: 22 });
  comps.forEach(function(c, i){
    var x = 84 + 16 + (i % 2) * (cw + 12), cy = y + 16 + (i < 2 ? 0 : rowH[0] + 12), h = rowH[i < 2 ? 0 : 1];
    d.card(slide, { x: x, y: cy, w: cw, h: h, radius: 18 });
    d.ellipse(slide, { x: x + 16, y: cy + 18, w: 30, h: 30, fill: T.red });
    d.text(slide, String(c.n), { x: x + 16, y: cy + 18, w: 30, h: 30, size: 14, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle', lh: 1 });
    var th = d.height(c.title, 19, iw, true, 1);
    d.text(slide, c.title, { x: x + 60, y: cy + 20, w: iw, h: th, size: 19, bold: true, lh: 1 });
    d.text(slide, c.body, { x: x + 60, y: cy + 26 + th, w: iw, h: d.height(c.body, 15, iw, false, 1.15), size: 15, color: T.ink2, lh: 1.15 });
  });
  var chx = 84 + fw + 56, chw = 1112 - fw - 56, ciw = chw - 32 - 44;
  var chh = chans.map(function(c){ return 18 + d.height(c.title, 19, ciw, true, 1) + 6 + d.height(c.body, 15, ciw, false, 1.15) + 18; });
  var total = chh.reduce(function(a, b){ return a + b; }, 0) + 12 * (chans.length - 1), cy = y + (fh - total) / 2;
  chans.forEach(function(c, i){
    var h = chh[i];
    d.line(slide, 84 + fw, y + fh / 2, chx, cy + h / 2, { color: T.red, dash: 'dash', w: 1.5, end: true });
    d.card(slide, { x: chx, y: cy, w: chw, h: h, radius: 18 });
    d.rect(slide, { x: chx + 16, y: cy + 18, w: 30, h: 30, fill: i ? T.teal : T.dark, radius: 9 });
    d.text(slide, String(c.id), { x: chx + 16, y: cy + 18, w: 30, h: 30, size: 14, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle', lh: 1 });
    var th = d.height(c.title, 19, ciw, true, 1);
    d.text(slide, c.title, { x: chx + 60, y: cy + 20, w: ciw, h: th, size: 19, bold: true, lh: 1 });
    d.text(slide, c.body, { x: chx + 60, y: cy + 26 + th, w: ciw, h: d.height(c.body, 15, ciw, false, 1.15), size: 15, color: T.ink2, lh: 1.15 });
    cy += h + 12;
  });
  if (s.footnote) d.note(slide, s.footnote, y + fh + 16);
};
