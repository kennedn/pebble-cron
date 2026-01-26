/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(1);
	module.exports = __webpack_require__(2);


/***/ }),
/* 1 */
/***/ (function(module, exports) {

	/**
	 * Copyright 2024 Google LLC
	 *
	 * Licensed under the Apache License, Version 2.0 (the "License");
	 * you may not use this file except in compliance with the License.
	 * You may obtain a copy of the License at
	 *
	 *     http://www.apache.org/licenses/LICENSE-2.0
	 *
	 * Unless required by applicable law or agreed to in writing, software
	 * distributed under the License is distributed on an "AS IS" BASIS,
	 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 * See the License for the specific language governing permissions and
	 * limitations under the License.
	 */
	
	(function(p) {
	  if (!p === undefined) {
	    console.error('Pebble object not found!?');
	    return;
	  }
	
	  // Aliases:
	  p.on = p.addEventListener;
	  p.off = p.removeEventListener;
	
	  // For Android (WebView-based) pkjs, print stacktrace for uncaught errors:
	  if (typeof window !== 'undefined' && window.addEventListener) {
	    window.addEventListener('error', function(event) {
	      if (event.error && event.error.stack) {
	        console.error('' + event.error + '\n' + event.error.stack);
	      }
	    });
	  }
	
	})(Pebble);


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(3);
	var globals = __webpack_require__(4);
	var Wod = __webpack_require__(5);
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


/***/ }),
/* 3 */
/***/ (function(module, exports) {

	if (!String.prototype.repeat) {
	  String.prototype.repeat = function(count) {
	    'use strict';
	    if (this == null)
	      throw new TypeError('can\'t convert ' + this + ' to object');
	
	    var str = '' + this;
	    // To convert string to integer.
	    count = +count;
	    // Check NaN
	    if (count != count)
	      count = 0;
	
	    if (count < 0)
	      throw new RangeError('repeat count must be non-negative');
	
	    if (count == Infinity)
	      throw new RangeError('repeat count must be less than infinity');
	
	    count = Math.floor(count);
	    if (str.length == 0 || count == 0)
	      return '';
	
	    // Ensuring count is a 31-bit integer allows us to heavily optimize the
	    // main part. But anyway, most current (August 2014) browsers can't handle
	    // strings 1 << 28 chars or longer, so:
	    if (str.length * count >= 1 << 28)
	      throw new RangeError('repeat count must not overflow maximum string size');
	
	    var maxCount = str.length * count;
	    count = Math.floor(Math.log(count) / Math.log(2));
	    while (count) {
	       str += str;
	       count--;
	    }
	    str += str.substring(0, maxCount - str.length);
	    return str;
	  };
	}
	
	
	if (!String.prototype.padStart) {
		String.prototype.padStart = function padStart(targetLength,padString) {
			targetLength = targetLength>>0; //truncate if number or convert non-number to 0;
			padString = String((typeof padString !== 'undefined' ? padString : ' '));
			if (this.length > targetLength) {
				return String(this);
			}
			else {
				targetLength = targetLength-this.length;
				if (targetLength > padString.length) {
					padString += padString.repeat(targetLength/padString.length); //append to original to ensure we are longer than needed
				}
				return padString.slice(0,targetLength) + String(this);
			}
		};
	}
	
	if (!String.prototype.endsWith) {
	  String.prototype.endsWith = function(search, this_len) {
	    if (this_len === undefined || this_len > this.length) {
	      this_len = this.length;
	    }
	    return this.substring(this_len - search.length, this_len) === search;
	  };
	}
	
	if (!String.prototype.startsWith) {
	    Object.defineProperty(String.prototype, 'startsWith', {
	        value: function(search, rawPos) {
	            var pos = rawPos > 0 ? rawPos|0 : 0;
	            return this.substring(pos, pos + search.length) === search;
	        }
	    });
	}


/***/ }),
/* 4 */
/***/ (function(module, exports) {

	var self = module.exports = {
	  DEBUG: 3,
	  XHR_MAXRETRY: 3,
	  debug: function(level, msg) {
	    if (level <= self.DEBUG) {
	      console.log(msg);
	    }
	  },
	  messageSuccess: function() {
	    self.debug(3, "Message send succeeded.");  
	  },
	  messageFailure: function() {
	    self.debug(3,"Message send failed.");
	  },
	  appMessage: function(payload) {
	    Pebble.sendAppMessage(payload, messageSuccess, messageFailure);
	  },
	  TransferType: {
	    "GENERATE_PINS": 0,
	    "ERROR": 1,
	    "ACK": 2,
	    "READY": 3,
	    "NO_CLAY": 4,
	    "CLAY": 5,
	    "REFRESH": 6
	  }
	};

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

	// wod.js
	//
	// Minimal Word of the Day scraper.
	// - Uses your existing xhrRequestText (promises, no async/await)
	// - Uses native DOMParser (no cheerio needed)
	
	var globals = __webpack_require__(4);
	var XHR = __webpack_require__(6);
	for (var key in globals) {
	  window[key] = globals[key];
	}
	
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


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

	var globals = __webpack_require__(4);
	for (var key in globals) {
	  window[key] = globals[key];
	}
	
	var self = module.exports = {
	  xhrRequest: function(method, url, headers, data, maxRetries) {
	    return new Promise(function(resolve, reject) {
	
	      var xhrRetry = function(method, url, headers, data, maxRetries) {
	        if (typeof(maxRetries) == 'number'){
	          maxRetries = [maxRetries, maxRetries];
	        }
	
	        var request = new XMLHttpRequest();
	        request.onload = function() {
	          if(this.status < 400) {
	            debug(1, "---- Status: " + this.status);
	            var returnData = {};
	            try {
	              returnData = JSON.parse(this.responseText);
	              debug(3, "Response data: " + JSON.stringify(returnData));
	            } catch(e) {
	              debug(1, "---- Status: JSON parse failure");
	              return reject();
	            }
	
	            return resolve(returnData);
	
	          } else {
	            if (maxRetries[1] > 0) {
	              debug(1, "---- Status: " + this.status);
	              setTimeout(function() { 
	                debug(2, "Retrying XHR request, " + maxRetries[1] + " attempts remaining");
	                xhrRetry(method, url, headers, data, [maxRetries[0], maxRetries[1] - 1]); 
	              }, 307 * (maxRetries[0] - maxRetries[1]));
	            } else {
	              debug(1, "---- Status: Max retries reached");
	              return reject();
	            }
	          }
	        };
	
	        debug(1, "XHR Type: Local");
	        debug(1, "-- URL: " + url);
	        debug(1, "-- Method: " + method);
	        debug(1, "-- Data: " + JSON.stringify(data));
	
	        request.onerror = request.ontimeout = function(e) { 
	          debug(1, "---- Status: Error or timeout encountered");
	          return reject();
	        };
	
	        request.open(method, url);
	        request.timeout = 5000;
	        for (var key in headers) {
	          if(headers.hasOwnProperty(key)) {
	          debug(1, "-- Header: " + key + ": " + headers[key]);
	          request.setRequestHeader(key, headers[key]);
	          }
	        }
	        request.send(JSON.stringify(data)); 
	      };
	      xhrRetry(method, url, headers, data, maxRetries);
	    });
	  },
	  xhrRequestText: function(method, url, headers, data, maxRetries) {
	    return new Promise(function(resolve, reject) {
	      var xhrRetry = function(method, url, headers, data, maxRetries) {
	        if (typeof maxRetries === "number") maxRetries = [maxRetries, maxRetries];
	
	        var request = new XMLHttpRequest();
	        request.onload = function() {
	          if (this.status < 400) {
	            debug(1, "---- Status: " + this.status);
	            return resolve(this.responseText);
	          }
	
	          if (maxRetries[1] > 0) {
	            debug(1, "---- Status: " + this.status);
	            setTimeout(function() {
	              debug(2, "Retrying XHR request, " + maxRetries[1] + " attempts remaining");
	              xhrRetry(method, url, headers, data, [maxRetries[0], maxRetries[1] - 1]);
	            }, 307 * (maxRetries[0] - maxRetries[1]));
	          } else {
	            debug(1, "---- Status: Max retries reached");
	            return reject(new Error("Max retries reached"));
	          }
	        };
	
	        request.onerror = request.ontimeout = function() {
	          debug(1, "---- Status: Error or timeout encountered");
	          return reject(new Error("XHR error/timeout"));
	        };
	
	        request.open(method, url);
	        request.timeout = 5000;
	        for (var key in headers) {
	          if (headers.hasOwnProperty(key)) request.setRequestHeader(key, headers[key]);
	        }
	        request.send(JSON.stringify(data));
	      };
	
	      xhrRetry(method, url, headers, data, maxRetries);
	    });
	  }
	};


/***/ })
/******/ ]);
//# sourceMappingURL=pebble-js-app.js.map