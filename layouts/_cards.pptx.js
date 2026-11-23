/* shared card grid for cards-5 / cards-6 (PPTX). opt: cols, gap, ico, title, body sizes */
YW.cardGrid = function(slide, cards, ctx, y, opt){
  var d = ctx.d, T = ctx.T, cols = opt.cols, gap = opt.gap, w = (1112 - gap * (cols - 1)) / cols, pad = opt.pad || 22, iw = w - pad * 2;
  var rows = Math.ceil(cards.length / cols);
  for (var r = 0; r < rows; r++) {
    var row = cards.slice(r * cols, r * cols + cols);
    var th = Math.max.apply(null, row.map(function(c){ return d.height(c.title, opt.ts, iw, true, 1); }));
    var bh = Math.max.apply(null, row.map(function(c){ return d.height(c.body, opt.bs, iw, false, 1.15); }));
    var tagH = row.some(function(c){ return c.tag; }) ? 34 : 0;
    var h = pad + opt.ico + 14 + th + 8 + bh + tagH + pad;
    row.forEach(function(c, k){
      var x = 84 + k * (w + gap), i = r * cols + k;
      d.card(slide, { x: x, y: y, w: w, h: h });
      d.rect(slide, { x: x + pad, y: y + pad, w: opt.ico, h: opt.ico, fill: T.red_tint, radius: 12 });
      d.text(slide, c.icon || String(i + 1), { x: x + pad, y: y + pad, w: opt.ico, h: opt.ico, size: opt.ico * 0.45, bold: true, color: T.red, align: 'center', valign: 'middle', lh: 1 });
      var ty = y + pad + opt.ico + 14;
      d.text(slide, c.title, { x: x + pad, y: ty, w: iw, h: th, size: opt.ts, bold: true, lh: 1 });
      d.text(slide, c.body, { x: x + pad, y: ty + th + 8, w: iw, h: bh, size: opt.bs, color: T.ink2, lh: 1.15 });
      if (c.tag) d.pill(slide, c.tag, x + pad, y + h - pad - 24, { size: 10.5, h: 24, pad: 18 });
    });
    y += h + gap;
  }
  return y - gap;
};
