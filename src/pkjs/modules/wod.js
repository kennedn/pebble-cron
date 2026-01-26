// wod.js
//
// Minimal Word of the Day scraper.
// - Uses your existing xhrRequestText (promises, no async/await)
// - Uses native DOMParser (no cheerio needed)

var globals = require('./globals');
for (var key in globals) {
  window[key] = globals[key];
}
var XHR = require('./xhr');

var self = module.exports = {
  getWordOfTheDay: function(maxRetries) {
    var url = "https://www.merriam-webster.com/word-of-the-day";
    var headers = { "Accept": "text/html,application/xhtml+xml" };

    return XHR.xhrRequestText("GET", url, headers, null, 3)
      .then(function(html) {
        var doc = new DOMParser().parseFromString(html, "text/html");

        var title = doc.querySelector(".word-header-txt").textContent;

        var container = doc.querySelector(".wod-definition-container");
        var ps = container.querySelectorAll("p");

        var body = ps[0].textContent + "\n";
        for (var i = 0; i < ps.length; i++) {
          if (ps[i].textContent.indexOf("//") === 0) body += ps[i].textContent + "\n";
        }

        return {
          title: title,
          body: body.trim()
        };
      });
  }
};
