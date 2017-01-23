
global.fetch = require('../fetch.js');

global.getJasmineRequireObj = function () {
    return global.jasmineRequire || jasmine;
};
require('jasmine-ajax');


beforeEach(function () {
    // Mock all external requests
    jasmine.Ajax.install();
    global.XMLHttpRequest = window.XMLHttpRequest;
});

afterEach(function () {
    // re-enable external requests
    jasmine.Ajax.uninstall();
});
