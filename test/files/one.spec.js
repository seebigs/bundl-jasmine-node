var mock = require('mock-require');

mock('./mocked.js', { type: 'mocked' });
var entry = require('./entry.js');
mock.stopAll();

describe('one', function () {

    describe('nested spec', function () {

        it('does the thing', function () {
            expect(typeof jasmine.createSpy).toBe('function');
        });

        it('requires mocked stuff', function () {
            expect(entry.foo()).toBe('foo');
            expect(entry.bar).toBe('mocked');
        });

        xit('skips this one', function () {
            expect(true).toBe(false);
        });

    });

});
