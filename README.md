# bundl-jasmine-node

**Run unit tests directly in Node. No browser needed!**

> Runs on the amazing [Bundl](https://github.com/seebigs/bundl) build tool

> Testing framework by [Jasmine](http://jasmine.github.io/)

> Runs with without a browser via [node-as-browser](https://github.com/seebigs/node-as-browser)

## How to use

```js
var bundl = require('bundl');
var runTests = require('bundl-jasmine-node');

var options = {
    slowThreshold: 500 //ms
};

bundl(['./spec/*'])
    .then(runTests(options))
    .all();
```
