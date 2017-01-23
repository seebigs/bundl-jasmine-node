
beforeEach(function () {
    for (var x in require.cache) {
        delete require.cache[x];
    }
});
