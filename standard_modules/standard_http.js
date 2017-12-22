module.exports = setBuiltInHttpFunctions;

function setBuiltInHttpFunctions (WINDOW,Var,Func,Exception) {
    WINDOW.scope["@CREATEHTTP"] = new Func("built-in",createHttpObject,["dis"]);
    function createHttpObject (dis) {
        if(dis.constructor !== Var) new Exception("destination is not a variable");
        dis.change([
            [{ type: 'identifier', value: 'PORT' },{ type: 'identifier', value: 'HEADER' },{ type: 'identifier', value: 'RESULT' }],
            [{ type: 'integer', value: 80 },{ type: 'object', value: undefined },{ type: 'object', value: undefined }]]
            ,"object");
    }
}