/* self-check (PPTX) — rows with empty tick boxes, banner text underneath */
YW.P['self-check'] = function(slide, s, ctx){
  var d = ctx.d, T = ctx.T, y = d.header(slide, s, { hot: true }) + 6, b = s.banner || {};
  (s.lines || []).forEach(function(l){
    var h = Math.max(64, d.height(l, 20, 1020, false, 1.1) + 32);
    d.card(slide, { x: 84, y: y, w: 1112, h: h, radius: 18 });
    d.rect(slide, { x: 106, y: y + h / 2 - 16, w: 32, h: 32, fill: 'FFFFFF', line: 'B8B8BF', lineW: 1.5, radius: 9 });
    d.text(slide, l, { x: 156, y: y, w: 1020, h: h, size: 20, valign: 'middle', lh: 1.1 });
    y += h + 12;
  });
  var bh = 22 + 26 + 4 + d.height(b.body, 16, 1060, false, 1.1) + 18;
  d.rect(slide, { x: 84, y: y + 8, w: 1112, h: bh, fill: T.red, radius: 18 });
  d.text(slide, [{ text: b.title, bold: true, size: 21, color: 'FFFFFF', breakLine: true }, { text: b.body, size: 16, color: 'FFFFFF' }],
    { x: 108, y: y + 8 + 18, w: 1060, h: bh - 36, size: 16, lh: 1.1, valign: 'middle' });
};
