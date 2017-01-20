
var oldOnException = jasmine.Spec.prototype.onException;
jasmine.Spec.prototype.onException = function (e) {
    console.log('\n\nHalt On Exception:\n');
    console.log(e);
    process.exit(1);
};
