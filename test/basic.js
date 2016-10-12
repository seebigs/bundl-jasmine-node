/**
 * Run basic validations
 */

var bundlJasmineNode = require('../index.js');
var path = require('path');

var fakeBundl = {
    args: require('./bundlMocks/args.js'),
    log: require('./bundlMocks/log.js')
};

var testFiles = [
    path.resolve('test/files/one.spec.js'),
    path.resolve('test/files/two.spec.js')
];

bundlJasmineNode({}).all.call(fakeBundl, testFiles);
