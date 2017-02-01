
var oldOnException = jasmine.Spec.prototype.onException;
jasmine.Spec.prototype.onException = function (e) {
    console.log('\n\nHalt On Exception:');
    console.log('   ' + this.result.fullName + '\n');
    console.log(e);
    process.exit(1);
};
