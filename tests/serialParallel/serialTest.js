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

        serial.doStep1(1000);
        serial.doAsync(serial.asyncStep);
        serial.doStep1(1).doStep2(2);

        //echivalent: this.serial(this.onResults, "Hello serial execution!").doAsync(serial.asyncStep).doStep1(1).doStep2(2)
    },
    doStep1:function(value){

        this.result += value;
    },
    doStep2:function(value){
        this.result += value;
    },
    asyncStep:function(value){
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