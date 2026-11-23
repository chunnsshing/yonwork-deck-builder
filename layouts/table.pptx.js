/* table (PPTX) — native, editable table */
YW.P.table = function(slide, s, ctx){
  var d = ctx.d, T = ctx.T, y = d.header(slide, s) + 6, cols = s.columns || [], rows = s.rows || [];
  var first = 300, rest = (1112 - first) / Math.max(1, cols.length - 1), colW = cols.map(function(_, i){ return i ? rest : first; });
  var hdrColor = [T.muted, T.teal_ink, T.red_deep];
  var font = d.font, size = YW.pt(16), line = { type: 'solid', pt: 0.75, color: 'E3E3E8' }, none = { type: 'none' };
  var body = [cols.map(function(c, i){
    return { text: String(c).toUpperCase(), options: { bold: true, color: hdrColor[i] || T.muted, fontSize: YW.pt(12.5), charSpacing: 1, fill: { color: 'FAFAFB' }, border: [none, none, line, none] } };
  })];
  var heights = [40];
  rows.forEach(function(r){
    heights.push(Math.max.apply(null, r.map(function(c, i){ return d.height(c, 16, colW[i] - 40, i === 0, 1.15); })) + 24);
    body.push(r.map(function(c, i){ return { text: String(c), options: { bold: i === 0, color: i === 0 ? T.ink : T.ink2, fill: { color: 'FFFFFF' }, border: [none, none, line, none] } }; }));
  });
  d.rect(slide, { x: 84, y: y, w: 1112, h: heights.reduce(function(a, b){ return a + b; }, 0), fill: 'FFFFFF', line: 'E6E6EB', radius: 18, shadow: true });
  slide.addTable(body, { x: YW.in(84), y: YW.in(y), w: YW.in(1112), colW: colW.map(YW.in), rowH: heights.map(YW.in), fontFace: font, fontSize: size,
    valign: 'top', margin: [YW.pt(12), YW.pt(20), YW.pt(10), YW.pt(20)], autoPage: false, lang: ctx.lang === 'zh' ? 'zh-CN' : 'en-US' });
  var th = heights.reduce(function(a, b){ return a + b; }, 0);
  if (s.footnote) d.note(slide, s.footnote, y + th + 14);
};
