
var ss = require("../../modules/signsensus");

require("../../engine/core").enableTesting();

var safeBox = ss.getAgentSafeBox("testAgent");
var assert=require('double-check').assert;

assert.callback('Signature fail test',function(end){
    var expected="start"+"getSignature"+"printResults";
    var actual="";
    var test = $$.flow.describe("signatureTest",{
        start:function(){
            this.obj = {
                name:"Hello World"
            }
            this.digest = safeBox.digest(this.obj);
            actual+="start";
            safeBox.sign(this.digest, this.getSignature);
        },
        getSignature:function(err,signature){
            this.signature = signature;
            console.log("Signature:", this.signature);
            actual+="getSignature";
            assert.notEqual(signature,null,"Signature is null");
            this.obj.name = "Hello World!!!!!!!!!";
            this.digest = safeBox.digest(this.obj);
            safeBox.verify(this.digest, signature, this.printResults);
        },
        printResults:function(err,isGood){
            //console.log(this.signature, isGood);
            actual+="printResults";
            assert.equal(actual,expected,"Callback sequence does not match");
            assert.equal(isGood,true,"Fail to verify signature");
            end();
        }
    });
    test().start();
});


