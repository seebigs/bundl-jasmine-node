/**
 * Jasmine-in-Node testing extension for Bundl
 */

var bundlPack = require('bundl-pack');
var Jasmine = require('jasmine');
var nodeAsBrowser = require('node-as-browser');
var utils = require('seebigs-utils');

var browserOpn = require('./browser/opn.js');
var reporter = require('./reporter.js');


function clearRequireCache () {
    for (var x in require.cache) {
        delete require.cache[x];
    }
}

function testJasmine (b, files, options, callback) {

    /* Init Global Env */
    nodeAsBrowser.init(global);

    /* Init Options */
    options.log = b.log;
    reporter.setReporterOptions(options);

    /* Init Jasmine */
    var jasmine = new Jasmine();

    jasmine.env.clearReporters();
    jasmine.addReporter(reporter);

    files = files || [];
    files.forEach(function (file) {
        jasmine.addSpecFile(file);
    });

    // Override Jasmine.prototype.loadSpecs to bust require.cache
    jasmine.loadSpecs = function () {
        this.specFiles.forEach(function(file) {
            clearRequireCache();
            require(file);
        });
    };

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

function debugInBrowser (b, files, options, callback) {
    var concat = '';

    files.forEach(function (file) {
        concat += '\n\n' + utils.readFile(file);
    });

    // use bundl-pack for easy requirifying
    var testBundle = bundlPack({
        paths: [
            './test/files'
        ]
    }).one(concat, {
        name: 'test.js',
        contents: concat,
        src: files
    }).contents;

    var tmpFolder = '/tmp/bundl_jasmine_node_' + new Date().getTime();

    utils.writeFile(tmpFolder + '/test.html', utils.readFile(__dirname + '/browser/test.html'));
    utils.writeFile(tmpFolder + '/jasmine.css', utils.readFile(__dirname + '/browser/jasmine-2.5.2/jasmine.css'));
    utils.writeFile(tmpFolder + '/jasmine.js', utils.readFile(__dirname + '/browser/jasmine-2.5.2/jasmine.js'));
    utils.writeFile(tmpFolder + '/jasmine-html.js', utils.readFile(__dirname + '/browser/jasmine-2.5.2/jasmine-html.js'));
    utils.writeFile(tmpFolder + '/boot.js', utils.readFile(__dirname + '/browser/jasmine-2.5.2/boot.js'));

    utils.writeFile(tmpFolder + '/test.js', testBundle);
    browserOpn(tmpFolder + '/test.html', { tmp: tmpFolder });
}


module.exports = function (options) {
    options = options || {};

    function all (files, done) {
        var bundl = this;
        if (bundl.args.env === 'browser') {
            debugInBrowser(bundl, files, options, done);
        } else {
            testJasmine(bundl, files, options, done);
        }
    }

    return {
        all: all
    };

};
