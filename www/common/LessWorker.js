window = self;
window.document = {
    getElementsByTagName: function(tagName) {
        if (tagName === 'script') {
            return [{dataset: {}}];
        } else if (tagName === 'style') {
            return [];
        } else if (tagName === 'link') {
            return [];
        }
        return [];
    }
};
var Less = importScripts('/common/less.min.js');

var lessEngine = Less;

var fixURL = function (url, parent) {
    // data: blob: etc
    if (/^[a-zA-Z0-9]*:/.test(url)) { return url; }
    var ua = url.split('#');
    var mark = (ua[0].indexOf('?') !== -1) ? '&' : '?';
    ua[0] = ua[0] + mark + key;
    if (ua[0].indexOf(':') === -1 && ua[0].indexOf('/') && parent) {
        ua[0] = parent.replace(/\/[^\/]*$/, '/') + ua[0];
    }
    ua[0] = ua[0].replace(/^\/\.\.\//, '/');
    var out = ua.join('#');
    //console.log(url + "  -->  " + out);
    return out;
};

Less.functions.functionRegistry.add('LessLoader_currentFile', function () {
    return new Less.tree.UnicodeDescriptor('"' +
        fixURL(this.currentFileInfo.filename) + '"');
});

var tempCache = { key: Math.random() };
var doXHR = lessEngine.FileManager.prototype.doXHR;
lessEngine.FileManager.prototype.doXHR = function (url, type, callback, errback) {
    url = fixURL(url);
    var cached = tempCache[url];
    if (cached && cached.res) {
        var res = cached.res;
        return void setTimeout(function () { callback(res[0], res[1]); });
    }
    if (cached) { return void cached.queue.push(callback); }
    cached = tempCache[url] = { queue: [ callback ], res: undefined };
    return doXHR(url, type, function (text, lastModified) {
        cached.res = [ text, lastModified ];
        var queue = cached.queue;
        cached.queue = [];
        queue.forEach(function (f) {
            setTimeout(function () { f(text, lastModified); });
        });
    }, errback);
};

self.onmessage = function (evt) {
    try {
        var data = JSON.parse(evt.data);
        Less.render(data.less, {}, function (err, css) {
            self.postMessage(JSON.stringify({
                txid: data.txid,
                error: err,
                css: css
            }));
        });
    } catch (e) {
        self.postMessage({
            error: 'PARSE_ERROR'
        });
    }
};
