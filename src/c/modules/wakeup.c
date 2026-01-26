#include <pebble.h>

#include "c/pebble-cron.h"
#include "c/user_interface/loading_window.h"

// Returns the next occurrence of (hour:min:sec) in local time from *now*.
// If the time has already passed today (or is exactly now), returns tomorrow.
static time_t wakeup_next_time_of_day_from_now(int hour, int min, int sec) {
    time_t now = time(NULL);

    struct tm* t = localtime(&now);

    t->tm_hour = hour;
    t->tm_min = min;
    t->tm_sec = sec;

    time_t candidate = mktime(t);
    // Ensure strictly in the future
    if (candidate <= now) {
        t->tm_mday += 1;
        candidate = mktime(t);
    }

    return candidate;
}

void wakeup_init() {
    // Clear any existing wakeup events
    wakeup_cancel_all();

    time_t ts = wakeup_next_time_of_day_from_now(1, 0, 0);  // 1:00:00 AM
    WakeupId id = wakeup_schedule(ts, 0, true);
    if (id < 0) {
        window_stack_pop_all(true);
        loading_window_push("Failed to schedule wakeup");
        debug(1, "Failed to schedule wakeup with reason: %d", (int)id);
        return;
    }
    // Format local time using strftime
    char time_string[32];
    struct tm* t = localtime(&ts);
    strftime(time_string, sizeof(time_string), "%Y-%m-%d %H:%M:%S", t);
    debug(1, "Scheduled wakeup event with id %d for %s", (int)id, time_string);
}