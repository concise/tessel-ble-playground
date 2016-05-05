global.noble = require('noble');

global.devices = [];

noble.on('discover', function (d) {
  devices.push(d);
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

devices.map(d => d.address);
devices.map(d => d.addressType);
devices.map(d => d.advertisement.localName);
devices.map(d => d.advertisement.manufacturerData);
devices.map(d => d.rssi);

devices.map(d => d.connectable);
devices = []; noble.startScanning();

// TODO 用標籤給每一張 BLE module 做記號，標記 6-byte address
//      或者要在 advertise 時就用不同的名字
