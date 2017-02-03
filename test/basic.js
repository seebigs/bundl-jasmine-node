var babelProcessor = require('bundl-pack-babel');
var bundl = require('bundl');
var bundlBabel = require('bundl-pack');
var bundlJasmineNode = require('../index.js');

var targetFiles = [
    'one.spec.js',
    'two.spec.es6.js',
    'three.spec.js'
];

var options = {
    pack: {
        js: babelProcessor()
    }
};

bundl(targetFiles, { targetDir: 'test/specs' })
    .then(bundlJasmineNode(options))
    .all();
