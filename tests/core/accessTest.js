var assert=require("double-check").assert;
require("../../engine/core").enableTesting();

var f = $$.flow.create("simpleSwarm", {
    protected:{
        prot_count:"int"
    },
    public:{
        pub_count:"int"
    },
    begin:function(){
        this.count = 3; //added in private
    }
});

f.begin();
f.pub_count = 1;
f.prot_count = 2;
f.priv_count = 3; //not declared
assert.equal(f.count,3,"Results don't match");

