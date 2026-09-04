const CACHE_PREFIX = 'snake-classic-';
const CACHE_NAME = 'snake-classic-v6';
const APP_PATH = new URL('./', self.location.href).pathname;
const ASSETS_TO_CACHE = [
    './', './index.html', './manifest.json', './css/style.css', './assets/bg-opt.jpg',
    './assets/snake-head-opt.png', './assets/food-opt.png', './assets/body-opt.png',
    './js/app.js', './js/i18n.js', './js/sound-engine.js', './js/storage-manager.js',
    './js/leaderboard-manager.js', './icon-192.svg', './icon-512.svg',
    './js/locales/ko.json', './js/locales/en.json', './js/locales/zh.json',
    './js/locales/hi.json', './js/locales/ru.json', './js/locales/ja.json',
    './js/locales/es.json', './js/locales/pt.json', './js/locales/id.json',
    './js/locales/tr.json', './js/locales/de.json', './js/locales/fr.json'
];

self.addEventListener('install', (event) => {
    event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE)));
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(caches.keys().then((names) => Promise.all(
        names.filter((name) => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME).map((name) => caches.delete(name))
    )));
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    const url = new URL(event.request.url);
    if (url.origin !== self.location.origin || !url.pathname.startsWith(APP_PATH)) return;
    event.respondWith(fetch(event.request).then((response) => {
        if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put(event.request, response.clone()));
        return response;
    }).catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html'))));
});
