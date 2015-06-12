/**
 * Libraries : Hacked
 * BNB Books Published example App
 * App to query the British National Bibliography for books published in the current location.
 * And to find the nearest library.
 */

//////////////////////////////////////////////////////////////
// APP STARTUP
//////////////////////////////////////////////////////////////

var UI = require('ui');
var Vector2 = require('vector2');
var ajax = require('ajax');
// For use when simulating locations
var hasfield = { latitude: 51.94, longitude: -2.26 }

var main = new UI.Card({
  title: 'BNB Books',
  icon: 'images/menu_icon.png',
  subtitle: '',
  body: 'Press any button to view a book published nearby.'
});

// Initially display the main screen
main.show();

////////////////////////////////////////////////////////////////
// APP EVENTS
////////////////////////////////////////////////////////////////

// Set the location options that are passed in when accessing location
// 15 second timeout and a maximum 'age' of the data set at 60 seconds. 
var locationOptions = { "timeout": 15000, "maximumAge": 60000 };
// Variable used for tracking the current function (which button was pressed)
var currentFunction = '';
// set up the buttons
// Up button finds books published in the current location (BNB)
main.on('click', 'up', function(e) { 
  currentFunction = 'published';
  navigator.geolocation.getCurrentPosition(reverseGeocode, handleError, locationOptions);
});
// Select button finds the nearest library (culture grid)
main.on('click', 'select', function(e) {
  navigator.geolocation.getCurrentPosition(getLibrary, handleError, locationOptions);
});
// Down button finds books set in the current location (BNB)
main.on('click', 'down', function(e) { 
  currentFunction = 'setin';
  navigator.geolocation.getCurrentPosition(reverseGeocode, handleError, locationOptions);
});


////////////////////////////////////////////////////////////////
// APP FUNCTIONS
////////////////////////////////////////////////////////////////

//////////////////////////////////////
// reverseGeocode(lat, lng)
// Input: lat and lng coordinates
// takes the location position and uses
// an implementation of OSM to reverse geocode them.
//////////////////////////////////////
function reverseGeocode(pos) {
  var coordinates = pos.coords;
  coordinates = hasfield;
  ajax(
    {
      url: 'http://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&lat=' + coordinates.latitude + '&lon=' + coordinates.longitude,
      type: 'json'
    },
    function(data, status, request) {
      if (currentFunction == 'published') getBookPublished(data.address);
      if (currentFunction == 'setin') getBookSetIn(data.address);
    },
    handleError
  );
}

//////////////////////////////////////
// getBookPublished(address)
// Input: address from reverse geocoding
//////////////////////////////////////
function getBookPublished(address) {
  // the address object may have village, town, or city
  // for now just use city
  console.log(JSON.stringify(address));
  var city = address.town;
  
  // construct a sparql query to get a book from a location
  var sparql = '';
  sparql += 'PREFIX bibo: <http://purl.org/ontology/bibo/>';
  sparql += 'PREFIX bio: <http://purl.org/vocab/bio/0.1/>';
  sparql += 'PREFIX blt: <http://www.bl.uk/schemas/bibliographic/blterms#>';
  sparql += 'PREFIX dct: <http://purl.org/dc/terms/>';
  sparql += 'PREFIX event: <http://purl.org/NET/c4dm/event.owl#>';
  sparql += 'PREFIX foaf: <http://xmlns.com/foaf/0.1/>';
  sparql += 'PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>';
  sparql += 'PREFIX isbd: <http://iflastandards.info/ns/isbd/elements/>';
  sparql += 'PREFIX org: <http://www.w3.org/ns/org#>';
  sparql += 'PREFIX owl: <http://www.w3.org/2002/07/owl#>';
  sparql += 'PREFIX rdau: <http://rdaregistry.info/Elements/u/>';
  sparql += 'PREFIX madsrdf: <http://www.loc.gov/mads/rdf/v1#>';
  sparql += 'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>';
  sparql += 'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>';
  sparql += 'PREFIX skos: <http://www.w3.org/2004/02/skos/core#>';
  sparql += 'PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>';
  sparql += 'PREFIX void: <http://rdfs.org/ns/void#>';
  sparql += 'SELECT ?book ?isbn ?title WHERE {';
  sparql += '  ?place rdfs:label "' + city + '" .';
  sparql += '  ?publication event:place ?place.';
  sparql += '  ?book';
  sparql += '    blt:publication ?publication;';
  sparql += '    bibo:isbn10 ?isbn;';
  sparql += '  dct:title ?title.';
  sparql += '}';
  sparql += 'LIMIT 1';

  queryBNB(sparql); 
}


