//import idb from 'idb.js';
//import '/idb.js';
let restaurants,
neighborhoods,
cuisines
var map
var markers = []


 var dbPromise =idb.open('Rest-rev', 1, function(upgradeDb){
 	switch(upgradeDb.oldVersion){
 		case 0:
 		var keyValStore = upgradeDb.createObjectStore('keyval');
 		keyValStore.put('world', 'hallo');
 		case 1:
 		upgradeDb.createObjectStore('restaurants', {keyPath: 'name'})
 	}
 	
 	
 }
);
//Reading from the database

 dbPromise.then(function(db){
 	var tx=db.transaction('keyval');
 	var keyValStore=tx.objectStore('keyval');
 	return keyValStore.get('hallo');
 }).then(function(val){
 	console.log('the value of "hallo" is:', val);
 });

//Adding to the database
dbPromise.then(function(db){
	var tx = db.transaction('keyval', 'readwrite');
	var keyValStore = tx.objectStore('keyval');
	keyValStore.put('bar', 'foo');
	return tx.complete;
}).then(function(){
	console.log('Added foo, bar to keyval');
});

/**
	* Fetch neighborhoods and cuisines as soon as the page is loaded.
*/
document.addEventListener('DOMContentLoaded', (event) => {
	fetchNeighborhoods();
	fetchCuisines();
});

/**
	* Fetch all neighborhoods and set their HTML.
*/
fetchNeighborhoods = () => {
	DBHelper.fetchNeighborhoods((error, neighborhoods) => {
		
			self.neighborhoods = neighborhoods;
			fillNeighborhoodsHTML();
		
	})
}


/**
	* Set neighborhoods HTML.
*/
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
	const select = document.getElementById('neighborhoods-select');
	
	neighborhoods.forEach(neighborhood => {
		const option = document.createElement('option');
		option.setAttribute('tabindex', 0);
		option.setAttribute('aria-label', neighborhood);
		option.innerHTML = neighborhood;
		option.value = neighborhood;
		select.append(option);
	});
}

/**
	* Fetch all cuisines and set their HTML.
*/
fetchCuisines = () => {
	DBHelper.fetchCuisines((error, cuisines) => {
		if (error) { // Got an error!
			console.error(error);
			} else {
			self.cuisines = cuisines;
			fillCuisinesHTML();
		}
		});
}

/**
	* Set cuisines HTML.
*/
fillCuisinesHTML = (cuisines = self.cuisines) => {
	const select = document.getElementById('cuisines-select');
	
	cuisines.forEach(cuisine => {
		const option = document.createElement('option');
		option.setAttribute = ('role', 'option');
		option.setAttribute = ('tabindex', '0');
		option.innerHTML = cuisine;
		option.value = cuisine;
		select.append(option);
	});
}

/**
	* Initialize Google map, called from HTML.
*/
window.initMap = () => {
	let loc = {
		lat: 40.722216,
		lng: -73.987501
	};
	self.map = new google.maps.Map(document.getElementById('map'), {
		zoom: 12,
		center: loc,
		scrollwheel: false
	});
	updateRestaurants();
}

/**
	* Update page and map for current restaurants.
*/
updateRestaurants = () => {
	const cSelect = document.getElementById('cuisines-select');
	const nSelect = document.getElementById('neighborhoods-select');
	
	const cIndex = cSelect.selectedIndex;
	const nIndex = nSelect.selectedIndex;
	
	const cuisine = cSelect[cIndex].value;
	const neighborhood = nSelect[nIndex].value;
	
	DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
		if (error) { // Got an error!
			console.error(error);
			} else {
			resetRestaurants(restaurants);
			fillRestaurantsHTML();
		}
	})
}

/**
	* Clear current restaurants, their HTML and remove their map markers.
*/
resetRestaurants = (restaurants) => {
	// Remove all restaurants
	self.restaurants = [];
	const ul = document.getElementById('restaurants-list');
	ul.innerHTML = '';
	
	// Remove all map markers
	self.markers.forEach(m => m.setMap(null));
	self.markers = [];
	self.restaurants = restaurants;
}

