const CACHE = 'sagan-v2';
const FILES = ['/sagan-tracker/', '/sagan-tracker/index.html', '/sagan-tracker/manifest.json'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES).catch(() => {})));
});
self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
