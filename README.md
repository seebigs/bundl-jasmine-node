# bundl-jasmine-node

**Run unit tests directly in Node. No browser needed!**

> Runs on the amazing [Bundl](https://github.com/seebigs/bundl) build tool

> Testing framework by [Jasmine](http://jasmine.github.io/)

> Runs without a browser via [node-as-browser](https://github.com/seebigs/node-as-browser)

## How to use

unitTests.js
```js
var bundl = require('bundl');
var jasmine = require('bundl-jasmine-node');
var babelProcessor = require('bundl-pack-babel');

var options = {
    slowThreshold: 500 //ms
    pack: {
        js: babelProcessor() // lets you write test code in ES6
    }
};

bundl(['./spec/*'])
    .then(jasmine(options))
    .all();
```

```
$ node ./unitTests.js --log=WARN
```

## CLI Options

### --log=LEVEL

*default: INFO*

ERROR - only show progress bar and any resulting errors

WARN - show warning messages and errors

INFO - show the outcome of each test as it runs (default)

### --browser

*opens in your default OS browser*

Compile tests into a standalone JS file and open an html page that runs your tests and outputs to DOM and/or window.console

This URL can be opened by any browser on your machine for testing in any browser

## Library Options

### slowThreshold

*default: 500*

If one test takes longer than this threshold to complete, it is flagged as slow and will throw a warning

### mockAjax

*default: true*

set to `false` to disable mocking XMLHttpRequest and fetch (See [jasmine-ajax](https://github.com/jasmine/jasmine-ajax))

### mockTimeouts

*default: true*

set to `false` to disable mocking setTimeout and setInterval (See [jasmine.clock](https://jasmine.github.io/edge/introduction.html#section-Jasmine_Clock))

### haltOnException

*default: true*

set to `false` to allow suite to continue even after throwing an exception

### htmlReporter (when using --browser)

*default: true*

set to `false` to prevent writing test results into document.body

### paths (when using --browser)

*Array of Strings telling Bundl how to resolve relative paths*

See [Bundl](https://github.com/seebigs/bundl)
