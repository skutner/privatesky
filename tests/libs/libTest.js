require("../../engine/core").enableTesting();

var assert=require("double-check").assert;

var lib1 = $$.loadLibrary("library1","./lib1");
var lib2 = $$.loadLibrary("library2","./lib2");
var lib3 = $$.loadLibrary("library2");  //should be == lib2

assert.notEqual(lib1,null,"lib1 is null");
assert.notEqual(lib2,null,"lib2 is null");
assert.equal(lib3,lib2,"Libraries are not the same");


var test1=$$.callflow.start("library1.f1");
assert.notEqual(test1,null,"Test1 is null");

var test2=$$.callflow.start(lib1.f1);
assert.notEqual(test2,null,"Test2 is null");

var test3=$$.callflow.start(lib2.f2);
var test4=$$.callflow.start(lib3.f1);

assert.notEqual(test3,null,"Test3 is null");
assert.notEqual(test4,null,"Test4 is null");

$$.callflow.start("wrongName"); //should send errors