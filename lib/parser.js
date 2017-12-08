var parser = function parser (tokens) {
    "use strict";
    var Exception = require ('./Exception');
    var autofill = {
        "const" : true,
        "readonly" : true
    };

    class ParserException extends Exception {
        constructor (msg,token) {
            super(msg);
            this.self = JSON.stringify(token) | "No Token info";
        }

        toString () {
            return `ParserException : ${this.constructor.constructor.toString.call(this)} \n ${this.self}`;
        };
    }

    class Expression {
        constructor (option) {

        }
    }

    class Refernce extends Expression {
        constructor (option) {
            super(option);
        }
    }

    class Addition extends Refernce {
        constructor (option) {
            super(option);
        }
    }

    class Term extends Addition {
        constructor (option) {
            super(option);
        }
    }

    class Factor extends Term {
        constructor (option) {
            super(option);
        }
    }

    class Container {
        constructor (type) {
            this.scope = {};
            this.type = type;
            this.options = new Map();// option_name = [option_value,]
            this.childs = [];
        }

        static load (container) {
            var result;
            if(token().type === "cont_end") {
                advance();
                while(!(result = token_parser.end_container())) {
                    if(token().type === "cont_end") advance();
                    let parse_result = token_parser.container();
                    if(parse_result.type) {
                        container.attachChild(parse_result);
                    } else throw new ParserException("ERROR",parse_result);
                }
            } else {
                while(!(result = token_parser.end_container())) {
                    if(token().type === "cont_end") advance();
                    let parse_result = token_parser.attr();
                    if(parse_result !== false) {
                        container.appendAttr(parse_result);
                    } else if((parse_result = token_parser.container()) !== false) {
                        container.attachChild(parse_result);
                    } else throw new ParserException("ERROR",parse_result);
                }
            }
            return result;
        }

        attachChild (container) {
            container.scope = Object.create(this.scope);
            this.childs.push(container);
        }

        appendAttr (attr) {
            this.options.set(attr.attr_name,attr.attr_value);
        }

        addValue (name,value) {
            this.scope[name] = value;
        }

        initScope () {
            var iterator = this.scope.keys();
            var item;
            while(!(item = iterator.next()).done) {
                this.scope[item] = undefined;
            }
        }

        hasAttrs (attrs) {
            var result = true;
            while(attrs.length && result) {
                if(!this.options.has(attrs.shift())) result = false;
            }
            return result;
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
                        attr_value : this.expression(option.value)
                    }
                } else throw new ParserException("ERROR",option);
            } else {
                let option = autofill[ident];
                return {
                    attr_name : ident.value,
                    attr_value : option ? option : null
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
                        advance();
                        return type;
                    } else throw new ParserException("ERROR",type);
                } else {
                    i--;
                    return false;
                }
            } else if(start.type === "operator" && start.value === "/") {
                advance();
                let end_cont = token();
                if(end_cont.type === "cont_end") {
                    advance();
                    return end_cont;
                } else {
                    i--;
                    return false;
                }
            } else return false;
        }
        static expression (option) {
            return option;
            //return new Factor(option);
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

    var tl = tokens.length-1;
    var window = new Container("WINDOW");

    while(i < tl) {
       window.attachChild(token_parser.container());
       tokens = tokens.slice(i+1);
       tl = tokens.length-1;
       i = 0;
    }
    return window;
};

module.exports = parser;