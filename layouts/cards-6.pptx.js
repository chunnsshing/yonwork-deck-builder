/* cards-6 (PPTX) — 3 × 2 */
YW.P['cards-6'] = function(slide, s, ctx){
  var y = ctx.d.header(slide, s) + 4;
  y = YW.cardGrid(slide, s.cards || [], ctx, y, { cols: 3, gap: 16, ico: 38, ts: 21, bs: 15.5, pad: 22 });
  ctx.d.band(slide, s.band, y + 20);
};
