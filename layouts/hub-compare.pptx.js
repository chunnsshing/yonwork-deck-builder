/* hub-compare (PPTX) — app grid vs hub with static spokes (lines) */
YW.P['hub-compare'] = function(slide, s, ctx){
  var d = ctx.d, T = ctx.T, L = s.left || {}, R = s.right || {}, y = d.header(slide, s) + 2, w = 546, iw = w - 48;
  var lh = Math.max(d.listHeight(L.points, 15, iw), d.listHeight(R.points, 15, iw));
  var h = 20 + 36 + 14 + 168 + 14 + lh + 20;
  [L, R].forEach(function(c, i){
    var x = 84 + i * (w + 20), yy = y + 20;
    d.card(slide, { x: x, y: y, w: w, h: h });
    var ew = d.width(c.eq, 30, true) + 14;
    d.text(slide, c.eq, { x: x + 24, y: yy, w: ew + 10, h: 36, size: 30, bold: true, color: i ? T.red : T.muted, lh: 1 });
    d.text(slide, String(c.cap).toUpperCase(), { x: x + 24 + ew, y: yy + 12, w: iw - ew, h: 16, size: 11.5, bold: true, color: i ? T.red : T.muted, charSpacing: 1, lh: 1 });
    yy += 50;
    if (!i) {
      var tw = (iw - 20) / 3;
      (c.apps || []).forEach(function(a, k){
        var ax = x + 24 + (k % 3) * (tw + 10), ay = yy + 34 + Math.floor(k / 3) * 56;
        d.rect(slide, { x: ax, y: ay, w: tw, h: 46, fill: 'FFFFFF', line: 'E3E3E8', radius: 12 });
        d.text(slide, a, { x: ax, y: ay, w: tw, h: 46, size: 14.5, bold: true, color: T.ink2, align: 'center', valign: 'middle', lh: 1 });
        d.rect(slide, { x: ax + tw - 22, y: ay - 8, w: 28, h: 17, fill: 'A1A1A6', radius: 8.5 });
        d.text(slide, 'AI', { x: ax + tw - 22, y: ay - 8, w: 28, h: 17, size: 9.5, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle', lh: 1 });
      });
    } else {
      var nodes = c.nodes || [], cx = x + w / 2, cy = yy + 84;
      var pos = nodes.map(function(n, k){ var a = -Math.PI / 2 + k * 2 * Math.PI / nodes.length; return [cx + Math.cos(a) * 190, cy + Math.sin(a) * 64]; });
      pos.forEach(function(p){ d.line(slide, cx, cy, p[0], p[1], { color: T.red, dash: 'dash', w: 1.25, alpha: 40 }); });
      nodes.forEach(function(n, k){
        var nw = Math.max(64, d.width(n, 12.5, true) + 22), p = pos[k];
        d.rect(slide, { x: p[0] - nw / 2, y: p[1] - 13, w: nw, h: 26, fill: 'FFFFFF', line: 'D9D9DE', radius: 13 });
        d.text(slide, n, { x: p[0] - nw / 2, y: p[1] - 13, w: nw, h: 26, size: 12.5, bold: true, color: T.ink2, align: 'center', valign: 'middle', lh: 1 });
      });
      d.ellipse(slide, { x: cx - 38, y: cy - 38, w: 76, h: 76, fill: T.red });
      d.text(slide, c.core, { x: cx - 50, y: cy - 38, w: 100, h: 76, size: 14, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle', lh: 1 });
    }
    yy += 168 + 14;
    d.list(slide, c.points, { x: x + 24, y: yy, w: iw, size: 15, kind: i ? 'yes' : '' });
  });
};