//////////////////////////////////////
// getBookSetIn(address)
// Input: address from reverse geocoding
//////////////////////////////////////
function getBookSetIn(address) {
  // the address object may have village, town, or city
  // for now just use city
  console.log(JSON.stringify(address));
  var city = address.town;
  
  // construct a sparql query to get a book from a location
  var sparql = '';
  sparql += 'PREFIX bibo: <http://purl.org/ontology/bibo/>';
  sparql += 'PREFIX bio: <http://purl.org/vocab/bio/0.1/>';
  sparql += 'PREFIX blt: <http://www.bl.uk/schemas/bibliographic/blterms#>';
  sparql += 'PREFIX dct: <http://purl.org/dc/terms/>';
  sparql += 'PREFIX event: <http://purl.org/NET/c4dm/event.owl#>';
  sparql += 'PREFIX foaf: <http://xmlns.com/foaf/0.1/>';
  sparql += 'PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>';
  sparql += 'PREFIX isbd: <http://iflastandards.info/ns/isbd/elements/>';
  sparql += 'PREFIX org: <http://www.w3.org/ns/org#>';
  sparql += 'PREFIX owl: <http://www.w3.org/2002/07/owl#>';
  sparql += 'PREFIX rdau: <http://rdaregistry.info/Elements/u/>';
  sparql += 'PREFIX madsrdf: <http://www.loc.gov/mads/rdf/v1#>';
  sparql += 'PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>';
  sparql += 'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>';
  sparql += 'PREFIX skos: <http://www.w3.org/2004/02/skos/core#>';
  sparql += 'PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>';
  sparql += 'PREFIX void: <http://rdfs.org/ns/void#>';
  sparql += 'SELECT ?book ?isbn ?title WHERE {';
  sparql += '  ?place rdfs:label "' + city + '" .';
  sparql += '  ?publication event:place ?place.';
  sparql += '  ?book';
  sparql += '    blt:publication ?publication;';
  sparql += '    bibo:isbn10 ?isbn;';
  sparql += '  dct:title ?title.';
  sparql += '}';
  sparql += 'LIMIT 1';

  queryBNB(sparql); 
}

//////////////////////////////////////
// queryBNB(sparql)
// Input: a sparql query string
// 
//////////////////////////////////////
function queryBNB(sparql) {
  ajax(
    {
      url: 'http://bnb.data.bl.uk/sparql?output=json&query=' + encodeURIComponent(sparql),
      type: 'json'
    },
    function(data, status, request) {
      console.log(data);
      displayBook(data);
    },
    handleError
  );
}

//////////////////////////////////////
// getLibrary(pos)
// Input:
// 
//////////////////////////////////////
function getLibrary(pos) {
  var coordinates = pos.coords;
  coordinates = hasfield;
  ajax(
    {
      url: 'http://www.culturegrid.org.uk/index/select/?q={!spatial lat=' + coordinates.latitude + ' long=' + coordinates.longitude + ' radius=25 unit=miles} dcterms.isPartOf:MLAInstitutions AND institution_sector:Libraries&version=2.2&start=0&rows=1&indent=on&sort=distance asc&wt=json',
      type: 'json'
    },
    function(data, status, request) {
      console.log(JSON.stringify(data));
      displayLibrary(data.response.docs[0]);
    },
    handleError
  );
}

//////////////////////////////////////
// displayBook(bookObject)
// Input:
//////////////////////////////////////
function displayBook(bookObject){

  var book = new UI.Window({
    fullscreen: true,
  });

  var textfield = new UI.Text({
    position: new Vector2(0, 65),
    size: new Vector2(144, 30),
    font: 'gothic-24-bold',
    text: 'Text Anywhere!',
    textAlign: 'center'
  });

  book.add(textfield);
  book.show();
}

//////////////////////////////////////
// displayLibrary(libraryObject)
// Input: A library object as returned by 
// the culture grid
// Displays onto the pebble screen
//////////////////////////////////////
function displayLibrary(libraryObject){

  var library = new UI.Window({
    fullscreen: true,
  });

  var textfield = new UI.Text({
    position: new Vector2(0, 65),
    size: new Vector2(144, 30),
    font: 'gothic-24-bold',
    text: libraryObject['dc.title'],
    textAlign: 'center'
  });

  library.add(textfield);
  library.show();
}

//////////////////////////////////////
// handleError()
// Input: an error object
// Error hanndling used for geocoding and 
// Ajax calls.
//////////////////////////////////////
function handleError(err) {
  console.warn('Error: (' + err.code + '): ' + err.message);
}