var fs = require("fs");
var path = require("path");


$$.flow.describe("mkDirRec", {
   make:function(folder, callback){
    folder = path.normalize(folder);

       var serialExecution = this.serial(callback);
       var folders = folder.split(path.sep);

       var currentFolder = folders[0];
       serialExecution.__mkOneStep(currentFolder, serialExecution.progress);


        for(var i = 1; i < folders.length; i++){
            currentFolder += path.sep;
            currentFolder += folders[i];
            serialExecution.__mkOneStep(currentFolder, serialExecution.progress);
        }

   },

    makeLink: function(existingPath, newPath, callback){
        //console.log("Link: ", existingPath, newPath);
        if(!fs.existsSync(newPath)){
            fs.symlink(existingPath, newPath,'dir', function(err, res){
                if(err){
                    console.error("Warning: ", err);
                }
                callback(null, res);
            });
        }else{
            callback(null, newPath);
        }
    },
   __mkOneStep:function(folder, callback){
       //console.log("Folder: ", folder);
       fs.exists(folder, function(res){
           if(!res && folder!==""){
              fs.mkdir(folder, callback);
           } else {
               callback(null, true);
           }
       });
   }
});




