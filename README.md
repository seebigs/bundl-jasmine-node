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

var options = {
    slowThreshold: 500 //ms
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

### --env=browser

*browser - compile tests into a standalone JS file and open them in your default browser*

This URL can also be opened by any browser on your machine

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

### htmlReporter (when --env=browser)

*default: true*

set to `false` to prevent writing test results into document.body

### paths (when --env=browser)

*Array of Strings telling Bundl how to resolve relative paths*

See [Bundl](https://github.com/seebigs/bundl)
