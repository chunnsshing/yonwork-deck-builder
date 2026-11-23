/* faq — two-column questions and answers */
YW.L.faq = function(s){
  var esc = YW.esc, h = YW.eyebrow(s.eyebrow, 0) + YW.head(s.heading, 1) + '<div class="fq">';
  (s.items || []).forEach(function(q, i){ h += '<div class="qa glass"' + YW.anim(i + 2) + '><h4>' + esc(q.q) + '</h4><p>' + esc(q.a) + '</p></div>'; });
  return { html: h + '</div>' };
};
