/**
 * Run basic validations
 */

var bundlJasmineNode = require('../index.js');
var path = require('path');

var fakeBundl = { log: console.log };
var testFiles = [
    path.resolve('test/files/one.spec.js'),
    path.resolve('test/files/two.spec.js')
];

bundlJasmineNode({}).all.call(fakeBundl, testFiles);
