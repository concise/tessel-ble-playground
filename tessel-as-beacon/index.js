console.log('INFO: Now we enter index.js');

//////////////////////////////////////////////////////////////////////////////

var tessel = require('tessel');
var LED_GREEN  = tessel.led[0];
var LED_BLUE   = tessel.led[1];
var LED_RED    = tessel.led[2];
var LED_ORANGE = tessel.led[3];

//////////////////////////////////////////////////////////////////////////////

var bleadvertise = require('bleadvertise');
var ble_ble113a = require('ble-ble113a');

var tessel_ble_module_ready = false;
var tessel_ble_module_ready_pending_task = null;
var default_advertisement_data = [0x01, 0x02, 0x03];

var advertise_new_data = function (new_data) {
  var _new_data_ = new Buffer(new_data);

  if (!tessel_ble_module_ready) {
    console.log('WARNING: Ignore advertise_new_data() function call since Tessel BLE module is not ready');
    tessel_ble_module_ready_pending_task = function () { advertise_new_data(_new_data_); };
    return false;
  }

  var ad_data = bleadvertise.serialize({ flags: [0x04], mfrData: _new_data_ });
  tessel_ble_module.stopAdvertising(function () {
    console.log('Tessel BLE module stops advertising itself');
    tessel_ble_module.setAdvertisingData(ad_data, function () {
      console.log('Tessel BLE module updates its advertisement data', _new_data_);
      tessel_ble_module.startAdvertising(function () {
        console.log('Tessel BLE module starts advertising itself');
      });
    });
  });
  return true;
};

var tessel_ble_module = ble_ble113a.use(tessel.port['A'], function () {
  tessel_ble_module_ready = true;
  console.log('Tessel BLE module is ready');

  if (tessel_ble_module_ready_pending_task === null) {
    advertise_new_data(default_advertisement_data);
  } else {
    tessel_ble_module_ready_pending_task();
  }
});

//////////////////////////////////////////////////////////////////////////////

console.log('INFO: Now we reach the end of index.js');
