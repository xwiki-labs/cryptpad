// override some modules that cryptget will need to load
_ = global;
_.COMMON_REALTIME = {};
_.NETWORK_CONFIG = {
    getWebsocketURL: function () {
        return 'ws://localhost:3000/cryptpad_websocket';
    },
};
_.CACHE_STORE = {};

var Crypt = require("../www/common/cryptget");
//var Hash = require("../www/common/common-hash");

//Crypt.get(URL, console.log );

