/**
 * Created by environmentset on 17. 10. 5.
 */

var Runner = ( () => {
    "use strict";
    var fs = require("fs");
    var lexer = require("./lexer")(`<ABC></ABC> <MAIN> <ADD dis = \`1,3\` src = \`2\` /> </MAIN>`.split("\n"));
    var parser = require("./parser")(lexer);
    console.log(require("util").inspect(parser,{showHidden : false,depth : null}));
})();

module.exports = Runner;