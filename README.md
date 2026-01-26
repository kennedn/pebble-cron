# Pebble Cron

The new Pebble mobile app no longer supports the remote timeline web API, eliminating the ability to push pins to user timelines programmatically.

This repository uses the new `insertTimelinePin`  API (recently [added to the Pebble mobile app](https://ndocs.repebble.com/changelog) to directly create pins without relying on the timeline web API.

## Current Implementation

**Word of the Day**: The app fetches Merriam-Webster's Word of the Day using DOMParser to scrape the contents of the web page and creates a daily timeline pin with the word and definition.

**Scheduling**: The Pebble wakeup API provides cron-like behaviour by scheduling the app to wake at specific times (currently 23:59 daily) to trigger pin generation without requiring the app to stay active.

## How It Works

1. Watchapp wakes up at the scheduled time via wakeup API
2. Sends message to PebbleKit JS requesting pin generation
3. Pins are generated in PebbleKit JS and inserted to the timeline
4. Watchapp exits

## Extending

This is currently a proof of concept conceivably but any pins could be generated this way so long as the logic required to make them can be performed in PebbleKit JS

## Building

### Prerequisites

- [Pebble SDK](https://developer.repebble.com/sdk/)

### Steps

```bash
pebble build
pebble install --phone <your-phone-ip>
```