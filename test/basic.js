var babelProcessor = require('bundl-pack-babel');
var bundl = require('bundl');
var bundlBabel = require('bundl-pack');
var bundlJasmineNode = require('../index.js');

var bundlOptions = {
    srcDir: 'specs',
    quiet: true
};

bundl([ 'one.spec.js', 'two.spec.js', 'three.spec.js' ], bundlOptions)
    .then(bundlJasmineNode({ clearCacheBeforeEach: true }))
    .go(function () {
        bundl([ 'one.spec.es6.js', 'two.spec.es6.js', 'three.spec.js' ], bundlOptions)
            .then(bundlJasmineNode({
                clearCacheBeforeEach: true,
                pack: {
                    js: babelProcessor()
                }
            }))
            .go();
    });
