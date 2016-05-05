global.noble = require('noble');
global.p = null;
global.s = null;
global.tx = null;
global.rx = null;
global.cb = function(){};

noble.startScanning();

noble.on('scanStart', function () {
    console.log('Scanning is started');
    setTimeout(function () {
        noble.stopScanning();
    }, 3000);
});

noble.on('scanStop', function () {
    console.log('Scanning is stopped');
});

noble.on('discover', function (discovered_peripheral) {
    p = discovered_peripheral;
    console.log('We have discovered one BLE device...');
    noble.stopScanning();
    cb();
});

global.cb = function () {
    p.connect();
    p.on('connect', function () {
        console.log('We have connected to the BLE device');
        p.discoverServices(['d752c5fb13804cd5b0efcac7d72cff20']);
        p.on('servicesDiscover', function () {
            console.log('We have discovered some services');
            s = p.services[0];
            s.discoverCharacteristics();
            s.on('characteristicsDiscover', function () {
                console.log('We have discovered some characteristics');
                rx = s.characteristics[0];
                tx = s.characteristics[1];
                tx.on('read', function (buffer) {
                    console.log('\n%d-byte data read from TX (in hex): %s', buffer.length, buffer.toString('hex'));
                });
                tx.notify(true);
                console.log('Two characteristics for TX and RX is OK now');
            });
        });
    });
};

// rx.write(new Buffer([0x00, 0x01]));
