// The Google tag is never requested until a visitor explicitly allows it.
(() => {
  const window = globalThis;
  const { document, location } = window;
  const choiceKey = 'wgf:analytics-choice:v1';
  const measurementId = 'G-XDVR78FJXY';
  const panel = document.querySelector('[data-analytics-consent]');
  const settings = document.querySelector('[data-analytics-settings]');
  const allow = document.querySelector('[data-analytics-allow]');
  const decline = document.querySelector('[data-analytics-decline]');
  if (!panel || !settings || !allow || !decline) return;

  let choice = null;
  try { choice = window.localStorage.getItem(choiceKey); } catch { /* Browsers can block storage. */ }

  function loadAnalytics() {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      page_location: location.origin + location.pathname,
      page_title: document.title,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    });
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.append(script);
  }

  function saveChoice(value) {
    try { window.localStorage.setItem(choiceKey, value); } catch { /* The current page still honors the choice. */ }
    panel.hidden = true;
    if (value === 'allow' && choice !== 'allow') loadAnalytics();
    if (value === 'decline' && choice === 'allow') {
      for (const cookie of document.cookie.split(';')) {
        const name = cookie.trim().split('=')[0];
        if (!/^_ga(?:_|$)/.test(name)) continue;
        for (const domain of ['', `; Domain=${location.hostname}`, `; Domain=.${location.hostname}`]) {
          document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax; Secure${domain}`;
        }
      }
      location.reload();
    }
    choice = value;
  }

  allow.addEventListener('click', () => saveChoice('allow'));
  decline.addEventListener('click', () => saveChoice('decline'));
  settings.addEventListener('click', () => { panel.hidden = false; allow.focus(); });
  if (choice === 'allow') loadAnalytics();
  else if (choice !== 'decline') panel.hidden = false;
})();
