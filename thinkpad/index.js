var SENSOR_TIMEOUT = 3000;

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

process.on('SIGINT', function () {
    this.SIGINT_handled += 1;
    if (this.SIGINT_handled === 1) {
        this.SIGINT_handled = 1;
        console.log('');
        console.log('* SIGINT (CTRL-C) detected, stopping BLE scanning...');
        noble.removeAllListeners();
        noble.stopScanning();
    } else if (this.SIGINT_handled === 2) {
        console.log('');
        console.log('* SIGINT (CTRL-C) 2 times, quitting this process...');
        process.exit(0);
    }
}.bind({SIGINT_handled: 0}));




var sensors = {};
//
// The object `sensors` contains key-value pairs like this one
//
//      'ndsensor-1': {
//          moni: true,
//          stat: 0,
//          time: 1462535873832,
//          gone: false
//      }
//

var view = '[]';

var update_view = function () {
    var all = [];
    var names = Object.keys(sensors).sort();
    for (var name of names) {
        var moni = sensors[name].moni;
        var gone = sensors[name].gone;
        var stat = sensors[name].stat;
        all.push([ name, moni, (gone ? '?' : stat === 0 ? 'O' : 'X') ]);
    }
    view = JSON.stringify(all);
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
    setTimeout(timeout_checker, SENSOR_TIMEOUT, name, time);
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



require('./httpserver.js').run(function (set_port, set_hostname, set_handler) {

    set_port(8000);
    set_hostname('0.0.0.0');

    set_handler('GET /', function (send_response) {
        require('fs').readFile('index.html', function (err, data) {
            if (err) throw err;
            send_response(data, {'Content-Type': 'text/html; charset=utf-8'});
        });
    });

    set_handler('POST /view', function (send_response) {
        send_response(new Buffer(view));
    });

    set_handler('POST /moni', function (send_response, request_body) {
        enable_monitoring(request_body.toString());
        send_response(new Buffer(0));
    });

    set_handler('POST /dismoni', function (send_response, request_body) {
        disable_monitoring(request_body.toString());
        send_response(new Buffer(0));
    });

});
