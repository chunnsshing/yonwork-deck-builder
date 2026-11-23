/* statement — one big line */
YW.L.statement = function(s){
  return { html: YW.eyebrow(s.eyebrow, 0, true) + '<h1 class="title"' + YW.anim(1) + '><span class="hl">' + YW.esc(s.heading) + '</span></h1>' + YW.lede(s.lede, 2) };
};
