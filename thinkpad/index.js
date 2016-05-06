var noble = require('noble');

noble.on('stateChange', function (state) {
    if (state === 'poweredOn') {
        noble.startScanning([], true);
    }
});

noble.on('discover', function (device) {
    if (device && device.advertisement) {
        var name = device.advertisement.localName || '';
        var data = device.advertisement.manufacturerData;
        var stat = (data && data.length === 1) ? data[0] : 255;
        if (name.startsWith('ndsensor-')) {
            sensor_discovery_handler(name, stat);
        }
    }
});

var TIMEOUT = 5000;
var sensors = {};
//
//  'ndsensor-1': {
//      moni: true,
//      stat: 0,
//      time: 1462535873832,
//      gone: false
//  }
//

var update_view = function () {
    console.log('View:');
    for (var name in sensors) {
        var moni = sensors[name].moni;
        var stat = sensors[name].stat;
        var time = sensors[name].time;
        var gone = sensors[name].gone;
        console.log('  %s moni=%s stat=%d time=%d gone=%s', name, moni, stat, time, gone);
    }
};

var sensor_discovery_handler = function (name, stat) {
    var time = Date.now();
    if (sensors[name]) {
        sensors[name].stat = stat;
        sensors[name].time = time;
        sensors[name].gone = false;
    } else {
        sensors[name] = {};
        sensors[name].moni = false;
        sensors[name].stat = stat;
        sensors[name].time = time;
        sensors[name].gone = false;
    }
    setTimeout(timeout_checker, TIMEOUT, name, time);
    update_view();
};

var timeout_checker = function (name, time) {
    if (sensors[name] && sensors[name].time === time) {
        if (sensors[name].moni) {
            sensors[name].gone = true;
        } else {
            delete sensors[name];
        }
        update_view();
    }
};

var enable_monitoring = function (name) {
    if (sensors[name]) {
        sensors[name].moni = true;
    }
    update_view();
};

var disable_monitoring = function (name) {
    if (sensors[name]) {
        sensors[name].moni = false;
    }
    update_view();
};
