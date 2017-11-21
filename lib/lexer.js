var lexer = function lexer (code) {
    var StringBuffer = require("./StringBuffer");
    var tokens = [];

    while(code.length != 0) {
        let item = code.shift();
        if(item === "\s") continue;
        if(item.charAt(0) === "#") continue;
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