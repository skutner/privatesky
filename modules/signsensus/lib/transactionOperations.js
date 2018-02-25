function compareTransactions(transaction1, transaction2) {
    if (transaction1.pulseNumber < transaction2.pulseNumber) {
        return -1;
    }
    if (transaction1.pulseNumber > transaction2.pulseNumber) {
        return 1;
    }
    for (var i in transaction1.output) {
        for (var j in transaction2.input) {
            if ( i === j && transaction1.output[i].version <= transaction2.input[j].version)
                return -1;
            }
        }
    for (var i in transaction1.input) {
        for (var j in transaction2.output) {
            if (i === j && transaction1.input[i].version >= transaction2.output[j].version) {
                return 1;
            }

        }
    }
    if (transaction1.digest < transaction2.digest) {
        return -1;
    }
    if(transaction1.digest > transaction2.digest){
        return 1;
    }
    return 0;
}

exports.sortTransactions = function (transactions,localStorage) {
    var toBeRemovedIndexes=[];
    for( var i=0; i<transactions.length; i++){
        for(var key in transactions[i].input) {
            var latestVersion=localStorage.latestVersion(key);
            if (transactions[i].input[key].version < localStorage.latestVersion(key)){
                toBeRemovedIndexes.push(i);
                break;
            }
            if (transactions[i].output[key].version < localStorage.latestVersion(key)){
                toBeRemovedIndexes.push(i);
                break;
            }
           /* if(transactions[i].output[key].version > localStorage.latestVersion(key)){
                if(transactions[i].timestamp < localStorage.lates)
                break;
            }*/
        }
    }
    for(var i=0; i<toBeRemovedIndexes.length; i++){
        transactions.splice(toBeRemovedIndexes[i],1);
        for(var j=i+1; j<toBeRemovedIndexes.length; j++){
            toBeRemovedIndexes[j]-=1;
        }
    }
    transactions.sort(compareTransactions);
}


