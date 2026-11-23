/* cover (PPTX) — same composition as the HTML cover, static */
YW.P.cover = function(slide, s, ctx){
  var d = ctx.d, T = ctx.T;
  // decoration: soft ring + dashed ring (right), drawn first so text sits on top
  d.ellipse(slide, { x: 840, y: 110, w: 620, h: 620, fill: 'FF8A78', alpha: 72 });
  d.ellipse(slide, { x: 910, y: 180, w: 480, h: 480, fill: 'F5F5F7' });
  d.ellipse(slide, { x: 960, y: 230, w: 380, h: 380, line: 'F2B3B7', dash: 'dash', lineW: 1.25 });
  d.image(slide, ctx.logo, { x: 84, y: 64, w: 187, h: 38 });

  var parts = String(s.eyebrow || '').split(' × '), client = parts[0], org = parts.slice(1).join(' × ');
  var w = YW.vlen(client), cs = w <= 24 ? 30 : w <= 40 ? 25 : w <= 60 ? 21 : 18;
  var y = 236, cw = 900;
  var ch = d.height(client + ' × ' + org, cs, cw, true, 1.1);
  d.text(slide, [{ text: client, color: T.ink, bold: true }, { text: '  ×  ', color: T.red, bold: true }, { text: org, color: T.muted, bold: true }],
    { x: 84, y: y, w: cw, h: ch, size: cs, lh: 1.1 });
  y += ch + 18;
  var tl = ctx.lang === 'zh' ? 1.05 : 0.92, th = d.height(s.heading, 68, 1000, true, tl);
  d.text(slide, s.heading, { x: 84, y: y, w: 1000, h: th, size: 68, bold: true, lh: tl });
  y += th + 14;
  var lh = d.height(s.lede, 23, 920, false, 1.2);
  d.text(slide, s.lede, { x: 84, y: y, w: 920, h: lh, size: 23, color: T.ink2, lh: 1.2 });
  y += lh + 26;
  d.rect(slide, { x: 84, y: y, w: 88, h: 5, fill: T.red, radius: 2.5 });
  d.text(slide, ctx.date, { x: 84, y: y + 26, w: 600, h: 26, size: 16, bold: true, color: T.muted, charSpacing: 0.5, lh: 1 });
};
