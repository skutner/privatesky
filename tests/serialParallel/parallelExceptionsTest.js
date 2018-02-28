
require("../../engine/core").enableTesting();
var assert=require('double-check').assert;
var f = $$.callflow.create("parallelExceptionCase", {
    public: {
        result: "int"
    },
    start: function (callback) {
        this.result = 0;
        this.resultCount = 0;
        this.callback = callback;
        var join = this.parallel(this.doJoin);
        join.doStep(1);
        join.doStep(2);
        join.doStepErr("Intentional error");
        join.doStepErr("Intentional error");
    },
    doStep: function (value) {
        this.result += value;
    },
    doStepErr: function (value) {
        throw new Error(value);
    },
    doJoin: function (err) {
        assert.equal(this.result, 3, "There is a problem with the callback sequence");
        assert.notEqual(err, null, "Error expected");
        this.callback();
    }
});
assert.callback("Parallel exceptions test",function(callback){
    f.start(callback);
})


