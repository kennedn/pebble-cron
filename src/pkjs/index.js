require('./polyfills/strings');
var globals = require('./modules/globals');
var Wod = require('./modules/wod');
for (var key in globals) {
  window[key] = globals[key];
}
// var LZString = require ('./vendor/LZString');

// var Clay = require('pebble-clay-kennedn');
// var customClay = require('./data/clay_function');
// var clayConfig = require('./data/clay_config');
// var clay = new Clay(clayConfig, customClay, {autoHandleEvents: false});

function nextTimeOfDayFromNow(hour, min, sec) {
  const now = new Date();

  // Start with today's date in local time
  const candidate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hour,
    min,
    sec,
    0
  );

  // Ensure strictly in the future
  if (candidate.getTime() <= now.getTime()) {
    candidate.setDate(candidate.getDate() + 1);
  }

  return candidate
}

function buildPin({
  id,
  time,
  title,
  subtitle,
  body,

  // Optional overrides with defaults
  type = "genericPin",
  tinyIcon = "system://images/NEWS_EVENT",
  primaryColor = "#000000",
  secondaryColor = "#000000",
  backgroundColor = "#00AAFF"
}) {
  // Enforce required fields
  if (!id || !time || !title || !body) {
    throw new Error("buildPin requires id, time, title, and body");
  }

  return {
    id,
    time,
    layout: {
      type,
      title,
      subtitle,
      body,
      tinyIcon,
      primaryColor,
      secondaryColor,
      backgroundColor
    }
  };
}


function insertWodPin() {
  Wod.getWordOfTheDay().then(function(word) {
    debug(2, "WOTD Title: " + word.title);
    debug(2, "WOTD Body: " + word.body);

    var time = nextTimeOfDayFromNow(23, 59, 0);
    var pin = buildPin({
      id: `wod-${time.getTime()}`,
      time: time.toISOString(),
      title: "Today's word:",
      subtitle: word.title,
      body: word.body
    });

    debug(2, "Inserting pin: " + JSON.stringify(pin));
    Pebble.insertTimelinePin(pin);
    appMessage({"TransferType": TransferType.ACK});
  }).catch(function(err) {
    debug(1, "Error fetching WOTD: " + err);
    appMessage({"TransferType": TransferType.ERROR});
  });
}

// Called when incoming message from the Pebble is received
Pebble.addEventListener("appmessage", function(e) {
  var dict = e.payload;
  debug(3, 'Got message: ' + JSON.stringify(dict));

  switch(dict.TransferType) {
    case TransferType.GENERATE_PINS:
      debug(2, "Generating pins");
      insertWodPin();
    break;
  }
});


Pebble.addEventListener('ready', function() {
  console.log("And we're back");
  appMessage({"TransferType": TransferType.READY});
});


// Pebble.addEventListener('showConfiguration', function(e) {
//   var claySettings = localStorage.getItem("clay-settings");
//   try {
//     claySettings = JSON.parse(claySettings);
//   } catch(err) {}

//   if(Geo.coords.length > 0 && claySettings && 'ClayJSON' in claySettings) {
//     debug(2, "Coords: " + Geo.coords);
//     claySettings['ClayJSON'] = JSON.stringify(Geo.coords[0]);
//     localStorage.setItem("clay-settings", JSON.stringify(claySettings));
//   }
    
//   Pebble.openURL(clay.generateUrl());
// });


// Pebble.addEventListener('webviewclosed', function(e) {
//   if (e && !e.response) {
//     return;
//   }
//   // Get the keys and values from each config item
//   var response = JSON.parse(LZString.decompressFromEncodedURIComponent(e.response));
  

//   switch(response.action) {
//     case "Search":
//       Pebble.sendAppMessage({"TransferType": TransferType.CLAY}, messageSuccess, messageFailure);
//       localStorage.setItem('search_query', encodeURIComponent(response.payload));
//       debug(2, "Search term: " + encodeURIComponent(response.payload));

//       var claySettings = {};
//       claySettings['SearchInput'] = response.payload;
//       localStorage.setItem('clay-settings', JSON.stringify(claySettings));

//       Geo.init(encodeURIComponent(response.payload)).then(function(items) {
//         claySettings['ClayJSON'] = JSON.stringify(items[0]);
//         localStorage.setItem('clay-settings', JSON.stringify(claySettings));
//       }, null);
//       break;
//   }
// });
