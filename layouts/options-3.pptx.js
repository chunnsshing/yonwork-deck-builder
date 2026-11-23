/* options-3 (PPTX) — "What leaves your network" box per option, pros and cons */
YW.P['options-3'] = function(slide, s, ctx){
  var d = ctx.d, T = ctx.T, L = ctx.labels, opts = s.options || [], y = d.header(slide, s) + 4, w = (1112 - 36) / 3, iw = w - 44;
  var lvh = Math.max.apply(null, opts.map(function(o){ return d.height(o.leaves, 15.5, iw - 28, true, 1.1); }));
  var ph = Math.max.apply(null, opts.map(function(o){ return d.listHeight(o.pros, 14.5, iw); }));
  var ch = Math.max.apply(null, opts.map(function(o){ return d.listHeight(o.cons, 14.5, iw); }));
  var h = 22 + 30 + 12 + (24 + lvh + 14) + 14 + 22 + ph + 10 + 22 + ch + 18;
  opts.forEach(function(o, i){
    var x = 84 + i * (w + 18), yy = y + 22;
    d.card(slide, { x: x, y: y, w: w, h: h });
    d.text(slide, o.title, { x: x + 22, y: yy, w: iw, h: 30, size: 24, bold: true, lh: 1 }); yy += 42;
    d.rect(slide, { x: x + 22, y: yy, w: iw, h: 24 + lvh + 14, fill: i === 0 ? T.teal_tint : T.red_tint, radius: 12 });
    d.text(slide, L.leaves.toUpperCase(), { x: x + 36, y: yy + 10, w: iw - 28, h: 16, size: 10.5, bold: true, color: i === 0 ? T.teal_ink : T.red_deep, charSpacing: 1, lh: 1 });
    d.text(slide, o.leaves, { x: x + 36, y: yy + 30, w: iw - 28, h: lvh, size: 15.5, bold: true, lh: 1.1 }); yy += 24 + lvh + 14 + 14;
    d.text(slide, L.pros.toUpperCase(), { x: x + 22, y: yy, w: iw, h: 16, size: 11.5, bold: true, color: T.muted, charSpacing: 1, lh: 1 }); yy += 22;
    d.list(slide, o.pros, { x: x + 22, y: yy, w: iw, size: 14.5, kind: 'yes' }); yy += ph + 10;
    d.text(slide, L.cons.toUpperCase(), { x: x + 22, y: yy, w: iw, h: 16, size: 11.5, bold: true, color: T.muted, charSpacing: 1, lh: 1 }); yy += 22;
    d.list(slide, o.cons, { x: x + 22, y: yy, w: iw, size: 14.5, kind: 'no' });
  });
  if (s.question) d.qband(slide, s.question, y + h + 18);
};
