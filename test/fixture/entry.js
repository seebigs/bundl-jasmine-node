
var mocked = require('./mocked.js');

module.exports = {
    foo: function () {
        return 'foo';
    },
    bar: mocked.type
};
