/* Meta Pixel + Conversions API (via Cloudflare Worker), com deduplicação por eventID */
(function () {
  'use strict';
  var PIXEL_ID = '1127389279664783';
  var CAPI_ENDPOINT = 'https://hara-capi.haraodontologia.workers.dev';


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

  function sendCapi(name, eventID, params) {
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
  function trackEvent(name, params) {
    var eventID = uid();
    try { fbq('track', name, params || {}, { eventID: eventID }); } catch (e) {}
    sendCapi(name, eventID, params);
  }
  window.trackEvent = trackEvent;

  // PageView do navegador já disparou no <head>; manda o mesmo eventID pelo servidor (CAPI)
  setTimeout(function () { sendCapi('PageView', window.__pvEventID || uid(), {}); }, 800);

  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href*="wa.me"], a[href*="whatsapp"]') : null;
    if (a) trackEvent('Lead', { content_name: 'WhatsApp' });
  }, true);
})();
