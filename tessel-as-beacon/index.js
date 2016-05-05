console.log('INFO: Now we enter index.js');

//////////////////////////////////////////////////////////////////////////////

var tessel = require('tessel');
var LED_GREEN  = tessel.led[0];
var LED_BLUE   = tessel.led[1];
var LED_RED    = tessel.led[2];
var LED_ORANGE = tessel.led[3];

var sensor_error_code = 0;

var sensor_error_code_set_to_good = function () {
  sensor_error_code = 0;
  LED_GREEN.write(1);
  LED_RED.write(0);
  advertise_new_mfr_data([sensor_error_code]);
};

var sensor_error_code_set_to_bad = function () {
  sensor_error_code = 1;
  LED_GREEN.write(0);
  LED_RED.write(1);
  advertise_new_mfr_data([sensor_error_code]);
};

var sensor_error_code_toggle_good_or_bad = function () {
  if (sensor_error_code === 0) {
    sensor_error_code_set_to_bad();
  } else {
    sensor_error_code_set_to_good();
  }
};

tessel.button.on('press', function () {
  console.log('Tessel main board config button is pressed');
  sensor_error_code_toggle_good_or_bad();
});

//////////////////////////////////////////////////////////////////////////////

var bleadvertise = require('bleadvertise');
var ble_ble113a = require('ble-ble113a');

var tessel_ble_module_ready = false;
var tessel_ble_module_ready_pending_task = null;

var advertise_new_mfr_data = function (new_mfr_data) {
  new_mfr_data = new Buffer(new_mfr_data);

  if (!tessel_ble_module_ready) {
    console.log('WARNING: Pending opertaion since Tessel BLE module is not ready');
    tessel_ble_module_ready_pending_task = function () { advertise_new_mfr_data(new_mfr_data); };
    return false;
  }

  LED_BLUE.write(1);
  var ad_data = bleadvertise.serialize({
    flags: [0x04],
    mfrData: new_mfr_data,
    completeName: 'ndsensor'
  });
  tessel_ble_module.stopAdvertising(function () {
    console.log('Tessel BLE module stops advertising itself');
    tessel_ble_module.setAdvertisingData(ad_data, function () {
      console.log('Tessel BLE module updates its advertisement data', new_mfr_data);
      tessel_ble_module.startAdvertising(function () {
        console.log('Tessel BLE module starts advertising itself');
        LED_BLUE.write(0);
      });
    });
  });
  return true;
};

var tessel_ble_module = ble_ble113a.use(tessel.port['A'], function () {
  tessel_ble_module_ready = true;
  console.log('Tessel BLE module is ready');

  if (tessel_ble_module_ready_pending_task === null) {
    sensor_error_code_set_to_good();
  } else {
    tessel_ble_module_ready_pending_task();
  }
});

//////////////////////////////////////////////////////////////////////////////

console.log('INFO: Now we reach the end of index.js');
