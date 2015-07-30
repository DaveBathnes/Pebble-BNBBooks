/**
 * Libraries : Hacked
 * BNB Books example App
 * App to query the British National Bibliography for books published in the current location.
 * Additional: And to find the nearest library.
 */

//////////////////////////////////////////////////////////////
// APP STARTUP
//////////////////////////////////////////////////////////////

var ui = require('ui');
var ajax = require('ajax');
// Test location for use in simulator
var testLocation = { coords: { latitude: 51.94, longitude: -2.26 } };

// Create and display the main UI card - values can then be dynamically changed
var main = new ui.Card({
  title: 'BNB Books',
  subtitle: 'Search for local books',
  body: 'Push buttons!'
});
main.show();

////////////////////////////////////////////////////////////////
// APP EVENTS
////////////////////////////////////////////////////////////////

// Set the location options that are passed in when accessing location
var locationOptions = { "timeout": 15000, "maximumAge": 60000 };
// Variable used for tracking the current function (which button was pressed)
var currentFunction = '';
// Up button (top) finds books published in the current location (BNB)
main.on('click', 'up', function(e) {
  currentFunction = 'published';
  navigator.geolocation.getCurrentPosition(reverseGeocode, handleError, locationOptions);
});
// Select button (middle) finds the nearest library (culture grid)
main.on('click', 'select', function(e) {
  navigator.geolocation.getCurrentPosition(getLibrary, handleError, locationOptions);
});
// Down button (bottom) finds books set in the current location (BNB)
main.on('click', 'down', function(e) { 
  currentFunction = 'setin';
  navigator.geolocation.getCurrentPosition(reverseGeocode, handleError, locationOptions);
});

////////////////////////////////////////////////////////////////
// APP FUNCTIONS
////////////////////////////////////////////////////////////////

//////////////////////////////////////
// reverseGeocode(pos)
// Input: Position object (lat and lng coordinates)
// Takes geocoordinates and uses OM to get an address.
//////////////////////////////////////
function reverseGeocode(pos) {
  pos = testLocation;
  var lat = pos.coords.latitude;
  var lon = pos.coords.longitude;
  var url = 'http://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&lat=' + lat + '&lon=' + lon;
  ajax( { url: url, type: 'json' },
       function(data, status, request) {
         if (currentFunction == 'published') getBookPublished(data.address);
         if (currentFunction == 'setin') getBookSetIn(data.address);
       },
       handleError
      );
}

//////////////////////////////////////
// getBookPublished(address)
// Input: address object
//////////////////////////////////////
function getBookPublished(address) {
  
  console.log(JSON.stringify(address));
  var city = address.town;
  
  // construct a sparql query to get a book from a location
  var sparql = 'PREFIX bibo: <http://purl.org/ontology/bibo/>' +
      'PREFIX blt: <http://www.bl.uk/schemas/bibliographic/blterms#>' +
      'PREFIX dct: <http://purl.org/dc/terms/>' +
      'PREFIX event: <http://purl.org/NET/c4dm/event.owl#>' +
      'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>' +
      'SELECT ?book ?title ?isbn ?creator ?name WHERE {' + 
      '  ?place rdfs:label "' + city + '" .' + 
      '  ?publication event:place ?place.' + 
      '  ?book' + 
      '    blt:publication ?publication;' + 
      '    bibo:isbn10 ?isbn;' + 
      '    dct:creator ?creator;' + 
      '    dct:title ?title.' + 
      '}' + 
      'LIMIT 1';
  
  queryBNB(sparql); 
}

//////////////////////////////////////
// getBookSetIn(address)
// Input: address from reverse geocoding
//////////////////////////////////////
function getBookSetIn(address) {
  
  console.log(JSON.stringify(address));
  var city = address.town + ' (' + address.state + ')';
  
  // construct a sparql query to get a book from a location
  var sparql = 'PREFIX bibo: <http://purl.org/ontology/bibo/>' +
      'PREFIX blt: <http://www.bl.uk/schemas/bibliographic/blterms#>' +
      'PREFIX dct: <http://purl.org/dc/terms/>' +
      'PREFIX event: <http://purl.org/NET/c4dm/event.owl#>' + 
      'PREFIX foaf: <http://xmlns.com/foaf/0.1/>' + 
      'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>' + 
      'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>' + 
      'PREFIX c4dm: <http://purl.org/NET/c4dm/event.owl#>' + 
      'SELECT ?bnb ?book ?title ?isbn ?creator ?name WHERE {' + 
      '   ?setIn rdfs:label "' + city + '" .' + 
      '   ?publication event:place ?place;' + 
      '      c4dm:time ?time.' + 
      '   ?book' + 
      '      a bibo:Book;' + 
      '      blt:bnb ?bnb;' +
      '      blt:publication ?publication;' + 
      '      bibo:isbn10 ?isbn;' + 
      '      dct:title ?title;' + 
      '      dct:creator ?creator;' + 
      '      dct:spatial ?setIn.' + 
      '   ?creator foaf:name ?name.' + 
      '}';
  console.log(sparql);
  queryBNB(sparql);
}

//////////////////////////////////////
// queryBNB(sparql)
// Input: a sparql query string
// Queries the BNB with the SPARQL
//////////////////////////////////////
function queryBNB(sparql) {
  var url = 'http://bnb.data.bl.uk/sparql?output=json&query=' + encodeURIComponent(sparql);
  ajax( { url: url, type: 'json' },
       function(data, status, request) {
         console.log(JSON.stringify(data));
         if (data.results.bindings[0]) displayItem(data.results.bindings[0].title.value, data.results.bindings[0].isbn.value, data.results.bindings[0].name.value);
       }, 
       handleError);
}

//////////////////////////////////////
// getLibrary(pos)
// Input: Position object (lat and lng coordinates)
// Gets the nearest library
//////////////////////////////////////
function getLibrary(pos) {
  pos = testLocation;
  var lat = pos.coords.latitude;
  var lon = pos.coords.longitude;
  var query = 'q={!spatial lat=' + lat + ' long=' + lon + ' radius=25 unit=miles} ' + 
      ' dcterms.isPartOf:MLAInstitutions ' + 
      'AND institution_sector:Libraries' + 
      '&version=2.2' + 
      '&start=0' + 
      '&rows=1' + 
      '&indent=on' + 
      '&sort=distance asc' + 
      '&wt=json';
  var url = 'http://www.culturegrid.org.uk/index/select/?' + query;
  ajax( { url: url, type: 'json' },
       function(data, status, request) {
         console.log(JSON.stringify(data));
         if (data.response.docs[0]) displayItem(data.response.docs[0]['dc.titleString'], '', '');
       },
       handleError
  );
}

//////////////////////////////////////
// displayItem(title, subtitle, body)
// Input: details to display
// Displays onto the pebble screen
//////////////////////////////////////
function displayItem(title, subtitle, body){
  main.title(title);
  main.subtitle(subtitle);
  main.body(body);
}

//////////////////////////////////////
// handleError()
// Input: an error object
// Error hanndling for app
//////////////////////////////////////
function handleError(err) {
  console.log(err);
}