/**
	* Create all restaurants HTML and add them to the webpage.
*/
fillRestaurantsHTML = (restaurants = self.restaurants) => {
	const ul = document.getElementById('restaurants-list');
	restaurants.forEach(restaurant => {
		ul.append(createRestaurantHTML(restaurant));
	});
	addMarkersToMap();
}

/**
	* Create restaurant HTML.
*/

createRestaurantHTML = (restaurant) => {
	
	const li = document.createElement('li');
	li.className='restaurant-listing';
	
	const name = document.createElement('h3');
	name.setAttribute('tabindex', '0');
	name.innerHTML = restaurant.name;
	li.append(name);
	
	const picture = document.createElement('picture');
	
	const source = document.createElement('source');
	source.media='(max-width: 501px), (min-width: 502px), (min-width:700px), (min-width: 950px)';
	source.sizes='(max-width: 501px) 200px, 100vw, (min-width: 502px) 550px, 100vw, (min-width:700px) 350px, 550px, 100vw, (min-width: 950px) 350px, 550px, 100vw' ;
	source.srcset='./images/'+restaurant.id+'-small.webp 200w, ./images/'+restaurant.id+'-medium.webp 350w, ';
	source.srcset +='./images/'+restaurant.id+'-large.webp 550w, ./images/'+restaurant.id+'-large7.webp 700w, ';
	source.srcset +='./images/'+restaurant.id+'-medium.webp 350w, ./images/'+restaurant.id+'-large.webp 550w, ./images/'+restaurant.id+'-large7.webp 700w ';
	picture.append(source); 
	const sourceL = document.createElement('source');
	sourceL.media='(max-width: 501px), (min-width: 502px), (min-width:700px), (min-width: 950px)';
	sourceL.sizes='(max-width: 501px) 200px, 100vw, (min-width: 502px) 550px, 100vw, (min-width: 700px) 350px, 550px, 100vw, (min-width: 950px) 350px, 550px, 100vw';
	sourceL.srcset='./images/'+restaurant.id+'-medium.jpg 200w, ./images/'+restaurant.id+'-large.jpg 350w, ';
	sourceL.srcset +='./images/'+restaurant.id+'-large.jpg 550w, ./images/'+restaurant.id+'-large7.jpg 700w, ';
	sourceL.srcset +='./images/'+restaurant.id+'-medium.webp 350w, ./images/'+restaurant.id+'-large.jpg 550w, ./images/'+restaurant.id+'-large7.jpg 700w ';
	picture.append(sourceL);
	const image = document.createElement('img');
	image.className = 'restaurant-img';
	image.alt = 'restaurant '+restaurant.name;
	image.src = DBHelper.imageUrlForRestaurant(restaurant);
	picture.append(image);
	li.append(picture);
	
	const neighborhood = document.createElement('p');
    neighborhood.setAttribute('tabindex', '0');
	neighborhood.setAttribute('aria-label', 'neighborhood:'+restaurant.neighborhood);
	neighborhood.className='neighborhood';
	neighborhood.innerHTML = restaurant.neighborhood;
	li.append(neighborhood);
	
	const address = document.createElement('p');
	address.className='address';
	address.setAttribute('aria-label', 'Address:'+restaurant.address);
	address.setAttribute('tabindex', '0');
	address.innerHTML = restaurant.address;
	li.append(address);
	
	const more = document.createElement('a');
	more.setAttribute('role', 'button')
	more.setAttribute('aria-label', 'View details on '+restaurant.name);
	more.innerHTML = "View details";
	more.href = DBHelper.urlForRestaurant(restaurant);
	li.append(more);
	
	return li
}


/**
	* Add markers for current restaurants to the map.
*/
addMarkersToMap = (restaurants = self.restaurants) => {
	restaurants.forEach(restaurant => {
		// Add marker to the map
		const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
		google.maps.event.addListener(marker, 'click', () => {
			window.location.href = marker.url
		});
		self.markers.push(marker);
	});
}


// if ('serviceWorker' in navigator) {
// 	window.addEventListener('load', function() {
// 		navigator.serviceWorker.register('sw.js').then(function(registration) {
// 			// Registration was successful
// 			console.log('ServiceWorker registration successful with scope: ', registration.scope);
// 			}, function(err) {
// 			// registration failed :(
// 			console.log('ServiceWorker registration failed: ', err);
// 		});
// 	});
//}



