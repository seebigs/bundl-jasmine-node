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
    var globalFnName = '__bundl_prepare_tests';
    var concat = globalFnName + '();\n';
    var paths = [__dirname + '/global'].concat(options.paths || []);
    var packOptions = options.pack || {};

    utils.each(files, function (file) {
        var specContents = utils.readFile(file);
        if (typeof packOptions.js === 'function') {
            var processor = packOptions.js(null, options).processor;
            if (typeof processor === 'function') {
                specContents = processor({ contents: specContents });
            }
        }
        concat += '\n__bundl_exec_test(function(){\n\n' + specContents + '\n});\n';
        var dir = path.dirname(file);
        if (paths.indexOf(dir) === -1) {
            paths.push(dir);
        }
    });

    concat += '\nfunction ' + globalFnName + ' () {\n';

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


    var tmpTestDir = options.tmpDir + '/test_' + new Date().getTime();

    // use bundl-pack for easy requirifying
    packOptions.paths = packOptions.paths || paths;
    var testBundle = bundlPack(packOptions).one(concat, {
        name: 'test.js',
        contents: concat,
        src: files
    }).contents;

    utils.writeFile(tmpTestDir + '/test.js', testBundle, function (written) {
        if (b.args.browser) {
            runSpecsInBrowser(b, tmpTestDir, options, callback);
        } else {
            runSpecsInNode(b, written.path, options, callback);
        }
    });
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
    utils.writeFile(tmpTestDir + '/test.html', utils.readFile(__dirname + '/browser/test.html'));
    utils.writeFile(tmpTestDir + '/jasmine.css', utils.readFile(__dirname + '/browser/jasmine-2.5.2/jasmine.css'));
    utils.writeFile(tmpTestDir + '/jasmine.js', utils.readFile(__dirname + '/browser/jasmine-2.5.2/jasmine.js'));

    if (options.htmlReporter === false) {
        utils.writeFile(tmpTestDir + '/jasmine-html.js', utils.readFile(__dirname + '/browser/jasmine-html-stub.js'));
    } else {
        utils.writeFile(tmpTestDir + '/jasmine-html.js', utils.readFile(__dirname + '/browser/jasmine-2.5.2/jasmine-html.js'));
    }

    utils.writeFile(tmpTestDir + '/console.js', utils.readFile(__dirname + '/browser/jasmine-2.5.2/console.js'));
    utils.writeFile(tmpTestDir + '/boot.js', utils.readFile(__dirname + '/browser/jasmine-2.5.2/boot.js'));

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
