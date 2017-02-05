/**
 * Jasmine-in-Node testing extension for Bundl
 */

var bundlPack = require('bundl-pack');
var Jasmine = require('jasmine');
var nodeAsBrowser = require('node-as-browser');
var path = require('path');
var utils = require('seebigs-utils');

var browserOpn = require('./browser/opn.js');
var terminalReporter = require('./reporters/terminal.js');


function createSpecBundle (b, files, options, callback) {
    var paths = [__dirname + '/global'].concat(options.paths || []);
    var packOptions = options.pack || {};
    var concat = '// global helpers\n';

    var globals = [__dirname + '/global/window.js'];

    if (b.args.browser) {
        globals.push(__dirname + '/global/browser.js');
    }

    if (options.mockTimeouts !== false) {
        globals.push(__dirname + '/global/timeouts.js');
    }

    if (options.mockAjax !== false) {
        globals.push(__dirname + '/global/ajax.js');
    }

    globals.forEach(function (file) {
        concat += 'require("' + file + '");\n';
        var dir = path.dirname(file);
        if (paths.indexOf(dir) === -1) {
            paths.push(dir);
        }
    });

    concat += '\n// spec files\n';

    utils.each(files, function (file) {
        concat += 'require.cache.clear();\nrequire("' + file + '");\n';
        var dir = path.dirname(file);
        if (paths.indexOf(dir) === -1) {
            paths.push(dir);
        }
    });

    // use bundl-pack for easy requirifying
    packOptions.paths = packOptions.paths || paths;
    var testBundle = bundlPack(packOptions).one(concat, {
        name: 'test.js',
        contents: concat,
        src: files
    }).contents;

    var tmpTestDir = __dirname + '/browser';
    if (b.args.browser) {
        tmpTestDir = options.tmpDir + '/test_' + new Date().getTime();
        utils.writeFile(tmpTestDir + '/test.js', testBundle, function (written) {
            runSpecsInBrowser(b, tmpTestDir, options, callback);
        });
    } else {
        utils.writeFile(tmpTestDir + '/test.js', testBundle, function (written) {
            runSpecsInNode(b, written.path, options, callback);
        });
    }
}

function runSpecsInNode (b, tempBundle, options, callback) {

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

    /* Load Files */

    if (options.haltOnException !== false) {
        require(__dirname + '/global/halt.js');
    }

    require(tempBundle);

    jasmine.execute();
}

function runSpecsInBrowser (b, tmpTestDir, options, callback) {

    function writeForBrowser (path) {
        utils.writeFile(tmpTestDir + path, utils.readFile(__dirname + '/browser' + path));
    }

    writeForBrowser('/test.html');
    writeForBrowser('/jasmine/jasmine.css');
    writeForBrowser('/jasmine/jasmine.js');

    if (options.htmlReporter === false) {
        utils.writeFile(tmpTestDir + '/jasmine/jasmine-html.js', utils.readFile(__dirname + '/browser/jasmine-html-stub.js'));
    } else {
        writeForBrowser('/jasmine/jasmine-html.js');
    }

    writeForBrowser('/jasmine/console.js');
    writeForBrowser('/jasmine/boot.js');

    b.log('Launching ' + tmpTestDir + '/test.html');
    browserOpn(tmpTestDir + '/test.html', { tmp: tmpTestDir });

    if (typeof callback === 'function') {
        callback();
    }
}


module.exports = function (options) {
    options = options || {};

    if (!options.tmpDir) {
        options.tmpDir = '/tmp/bundl_jasmine_node';
    }

    function all (resources, srcFiles, done) {
        var bundl = this;
        createSpecBundle(bundl, srcFiles || [], options, done);
    }

    return {
        all: all
    };

};
