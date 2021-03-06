
function encode(buffer) {
    return buffer.toString('base64')
        .replace(/\+/g, '')
        .replace(/\//g, '')
        .replace(/=+$/, '');
};

function stampWithTime(buf, salt, msalt){
    if(!salt){
        salt = 1;
    }
    if(!msalt){
        msalt = 1;
    }
    var date = new Date;
    var ct = Math.floor(date.getTime() / salt);
    var counter = 0;
    while(ct > 0 ){
        //console.log("Counter", counter, ct);
        buf[counter*msalt] = Math.floor(ct % 256);
        ct = Math.floor(ct / 256);
        counter++;
    }
}

/*
    The uid contains around 256 bits of randomness and are unique at the level of seconds. This UUID should by cryptographically safe (can not be guessed)

    We generate a safe UID that is guaranteed unique (by usage of a PRNG to geneate 256 bits) and time stamping with the number of seconds at the moment when is generated
    This method should be safe to use at the level of very large distributed systems.
    The UUID is stamped with time (seconds): does it open a way to guess the UUID? It depends how safe is "crypto" PRNG, but it should be no problem...

 */

exports.safe_uuid = function(callback) {
    require('crypto').randomBytes(36, function (err, buf) {
        if (err) {
            callback(err);
            return;
        }
        stampWithTime(buf, 1000, 3);
        callback(null, encode(buf));
    });
}


/*
    Try to generate a small UID that is unique against chance in the same millisecond second and in a specific context (eg in the same choreography execution)
    The id contains around 6*8 = 48  bits of randomness and are unique at the level of milliseconds
    This method is safe on a single computer but should be used with care otherwise
    This UUID is not cryptographically safe (can be guessed)
 */
exports.short_uuid = function(callback) {
    require('crypto').randomBytes(12, function (err, buf) {
        if (err) {
            callback(err);
            return;
        }
        stampWithTime(buf,1,2);
        callback(null, encode(buf));
    });
}

/*
        //NOT USED, OBSOLETE.. prone to evil race conditions...
    A bit hacky but trying to do the simplest workaround against asynchronous calls in the core. Created to avoid other dependencies or performance issues in the core
        This function should be used to wait for  UUIDs  that are not yet ready (or other predictable sucessful but still asynchronous calls)
    but keeping a sense of synchronicity/simplicity in code where is possible
        Generating uuids synchronously is possible but it could create performance issues

        Warning: In a large majority of cases do not use this method!!  swarm workflow or safebox dependency injection should be used and not this workaround!!!!
 */

exports.wait_for_condition = function wait_for_condition(condition, callback, tries){
    if(tries == undefined){
        tries  = 1024;
    }
    if(condition(tries)) {
        setTimeout(function(){ //ensure that all the asynchronous calls in the current phase took place
            return callback();
        },1);
    }
    else {
        tries--;
        if(tries <=0){
            throw new Error("__wait_for_condition");
        }
        else {
            setTimeout(function(){
                wait_for_condition(condition, callback, tries);
            },10)
        }
        //else  setImmediate(__wait_for_condition, condition, tries, callback);
    }
}