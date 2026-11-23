/* engine-4 (PPTX) — dark engine card, 2×2 harness cards, strip */
YW.P['engine-4'] = function(slide, s, ctx){
  var d = ctx.d, T = ctx.T, e = s.engine || {}, cards = s.cards || [], y = d.header(slide, s) + 2;
  var gw = (1112 - 380 - 18 - 14) / 2, iw = gw - 40;
  var rowH = [0, 1].map(function(r){
    return Math.max.apply(null, cards.slice(r * 2, r * 2 + 2).map(function(c){
      return 18 + d.height(c.icon + '  ' + c.title, 19, iw, true, 1) + 6 + d.height(c.body, 14.5, iw, false, 1.15) + 8 + 18 + 18;
    }));
  });
  var H = rowH[0] + rowH[1] + 14;
  d.rect(slide, { x: 84, y: y, w: 380, h: H, fill: T.dark, radius: 22, shadow: true });
  var ey = y + 28;
  d.cap(slide, e.cap, 110, ey, 330, 'FF8A78'); ey += 30;
  var eth = d.height(e.title, 25, 328, true, 1.05); d.text(slide, e.title, { x: 110, y: ey, w: 328, h: eth, size: 25, bold: true, color: 'FFFFFF', lh: 1.05 }); ey += eth + 10;
  var ebh = d.height(e.body, 16, 328, false, 1.2); d.text(slide, e.body, { x: 110, y: ey, w: 328, h: ebh, size: 16, color: 'C9C9CE', lh: 1.2 });
  d.text(slide, e.kicker, { x: 110, y: y + H - 56, w: 328, h: 30, size: 22, bold: true, color: 'FFFFFF', lh: 1 });
  cards.forEach(function(c, i){
    var x = 84 + 380 + 18 + (i % 2) * (gw + 14), cy = y + (i < 2 ? 0 : rowH[0] + 14), h = rowH[i < 2 ? 0 : 1];
    d.card(slide, { x: x, y: cy, w: gw, h: h, radius: 20 });
    var th = d.height(c.icon + '  ' + c.title, 19, iw, true, 1);
    d.text(slide, c.icon + '  ' + c.title, { x: x + 20, y: cy + 18, w: iw, h: th, size: 19, bold: true, lh: 1 });
    var bh = d.height(c.body, 14.5, iw, false, 1.15);
    d.text(slide, c.body, { x: x + 20, y: cy + 24 + th, w: iw, h: bh, size: 14.5, color: T.ink2, lh: 1.15 });
    d.text(slide, c.fix, { x: x + 20, y: cy + h - 36, w: iw, h: 18, size: 12.5, bold: true, color: T.red_deep, lh: 1 });
  });
  var sy = y + H + 16, sw = (1112 - 24) / 3, strip = s.strip || [];
  var sh = Math.max.apply(null, strip.map(function(t){ var p = String(t).split(' · '); return 24 + d.height(p.slice(1).join(' · '), 14.5, sw - 32, false, 1.1) + 22; }));
  strip.forEach(function(t, i){
    var p = String(t).split(' · '), x = 84 + i * (sw + 12), on = i === strip.length - 1;
    d.rect(slide, { x: x, y: sy, w: sw, h: sh, fill: on ? T.red_tint : 'FFFFFF', line: on ? 'F2B3B7' : 'E3E3E8', radius: 14 });
    d.text(slide, [{ text: p[0], bold: true, color: on ? T.red_deep : T.ink, size: 15, breakLine: true }, { text: p.slice(1).join(' · '), color: T.ink2, size: 14.5 }],
      { x: x + 16, y: sy + 11, w: sw - 32, h: sh - 22, size: 14.5, lh: 1.1 });
  });
};
