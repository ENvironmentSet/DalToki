/**
 * Created by environmentset on 17. 10. 5.
 */

var Runner = ( () => {
    "use strict";
    var fs = require("fs");
    var lexer = require("./lexer")(`<MAIN> \n <@Print args=\`\"hi\"\` /> \n </MAIN>`.split("\n"));
    console.log(lexer);
    var parser = require("./parser")(lexer);
})();

module.exports = Runner;