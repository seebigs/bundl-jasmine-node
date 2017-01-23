/**
 * Browser console reporter
 */

var log = console.log;
var logError = console.error || console.log;

var indents = 0;
var indentLevel = 3;
var slowThreshold = 500; // in milliseconds
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
    },

    jasmineStarted: function (suiteInfo) {
        log('Bundl tests starting (' + suiteInfo.totalSpecsDefined + ' tests)\n');
        totalTime = +new Date();
        total.queued = suiteInfo.totalSpecsDefined;
    },

    suiteStarted: function (result) {
        var indentedDescription = getIndents() + result.description;
        describeStack = indents ? describeStack + '\n' + indentedDescription : indentedDescription;
        indents += indentLevel;
    },

    specStarted: function (result) {
        specTime = +new Date();
    },

    specDone: function (result) {
        total.executed++;

        var duration = (+new Date()) - specTime;
        var slow = duration > slowThreshold;
        if (slow) {
            total.slow++;
        }

        if (result.failedExpectations.length) {
            total.failedExpectations.push(result);
        }

        if (result.status === 'passed') {
            total.passed++;

        } else if (result.status === 'failed') {
            total.failed++;

        } else {
            total.skipped++;
        }
    },

    suiteDone: function (result) {
        indents -= indentLevel;
    },

    jasmineDone: function () {
        if (total.failedExpectations.length) {
            total.failedExpectations.forEach(function (ex) {
                var errMsg = 'FAILED: ' + ex.fullName;
                ex.failedExpectations.forEach(function (failure) {
                    errMsg += '\n' + failure.message;
                });
                logError(errMsg);
            });
        }

        if (total.passed) {
            log('passed: ' + total.passed);
        }
        if (total.failed) {
            log('failed: ' + total.failed);
        }
        if (total.skipped) {
            log('skipped: ' + total.skipped);
        }
        if (total.slow) {
            log('slow: ' + total.slow);
        }
        log('Finished in ' + (+new Date() - totalTime) + ' ms');
    },

    getResults: function () {
        return total;
    }

};
