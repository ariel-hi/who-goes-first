/* global window, navigator */
// Registers the offline worker after load so it never competes with the page.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => { navigator.serviceWorker.register('/sw.js').catch(() => undefined); });
}
