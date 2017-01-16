/**
 * Bundl test reporter
 */

var chalk = require('chalk');
var prettyTime = require('pretty-hrtime');

var symbols = require('./symbols.js');

var args = {};
var log = console.log;

var indents = 0;
var indentLevel = 3;
var slowThreshold = 500; // in milliseconds
var logLevel = 3;
var spinner = '⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏';
var totalTime, specTime, describeStack;

var total = {
    failedExpectations: [],
    executed: 0,
    failed: 0,
    passed: 0,
    skipped: 0,
    slow: 0,
    queued: 0
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
        if (opt.args) {
            args = opt.args;
            if (args.log === 'WARN') {
                logLevel = 2;
            } else if (args.log === 'ERROR') {
                logLevel = 1;
            }
        }

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
        total.queued = suiteInfo.totalSpecsDefined;
    },

    suiteStarted: function (result) {
        var indentedDescription = getIndents() + result.description;
        if (logLevel > 2) {
            log(indentedDescription);
        }
        describeStack = indents ? describeStack + '\n' + indentedDescription : indentedDescription;
        indents += indentLevel;
    },

    specStarted: function (result) {
        specTime = process.hrtime();
    },

    specDone: function (result) {
        total.executed++;

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
            if (logLevel > 2) {
                log(chalk.green(getIndents() + symbols.success + ' ' + result.description) + slowWarning);
            } else if (logLevel > 1) {
                if (slow) {
                    log(describeStack);
                    log(chalk.yellow(getIndents() + symbols.success + ' ' + result.description) + slowWarning);
                }
            }

        } else if (result.status === 'failed') {
            total.failed++;
            if (logLevel > 2) {
                log(chalk.red(getIndents() + symbols.error + ' ' + result.description) + slowWarning);
            }

        } else {
            total.skipped++;
            if (logLevel > 2) {
                log(chalk.gray(getIndents() + '- ' + result.description));
            }
        }

        if (logLevel === 1) {
            var percent = Math.round(total.executed/total.queued * 100);
            var spin1 = total.executed%spinner.length;
            var spin2 = spin1 - 1;
            if (spin2 < 0) { spin2 = spinner.length - 1; }
            process.stdout.write('\r' + spinner[spin1] + spinner[spin2] + ' ' + percent + '% ');
        }
    },

    suiteDone: function (result) {
        indents -= indentLevel;
    },

    jasmineDone: function () {
        log('\r       ');

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
