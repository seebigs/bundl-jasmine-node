/**
 * Jasmine-in-Node testing extension for Bundl
 */

var Jasmine = require('jasmine');
var jsdom = require("jsdom").jsdom;

var reporter = require('./reporter.js');


function enhanceToString () {
    "use strict"; // causes fn.call(null) to return [object Null] instead of [object global]

    var oldToString = Object.prototype.toString;
    Object.prototype.toString = function () {
        var ts = oldToString.call(this);
        if (ts === '[object Object]') {
            if (this.nodeType) {
                return this.toString();
            }
            return ts;
        }
        return ts;
    };
}

function testJasmine (b, files, options, callback) {

    /* Init Global Env */

    var win = jsdom('<!DOCTYPE html>', {}).defaultView;
    win.document.hasFocus = function () { return true; };

    // Adds LocalStorage
    // This should only be needed until jsdom adds this feature
    // https://github.com/tmpvar/jsdom/issues/1137
    win.localStorage = win.sessionStorage = (function () {
        return {
            getItem: function (key) {
                return this[key] || null;
            },
            setItem: function (key, value) {
                this[key] = value;
            },
            removeItem: function (key) {
                this[key] = null;
            },
        };
    })();

    global.window = win;

    var preserve = [
        'clearInterval',
        'clearTimeout',
        'setInterval',
        'setTimeout',
    ];

    for (var x in win) {
        if (preserve.indexOf(x) === -1) {
            global[x] = win[x];
        }
    }

    // Enhance toString output for DOM nodes
    enhanceToString();


    /* Init Jasmine */

    var jasmine = new Jasmine();

    options.log = b.log;
    reporter.setReporterOptions(options);
    jasmine.addReporter(reporter);

    files = files || [];
    files.forEach(function (file) {
        jasmine.addSpecFile(file);
    });

    jasmine.onComplete(function() {
        var results = reporter.getResults();

        if (!results || results.executed === 0) {
            b.log('No tests ran');

        } else if (results.failed > 0) {
            b.log.error('Tests failed');

        } else {
            b.log.section('All tests have passed');
        }

        if (typeof callback === 'function') {
            callback();
        }
    });

    jasmine.execute();
}


module.exports = function (options) {
    options = options || {};

    function jasmineAll (files, done) {
        var bundl = this;
        testJasmine(bundl, files, options, done);
    }

    return {
        all: jasmineAll
    };

};
