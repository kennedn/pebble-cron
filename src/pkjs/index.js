require('./polyfills/strings');
var globals = require('./modules/globals');
for (var key in globals) {
  window[key] = globals[key];
}
var Pins = require('./modules/pins');
var LZString = require ('./vendor/LZString');

var Clay = require('pebble-clay-kennedn');
var customClay = require('./data/clay_function');
var clayConfig = require('./data/clay_config');
var clay = new Clay(clayConfig, customClay, {autoHandleEvents: false});

// Called when incoming message from the Pebble is received
Pebble.addEventListener("appmessage", function(e) {
  var dict = e.payload;
  debug(3, 'Got message: ' + JSON.stringify(dict));

  switch(dict.TransferType) {
    case TransferType.GENERATE_PINS:
      address = localStorage.getItem("address");
      if(!address) {
        appMessage({"TransferType": TransferType.NO_CLAY});
        return;
      }
      debug(2, "Generating pins");
      Pins.insertPins()
      .then(() => {
        appMessage({ TransferType: TransferType.ACK });
      })
      .catch(err => {
        debug(1, "Insert pins failed: " + err);
        appMessage({ TransferType: TransferType.ERROR });
      });
    break;
  }
});


Pebble.addEventListener('ready', function() {
  console.log("And we're back");
  appMessage({"TransferType": TransferType.READY});
});


Pebble.addEventListener('showConfiguration', function(e) {
  localStorage.clear();
  Pebble.openURL(clay.generateUrl());
});


Pebble.addEventListener('webviewclosed', function(e) {
  if (e && !e.response) {
    return;
  }
  // Get the keys and values from each config item
  var response = JSON.parse(LZString.decompressFromEncodedURIComponent(e.response));
  

  switch(response.action) {
    case "Submit":
      localStorage.setItem('address', response.payload);
      debug(2, "addresss set: " + response.payload);

      var claySettings = {};
      claySettings['AddressInput'] = response.payload;
      localStorage.setItem('clay-settings', JSON.stringify(claySettings));
      appMessage({"TransferType": TransferType.READY});
      break;
  }
});
