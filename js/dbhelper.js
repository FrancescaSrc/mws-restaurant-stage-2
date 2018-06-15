/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }


  static openDB(){
   
   return idb.open('Restaurants-reviews', 1, function(upgradeDb) {
    var restStore = upgradeDb.transaction.objectStore('restaurants');
    console.log('restStore is empty', restStore);
    
    });
  }

  static createStore(response){
    var restaurants=response;
   // console.log('create', restaurants)
   idb.open('Restaurants-reviews', 1, function(upgradeDb) {

    var restStore = upgradeDb.createObjectStore('restaurants', {keyPath: 'id'});
    //create index for cuisine property
    restStore.createIndex('by-cuisine', 'cuisine_type');
    //create index for neighborhood property
    restStore.createIndex('by-neighborhood', 'neighborhood');
    
    }).then(function(db) {
    // or the very first load, there's no point fetching
    // posts from IDB
        if (!db) { return;}
                
              restaurants.forEach(restaurant =>{
              var tx= db.transaction('restaurants', 'readwrite');
              var restStore= tx.objectStore('restaurants');
              restStore.put(restaurant);
              return tx.complete;
              });
          });

    return restaurants;
  }

/**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
     if (!navigator.serviceWorker) {
    return null;
  }

    if(indexedDB in window){

   DBHelper.openDB().then(function(db){
    console.log('fetched from indexDB ', db);
   
      var tx= db.transaction('restaurants');
    var restStore= tx.objectStore('restaurants');
    return restStore.getAll();

  }).then(function(restaurants){
   
    return callback(restaurants);
  });
 } else {
  fetch(DBHelper.DATABASE_URL)
      .then(response => response.json())
      .then(response => DBHelper.createStore(response))
      .then(callback)
      .catch(err=> console.log(err));
 }

 
    
    
}


  /**
   * Fetch all restaurants without using IDB.
   */
  static fetchRestaurantsWithoutIDB(callback) {
   
   fetch(DBHelper.DATABASE_URL)
      .then(response => response.json())
      .then(callback)
      .catch(err=> console.log(err));

  }
      


  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {

    if(window.indexedDB){
     DBHelper.fetchRestaurantByIdLocally(id, callback);
    }
    else{
    DBHelper.fetchRestaurants(restaurants => {
          return restaurant.find(r => r.id == id)
            || Promise.reject(new error('Restaurant does not exist'));
        });
    }

    
    
       
              
}

 /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantByIdLocally(id, callback) {

  var dbPromise=DBHelper.openDB();

       dbPromise.then(function(db){
    var tx= db.transaction('restaurants');
    var restStore= tx.objectStore('restaurants');
    return restStore.get(parseInt(id));
  }).then(function(restaurant){
 //  console.log('restStore contents res1: ', restaurant);
     callback(restaurant);
  }); 
    
  
}


  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants(restaurants => {      
        // Filter restaurants to have only given cuisine type
        return restaurants.filter(r => r.cuisine_type == cuisine)
        .catch(err=> console.log(err));
      
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants(restaurants => {
      return restaurants.filter(r => r.neighborhood == neighborhood);       
      }).catch(err=> console.log(err));
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
 static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {

    // Fetch all restaurants
    DBHelper.fetchRestaurants(restaurants => {     
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      
    });
  }
  
  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants(restaurants => {      
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      
      
    });
  }


  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants(restaurants => {     
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`./img/${restaurant.photograph}`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

}
