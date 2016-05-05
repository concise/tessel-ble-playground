global.noble = require('noble');

global.peripherals = [];

noble.on('discover', function (p) {
    peripherals.push(p);
    console.log('Discover one peripheral');
});

noble.on('scanStop', function () {
    console.log('Scanning operation is stopped');
});

noble.on('scanStart', function () {
    console.log('Scanning operation is started');
    setTimeout(function () {
        noble.stopScanning();
    }, 3000);
    console.log('Scanning operation will be stopped in 3 seconds');
});

noble.startScanning();




return;

peripherals.map(p => p.advertisement.localName);
peripherals.map(p => p.advertisement.manufacturerData);
peripherals = []; noble.startScanning();
