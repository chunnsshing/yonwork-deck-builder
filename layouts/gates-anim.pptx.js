/* gates-anim (PPTX) — the final state: every gate approved (green) */
YW.P['gates-anim'] = function(slide, s, ctx){
  var d = ctx.d, T = ctx.T, steps = s.steps || [], gates = s.gates || [], n = steps.length + gates.length;
  var y = d.header(slide, s, { hot: true }) + 34, x0 = 84 + 70, step = (1112 - 140) / (n - 1), cy = y + 33;
  d.line(slide, x0, cy, x0 + step * (n - 1), cy, { color: T.red, w: 2.25 });
  for (var k = 0; k < n; k++) {
    var cx = x0 + k * step;
    if (k % 2 === 0) {
      d.rect(slide, { x: cx - 33, y: cy - 33, w: 66, h: 66, fill: T.red, radius: 20, shadow: true });
      d.text(slide, String(k / 2 + 1), { x: cx - 33, y: cy - 33, w: 66, h: 66, size: 22, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle', lh: 1 });
      var t = steps[k / 2], th = d.height(t, 16, 150, true, 1.1);
      d.text(slide, t, { x: cx - 75, y: cy + 48, w: 150, h: th, size: 16, bold: true, color: T.ink2, align: 'center', lh: 1.1 });
    } else {
      d.rect(slide, { x: cx - 30, y: cy - 30, w: 60, h: 60, fill: T.teal, shape: 'diamond' });
      d.text(slide, '✓', { x: cx - 30, y: cy - 30, w: 60, h: 60, size: 22, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle', lh: 1 });
      var q = gates[(k - 1) / 2], qh = d.height(q, 14.5, 150, true, 1.1);
      d.text(slide, q, { x: cx - 75, y: cy + 48, w: 150, h: qh, size: 14.5, bold: true, color: T.teal_ink, align: 'center', lh: 1.1 });
    }
  }
  d.band(slide, s.band, cy + 170);
};
