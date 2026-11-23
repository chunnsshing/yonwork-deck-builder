/* cards-5 (PPTX) */
YW.P['cards-5'] = function(slide, s, ctx){
  var y = ctx.d.header(slide, s) + 4;
  y = YW.cardGrid(slide, s.cards || [], ctx, y, { cols: 5, gap: 14, ico: 40, ts: 19.5, bs: 15, pad: 18 });
  ctx.d.band(slide, s.band, y + 20);
};
