var staticCacheName = "pwa-v" + new Date().getTime();
// var filesToCache = [
//     "/public/offline",
//     "/public/css/app.css",
//     "/public/js/app.js",
//     "/public/assets/images/icon.jpg",
//     "/public/assets/images/icon.jpg",
//     "/public/assets/images/icon.jpg",
//     "/public/assets/images/icon.jpg",
//     "/public/assets/images/icon.jpg",
//     "/public/assets/images/icon.jpg",
//     "/public/assets/images/icon.jpg",
//     "/public/assets/images/icon.jpg",
// ];
var filesToCache = [
    "/offline.html", // Corrected path
    "/css/app.css", // Corrected path
    "/js/app.js", // Corrected path
    "/assets/images/icon.jpg", // Corrected path
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(staticCacheName).then((cache) => {
            return cache.addAll(filesToCache); // Menambahkan file baru ke cache
        })
    );
    self.skipWaiting(); // Memaksa service worker baru untuk aktif
});

// Activate event to clean up old caches
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((cacheName) => cacheName.startsWith("pwa-"))
                    .filter((cacheName) => cacheName !== staticCacheName)
                    .map((cacheName) => caches.delete(cacheName)) // Menghapus cache lama
            );
        })
    );
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            if (response) {
                return response;
            }
            return fetch(event.request).then((networkResponse) => {
                return caches.open(staticCacheName).then((cache) => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
            });
        })
    );
});

// Preload files into the cache
const preLoad = function () {
    return caches.open("offline").then(function (cache) {
        return Promise.all(
            filesToCache.map(function (url) {
                return fetch(url).then(function (response) {
                    if (response.ok) {
                        return cache.put(url, response.clone());
                    }
                    return Promise.reject(new Error(`Failed to fetch ${url}`));
                });
            })
        )
            .then(function () {
                console.log("All files cached successfully");
            })
            .catch(function (error) {
                console.error("Failed to cache files:", error);
            });
    });
};

// Check if the response is valid
const checkResponse = function (request) {
    return new Promise(function (fulfill, reject) {
        fetch(request)
            .then(function (response) {
                if (response.ok) {
                    fulfill(response);
                } else {
                    reject();
                }
            })
            .catch(reject); // Catch network errors
    });
};

// Add the request to the cache
const addToCache = function (request) {
    return caches.open("offline").then(function (cache) {
        return fetch(request).then(function (response) {
            if (response.ok) {
                return cache.put(request, response.clone());
            }
            return response; // Return the response if not ok
        });
    });
};

// Return the cached response or the offline page
const returnFromCache = function (request) {
    return caches.open("offline").then(function (cache) {
        return cache.match(request).then(function (matching) {
            if (!matching || matching.status === 404) {
                return cache.match("/offline.html"); // Return offline page if not found
            } else {
                return matching; // Return the cached response
            }
        });
    });
};
