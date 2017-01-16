var entry = require('./entry.js');

describe('two', function () {

    describe('nested', function () {

        describe('specs', function () {

            it('does multiple things', function () {
                expect(1).toBe(1);
                expect(2).toBe(2);
            });

            it('requires real stuff', function () {
                expect(entry.foo()).toBe('foo');
                expect(entry.bar).toBe('real');
            });

        });

    });

});
