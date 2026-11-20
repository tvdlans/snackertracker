/* 侍 SnackerTracker service worker — werkt ook offline */
const VERSION = 'st-v1';
const SHELL = [
  './', 'index.html', 'css/style.css',
  'js/menu.js', 'js/audio.js', 'js/fx.js', 'js/app.js',
  'fonts/brush.woff2', 'fonts/dela-gothic-one-latin-400.woff2', 'fonts/dela-gothic-one-latin-ext-400.woff2',
  'fonts/zen-kaku-gothic-new-latin-400.woff2', 'fonts/zen-kaku-gothic-new-latin-700.woff2', 'fonts/zen-kaku-gothic-new-latin-900.woff2',
  'icons/favicon.svg', 'icons/icon-192.png', 'manifest.webmanifest'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  // eerst het netwerk (altijd de nieuwste versie), offline terugvallen op de cache
  e.respondWith(fetch(req).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
    return res;
  }).catch(() => caches.match(req, { ignoreSearch: true }).then(hit => hit || (req.mode === 'navigate' ? caches.match('index.html') : undefined))));
});
