/**
 * Bundl test reporter
 */

var chalk = require('chalk');
var prettyTime = require('pretty-hrtime');

var symbols = require('./symbols.js');

var log = console.log;

var indents = 0;
var indentLevel = 3;
var slowThreshold = 500; // in milliseconds
var totalTime, specTime;

var total = {
    failedExpectations: [],
    failed: 0,
    passed: 0,
    skipped: 0,
    slow: 0
};

function convertHrtime (hrtime) {
    var ns = hrtime[0] * 1e9 + hrtime[1];
	return ns / 1e6; // ms
}

function getIndents () {
    var str = '';

    for (var i = 0; i < indents; i++) {
        str += ' ';
    }

    return str;
}

module.exports = {

    setReporterOptions: function (opt) {
        if (opt.slowThreshold) {
            slowThreshold = opt.slowThreshold;
        }

        if (opt.log) {
            log = opt.log;
        }
    },

    jasmineStarted: function (suiteInfo) {
        log();
        log(chalk.blue('Bundl tests starting (' + suiteInfo.totalSpecsDefined + ' tests)\n'));
        totalTime = process.hrtime();
    },

    suiteStarted: function (result) {
        log(getIndents() + result.description);
        indents += indentLevel;
    },

    specStarted: function (result) {
        specTime = process.hrtime();
    },

    specDone: function (result) {
        var duration = process.hrtime(specTime);
        var slow = convertHrtime(duration) > slowThreshold;
        var slowWarning = slow ? ' ' + chalk.yellow('(slow: ' + prettyTime(duration) + ')') : '';
        if (slow) {
            total.slow++;
        }

        if (result.failedExpectations.length) {
            total.failedExpectations.push(result);
        }

        if (result.status === 'passed') {
            total.passed++;
            log(chalk.green(getIndents() + symbols.success + ' ' + result.description) + slowWarning);
        } else if (result.status === 'failed') {
            total.failed++;
            log(chalk.red(getIndents() + symbols.error + ' ' + result.description) + slowWarning);
        } else {
            total.skipped++;
            if (b.args.verbose) {
                log(chalk.gray(getIndents() + '- ' + result.description));
            }
        }
    },

    suiteDone: function (result) {
        indents -= indentLevel;
    },

    jasmineDone: function () {
        log();

        if (total.failedExpectations.length) {
            log(chalk.underline('FAILED TESTS'));
            total.failedExpectations.forEach(function (ex) {
                log(ex.fullName);
                ex.failedExpectations.forEach(function (failure) {
                    log(chalk.red(failure.stack));
                    log();
                });
            });
        }

        log(chalk.underline('SUMMARY'));
        if (total.passed) {
            log(chalk.green(symbols.success + '  passed: ' + total.passed));
        }
        if (total.failed) {
            log(chalk.red(symbols.error + '  failed: ' + total.failed));
        }
        if (total.skipped) {
            log(chalk.gray('-  skipped: ' + total.skipped));
        }
        if (total.slow) {
            log(chalk.yellow(symbols.warning + '  slow: ' + total.slow));
        }
        log();
        log('Finished in ' + prettyTime(process.hrtime(totalTime)));
    },

    getResults: function () {
        return total;
    }

};
