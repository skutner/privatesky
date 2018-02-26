
var ss = require("../../modules/signsensus");

require("../../engine/core").enableTesting();

var safeBox = ss.getAgentSafeBox("testAgent");
var assert=require('double-check').assert;


assert.callback("Signature test",function(end) {
    var expected = 'sign' + 'getSignature' + 'printResults';
    var actual = "";

    var test = $$.flow.describe("signatureTest", {

        start: function () {
            this.obj = {
                name: "Hello World"
            }

            this.digest = safeBox.digest(this.obj);
            actual += 'sign';
            safeBox.sign(this.digest, this.getSignature);
        },
        getSignature: function (err, signature) {
            this.signature = signature;
            //console.log("Signature:", this.signature);
            assert.notEqual(signature, null, "Signature is null");
            actual += 'getSignature';
            safeBox.verify(this.digest, signature, this.printResults);
        },

        printResults: function (err, isGood) {
            //console.log(this.signature, isGood);
            actual += 'printResults';
            assert.equal(actual,expected,'Callback sequence does not match');
            assert.equal(isGood, true, "Fail to verify signature");
            end();
        }
    })
    test().start();
});


