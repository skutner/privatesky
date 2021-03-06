require("../../engine/core").enableTesting();
var assert=require("double-check").assert;
var f = $$.callflow.create("serialExample", {
    public:{
        result:"int"
    },
    start:function(callback){
        this.result = 0;
        this.callback=callback;
        var serial = this.serial(this.onResults);

    },
    doStep1:function(value){

        this.result += value;
    },
    doStep2:function(value){
        this.result += value;
    },
    asyncStep:function(value) {
        this.result += value;
    },
    doAsync:function(callback){
        setTimeout(function(){
            callback(100);
        }, 100);
    },
    onResults:function(err){
        assert.equal(err,null,"Error");
        assert.equal(this.result,1103,"Results don't match");
        this.callback();
    }
});
assert.callback("Serial Test",function(callback){
    f.start(callback);
})