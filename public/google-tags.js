// Used only when the owner configures AdSense (ADSENSE_CLIENT). Google's
// certified consent message from AdSense Privacy & messaging asks visitors in
// the EEA, UK and Switzerland; until they answer, consent mode keeps ads and
// analytics cookieless there. Ads load only on pages that allow them.
(() => {
  const window = globalThis;
  const { document, location } = window;
  const tag = document.currentScript;
  const client = tag?.dataset.client || '';
  if (!/^ca-pub-\d{10,20}$/.test(client)) return;
  const publisher = client.slice(3);
  const measurementId = 'G-XDVR78FJXY';
  const analyticsKey = 'wgf:analytics-choice:v2';
  const regulated = ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IS', 'IE', 'IT', 'LV', 'LI', 'LT', 'LU', 'MT', 'NL', 'NO', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'GB', 'CH'];

  let declined = false;
  try {
    const choice = window.localStorage.getItem(analyticsKey) ?? window.localStorage.getItem('wgf:analytics-choice:v1');
    declined = choice === 'decline';
  } catch { /* Browsers can block storage. */ }

  // Match the analytics-only loader: preserve fixed editorial campaign labels,
  // and remove arbitrary query values before any Google script can inspect them.
  const params = new window.URLSearchParams(location.search);
  const source = params.get('utm_source');
  const medium = params.get('utm_medium');
  const name = params.get('utm_campaign');
  const campaigns = new Set(['first_player_picker', 'game_rules', 'house_questions', 'choose_first_player']);
  const campaign = ['pinterest', 'bluesky'].includes(source) && medium === 'organic_social' && campaigns.has(name)
    ? { campaign_source: source, campaign_medium: medium, campaign_name: name }
    : {};
  if (location.search) {
    try { window.history.replaceState(window.history.state, '', location.pathname + location.hash); }
    catch { return; /* Do not load tags that could read an unfiltered query. */ }
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  const gtag = window.gtag;
  gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied', region: regulated, wait_for_update: 500 });
  // A visitor who turned analytics off keeps it off everywhere.
  gtag('consent', 'default', { ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted', analytics_storage: declined ? 'denied' : 'granted' });
  gtag('js', new Date());
  window[`ga-disable-${measurementId}`] = declined;
  if (!declined) gtag('config', measurementId, { page_location: location.origin + location.pathname, page_title: document.title, allow_google_signals: false, allow_ad_personalization_signals: false, ...campaign });

  function load(src, crossOrigin) {
    const script = document.createElement('script');
    script.async = true; script.src = src;
    if (crossOrigin) script.crossOrigin = 'anonymous';
    document.head.append(script);
  }
  if (!declined) load(`https://www.googletagmanager.com/gtag/js?id=${measurementId}`);
  // The consent message runs on every page, including ad-free ones.
  load(`https://fundingchoicesmessages.google.com/i/${publisher}?ers=1`);
  (function signalGooglefcPresent() {
    if (window.frames.googlefcPresent) return;
    if (!document.body) { setTimeout(signalGooglefcPresent, 0); return; }
    const frame = document.createElement('iframe');
    frame.style.cssText = 'width:0;height:0;border:none;z-index:-1000;left:-1000px;top:-1000px;display:none';
    frame.name = 'googlefcPresent'; frame.title = 'Consent signal'; frame.setAttribute('aria-hidden', 'true');
    document.body.append(frame);
  })();
  if (tag.dataset.ads === 'on') load(`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`, true);

  // Privacy page controls.
  document.addEventListener('click', event => {
    const target = event.target instanceof window.Element ? event.target : null;
    if (target?.closest('[data-consent-open]')) {
      window.googlefc = window.googlefc || {};
      window.googlefc.callbackQueue = window.googlefc.callbackQueue || [];
      window.googlefc.callbackQueue.push(() => window.googlefc.showRevocationMessage());
    }
    if (target?.closest('[data-analytics-off]')) {
      try { window.localStorage.setItem(analyticsKey, 'decline'); } catch { /* The current page still honors the choice. */ }
      window[`ga-disable-${measurementId}`] = true;
      gtag('consent', 'update', { analytics_storage: 'denied' });
      for (const cookie of document.cookie.split(';')) {
        const name = cookie.trim().split('=')[0];
        if (!/^_ga(?:_|$)/.test(name)) continue;
        for (const domain of ['', `; Domain=${location.hostname}`, `; Domain=.${location.hostname}`]) {
          document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax; Secure${domain}`;
        }
      }
      const status = document.querySelector('[data-analytics-status]');
      if (status) status.textContent = 'Analytics is off on this device.';
    }
  });
})();
