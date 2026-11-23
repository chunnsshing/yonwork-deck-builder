/* cards-6 — 3 × 2 grid */
YW.L['cards-6'] = function(s){
  var h = YW.eyebrow(s.eyebrow, 0) + YW.head(s.heading, 1) + YW.lede(s.lede, 2) + '<div class="grid c6">';
  (s.cards || []).forEach(function(c, i){ h += YW.cardHtml(c, i); });
  return { html: h + '</div>' + YW.band(s.band, 9) };
};
