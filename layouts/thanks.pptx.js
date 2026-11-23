/* thanks (PPTX) — heading in solid brand red (no gradient text in PowerPoint) + two QR cards */
YW.P.thanks = function(slide, s, ctx){
  var d = ctx.d, T = ctx.T, links = s.links || [];
  d.text(slide, String(s.eyebrow || '').toUpperCase(), { x: 84, y: 196, w: 1112, h: 24, size: 14, bold: true, color: T.red, align: 'center', charSpacing: 2, lh: 1 });
  d.text(slide, s.heading, { x: 84, y: 228, w: 1112, h: 120, size: 96, bold: true, color: T.red, align: 'center', valign: 'middle', lh: 1 });
  var w = 430, gap = 28, x0 = (1280 - (links.length * w + (links.length - 1) * gap)) / 2, y = 380, h = 194;
  links.forEach(function(l, i){
    var x = x0 + i * (w + gap);
    d.card(slide, { x: x, y: y, w: w, h: h });
    d.rect(slide, { x: x + 22, y: y + 22, w: 150, h: 150, fill: 'FFFFFF', line: 'E3E3E8', radius: 14 });
    d.image(slide, YW.qrImage(l.url), { x: x + 30, y: y + 30, w: 134, h: 134 });
    var tx = x + 194, tw = w - 194 - 22;
    var lh = d.height(l.label, 24, tw, true, 1.0);
    var url = String(l.url).replace(/^https?:\/\//, '').replace(/[#?].*$/, '').replace(/\/$/, '');
    var uh = d.height(url, 13, tw, false, 1.15);
    var top = y + (h - (22 + 8 + lh + 10 + uh)) / 2;
    d.text(slide, String(l.sub).toUpperCase(), { x: tx, y: top, w: tw, h: 22, size: 13, bold: true, color: T.red, charSpacing: 1, lh: 1 });
    d.text(slide, l.label, { x: tx, y: top + 30, w: tw, h: lh, size: 24, bold: true, lh: 1.0 });
    d.text(slide, url, { x: tx, y: top + 30 + lh + 10, w: tw, h: uh, size: 13, color: T.muted, lh: 1.15 });
  });
};
