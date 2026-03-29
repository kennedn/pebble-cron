// bin.js
//
// Bin collection checker via JSON API.
// - Uses existing xhrRequestText (promises)
// - Returns objects like:
//   { label: "Food", date: DateObject, dateStr: "30/03/2026" }

var globals = require('./globals');
for (var key in globals) {
  window[key] = globals[key];
}
var XHR = require('./xhr');

function midnight(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

var self = module.exports = {
  // Returns Promise<[ { label, date, dateStr }, ... ]>
  getBinsTomorrow: function(address) {
    var headers = {
      "Accept": "application/json",
      "Content-Type": "application/json"
    };

    var url = "http://api.kennedn.com/v2/bins";

    var body = {
      address: address
    };

    return XHR.xhrRequest("POST", url, headers, body, 3)
      .then(function(responseJson) {

        if (!responseJson || !Array.isArray(responseJson.data)) {
          throw new Error("Invalid bin API response");
        }

        var items = responseJson.data
          .map(function(item) {
            var date = new Date(item.date);
            if (isNaN(date.getTime()) || !item.name) {
              debug(2, "Skipping invalid bin item: " + JSON.stringify(item));
              return null;
            }

            return {
              label: item.name,
              date: date,
              dateStr: date.toLocaleDateString("en-GB")
            };
          })
          .filter(function(item) {
            return item !== null;
          });

        debug(3, "Bin collection candidates: " + items.length);

        var tomorrow = midnight(new Date());
        tomorrow.setDate(tomorrow.getDate() + 1);

        return items.filter(function(item) {
          return midnight(item.date).getTime() === tomorrow.getTime();
        });
      });
  }
};