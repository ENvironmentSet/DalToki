/**
 * Created by environmentset on 17. 10. 5.
 */
class Exception {
    constructor (msg) {
        this.msg = msg;
    }

    toString ()  {
        return this.msg;
    }

    log () {
        console.log("Exception on created \n"+this.toString());
    }
}

module.exports = Exception;