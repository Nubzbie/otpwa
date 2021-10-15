function checkPromises(promise){
    if (promise.isFulfilled) return promise

    var isRejected = false
    var isPending = true
    var isFulfilled = false

    var result = promise.then(
        function(v) {
            isFulfilled = true
            isPending = false
            return v
        },
        function(e) {
            isRejected = true
            isPending = false
            throw e
        }
    )

    //Object.assign(result, { isRejected, isPending, isFulfilled })

    result['isRejected'] = function() { return isRejected; }
    result['isPending'] = function() { return isPending; }
    result['isFulfilled'] = function() { return isFulfilled; }
    return result
}


const cek = n => {
    return new Promise((resolve, reject) => {
        //if (!n) reject('fill is not empty!')
        resolve('sip')
    })
}


const test = checkPromises(cek(''))


test.then(v => console.log(v.isRejected))
