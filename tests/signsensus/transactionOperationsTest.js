const operations = require("../../modules/signsensus/lib/transactionOperations");
const fs=require('fs');
const path=require('path');
const assert=require('assert');
var MAX_KEYS_COUNT      = 10;
var MAX_TRANS_COUNT = 16;

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
    var latestKeyAlteringTransaction={};
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


    function generateInputOut(){
        var result = {
            input:{},
            output:{}
        };

        var howMany = getRandomInt(MAX_KEYS_COUNT/4) + 1;
        for(var i = 0; i< howMany; i++ ){
            var keyName = "key" + getRandomInt(MAX_KEYS_COUNT);
            var keyIn = {};
            var keyOut = {};
            keyIn.version = modifyKey(keyName);
            result.input[keyName] = keyIn;

            keyOut.version=modifyKey(keyName);
            result.output[keyName]=keyOut;
        }
        return result;
    };
     this.generateTransactions=function(noTransactions){
        var transactions=[];
        while(noTransactions>0){
            var result=generateInputOut();
            var transaction=new Transaction(result.input,result.output);
            for(var key in transaction.output){
                latestKeyAlteringTransaction[key]=transaction;
            }
            transactions.push(transaction);
            noTransactions--;
        }
        return transactions;
    }
    this.latestVersion=function(name){
        return readKey(name);
    }
    this.recordsLength=function () {
        return keys.length;
    }
    this.getKeys=function () {
        return keys;
    }
    this.latestTransaction=function(key){
        return latestKeyAlteringTransaction[key];
    }
    this.latestTransactions=function () {
        return latestKeyAlteringTransaction;
    }

}

function TransactionsFilesManager(testDirectory,auxDirectory){
    var fakePDS=new fakePDSVerificationSpace();

    function getFiles(testDirectory){
        var memberFiles=fs.readdirSync(testDirectory);
        for(var i=0; i<memberFiles.length; i++){
            memberFiles[i]=path.resolve(testDirectory+'\\'+memberFiles[i]);
        }
        return memberFiles;
    }
    function writeTestFiles(files){
        transactionCounter=0;
        if(files.length){
            var file=files.shift();
            var howMany = getRandomInt(MAX_TRANS_COUNT/2)+1;
            var transactions=fakePDS.generateTransactions(howMany);
            var test={};
            test.transactions=transactions;
            test.expected=[];
            fs.writeFile(file,JSON.stringify(test,null,4),function(err){
                if(err){
                    console.error(err);
                    return;
                }
                console.log('Done with '+file);
                writeTestFiles(files);
            });

        }
    }
    function testTransactionSort(files){
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
                operations.sortTransactions(transactions,fakePDS);
                for(var i=0; i<transactions.length; i++){
                    result.push(transactions[i].digest);
                }
                /* if(assert.deepEqual(result,test.expected) == undefined){
                     console.log('Test passed');
                 }*/
                console.log(result);
                testTransactionSort(files);
            });

        }
    }
    this.generateTestFiles=function (testDirectory) {
        var files=getFiles(testDirectory);
        writeTestFiles(files);
        fs.readdir(auxDirectory,function (err,files) {
            if(err){
                console.error(err);
                return;
            }
            files.forEach(function(file){
                fs.writeFile(file,JSON.stringify(fakePDS.latestTransactions()),function (err) {
                    if(err){
                        console.error(err);
                        return;
                    }
                    console.log("Done with verification space");
                });
            })
        })
    }
    this.testSort=function (testDirectory) {
        var files=getFiles(testDirectory);
        testTransactionSort(files);
    }
}



var testDirectory='./testsTransactionOrdering';
var auxDirectory='./auxDirectory';
var tops=new TransactionsFilesManager(testDirectory,auxDirectory);
tops.generateTestFiles(testDirectory);



