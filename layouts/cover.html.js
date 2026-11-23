/* cover — big title, client × Yonyou line, date, Yonyou logo */
YW.L.cover = function(s, ctx){
  var esc = YW.esc;
  var parts = String(s.eyebrow || '').split(' × ');
  var client = parts[0], org = parts.slice(1).join(' × ');
  var w = YW.vlen(client);
  var size = w <= 24 ? 30 : w <= 40 ? 25 : w <= 60 ? 21 : 18;   // long names shrink, never overflow
  return {
    html:
      '<div class="orb" aria-hidden="true"></div><div class="ring" aria-hidden="true"></div>' +
      '<img class="logo" src="' + ctx.logo + '" alt="Yonyou Singapore"' + YW.anim(0, 'fade') + '>' +
      '<div class="mid">' +
        '<div class="client" style="font-size:' + size + 'px"' + YW.anim(1, 'fade') + '>' + esc(client) +
          (org ? '<span class="x">×</span><span class="org">' + esc(org) + '</span>' : '') + '</div>' +
        '<h1 class="title"' + YW.anim(2) + '>' + esc(s.heading) + '</h1>' +
        '<p class="lede"' + YW.anim(3) + '>' + esc(s.lede) + '</p>' +
        '<div class="rule"' + YW.anim(4, 'fade') + '></div>' +
        '<div class="date"' + YW.anim(5, 'fade') + '>' + esc(ctx.date) + '</div>' +
      '</div>'
  };
};
