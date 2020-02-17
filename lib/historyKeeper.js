/* jshint esversion: 6 */

const nThen = require('nthen');
const Crypto = require('crypto');
const WriteQueue = require("./write-queue");
const BatchRead = require("./batch-read");
const RPC = require("./rpc");
const HK = require("./hk-util.js");
const Core = require("./commands/core");

const Store = require("./storage/file");
const BlobStore = require("./storage/blob");

module.exports.create = function (config, cb) {
    const Log = config.log;
    var WARN = function (e, output) {
        if (e && output) {
            Log.warn(e, {
                output: output,
                message: String(e),
                stack: new Error(e).stack,
            });
        }
    };

    Log.silly('HK_LOADING', 'LOADING HISTORY_KEEPER MODULE');

    // TODO populate Env with everything that you use from config
    // so that you can stop passing around your raw config
    // and more easily share state between historyKeeper and rpc
    const Env = {
        Log: Log,
        // tasks
        // store
        id: Crypto.randomBytes(8).toString('hex'),

        metadata_cache: {},
        channel_cache: {},
        queueStorage: WriteQueue(),
        batchIndexReads: BatchRead("HK_GET_INDEX"),

        //historyKeeper: config.historyKeeper,
        intervals: config.intervals || {},
        maxUploadSize: config.maxUploadSize || (20 * 1024 * 1024),
        Sessions: {},
        paths: {},
        //msgStore: config.store,

        pinStore: undefined,
        pinnedPads: {},
        pinsLoaded: false,
        pendingPinInquiries: {},
        pendingUnpins: {},
        pinWorkers: 5,

        limits: {},
        admins: [],
        WARN: WARN,
        flushCache: config.flushCache,
        adminEmail: config.adminEmail,
        allowSubscriptions: config.allowSubscriptions,
        myDomain: config.myDomain,
        mySubdomain: config.mySubdomain,
        customLimits: config.customLimits,
        // FIXME this attribute isn't in the default conf
        // but it is referenced in Quota
        domain: config.domain
    };

    var paths = Env.paths;

    var keyOrDefaultString = function (key, def) {
        return typeof(config[key]) === 'string'? config[key]: def;
    };

    var pinPath = paths.pin = keyOrDefaultString('pinPath', './pins');
    paths.block = keyOrDefaultString('blockPath', './block');
    paths.data = keyOrDefaultString('filePath', './datastore');
    paths.staging = keyOrDefaultString('blobStagingPath', './blobstage');
    paths.blob = keyOrDefaultString('blobPath', './blob');

    Env.defaultStorageLimit = typeof(config.defaultStorageLimit) === 'number' && config.defaultStorageLimit > 0?
        config.defaultStorageLimit:
        Core.DEFAULT_LIMIT;

    try {
        Env.admins = (config.adminKeys || []).map(function (k) {
            k = k.replace(/\/+$/, '');
            var s = k.split('/');
            return s[s.length-1];
        });
    } catch (e) {
        console.error("Can't parse admin keys. Please update or fix your config.js file!");
    }

    config.historyKeeper = Env.historyKeeper = {
        metadata_cache: Env.metadata_cache,
        channel_cache: Env.channel_cache,

        id: Env.id,

        channelMessage: function (Server, channel, msgStruct) {
            // netflux-server emits 'channelMessage' events whenever someone broadcasts to a channel
            // historyKeeper stores these messages if the channel id indicates that they are
            // a channel type with permanent history
            HK.onChannelMessage(Env, Server, channel, msgStruct);
        },
        channelClose: function (channelName) {
            // netflux-server emits 'channelClose' events whenever everyone leaves a channel
            // we drop cached metadata and indexes at the same time
            HK.dropChannel(Env, channelName);
        },
        channelOpen: function (Server, channelName, userId) {
            Env.channel_cache[channelName] = {};
            Server.send(userId, [
                0,
                Env.id,
                'JOIN',
                channelName
            ]);
        },
        directMessage: function (Server, seq, userId, json) {
            // netflux-server allows you to register an id with a handler
            // this handler is invoked every time someone sends a message to that id
            HK.onDirectMessage(Env, Server, seq, userId, json);
        },
    };

    Log.verbose('HK_ID', 'History keeper ID: ' + Env.id);

    nThen(function (w) {
        // create a pin store
        Store.create({
            filePath: pinPath,
        }, w(function (s) {
            Env.pinStore = s;
        }));

        // create a channel store
        Store.create(config, w(function (_store) {
            config.store = _store;
            Env.msgStore = _store; // API used by rpc
            Env.store = _store; // API used by historyKeeper
        }));

        // create a blob store
        BlobStore.create({
            blobPath: config.blobPath,
            blobStagingPath: config.blobStagingPath,
            archivePath: config.archivePath,
            getSession: function (safeKey) {
                return Core.getSession(Env.Sessions, safeKey);
            },
        }, w(function (err, blob) {
            if (err) { throw new Error(err); }
            Env.blobStore = blob;
        }));
    }).nThen(function (w) {
        // create a task store
        require("./storage/tasks").create(config, w(function (e, tasks) {
            if (e) {
                throw e;
            }
            Env.tasks = tasks;
            config.tasks = tasks;
            if (config.disableIntegratedTasks) { return; }

            config.intervals = config.intervals || {};
            config.intervals.taskExpiration = setInterval(function () {
                tasks.runAll(function (err) {
                    if (err) {
                        // either TASK_CONCURRENCY or an error with tasks.list
                        // in either case it is already logged.
                    }
                });
            }, 1000 * 60 * 5); // run every five minutes
        }));
    }).nThen(function () {
        RPC.create(Env, function (err, _rpc) {
            if (err) { throw err; }

            Env.rpc = _rpc;
            cb(void 0, config.historyKeeper);
        });
    });
};