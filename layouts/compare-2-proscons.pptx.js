/* compare-2-proscons (PPTX) */
YW.P['compare-2-proscons'] = function(slide, s, ctx){
  var d = ctx.d, T = ctx.T, L = ctx.labels, y = d.header(slide, s) + 4, w = 546, iw = w - 52;
  var cols = [['left', s.left], ['right', s.right]].filter(function(p){ return p[1]; });
  var ph = Math.max.apply(null, cols.map(function(p){ return d.listHeight(p[1].pros, 15, iw); }));
  var ch = Math.max.apply(null, cols.map(function(p){ return d.listHeight(p[1].cons, 15, iw); }));
  var sh = Math.max.apply(null, cols.map(function(p){ return s.suits && s.suits[p[0]] ? d.height(s.suits[p[0]], 14.5, iw - 28, false, 1.1) + 42 : 0; }));
  var h = 22 + 30 + 22 + 10 + 22 + ph + 8 + 22 + ch + 12 + sh + 22;
  cols.forEach(function(p, i){
    var c = p[1], x = 84 + i * (w + 20), yy = y + 22;
    d.card(slide, { x: x, y: y, w: w, h: h });
    d.text(slide, c.title, { x: x + 26, y: yy, w: iw, h: 30, size: 24, bold: true, lh: 1 }); yy += 32;
    d.text(slide, c.sub || '', { x: x + 26, y: yy, w: iw, h: 20, size: 14.5, bold: true, color: T.muted, lh: 1 }); yy += 30;
    d.text(slide, L.pros.toUpperCase(), { x: x + 26, y: yy, w: iw, h: 16, size: 11.5, bold: true, color: T.muted, charSpacing: 1, lh: 1 }); yy += 22;
    d.list(slide, c.pros, { x: x + 26, y: yy, w: iw, size: 15, kind: 'yes' }); yy += ph + 8;
    d.text(slide, L.limits.toUpperCase(), { x: x + 26, y: yy, w: iw, h: 16, size: 11.5, bold: true, color: T.muted, charSpacing: 1, lh: 1 }); yy += 22;
    d.list(slide, c.cons, { x: x + 26, y: yy, w: iw, size: 15, kind: 'no' }); yy += ch + 12;
    if (s.suits && s.suits[p[0]]) {
      d.rect(slide, { x: x + 26, y: yy, w: iw, h: sh, fill: 'F1F1F4', radius: 12 });
      d.text(slide, L.suits.toUpperCase(), { x: x + 40, y: yy + 10, w: iw - 28, h: 14, size: 10.5, bold: true, color: T.muted, charSpacing: 1, lh: 1 });
      d.text(slide, s.suits[p[0]], { x: x + 40, y: yy + 30, w: iw - 28, h: sh - 40, size: 14.5, lh: 1.1 });
    }
  });
  if (s.footnote) d.note(slide, s.footnote, y + h + 14);
};
