/**
 * Jasmine-in-Node testing extension for Bundl
 */

var Jasmine = require('jasmine');
var jsdom = require("jsdom").jsdom;

var reporter = require('./reporter.js');

function testJasmine (b, files, options, callback) {
    var jasmine = new Jasmine();

    var doc = jsdom('', {});
    window = doc.defaultView;
    document = window.document;

    options.log = b.log;
    reporter.setReporterOptions(options);
    jasmine.addReporter(reporter);

    files = files || [];
    files.forEach(function (file) {
        jasmine.addSpecFile(file);
    });

    jasmine.onComplete(function(passed) {
        if (passed) {
            var results = reporter.getResults();
            if (!results || results.passed === 0) {
                b.log('No tests ran');
            } else {
                b.log.section('All tests have passed');
            }

            if (typeof callback === 'function') {
                callback();
            }

        } else {
            b.log.error('Tests failed');
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
