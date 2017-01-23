
window.global = window;

jasmine.getEnv().addReporter(require('../reporters/browser_console.js'));

beforeEach(function () {
    require.cache.clear();
});
