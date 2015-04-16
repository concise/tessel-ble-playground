console.log('index.js is running on the Tessel board');

var tessel = require('tessel');
var blelib = require('ble-ble113a');
var peripheral = blelib.use(tessel.port['B']);

peripheral.on('ready', function (err) {
    console.log('BLE peripheral is ready');
    peripheral.startAdvertising();
});

peripheral.on('startAdvertising', function () {
    console.log('BLE peripheral starts advertising itself');
});

peripheral.on('stopAdvertising', function () {
    console.log('BLE peripheral stops advertising itself');
});

peripheral.on('connect', function () {
    console.log('BLE peripheral is connected from a master peer');
    peripheral.stopAdvertising();
});

peripheral.on('disconnect', function () {
    console.log('BLE peripheral is disconnected from a master peer');
    peripheral.startAdvertising();
});

// There are three services on Tessel BLE-113a Board
//
// UUID=180a                             "Device Information" Service
// UUID=08c8c7a06cc511e3981f0800200c9a66 "Tessel Firmware Information" Service
// UUID=d752c5fb13804cd5b0efcac7d72cff20 "Data Transceiving" Service
//
// and there are 12 characteristics (index 0 ~ index 11) on the "Data Transceiving" service...
//
// Let us use the characteristic #0 as RX for receiving data from the peer
//        and the characteristic #1 as TX for sending data to the peer
//
peripheral.on('remoteWrite', function (connectionId, index, buffer) {
    if (index == 0) {
        console.log('%d-byte data read from RX (in hex): %s', buffer.length, buffer.toString('hex'));
        console.log('The same data is echoed back using TX...');
        peripheral.writeLocalValue(1, buffer);
    }
});
