
function args () {
    var a = { _: [] };
    var rawArgs = process.argv.slice(2);
    var npmConfigArgs = process.env.npm_config_argv;
    if (npmConfigArgs) {
        rawArgs = rawArgs.concat(JSON.parse(npmConfigArgs).original);
    }

    rawArgs.forEach(function (raw) {
        var pair = raw.split('=');
        var argName;
        if (pair[0].charAt(0) === '-') {
            argName = pair[0].split('-').pop();
            a[argName] = pair[1] || true;

        } else {
            a._.push(pair[0]);
        }
    });

    return a;
}

module.exports = args();
