var minimist = require('minimist');

module.exports = minimist(process.argv.slice(2), {
    alias: { h: 'help' }
});
