/**
 * Created by environmentset on 17. 10. 5.
 */

var Runner = ( () => {
    var fs = require("fs");
    var lexer = require("./lexer")("<main> \n <impl define = 'a'> \n <Print arg = \'\"Hello,world\"\' /> \n  a = 3 \n </impl> \n </main>".split("\n"));
    console.log(lexer)
    var parser = require("./parser")(lexer);
})();

module.exports = Runner;