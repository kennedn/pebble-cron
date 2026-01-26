var globals = require('./globals');
for (var key in globals) {
  window[key] = globals[key];
}
var Wod = require('./wod');
var Bin = require('./bin');


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

function capitalizeWords(str) {
  return str.replace(/\b\w/g, char => char.toUpperCase());
}

function insertWodPin() {
  return Wod.getWordOfTheDay()
    .then(word => {
      const time = nextTimeOfDayFromNow(23, 59, 0);

      const pin = buildPin({
        id: `wod-${time.getTime()}`,
        time: time.toISOString(),
        title: "Today's word",
        subtitle: word.title,
        body: word.body
      });

      debug(2, "Inserting pin: " + JSON.stringify(pin));
      return Pebble.insertTimelinePin(pin);
    });
}

function insertBinPins() {
  address = localStorage.getItem("address");
  return Bin.getBinsTomorrow(address)
    .then(bins => {
      debug(2, `Found ${bins.length} bins due for collection tomorrow`);
      return Promise.all(
        bins.map(bin => {
          const time = nextTimeOfDayFromNow(23, 59, 0);

          const pin = buildPin({
            id: `bin-${bin.label.replace(" ", "-")}-${time.getTime()}`,
            time: time.toISOString(),
            title: "Bin Collection Tomorrow",
            subtitle: capitalizeWords(bin.label),
            body: `${capitalizeWords(bin.label)} due to be collected on ${bin.dateStr}`,
            tinyIcon: "system://images/SCHEDULED_EVENT"
          });

          debug(2, "Inserting pin: " + JSON.stringify(pin));
          return Pebble.insertTimelinePin(pin);
        })
      );
    });
}


var self = module.exports = {
  insertPins: function () {
    return Promise.all([
      insertWodPin(),
      insertBinPins()
    ]);
  }
};