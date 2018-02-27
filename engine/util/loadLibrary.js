/*
Initial License: (c) Axiologic Research & Alboaie Sînică.
Contributors: Axiologic Research , PrivateSky project
Code License: LGPL or MIT.
*/

var fs = require("fs");
var path = require("path");

function wrapCall(original, prefixName){
    return function(){
        //console.log("prefixName", prefixName)
        var previousPrefix = $$.libraryPrefix;
        console.log(previousPrefix);
        $$.libraryPrefix = prefixName;
        try{
            var ret = original.apply(this,arguments);
            $$.libraryPrefix = previousPrefix ;
        }catch(err){
            $$.libraryPrefix = previousPrefix ;
            throw err;
        }
        return ret;
    }
}



function SwarmLibrary(prefixName, folder){
    $$.libraries[prefixName] = this; // so other calls for loadLibrary will return inside of the files
    var prefixedRequire = wrapCall(function(path){
        require(path);
    }, prefixName);

    function includeAllInRoot(folder, prefixName) {
        //var stat = fs.statSync(path); //TODO -- check agains folders with extension .js
        var files = fs.readdirSync(folder);
        files.forEach(function(fileName){
            //console.log("Loading ", fileName);
            var ext = fileName.substr(fileName.lastIndexOf('.') + 1);
            if(ext.toLowerCase() == "js"){
                try {
                    var fullPath = path.resolve(folder + "/" + fileName);
                    prefixedRequire(fullPath);
                }catch(e){
                    throw e;
                }
            }
        })
    }

    var self = this;

    function wrapSwarmRelatedFunctions(space, prefixName){
        var ret = {};
        var names = ["create","describe", "start", "restart"];
        for(var i = 0;i<names.length;i++ ){
            ret[names[i]] = wrapCall(space[names[i]], prefixName);
        }
        return ret;
    }

    this.callflows        = this.callflow   = wrapSwarmRelatedFunctions($$.callflows, prefixName);
    this.swarms           = this.swarm      = wrapSwarmRelatedFunctions($$.swarms, prefixName);
    this.contracts        = this.contract   = wrapSwarmRelatedFunctions($$.contracts, prefixName);
    includeAllInRoot(folder, prefixName);
}

exports.loadLibrary = function(prefixName, folder){
    var existing = $$.libraries[prefixName];
    console.log("In Load Library");
    console.log(prefixName);
    if(existing ){
        if(folder) {
            $$.errorHandler.warning("Reusing already loaded library " + prefixName + "could be an error!");
        }
        return existing;
    }
    var absolutePath = path.resolve(folder);
    return new SwarmLibrary(prefixName, absolutePath);
}

/*

includeInAdapters = function(arrayOfAdapterNames){
    function adapterIncluded(){
        return arrayOfAdapterNames.some(function(adapterName){
            return adapterName===thisAdapter.mainGroup
        })
    }
    if(!adapterIncluded()){
        throw new Error("Not included in adapter");
    }
}

excludeFromAdapters = function(arrayOfAdapterNames){
    function adapterExcluded(adapter){
        if(thisAdapter.mainGroup===adapter){
            throw new Error("Not included in adapter");
        }
    }
    arrayOfAdapterNames.forEach(adapterExcluded)
}


var resetCallBacks = [];

registerResetCallback = function(callBack){
    resetCallBacks.push(callBack);
}


var container = require('safebox/lib/container').container;

container.service("resetCallBacks", ['swarmingIsWorking'], function(outOfService, swarming){
    if(!outOfService){
        resetCallBacks.forEach(function(c){
            c();
        })
    }
});

includeRec(process.env.SWARM_PATH+"/autolib/");
*/