module.exports = setBuiltInHttpFunctions;
var http = require('http');
function setBuiltInHttpFunctions (WINDOW,Var,Func,Exception) {
    WINDOW.scope["@CREATE_HTTP"] = new Func("built-in",createHttpObject,["dis"]);
    function createHttpObject (dis,_scope) {
        if(dis.constructor !== Var) new Exception("destination is not a variable");
        dis.change([
            [{ type: 'identifier', value: 'PORT' },{ type: 'identifier', value: 'HEADER' },{ type: 'identifier', value: 'RESULT' },{ type: 'identifier', value: 'HOSTNAME' },{ type: 'identifier', value: 'PATH' }],
            [{ type: 'integer', value: 80 },{ type: 'object', value: undefined },{ type: 'string', value: "" },{ type: 'string', value: '127.0.0.1' },{ type: 'string', value: '/' }]]
            ,"object");
    }
    WINDOW.scope["@SEND_HTTP_REQUEST"] = new Func("built-in",sendHttpRequest,["src"]);
    function sendHttpRequest (src,_scope,callback) {
        if(src.constructor !== Var) new Exception("source is not a variable");
        src = src.get();
        var options = {
            hostname: src.read("HOSTNAME").get_unwrap(),
            port: src.read("PORT").get_unwrap(),
            path: src.read("PATH").get_unwrap(), //Header 은 아직 미지원
        };
        function handleResponse(response) {
            var serverData = '';
            response.on('data', function (chunk) {
                serverData += chunk;
            });
            response.on('end', function () {
                src.read("RESULT").change(serverData,"string");
                callback.callFunc([],_scope);
            });
        }
        http.request(options, function(response){
            handleResponse(response);
        }).on('error' , (e) => {
            src.read("RESULT").change("ERROR : "+e,"string");
            callback.callFunc([],_scope);
        }).end();
    }
}