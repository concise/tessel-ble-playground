global.noble = require('noble');

noble.on('scanStart', function () {
    console.log('Scanning operation is started');
});

noble.on('discover', function (d) {
    var rssi = d.rssi;
    var name = d.advertisement.localName;
    var data = d.advertisement.manufacturerData;
    if (!name || !name.startsWith('ndsensor-')) {
        return;
    }
    console.log('%d %s %sdbm %s',
            Date.now(),
            name,
            rssi,
            to_status(data)
            );
});

var to_status = function (data) {
    return (Buffer.isBuffer(data) && data.length === 1 && data[0] === 0)
            ? 'O'
            : 'X';
};

noble.on('stateChange', function (state) {
    if (state === 'poweredOn') {
        noble.startScanning([], true);
    }
});

//setTimeout(function () {
//  noble.stopScanning();
//}, 3000);
//
//noble.on('scanStop', function () {
//  console.log('Scanning operation is stopped');
//});
