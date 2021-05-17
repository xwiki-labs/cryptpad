// override some modules that cryptget will need to load
const ws = require('ws');
require('tweetnacl');

_ = global;
_.NETWORK_CONFIG = {
    getWebsocketURL: function () {
        return 'ws://localhost:3000/cryptpad_websocket';
    },
};
_.CACHE_STORE = undefined;

global.window = global;
global.addEventListener = function () {};
global.WebSocket = ws;
var Crypt = require("../www/common/cryptget");
var Hash = require("../www/common/common-hash");

var iUrl = process.argv.indexOf('--url');
var url = iUrl >= 0 ? process.argv[iUrl + 1] : undefined;

if (!url) {
    console.log("ERROR: No URL (use --url)");
    process.exit();
}

var iPw = process.argv.indexOf('--password');
var pw = iPw >= 0 ? process.argv[iPw + 1] : undefined;

var iPut = process.argv.indexOf('--put');
var put = iPut >= 0 ? process.argv[iPut + 1] : undefined;

var parsed = Hash.parsePadUrl(url);

if (!parsed || !parsed.hash) {
    console.log("ERROR: Invalid URL");
    process.exit();
}

if (put) {
    Crypt.put(parsed.hash, put, function (err, val) {
        if (err) { return console.log('ERROR:' + err); }
        if (!val) { return void console.log('ERROR: Empty'); }
        console.log(val);
    }, {
        password: pw
    });
} else {
    Crypt.get(parsed.hash, function (err, val) {
        if (err) { return console.log('ERROR:' + err); }
        if (!val) { return void console.log('ERROR: Empty'); }
        console.log(val);
    }, {
        password: pw
    });
}

//Crypt.get(URL, console.log );

