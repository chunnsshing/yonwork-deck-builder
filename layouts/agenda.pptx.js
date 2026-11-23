/* agenda (PPTX) — table-like rows: number, section + summary, minutes pill */
YW.P.agenda = function(slide, s, ctx){
  var d = ctx.d, T = ctx.T, rows = ctx.agenda || [];
  var y = d.header(slide, s) + 4;
  var dense = rows.length > 4, h = dense ? 66 : 76, gap = dense ? 10 : 12;
  rows.forEach(function(r, i){
    d.card(slide, { x: 84, y: y, w: 1112, h: h, radius: 20 });
    d.text(slide, (i + 1 < 10 ? '0' : '') + (i + 1), { x: 110, y: y, w: 80, h: h, size: 30, bold: true, color: T.red, valign: 'middle', lh: 1 });
    d.text(slide, [{ text: r.name, bold: true, size: dense ? 22 : 24, color: T.ink, breakLine: true }, { text: r.summary, size: 16, color: T.muted, bold: false }],
      { x: 202, y: y + 6, w: 820, h: h - 12, size: 16, valign: 'middle', lh: 1.0 });
    var pw = d.width(r.minLabel, 15, true) + 30;
    d.rect(slide, { x: 1170 - pw, y: y + h / 2 - 17, w: pw, h: 34, fill: 'FFFFFF', line: 'E3E3E8', radius: 17 });
    d.text(slide, r.minLabel, { x: 1170 - pw, y: y + h / 2 - 17, w: pw, h: 34, size: 15, bold: true, color: T.ink2, align: 'center', valign: 'middle', lh: 1 });
    y += h + gap;
  });
};
