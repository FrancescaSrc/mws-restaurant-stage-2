	let restaurants,
	neighborhoods,
	cuisines
	var map
	var markers = []
	const responseContainer = document.querySelector('#filter-results');

	/**
		* Fetch neighborhoods and cuisines as soon as the page is loaded.
		*/
		document.addEventListener('DOMContentLoaded', (event) => {
			event.preventDefault();
			responseContainer.innerHTML = '';
			const restaurantListContainer = document.getElementById('restaurants-list');
			const cSelect = document.getElementById('cuisines-select');
			const nSelect = document.getElementById('neighborhoods-select');
			fetchRestaurants();
		
	function fetchRestaurants() {
	   	fetch('http://localhost:1337/restaurants')
	   	.then(response => response.json())
	   	.then(fillRestaurants);}

	   	function fillRestaurants(restaurants){
	   		let htmlContent='';

	   		htmlContent= '<ul id="restaurants-list">' + restaurants.map(restaurant=> 
	   			`<li class="restaurant-listing">
	   			<h3>${restaurant.name}</h3>
	   			<img class="restaurant-img" alt="restaurant ${restaurant.name}" src="./img/${restaurant.id}.jpg">
	   			<p tabindex="0" aria-label="neighborhood:${restaurant.neighborhood}" class="neighborhood">${restaurant.neighborhood}</p>
	   			<p class="address" aria-label="${restaurant.address}" tabindex="0">
	   			${restaurant.address}</p><a role="button" aria-label=
	   			"View details on ${restaurant.name}" 
	   			href="./restaurant.html?id=${restaurant.id}">View details</a>

	   			</li>`
	   			).join('')+'</ul>';

		responseContainer.insertAdjacentHTML('afterbegin', htmlContent);
	   	fetchNeighborhoodsAndCusines(restaurants);
	   	addMarkersToMap(restaurants);

	   
	   	};


	/**
	   * Fetch neighboorhoods and cusise
	   */
	   function fetchNeighborhoodsAndCusines(restaurants){

	   	if(restaurants[0]){
	   		var neighborhoods=fetchNeighborhoods(restaurants);
	   		var cusines=fetchCuisines(restaurants);
	   		
	   
	   
		}
	}

	/**
	   * Fetch all neighborhoods with proper error handling.
	   */
	   function fetchNeighborhoods(restaurants) {


	    // Get all neighborhoods from all restaurants
	    const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood);
	        // Remove duplicates from neighborhoods
	        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
	        fillNeighborhoodsHTML(uniqueNeighborhoods);
	    }
	 /**
	   * Fetch restaurants by a cuisine type with proper error handling.
	   */
	   function fetchCuisines(restaurants) {
	   
	   	const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
	        // Remove duplicates from cuisines
	        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)

	        fillCusinesHTML(uniqueCuisines);
	       
	    }

	   /**
	* Set neighborhoods HTML.
	*/
	fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {

		let htmlContent='';
		htmlContent= neighborhoods.map(neighborhood=> 
			`<option tabindex=0 aria-label=${neighborhood}>${neighborhood}`+'</option>'
			).join('');

		nSelect.insertAdjacentHTML('afterbegin', htmlContent);
		}

	fillCusinesHTML = (cusines = self.cusines) => {
		let htmlContent='';
		htmlContent= cusines.map(cusine=> 
			`<option tabindex=0 aria-label=${cusine}>${cusine}`+'</option>'
			).join('');

		cSelect.insertAdjacentHTML('afterbegin', htmlContent);
	};

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
		fetchRestaurants();
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

		if (neighborhood == 'all' && cuisine == 'all'){
			debugger;
			fetch('http://localhost:1337/restaurants')
			.then(response => response.json())
			.then(fillRestaurantsHTML);
		}else{
			results = results.filter(r => r.cuisine_type == cuisine);
			results = results.filter(r => r.neighborhood == neighborhood);
			resetRestaurants(restaurants);
		}  	


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
	* Add markers for current restaurants to the map.
*/
	addMarkersToMap = (restaurants = self.restaurants) => {
		
		restaurants.forEach(restaurant => {
			// Add marker to the map
			console.log(restaurant.map);
			const marker = mapMarkerForRestaurant(restaurant, self.map);
			google.maps.event.addListener(marker, 'click', () => {
				window.location.href = marker.url
			});
			self.markers.push(marker);
		});
	}

/**
   * Map marker for a restaurant.
   */
  function mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: `./restaurant.html?id=${restaurant.id}`,
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }


});  






