/**
 * Jasmine-in-Node testing extension for Bundl
 */

var Jasmine = require('jasmine');
var jsdom = require("jsdom").jsdom;

var reporter = require('./reporter.js');

function testJasmine (b, files, options, callback) {
    "use strict"; // causes fn.call(null) to return [object Null] instead of [object global]

    var jasmine = new Jasmine();

    var doc = jsdom('<!DOCTYPE html>', {});
    global.window = doc.defaultView;
    global.document = window.document;

    global.navigator = window.navigator;

    // Enhance toString output for DOM nodes
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
