function pairSmallerOrEqual(pair1, pair2) {
    if (pair1.name === pair2.name && pair1.version <= pair2.version) {
        return true;
    }
    return false;
}


function compareTransactions(transaction1, transaction2) {
    if (transaction1.pulseNumber < transaction2.pulseNumber) {
        return true;
    }
    if (transaction1.pulseNumber > transaction2.pulseNumber) {
        return false;
    }
    var smallerThan=false;
    for (var i in transaction1.output) {
        for (var j in transaction2.input) {
            if (pairSmallerOrEqual(transaction1.output[i], transaction2.input[j])) {
                smallerThan=true;
                return true;
            }
        }
    }
    for (var i in transaction1.input) {
        for (var j in transaction2.output) {
            if (pairSmallerOrEqual(transaction1.input[i], transaction2.output[j])) {
                if(smallerThan) {
                    console.error('incompatible transactions');
                    return;
                }
                return false;s
            }

        }
    }
    if(smallerThan){
        return true;
    }
    if (transaction1.digest < transaction2.digest) {
        return true;
    }
    return false;
}

exports.sortTransactions = function (transactions) {
    for (var i = 0; i < transactions.length - 1; i++) {
        for (var j = i + 1; j < transactions.length; j++) {
            if (compareTransactions(transactions[j], transactions[i])) {
                var tempTransaction = transactions[i];
                transactions[i] = transactions[j];
                transactions[j] = tempTransaction;
            }
        }
    }
}


