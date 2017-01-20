
beforeEach(function () {
    // disable setTimeout
    // must happen before innerHTML = ''
    jasmine.clock().install();

    // blank page
    window.name = '';
    document.head.innerHTML = '';
    document.body.innerHTML = '';
    window.scrollTo(0, 0);
});

afterEach(function () {
    // re-enable setTimeout
    jasmine.clock().uninstall();
});
