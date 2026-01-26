// bin_collector.js
//
// Minimal bin collection checker.
// - Uses existing xhrRequestText (promises)
// - Uses native DOMParser
// - Returns strings like: "Next recycling collection is tomorrow"

var globals = require('./globals');
for (var key in globals) {
  window[key] = globals[key];
}
var XHR = require('./xhr');

function midnight(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function dateParse(str) {
  var match = str.match(/^(?<day>\d{1,2})\/(?<month>\d{1,2})\/(?<year>\d{4})$/);
  if (!match) return null;

  var { day, month, year } = match.groups;
  return new Date(year, month - 1, day);
}

var self = module.exports = {
  // Returns Promise<[string, string, ...]>
  getBinsTomorrow: function(address) {
    var headers = {
      "Accept": "text/html,application/xhtml+xml"
    };

    var searchUrl =
      "https://www.midlothian.gov.uk/site/scripts/directory_search.php?directoryID=35&keywords=" +
      address.replace(" ", "+") +
      "&search=Search";

    return XHR.xhrRequestText("GET", searchUrl, headers, null, 3)
      .then(function(html) {
        var doc = new DOMParser().parseFromString(html, "text/html");
        var a = [...doc.querySelectorAll("a")].find(i => i.innerText == address);
        if (!a) throw new Error("No address link found");
        debug(3, `Found address link: ${a.getAttribute("href")}`);
        return "https://www.midlothian.gov.uk" + a.getAttribute("href");
      })

      .then(function(detailUrl) {
        return XHR.xhrRequestText("GET", detailUrl, headers, null, 3);
      })

      .then(function(html) {
        var doc = new DOMParser().parseFromString(html, "text/html");

        var items = [...doc.querySelectorAll("ul > li")]
          .map(i => i.innerText.trim())
          .filter(i => /^Next.*collection/.test(i));

        debug(3, `Bin collection candidates: ${items.length}`);
        var today = midnight(new Date());
        var tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        return items
          .map(i => {
            var regex = /Next\s+(?<label>.+?)\s+collection[\s\S]*?(?<dateStr>\d{1,2}\/\d{1,2}\/\d{4})/;
            var m = i.match(regex);
            var { label, dateStr } = m.groups;
            var date = dateParse(dateStr);
            if (!date) {
              debug(2, `Failed to parse date for item: ${i}`);
              return { label: label, date: NaN };
            }
            return { label: label, date: date, dateStr: dateStr };
          })
          .filter(i => {
            return !isNaN(i.date) && midnight(i.date).getTime() === tomorrow.getTime();
          })
      });
  }
};
