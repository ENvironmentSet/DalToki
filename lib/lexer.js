var lexer = function lexer (code) {
    "use strict";
    var path = require("path");
    var interpreter_path = process.argv[1];
    var StringBuffer = require(path.join(interpreter_path,"lib","StringBuffer.js"));
    var tokens = [];

    while(code.length != 0) {
        let item = code.shift();
        if(item === "\s") continue;
        if(item.trim().charAt(0) === "#") continue;
        item = new StringBuffer(item);
        item.trim();
        while(item.check()) {
            let token = item.get_token();
            if(token.type != "Nothing") {
                tokens.push(token);
            }
        }
    }
    return tokens;
};

module.exports = lexer;