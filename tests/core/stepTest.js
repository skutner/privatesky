
require("../../engine/core").enableTesting();
var assert=require("double-check").assert;
var f = $$.swarm.create("stepExample", {
    private:{
        a1:"int",
        a2:"int"
    },
    public:{
        result:"int"
    },
    begin:function(a1,a2){
        this.a1 = a1;
        this.a2 = a2;
        this.doStep(3);
    },
    doStep:function(a){
        this.result = this.a1 + this.a2 + a;
    },
    doResult:function(){
        return this.result;
    }
});

f.begin(1, 2);
assert.equal(f.doResult(),6,"Results don't match");