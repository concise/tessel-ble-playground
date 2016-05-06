var noble = require('noble');

noble.on('stateChange', function (state) {
    if (state === 'poweredOn') {
        noble.startScanning([], true);
    }
});

noble.on('discover', function (device) {
    var time = Date.now();
    var rssi = device.rssi;
    var name = device.advertisement.localName || '';
    var data = device.advertisement.manufacturerData;
    var stat = (data.length === 1 && data[0] === 0) ? 0 : 1;
    if (name.startsWith('ndsensor-')) {
        console.log('%s %d %ddbm %d',
            name, stat, rssi, time
        );
    }
});
