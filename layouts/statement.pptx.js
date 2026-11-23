/* statement (PPTX) */
YW.P.statement = function(slide, s, ctx){
  var d = ctx.d, T = ctx.T;
  d.text(slide, String(s.eyebrow || '').toUpperCase(), { x: 84, y: 236, w: 1112, h: 22, size: 14, bold: true, color: T.red, charSpacing: 2, lh: 1 });
  var hh = d.height(s.heading, 110, 1112, true, 0.95);
  d.text(slide, s.heading, { x: 84, y: 270, w: 1112, h: hh, size: 110, bold: true, color: T.red, lh: 0.95 });
  var lh = d.height(s.lede, 28, 880, false, 1.25);
  d.text(slide, s.lede, { x: 84, y: 290 + hh, w: 880, h: lh, size: 28, color: T.ink2, lh: 1.25 });
};
