
beforeEach(function () {
    // disable setTimeout
    // must happen before innerHTML = ''
    jasmine.clock().install();
});

afterEach(function () {
    // re-enable setTimeout
    jasmine.clock().uninstall();
});
