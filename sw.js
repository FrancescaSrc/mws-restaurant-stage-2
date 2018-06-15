var staticCacheName = 'restview-1';
var contentImgsCache = 'restview-imgs';
var allCaches = [
	staticCacheName,
	contentImgsCache
];

self.addEventListener('install', function(event) {
	event.waitUntil(
    caches.open(staticCacheName).then(function(cache) {
		return cache.addAll([
			
			'./',
			'./index.html',
			'./restaurant.html',
			'./css/styles.css',
			'./css/responsive.css',
			'./js/all.js',
			'https://fonts.gstatic.com/s/roboto/v15/2UX7WLTfW3W8TclTUvlFyQ.woff',
			'https://fonts.gstatic.com/s/roboto/v15/d-6IYplOFocCacKzxwXSOD8E0i7KZn-EPnyo3HZu7kw.woff'
			
			
		]);
	}
    ).catch(function(err){
		console.log('error with caching');
	})
	);
});






self.addEventListener('activate', function(event) {
	event.waitUntil(
    caches.keys().then(function(cacheNames) {
		return Promise.all(
        cacheNames.filter(function(cacheName) {
			return cacheName.startsWith('restview-') &&
			!allCaches.includes(cacheName);
			}).map(function(cacheName) {
			return caches.delete(cacheName);
		})
		);
	})
	);
});

self.addEventListener('fetch', function(event) {
	var requestUrl = new URL(event.request.url);
	
    if (requestUrl.origin === location.origin) {
        
		if (requestUrl.pathname.startsWith('/Stage-2/images/')) {
			event.respondWith(servePhoto(event.request));
			return;
		}
		if (requestUrl.pathname.startsWith('/Stage-2/img/')) {
			event.respondWith(servePhoto(event.request));
			return;
		}
		}	
	
	event.respondWith(
    caches.match(requestUrl.pathname).then(function(response) {
		return response || fetch(event.request);
	}).catch(err => console.log("Fetch error", err))
	); 
	
	
	
});


function servePhoto(request) {
	var storageUrl = request.url.replace(/-\w+.(jpg|webp)$/, '');
	
	//search for image in cache and return it
	return caches.open(contentImgsCache).then(function(cache) {
		return cache.match(storageUrl).then(function(response) {
			if (response) return response;
			
			return fetch(request).then(function(networkResponse) {
			cache.put(storageUrl, networkResponse.clone());
			return networkResponse;
			});
			});
	});
}






