const operations = require("../../modules/signsensus/lib/transactionOperations");
const fs=require('fs');
const path=require('path');
const assert=require('assert');
var MAX_KEYS_COUNT      = 10;
var MAX_TRANS_COUNT = 15;

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

var transactionCounter = 0;
function Transaction(input, output){
    this.input  = input;
    this.output = output;
    this.pulseNumber  = 0; //will be modified by nodes
    this.digest = "T"+ transactionCounter; //TODO:  this is for debug and tests only.. use the proper hashValues
    transactionCounter++;
}
function fakePDSVerificationSpace(){

    var keys = {};

    function readKey(name){
        var k = keys[name];
        if(!k){
            k = keys[name] = 0;
        }
        return k;
    }

    function modifyKey(name){
        var k = keys[name];
        if(!k){
            k = keys[name] = 1;
        } else {
            k++;
            keys[name] = k;
        }
        return  k;
    }


    this.generateInputOut = function(){
        var result = {
            input:{},
            output:{}
        };

        var howMany = getRandomInt(MAX_KEYS_COUNT/4) + 1;
        for(var i = 0; i< howMany; i++ ){
            var keyName = "key" + getRandomInt(MAX_KEYS_COUNT);

            var key = {};
            key.name    = keyName;
            var problemsDice =  getRandomInt(3); // one in 3 keys will create concurrency issues
            if(problemsDice){
                key.version = readKey(keyName);
            } else {

                var key = {};
                key.name    = keyName;
                key.version = modifyKey(keyName);
                result.output[keyName] = key;
            }
            result.input[keyName] = key;
        }

        var howMany = getRandomInt(MAX_KEYS_COUNT/8) + 1 ;
        for(var i = 0; i< howMany; i++ ){
            var keyName = "key" + getRandomInt(MAX_KEYS_COUNT);

            var key = {};
            key.name    = keyName;
            key.version = modifyKey(keyName);
            result.output[keyName] = key;
        }

        return result;
    }

}
function generateTransactions(noTransactions){
    var transactions=[];
    while(noTransactions>0){
        var result=fakePDS.generateInputOut();
        transactions.push(new Transaction(result.input,result.output));
        noTransactions--;
    }
    return transactions;
}
function getFiles(testDirectory){
    var memberFiles=fs.readdirSync(testDirectory);
    for(var i=0; i<memberFiles.length; i++){
        memberFiles[i]=path.resolve(testDirectory+'\\'+memberFiles[i]);
    }
    return memberFiles;
}


function createFiles(files){
    transactionCounter=0;
    if(files.length){
        var file=files.shift();
        var howMany = getRandomInt(MAX_TRANS_COUNT/3)+1;
        var transactions=generateTransactions(howMany);
        var test={};
        test.transactions=transactions;
        test.expected=[];
        fs.writeFile(file,JSON.stringify(test,null,4),function(err){
           if(err){
               console.error(err);
               return;
           }
            createFiles(files);
        });

    }
}
function readFromFiles(files){
    if(files.length){
        var file=files.shift();
        fs.readFile(file,function(err,data){
            if(err){
                console.error(err);
                return;
            }
            var test=JSON.parse(data);
            var result=[];
            var transactions=test.transactions;
            operations.sortTransactions(transactions);
            for(var i=0; i<transactions.length; i++){
                result.push(transactions[i].digest);
            }
            if(assert.deepEqual(result,test.expected) == undefined){
                console.log('Test passed');
            }
            readFromFiles(files);
        });

    }
}


var fakePDS=new fakePDSVerificationSpace();
var testDirectory='./testsTransactionOrdering';
var files=getFiles(testDirectory);
var filesClone=getFiles(testDirectory);
readFromFiles(files);

//createFiles(files);


