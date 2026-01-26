#include "c/modules/comm.h"
#include "c/modules/wakeup.h"
#include "c/pebble-cron.h"
#include "c/user_interface/loading_window.h"
static AppTimer *s_ready_timer, *s_generate_pins_timer;
static bool s_clay_needs_config = false;
static bool s_is_ready = false;
static int s_outbox_attempts = 0;
static void comm_bluetooth_event(bool connected);


//! Asks pebblekit to perform pin generation functions
//! @param data NULL pointer
void comm_generate_pins_request(void *data) {
    DictionaryIterator *dict;
    uint32_t result = app_message_outbox_begin(&dict);
    s_generate_pins_timer = NULL;
    debug(3, "Refresh result: %d", (int)result);
    if (result == APP_MSG_OK) {
      dict_write_uint8(dict, MESSAGE_KEY_TransferType, TRANSFER_TYPE_GENERATE_PINS);
      dict_write_end(dict);
      app_message_outbox_send();
    } else {
      s_generate_pins_timer = app_timer_register(100, comm_generate_pins_request, NULL);
    }
}

//! Handle Javascript inbound communication
//! @param dict A dictionary iterator containing any sent keys from JS side
//! @param context Pointer to any application specific data
static void inbox(DictionaryIterator *dict, void *context) {
    Tuple *type_t = dict_find(dict, MESSAGE_KEY_TransferType);
    switch(type_t->value->int32) {

      case TRANSFER_TYPE_READY:
        debug(2, "Pebblekit environment ready");
        wakeup_init();
        comm_generate_pins_request(NULL);
        s_is_ready = true;
        break;

      case TRANSFER_TYPE_ERROR:
        // If we get a TRANSFER_TYPE_ERROR, show Error
        window_stack_pop_all(true);
        loading_window_push("Error");
        break;

      case TRANSFER_TYPE_ACK:
        // If we get a TRANSFER_TYPE_ACK just exit the app
        window_stack_pop_all(true);
        break;

      default:
        break;
    }
}

void comm_ready_callback(void *data) {
  if (s_clay_needs_config) {
    s_ready_timer = NULL;
    return;
  }

  if (!s_is_ready) {
    if (s_outbox_attempts == 3) {
      window_stack_pop_all(true);
      loading_window_push(NULL);
    }
    DictionaryIterator *dict;
    uint32_t result = app_message_outbox_begin(&dict);
    debug(3, "Ready result: %d", (int)result);
    if (result == APP_MSG_OK) {
      dict_write_uint8(dict, MESSAGE_KEY_TransferType, TRANSFER_TYPE_READY);
      dict_write_end(dict);
      app_message_outbox_send();
    }
    s_outbox_attempts = MIN(30, s_outbox_attempts + 1);
    debug(3, "Not ready, waiting %d ms", RETRY_READY_TIMEOUT * s_outbox_attempts);
    s_ready_timer = app_timer_register(RETRY_READY_TIMEOUT * s_outbox_attempts, comm_ready_callback, NULL);
  } else {
    s_ready_timer = NULL;
  }
}

void comm_callback_start() {
  s_is_ready = false;
  s_clay_needs_config = false;
  s_outbox_attempts = 0;
  if (s_ready_timer) {app_timer_cancel(s_ready_timer);}
  s_ready_timer = NULL;
  app_timer_register(RETRY_READY_TIMEOUT, comm_ready_callback, NULL);
}


//! Callback function for pebble connectivity events
//! @param connected Connection state of pebble
static void comm_bluetooth_event(bool connection_state) {
  debug(2, "Connection state changed to %u", connection_state);
  if (connection_state) {
    window_stack_pop_all(true);
    loading_window_push(NULL);

    // comm_callback_start had the ability to call data_retrieve_persist. Calling this function too early
    // causes undocumented behaviour in the SDK. Using app_timer_register delays enough to work around this. 
    app_timer_register(0, comm_callback_start, NULL);
  } else if(!connection_state) {
    window_stack_pop_all(true);
    loading_window_push("No connection to phone");
  }
}

//! Initialise AppMessage and subscriptions
void comm_init() {
  s_ready_timer = NULL;
  s_generate_pins_timer = NULL;
  app_message_register_inbox_received(inbox);

  app_message_open(INBOX_SIZE, OUTBOX_SIZE);

  connection_service_subscribe((ConnectionHandlers) {
    .pebble_app_connection_handler = comm_bluetooth_event,
    .pebblekit_connection_handler = comm_bluetooth_event
  });
  comm_bluetooth_event(connection_service_peek_pebble_app_connection());
}

//! Deinitialise  AppMesage, timers, arrays and any left over data
void comm_deinit() {
  connection_service_unsubscribe();
  app_message_deregister_callbacks();
  if (s_ready_timer) {app_timer_cancel(s_ready_timer);}
  s_ready_timer = NULL;
  if (s_generate_pins_timer) {app_timer_cancel(s_generate_pins_timer);}
  s_generate_pins_timer = NULL;
}
