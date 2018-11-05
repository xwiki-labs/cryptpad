define([], function () {
    var Flat = {};

    var slice = function (coll) {
        return Array.prototype.slice.call(coll);
    };

    var getAttrs = function (el) {
        var i = 0;
        var l = el.attributes.length;
        var attr;
        var data = {};
        for (;i < l;i++) {
            attr = el.attributes[i];
            if (attr.name === 'data-flatdom-id') { continue; }
            if (attr.name && attr.value) { data[attr.name] = attr.value; }
        }
        return data;
    };

    Flat.fromDOM = function (dom, predicate, filter) {
        var data = {
            map: {},
        };

        var uid = function () {
            var uid;
            while (typeof (data.map[(uid = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER))]) !== "undefined") {}
            return uid;
        };

        var process = function (el) {
            var id;
            if (!el.tagName && el.nodeType === Node.TEXT_NODE) {
                return el.textContent;
                /*id = el._flatdomId;
                if (!id) {
                    id = uid();
                    el._flatdomId = id;
                }
                data.map[id] = el.textContent;
                return id;*/
            }
            if (!el || !el.attributes) { return; }
            if (predicate) {
                if (!predicate(el)) { return; } // shortcircuit
            }

            id = Number(el.getAttribute('data-flatdom-id'));
            if (!id || data.map[id]) {
                id = uid();
                el.setAttribute('data-flatdom-id', id);
            }
            var temp = [
                el.tagName,
                getAttrs(el),
                slice(el.childNodes).map(function (e) {
                    return process(e);
                }).filter(Boolean)
            ];

            data.map[id] = filter? filter(temp): temp;

            return id;
        };

        data.root = process(dom);
        return data;
    };

    Flat.toDOM = function (data) {
        var visited = {};
        var process = function (key) {
            if (!key) { return; } // ignore falsey keys
            if (visited[key]) {
                // TODO handle this more gracefully.
                return;
                //throw new Error('duplicate id or loop detected');
            }
            visited[key] = true; // mark paths as visited.

            var hj = data.map[key];
            /*
            if (typeof(hj) === 'string') {
                var textNode = document.createTextNode(hj);
                textNode._flatdomId = key;
                return textNode;
            }*/
            if (typeof(hj) === 'undefined') { return; }
            if (!Array.isArray(hj)) { console.error(hj); throw new Error('expected array'); }

            var e = document.createElement(hj[0]);
            e.setAttribute('data-flatdom-id', key);
            for (var x in hj[1]) { e.setAttribute(x, hj[1][x]); }
            var child;
            for (var i = 0; i < hj[2].length; i++) {
                if (typeof (hj[2][i]) === "string") {
                    e.appendChild(document.createTextNode(hj[2][i]));
                    continue;
                }
                child = process(hj[2][i]);
                if (child) {
                    e.appendChild(child);
                }
            }
            return e;
        };

        return process(data.root);
    };

    return Flat;
});
