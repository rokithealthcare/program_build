const CACHE = "poop-home-run-v4";
const ASSETS = [
  "./", "./index.html", "./style.css", "./main.js", "./manifest.webmanifest", "./icon.svg",
  "./UI/게임진행화면1.png", "./UI/보스몹.png", "./UI/표정.png"
];
self.addEventListener("install", event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS))));
self.addEventListener("activate", event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))));
self.addEventListener("fetch", event => event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request))));
