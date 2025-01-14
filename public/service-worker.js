var staticCacheName = "pwa-v" + new Date().getTime();
var filesToCache = [
    "/offline.html",
    "/css/app.css",
    "/js/app.js",
    "/assets/images/icon.jpg",
];

// Install event to cache files
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(staticCacheName).then((cache) => {
            return cache.addAll(filesToCache); // Cache the specified files
        })
    );
    self.skipWaiting(); // Activate the new service worker immediately
});

// Activate event to clean up old caches
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((cacheName) => cacheName.startsWith("pwa-"))
                    .filter((cacheName) => cacheName !== staticCacheName)
                    .map((cacheName) => caches.delete(cacheName)) // Delete old caches
            );
        })
    );
});

// Fetch event to serve cached files or fetch from network
self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches
            .match(event.request)
            .then((response) => {
                if (response) {
                    return response; // Return cached response if found
                }
                return fetch(event.request).then((networkResponse) => {
                    return caches.open(staticCacheName).then((cache) => {
                        // Cache the new response
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse; // Return the network response
                    });
                });
            })
            .catch(() => {
                // If both cache and network fail, return the offline page
                return returnFromCache(event.request);
            })
    );
});

// Function to return the cached response or the offline page
const returnFromCache = function (request) {
    return caches.open(staticCacheName).then(function (cache) {
        return cache.match(request).then(function (matching) {
            if (!matching || matching.status === 404) {
                return cache.match("/offline.html"); // Return offline page if not found
            } else {
                return matching; // Return the cached response
            }
        });
    });
};
