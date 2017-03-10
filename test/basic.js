var babelProcessor = require('bundl-pack-babel');
var bundl = require('bundl');
var bundlBabel = require('bundl-pack');
var bundlJasmineNode = require('../index.js');

var bundlOptions = {
    srcDir: 'specs'
};

bundl([ 'one.spec.js', 'two.spec.js', 'three.spec.js' ], bundlOptions)
    .then(bundlJasmineNode({ clearCacheBeforeEach: true }))
    .all(function () {
        bundl([ 'one.spec.es6.js', 'two.spec.es6.js', 'three.spec.js' ], bundlOptions)
            .then(bundlJasmineNode({
                clearCacheBeforeEach: true,
                pack: {
                    js: babelProcessor()
                }
            }))
            .all();
    });
