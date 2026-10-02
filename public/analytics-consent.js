// The Google tag is never requested until a visitor explicitly allows it.
(() => {
  const window = globalThis;
  const { document, location } = window;
  const choiceKey = 'wgf:analytics-choice:v3';
  const measurementId = 'G-XDVR78FJXY';
  // This finite list comes from the site's reviewed editorial queue, captured
  // while this script is current (before a later consent click). Older cached
  // pages retain their legacy labels; malformed configuration enables no extras.
  let campaigns = new Set(['first_player_picker', 'game_rules', 'house_questions', 'choose_first_player']);
  try {
    const names = JSON.parse(document.currentScript?.dataset.campaigns || 'null');
    if (Array.isArray(names) && names.length <= 64 && names.every(name => typeof name === 'string' && /^[a-z][a-z0-9_]{0,63}$/.test(name))) campaigns = new Set(names);
  } catch { /* Keep the legacy finite list. */ }
  const panel = document.querySelector('[data-analytics-consent]');
  const settings = document.querySelector('[data-analytics-settings]');
  const allow = document.querySelector('[data-analytics-allow]');
  const decline = document.querySelector('[data-analytics-decline]');
  if (!panel || !settings || !allow || !decline) return;

  let choice = null;
  let analyticsLoaded = false;
  try {
    choice = window.localStorage.getItem(choiceKey);
    // An earlier refusal remains a refusal; an earlier allowance did not
    // include affiliate-link measurement and must be requested again.
    if (choice === null && (window.localStorage.getItem('wgf:analytics-choice:v2') === 'decline'
      || window.localStorage.getItem('wgf:analytics-choice:v1') === 'decline')) choice = 'decline';
  } catch { /* Browsers can block storage. */ }

  document.addEventListener('wgf:share-completed', event => {
    if (choice !== 'allow' || !analyticsLoaded) return;
    const kind = event.detail;
    if (kind !== 'tool' && kind !== 'page') return;
    window.gtag('event', 'share', {
      method: 'link', content_type: kind,
      item_id: kind === 'tool' ? 'first_player_picker' : 'site_page',
      page_location: location.origin + location.pathname,
      page_title: document.title,
      send_to: measurementId,
    });
  });

  document.addEventListener('click', event => {
    if (choice !== 'allow' || !analyticsLoaded || !event.target?.closest?.('a[data-affiliate-link="amazon"]')) return;
    window.gtag('event', 'affiliate_outbound', {
      partner: 'amazon',
      page_location: location.origin + location.pathname,
      page_title: document.title,
      send_to: measurementId,
    });
  });

  function loadAnalytics() {
    // Test runs and local previews build the production site too; only the live
    // hostname may reach Google Analytics.
    if (!/^(www\.)?whogoesfirst\.fun$/.test(location.hostname)) return;
    // Campaign labels are fixed editorial identifiers, never user or player input.
    // Remove the complete query before loading the tag so unrelated parameters
    // cannot be collected by the tag's automatic URL handling.
    const params = new window.URLSearchParams(location.search);
    const source = params.get('utm_source');
    const medium = params.get('utm_medium');
    const name = params.get('utm_campaign');
    const campaign = ['pinterest', 'bluesky'].includes(source) && medium === 'organic_social' && campaigns.has(name)
      ? { campaign_source: source, campaign_medium: medium, campaign_name: name }
      : {};
    if (location.search) {
      try { window.history.replaceState(window.history.state, '', location.pathname + location.hash); }
      catch { return; /* Do not load a tag that could read an unfiltered query. */ }
    }
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      page_location: location.origin + location.pathname,
      page_title: document.title,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      ...campaign,
    });
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.append(script);
    analyticsLoaded = true;
  }

  function saveChoice(value) {
    const previousChoice = choice;
    choice = value;
    try { window.localStorage.setItem(choiceKey, value); } catch { /* The current page still honors the choice. */ }
    panel.hidden = true;
    if (value === 'allow' && previousChoice !== 'allow') loadAnalytics();
    if (value === 'decline') {
      analyticsLoaded = false;
      for (const cookie of document.cookie.split(';')) {
        const name = cookie.trim().split('=')[0];
        if (!/^_ga(?:_|$)/.test(name)) continue;
        for (const domain of ['', `; Domain=${location.hostname}`, `; Domain=.${location.hostname}`]) {
          document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax; Secure${domain}`;
        }
      }
      if (previousChoice === 'allow') location.reload();
    }
  }

  allow.addEventListener('click', () => saveChoice('allow'));
  decline.addEventListener('click', () => saveChoice('decline'));
  settings.addEventListener('click', () => { panel.hidden = false; allow.focus(); });
  if (choice === 'allow') loadAnalytics();
  else if (choice !== 'decline') panel.hidden = false;
})();
