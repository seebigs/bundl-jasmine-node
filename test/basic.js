var bundl = require('bundl');
var bundlJasmineNode = require('../index.js');

var targetFiles = [
    'one.spec.js',
    'two.spec.js',
    'three.spec.js'
];

bundl(targetFiles, { targetDir: 'test/files' })
    .then(bundlJasmineNode({ slowThreshold: 500 }))
    .all();
