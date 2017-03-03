/**
 * Jasmine-in-Node testing extension for Bundl
 */

var bundlPack = require('bundl-pack');
var Jasmine = require('jasmine');
var nodeAsBrowser = require('node-as-browser');
var path = require('path');
var stackRemap = require('stack-remap');
var utils = require('seebigs-utils');

var browserOpn = require('./browser/opn.js');


function createSpecBundle (b, files, options, callback) {
    var paths = [].concat(options.paths || []);
    var packOptions = options.pack || {};
    var concat = '// global helpers\n';

    var globals = [__dirname + '/global/window.js'];

    if (options.browser) {
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
    });

    concat += '\n// spec files\n';

    utils.each(files, function (file) {
        concat += 'require.cache.clear();\nrequire("' + file + '");\n';
    });

    // use bundl-pack for easy requirifying
    packOptions.paths = packOptions.paths || paths;
    var testBundl = bundlPack(packOptions).one.call({ LINES: concat.split('\n').length + 1 }, concat, {
        name: 'test.js',
        contents: concat,
        src: files,
        sourcemaps: []
    });

    var tmpTestDir = __dirname + '/browser';
    if (options.browser) {
        tmpTestDir = options.tmpDir + '/test_' + new Date().getTime();
        utils.writeFile(tmpTestDir + '/test.js', testBundl.contents, function (written) {
            runSpecsInBrowser(b, tmpTestDir, options, callback);
        });
    } else {
        utils.writeFile(tmpTestDir + '/test.js', testBundl.contents, function (written) {
            runSpecsInNode(b, testBundl, written.path, options, callback);
        });
    }
}

function runSpecsInNode (b, testBundl, tempBundlePath, options, callback) {
    var shouldStackRemap = !options.pack || !options.pack.js;

    /* Clear Node's Cache */
    for (var x in require.cache) {
        delete require.cache[x];
    }

    /* Enble StackRemap */
    if (shouldStackRemap) {
        stackRemap.install();
        stackRemap.add(testBundl.sourcemaps);
    }

    /* Init Global Env */
    nodeAsBrowser.init(global);

    /* Init Options */
    options.logger = b.log;
    var terminalReporter = require('./reporters/terminal.js'); // need a fresh reporter each time
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

        // Disable StackRemap
        if (shouldStackRemap) {
            stackRemap.reset();
            stackRemap.uninstall();
        }

        if (typeof callback === 'function') {
            callback();
        }
    });

    /* Load Files */

    if (options.haltOnException !== false) {
        require(__dirname + '/global/halt.js');
    }

    require(tempBundlePath);

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
        Object.assign(options, bundl.args);
        createSpecBundle(bundl, srcFiles || [], options, done);
    }

    return {
        all: all
    };

};
