/* global self, caches, Response */
// Offline support for game night. Pages are network-first, so a deploy is seen on
// the next online visit; the cache only answers when the network fails.
// Hashed /_astro/ assets never change, so they are cache-first. Cross-origin
// requests (ads, analytics) and non-GET requests are never touched.
const CACHE = 'wgf-v1';
const PRECACHE = ['/', '/finger-chooser/', '/coin-flip/', '/random-team-generator/', '/rock-paper-scissors/', '/methods/spinner/'];

async function precache() {
  const cache = await caches.open(CACHE);
  await Promise.all(PRECACHE.map(async path => {
    try {
      const response = await fetch(path, { cache: 'no-cache' });
      if (!response.ok) return;
      const html = await response.clone().text();
      await cache.put(path, response);
      const assets = [...new Set(html.match(/\/_astro\/[\w.-]+\.(?:js|css)/g) ?? [])];
      await Promise.all(assets.map(asset => cache.add(asset).catch(() => undefined)));
    } catch { /* Offline during install: runtime caching fills in later. */ }
  }));
}

self.addEventListener('install', event => { event.waitUntil(precache().then(() => self.skipWaiting())); });
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || url.pathname === '/sw.js') return;
  if (url.pathname.startsWith('/_astro/')) {
    event.respondWith(caches.match(request).then(hit => hit || fetch(request).then(response => {
      if (response.ok) { const copy = response.clone(); caches.open(CACHE).then(cache => cache.put(request, copy)); }
      return response;
    })));
    return;
  }
  if (request.mode !== 'navigate') return;
  event.respondWith(fetch(request).then(response => {
    if (response.ok && response.type === 'basic') { const copy = response.clone(); caches.open(CACHE).then(cache => cache.put(url.pathname, copy)); }
    return response;
  }).catch(async () => (await caches.match(url.pathname)) || (await caches.match('/')) || Response.error()));
});
