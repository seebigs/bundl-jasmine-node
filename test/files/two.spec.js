
describe('two', function () {

    it('does multiple things', function () {
        expect(1).toBe(1);
        expect(2).toBe(2);
    });

    it('requires stuff', function () {
        expect(require('./required.js').foo()).toBe('bar');
    });

});
