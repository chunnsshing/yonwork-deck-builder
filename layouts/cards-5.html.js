/* cards-5 — five compact cards + optional band */
YW.L['cards-5'] = function(s){
  var h = YW.eyebrow(s.eyebrow, 0) + YW.head(s.heading, 1) + YW.lede(s.lede, 2) + '<div class="grid c5">';
  (s.cards || []).forEach(function(c, i){ h += YW.cardHtml(c, i, { cls: 'sm' }); });
  return { html: h + '</div>' + YW.band(s.band, 8) };
};
