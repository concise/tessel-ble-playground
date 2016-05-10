// The name to be advertised
var DEVICE_NAME = (process.argv.length === 3) ? process.argv[2] : 'ndsensor-3';

// Time interval between two operations in milliseconds
var OPERATION_INTERVAL = 100;

var tessel = require('tessel');

(function(){

    // Use GPIO G3 PIN and GPIO G2 PIN to detect whether
    // a pair of patches is correctly attached on a skin

    var tessel = require('tessel');
    var output_pin = tessel.port['GPIO'].pin['G2'];
    var input_pin = tessel.port['GPIO'].pin['G3'];
    var internal_state_phase_1 = 0;
    var internal_state_phase_2 = 0;

    var do_work = function (i) {
        var tmp;
        switch (i) {
        case 0:
            output_pin.write(1);
            input_pin.pull('pulldown');
            internal_state_phase_1 = 0;
            break;
        case 1:
        case 2:
        case 3:
        case 4:
            tmp = input_pin.read();
            input_pin.pull('pulldown');
            internal_state_phase_1 += (tmp === 1) ? 1 : 0;
            if (i === 4) {
                var is_good = (internal_state_phase_1 >= 3) && (internal_state_phase_2 >= 3);
                console.log('[sensor] %d %d => result: %s', internal_state_phase_1, internal_state_phase_2, (is_good ? 'GOOD' : 'BAD'));
                if (is_good) {
                    sensor_error_code_set_to_good();
                } else {
                    sensor_error_code_set_to_bad();
                }
            }
            break;
        case 5:
            output_pin.write(0);
            input_pin.pull('pullup');
            internal_state_phase_2 = 0;
            break;
        case 6:
        case 7:
        case 8:
        case 9:
            tmp = input_pin.read();
            input_pin.pull('pullup');
            internal_state_phase_2 += (tmp === 0) ? 1 : 0;
            if (i === 9) {
                var is_good = (internal_state_phase_1 >= 3) && (internal_state_phase_2 >= 3);
                console.log('[sensor] %d %d => result: %s', internal_state_phase_1, internal_state_phase_2, (is_good ? 'GOOD' : 'BAD'));
                if (is_good) {
                    sensor_error_code_set_to_good();
                } else {
                    sensor_error_code_set_to_bad();
                }
            }
            break;
        default:
        }
        setTimeout(do_work, OPERATION_INTERVAL, (i + 1) % 10);
    };

    setTimeout(do_work, OPERATION_INTERVAL, 0);

}());

//////////////////////////////////////////////////////////////////////////////

var bleadvertise = require('bleadvertise');
var ble_ble113a = require('ble-ble113a');

var tessel_ble_module_ready_pending_task = null;
var tessel_ble_module_ready = false;
var tessel_ble_module = ble_ble113a.use(tessel.port['A'], function () {
    tessel_ble_module_ready = true;
    if (tessel_ble_module_ready_pending_task !== null) {
        tessel_ble_module_ready_pending_task();
    }
});

var advertise_new_mfr_data = function (new_mfr_data) {
    new_mfr_data = new Buffer(new_mfr_data);
    if (!tessel_ble_module_ready) {
        tessel_ble_module_ready_pending_task = function () { advertise_new_mfr_data(new_mfr_data); };
        return false;
    }
    LED_BLUE.write(1);
    var ad_data = bleadvertise.serialize({
        flags: [0x04],
        mfrData: new_mfr_data,
        completeName: DEVICE_NAME
    });
    tessel_ble_module.stopAdvertising(function () {
        tessel_ble_module.setAdvertisingData(ad_data, function () {
            tessel_ble_module.startAdvertising(function () {
                LED_BLUE.write(0);
            });
        });
    });
    return true;
};

//////////////////////////////////////////////////////////////////////////////

var LED_GREEN  = tessel.led[0];
var LED_BLUE   = tessel.led[1];
var LED_RED    = tessel.led[2];
var LED_ORANGE = tessel.led[3];

var sensor_error_code = null;

var sensor_error_code_set_to_good = function () {
    if (sensor_error_code !== 0) {
        sensor_error_code = 0;
        LED_GREEN.write(1);
        LED_RED.write(0);
        advertise_new_mfr_data([0]);
    }
};

var sensor_error_code_set_to_bad = function () {
    if (sensor_error_code !== 1) {
        sensor_error_code = 1;
        LED_GREEN.write(0);
        LED_RED.write(1);
        advertise_new_mfr_data([1]);
    }
};
