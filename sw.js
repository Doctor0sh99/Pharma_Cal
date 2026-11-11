const CACHE_NAME = "bnf-pharma-cache-v3";
const STATIC_ASSETS = [
    "./",
    "./index.html",
    "./about.html",
    "./style.css",
    "./script.js",
    "./manifest.json",
    "https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.rtl.min.css",
    "https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"
];

// تنصيب عامل الخدمة وتخزين الملفات
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        }).then(() => self.skipWaiting())
    );
});

// تفعيل عامل الخدمة ومسح النسخ القديمة
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((name) => {
                    if (name !== CACHE_NAME) {
                        return caches.delete(name);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// اعتراض الطلبات وتقديمها من الكاش (Stale-while-revalidate)
self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            const fetchPromise = fetch(event.request).then((networkResponse) => {
                // حفظ نسخة جديدة في الكاش
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return networkResponse;
            }).catch(() => {
                // في حال فشل الاتصال وعدم وجود كاش (أوفلاين تماماً)
                return cachedResponse;
            });
            return cachedResponse || fetchPromise;
        })
    );
});