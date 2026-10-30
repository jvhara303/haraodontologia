/* Meta Pixel + Conversions API (via Cloudflare Worker), com deduplicação por eventID */
(function () {
  'use strict';
  var PIXEL_ID = '1127389279664783';
  var CAPI_ENDPOINT = 'https://hara-capi.haraodontologia.workers.dev';

  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
  n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
  document,'script','https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', PIXEL_ID);

  function uid() {
    try { if (window.crypto && crypto.randomUUID) return crypto.randomUUID(); } catch (e) {}
    return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 12);
  }
  function cookie(name) {
    var m = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : '';
  }
  function getFbc() {
    var c = cookie('_fbc');
    if (c) return c;
    try {
      var id = new URLSearchParams(location.search).get('fbclid');
      if (id) return 'fb.1.' + Date.now() + '.' + id;
    } catch (e) {}
    return '';
  }

  function trackEvent(name, params) {
    var eventID = uid();
    try { fbq('track', name, params || {}, { eventID: eventID }); } catch (e) {}
    try {
      var body = JSON.stringify({
        event_name: name,
        event_id: eventID,
        event_source_url: location.href,
        fbp: cookie('_fbp'),
        fbc: getFbc(),
        custom_data: params || {}
      });
      if (navigator.sendBeacon) {
        navigator.sendBeacon(CAPI_ENDPOINT, new Blob([body], { type: 'text/plain' }));
      } else {
        fetch(CAPI_ENDPOINT, { method: 'POST', body: body, keepalive: true, mode: 'cors' }).catch(function () {});
      }
    } catch (e) {}
  }
  window.trackEvent = trackEvent;

  // espera o fbevents.js criar o cookie _fbp antes de mandar o PageView
  setTimeout(function () { trackEvent('PageView'); }, 600);

  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href*="wa.me"], a[href*="whatsapp"]') : null;
    if (a) trackEvent('Lead', { content_name: 'WhatsApp' });
  }, true);
})();
