var tessel = require('tessel');
var bleadvertise = require('bleadvertise');
var ble_ble113a = require('ble-ble113a');

var tessel_ble_module_ready = false;

var advertise_new_data = function (new_data) {
  if (!tessel_ble_module_ready) {
    console.log('Warning: Ignore advertise_new_data() function call since Tessel BLE module is not ready');
    return false;
  }
  _new_data_ = new Buffer(new_data);
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
  advertise_new_data([0x01, 0x02, 0x03]);
});
