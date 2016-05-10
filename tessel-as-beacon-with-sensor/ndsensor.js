// Time interval between two operations in milliseconds
var OPERATION_INTERVAL = 200;

// The current status (true: GOOD, false: BAD) which will
// be updated every OPERATION_INTERVAL * 10 milliseconds
var reported_status = false;

// Use GPIO G3 PIN and GPIO G2 PIN to detect whether
// a pair of patches is correctly attached on a skin
(function(){

    var tessel = require('tessel');

    var i_pin = tessel.port['GPIO'].pin['G3'];
    i_pin.rawDirection(0);
    i_pin.pull('pullup');

    var o_pin = tessel.port['GPIO'].pin['G2'];
    o_pin.rawDirection(1);
    o_pin.rawWrite(0);

    var internal_state = false;

    var do_work = function (i) {
        switch (i) {
        case 0:
            internal_state = true;
            i_pin.pull('pulldown');
            break;
        case 1:
            o_pin.rawWrite(1);
            break;
        case 2:
            var read_state = i_pin.rawRead();
            internal_state = internal_state && (read_state === 1);
            console.log('[sensor]', read_state);
            break;
        case 3:
            var read_state = i_pin.rawRead();
            internal_state = internal_state && (read_state === 1);
            console.log('[sensor]', read_state);
            break;
        case 4:
            var read_state = i_pin.rawRead();
            internal_state = internal_state && (read_state === 1);
            console.log('[sensor]', read_state);
            break;
        case 5:
            i_pin.pull('pullup');
            break;
        case 6:
            o_pin.rawWrite(0);
            break;
        case 7:
            var read_state = i_pin.rawRead();
            internal_state = internal_state && (read_state === 0);
            console.log('[sensor]', read_state);
            break;
        case 8:
            var read_state = i_pin.rawRead();
            internal_state = internal_state && (read_state === 0);
            console.log('[sensor]', read_state);
            break;
        case 9:
            var read_state = i_pin.rawRead();
            internal_state = internal_state && (read_state === 0);
            reported_status = internal_state;
            console.log('[sensor]', read_state);
            console.log('[sensor] result:', reported_status ? 'GOOD' : 'BAD');
            console.log('[sensor] ----------------');
            break;
        default:
        }
        setTimeout(do_work, OPERATION_INTERVAL, (i + 1) % 10);
    };

    setTimeout(do_work, OPERATION_INTERVAL, 0);

}());

//
// Digital PINs
//
//      input           pull            LOW
//      output          write           HIGH
//      input           read            (expect HIGH)
//      input           read            (expect HIGH)
//      input           read            (expect HIGH)
//      input           pull            HIGH
//      output          write           LOW
//      input           read            (expect LOW)
//      input           read            (expect LOW)
//      input           read            (expect LOW)
//
// period = 100ms   ->   period == 1000ms
//
