var parser = function parser (tokens) {
    "use strict";
    var Exception = require ('./Exception');
    var {Tree} = require ('./data_structure');
    var autofill = {
        "const" : true,
        "readonly" : true
    };
    var parse_tree = [];

    class ParserException extends Exception {
        constructor (msg,token) {
            super(msg);
            this.self = JSON.stringify(token) | "No Token info";
        }

        toString () {
            return `ParserException : ${this.constructor.constructor.toString.call(this)} \n ${this.self}`;
        };
    }

    class Primary {
        constructor (expression) {

        }
    }

    class Factor extends Primary {
        constructor (expression) {
            super(expression);
        }
    }

    class Term extends Factor {
        constructor (expression) {
            super(expression);
        }
    }

    class Addition extends Term{
        constructor (expression) {
            super(expression);
        }
    }

    class Refernce extends Addition {
        constructor (expression) {
            super(expression);
        }
    }

    class Relation extends Refernce {
        constructor (expression) {
            super(expression);
        }
    }

    class Equality extends Relation {
        constructor (expression) {
            super(expression);
        }
    }

    class Conjunction extends Equality {
        constructor (expression) {
            super(expression);
        }
    }

    class Expression extends Conjunction {
        constructor (expression) {
            super(expression);
        }
    }

    class Container {
        constructor (type) {
            this.scope = new Map();
            this.type = type;
            this.parent_scope = null;
            this.options = new Map();// option_name = [option_value,]
            this.childs = [];
        }

        static load (container) {
            var result;
            if(token().type === "cont_end") {
                advance();
                while(!(result = token_parser.end_container())) {
                    let parse_result = token_parser.container();
                    if(parse_result.type) {
                        container.attachChild(parse_result);
                    } else throw new ParserException("ERROR",parse_result);
                }
            } else {
                while(!(result = token_parser.end_container())) {
                    let parse_result = token_parser.attr();
                    if(parse_result !== false) {
                        container.appendAttr(parse_result);
                    } else if(parse_result = token_parser.container() !== false) {
                        container.attachChild(parse_result);
                    } else throw new ParserException("ERROR",parse_result);
                }
            }
            return result;
        }

        attachChild (container) {
            container.parent_scope = this;
            this.childs.push(container);
        }

        appendAttr (attr) {
            this.options.set(attr.attr_name,attr.attr_value);
        }
    }

    class token_parser {
        static attr () {
            var ident = token();
            if(ident.type !== "identifier") return false;
            advance();
            var operator = token();
            if(operator.type === "operator" && operator.value === "=") {
                advance();
                let option = advance();
                if(option.type === "option") {
                    return {
                        attr_name : ident.value,
                        attr_value : option.value
                    }
                } else throw new ParserException("ERROR",option);
            } else {
                let option;
                if(ident in autofill) option = autofill[ident];
                return {
                    attr_name : ident.value,
                    attr_value : option ? option.value : null
                }
            }
        }
        static container () {
            var start = token();
            if(start.type === "cont_start") {
                advance();
                let type = token();
                if(type.type === "identifier") {
                    advance();
                    let new_cont = new Container(type.value);
                    Container.load(new_cont); // attr and child load and take end tag
                    return new_cont;
                } else throw new ParserException("ERROR",type);
            } else return false;
        }
        static end_container () {
            var start = token();
            if(start.type === "cont_start") {
                advance();
                let end_op = token();
                if(end_op.type === "operator" && end_op.value === "/") {
                    advance();
                    let type = token();
                    if(type.type === "identifier") {
                        return type;
                    }
                    throw new ParserException("ERROR",type);
                }
                i--;
                return false;
            } else if(start.type === "operator" && start.value === "/") {
                advance();
                let type = token();
                if(type.type === "identifier") {
                    advance();
                    return type;
                } else if(type.type === "cont_end") {
                    advance();
                    return type;
                }
                i--;
                return false;
            } else return false;
        }
    }

    function token () {
        return tokens[i];
    }

    var i = 0;
    function advance () {
        var result = token();
        i++;
        return result;
    }

    var tl = tokens.length;
    while(i < tl) {
        var resul = token_parser.container();
        console.log(require("util").inspect(resul,{showHidden : false,depth : null}));
    }
};

module.exports = parser;