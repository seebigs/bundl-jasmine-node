/**
 * Jasmine-in-Node testing extension for Bundl
 */

var Jasmine = require('jasmine');
var nodeAsBrowser = require('node-as-browser');

var reporter = require('./reporter.js');


function testJasmine (b, files, options, callback) {

    /* Init Global Env */

    nodeAsBrowser.init(global);

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
