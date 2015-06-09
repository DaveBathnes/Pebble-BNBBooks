/**
 * BNB Books Published example App
 * App to query the British National Bibliography for books published in the current location.
 */

var UI = require('ui');
var Vector2 = require('vector2');

var main = new UI.Card({
  title: 'BNB Books',
  icon: 'images/menu_icon.png',
  subtitle: '',
  body: 'Press any button to view a book published nearby.'
});

// The location options that are passed in when accessing location
// 15 second timeout and a maximum 'age' of the data set at 60 seconds. 
var locationOptions = { "timeout": 15000, "maximumAge": 60000 }; 

main.show();

// set up any of the buttons to trigger the fetch.
main.on('click', 'up', function(e) { getLocalBook(); });
main.on('click', 'select', function(e) { getLocalBook(); });
main.on('click', 'down', function(e) { getLocalBook(); });

//////////////////////////////////////
// getLocalBook()
// Triggers the location lookup
//////////////////////////////////////
function getLocalBook(){
  main.navigator.geolocation.getCurrentPosition(locationSuccess, locationError, locationOptions);
}

//////////////////////////////////////
// locationSuccess()
// Input: position (as returned by a geocode lookup)
// On success of the location lookup, call to the the book.
//////////////////////////////////////
function locationSuccess(pos) {
  var coordinates = pos.coords;
  getBook(coordinates.latitude, coordinates.longitude);
}

//////////////////////////////////////
// locationError()
// Input:
// Output: 
//////////////////////////////////////
function locationError(err) {
  console.warn('location error (' + err.code + '): ' + err.message);
}

//////////////////////////////////////
// getBook(latitude, longitude)
// Input:
// Output: 
//////////////////////////////////////
function getBook(latitude, longitude) {
  
  var req = new XMLHttpRequest();
  
  req.open('GET', "http://api.openweathermap.org/data/2.5/weather?" + "lat=" + latitude + "&lon=" + longitude + "&cnt=1", true);
  
  req.onload = function(e) {
    if (req.readyState == 4) {
      if(req.status == 200) {
        console.log(req.responseText);

        displayBook(req);
        
      } else {
        console.log("Error");
      }
    }
  };
  
  req.send(null);
}

//////////////////////////////////////
// displayBook(bookObject)
// Input:
// Output: 
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