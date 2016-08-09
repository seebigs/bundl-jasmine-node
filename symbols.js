/**
 * Text symbols
 * https://github.com/sindresorhus/log-symbols
 */

var main = {
    info: 'ℹ',
    success: '✔',
    warning: '⚠',
    error: '✖'
};

var win = {
    info: 'i',
    success: '√',
    warning: '‼',
    error: '×'
};

module.exports = process.platform === 'win32' ? win : main;
