/**
 * Jasmine-in-Node testing extension for Bundl
 */

require('require-cache-mock');

var bundlPack = require('bundl-pack');
var Jasmine = require('jasmine');
var nodeAsBrowser = require('node-as-browser');
var path = require('path');
var utils = require('seebigs-utils');

var browserOpn = require('./browser/opn.js');
var terminalReporter = require('./reporters/terminal.js');


function clearRequireCache () {
    for (var x in require.cache) {
        delete require.cache[x];
    }
}

function runSpecsInNode (b, files, options, callback) {

    /* Init Global Env */
    nodeAsBrowser.init(global);

    /* Init Options */
    options.log = b.log;
    options.args = b.args;
    terminalReporter.setReporterOptions(options);

    /* Init Jasmine */
    var jasmine = new Jasmine();

    jasmine.env.clearReporters();
    jasmine.addReporter(terminalReporter);

    files = files || [];

    if (options.mockAjax !== false) {
        files.unshift(__dirname + '/global/ajax.js');
    }

    if (options.mockTimeouts !== false) {
        files.unshift(__dirname + '/global/timeouts.js');
    }

    if (options.haltOnException !== false) {
        files.unshift(__dirname + '/halt.js');
    }

    files.unshift(__dirname + '/global/node.js');

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
        var results = terminalReporter.getResults();

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
    var globalFnName = '__bundl_prepare_tests';
    var concat = globalFnName + '();\n';
    var paths = [__dirname + '/global'].concat(options.paths || []);

    files.forEach(function (file) {
        concat += '\n__bundl_exec_test(function(){\n\n' + utils.readFile(file) + '\n});\n';
        var dir = path.dirname(file);
        if (paths.indexOf(dir) === -1) {
            paths.push(dir);
        }
    });

    concat += '\nfunction ' + globalFnName + ' () {\n';

    var globals = [__dirname + '/global/browser.js'];

    if (options.mockTimeouts !== false) {
        globals.push(__dirname + '/global/timeouts.js');
    }

    if (options.mockAjax !== false) {
        globals.push(__dirname + '/global/ajax.js');
    }

    globals.forEach(function (file) {
        concat += '\n(function(){\n\n' + utils.readFile(file) + '\n})();\n';
        var dir = path.dirname(file);
        if (paths.indexOf(dir) === -1) {
            paths.push(dir);
        }
    });

    concat += '\n}\n';

    function __bundl_exec_test (fn) {
        require.cache.clear();
        fn();
    }

    concat += __bundl_exec_test.toString() + '\n';


    // use bundl-pack for easy requirifying
    var testBundle = bundlPack({ paths: paths }).one(concat, {
        name: 'test.js',
        contents: concat,
        src: files
    }).contents;

    var tmpFolder = '/tmp/bundl_jasmine_node_' + new Date().getTime();

    utils.writeFile(tmpFolder + '/test.html', utils.readFile(__dirname + '/browser/test.html'));
    utils.writeFile(tmpFolder + '/jasmine.css', utils.readFile(__dirname + '/browser/jasmine-2.5.2/jasmine.css'));
    utils.writeFile(tmpFolder + '/jasmine.js', utils.readFile(__dirname + '/browser/jasmine-2.5.2/jasmine.js'));

    if (options.htmlReporter === false) {
        utils.writeFile(tmpFolder + '/jasmine-html.js', utils.readFile(__dirname + '/browser/jasmine-html-stub.js'));
    } else {
        utils.writeFile(tmpFolder + '/jasmine-html.js', utils.readFile(__dirname + '/browser/jasmine-2.5.2/jasmine-html.js'));
    }

    utils.writeFile(tmpFolder + '/console.js', utils.readFile(__dirname + '/browser/jasmine-2.5.2/console.js'));
    utils.writeFile(tmpFolder + '/boot.js', utils.readFile(__dirname + '/browser/jasmine-2.5.2/boot.js'));

    utils.writeFile(tmpFolder + '/test.js', testBundle);
    b.log('Launching ' + tmpFolder + '/test.html');
    browserOpn(tmpFolder + '/test.html', { tmp: tmpFolder });
}


module.exports = function (options) {
    options = options || {};

    function all (files, done) {
        var bundl = this;
        if (bundl.args.browser) {
            debugInBrowser(bundl, files, options, done);
        } else {
            runSpecsInNode(bundl, files, options, done);
        }
    }

    return {
        all: all
    };

};
