var parser = function parser (tokens) {
    "use strict";
    var path = require("path");
    var interpreter_path = process.argv[1];
    var Exception = require(path.join(interpreter_path,"lib","Exception.js"));
    var autofill = {
        "const" : true,
        "readonly" : true,
        "CALLBACK" : 0
    };

    function log (l) {
        console.log(require("util").inspect(l,{showHidden : false,depth : null}));
    }

    class ParserException extends Exception {
        constructor (msg,token) {
            super(msg);
            this.self = JSON.stringify(token) | "No Token info";
        }

        toString () {
            return `ParserException : ${this.constructor.constructor.toString.call(this)} \n ${this.self}`;
        };
    }

    class Option extends Map{
        constructor(iterator) {
            super(iterator);
        }
    }

    class Container {
        constructor (type) {
            if(WINDOW) {
                this.scope = {};
                this.scope.__proto__ = WINDOW.scope;
            } else {
                this.scope = {};
            }
            this.type = type;
            this.options = new Option();// option_name = [option_value,]
            this.childs = [];
        }

        static loadChild (container) { // load Attr and childs
            while(!token_parser.end_container()){
                let cont = token_parser.container();
                if(cont !== false) {
                    container.attachChild(cont);
                } else {
                    throw new ParserException("unexpected token", token());
                }
            }
        }

        static loadAttr (container) {
            var next;
            while(!((next = token()).type === "cont_end" || (next.type === "operator" && next.value === "/"))){
                let attr = token_parser.attr();
                if(attr !== false) {
                    container.options.set(attr.attr,attr.value);
                } else throw new ParserException("Not enough tokens for attr",next);
            }
        }

        attachChild (container) {
            container.scope.__proto__ = this.scope;
            this.childs.push(container);
        }

        appendAttr (attr) {
            this.options.set(attr.attr_name,attr.attr_value);
        }

        addValue (name,value) {
            this.scope.__proto__[name] = value;
        }

        initScope () {
            var iterator = Object.keys(this.scope);
            while(iterator.length) {
                this.scope[iterator.shift()] = {"type":undefined,"value":undefined};
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
            var tok = token();
            if(tok.type === "identifier") {
                let result_attr = { "attr" : tok.value };
                advance();
                tok = token();
                if(tok.type === "operator" && tok.value === "=") {
                    advance();
                    tok = token();
                    if(tok.type === "option") {
                        advance();
                        result_attr.value = this.expression(tok.value);
                    }
                } else {
                    result_attr.value = autofill[result_attr.attr];
                }

                return result_attr;
            }
            return false;
        }
        static container () {
            var tok = token();
            if(tok.type === "cont_start") {
                advance();
                tok = token();
                if(tok.type === "identifier") {
                    advance();
                    let new_container = new Container(tok.value);
                    Container.loadAttr(new_container);
                    if(token_parser.end_container()) {
                        return new_container;
                    } else {
                        advance();
                        Container.loadChild(new_container);
                        return new_container;
                    }
                } else recover();
            } else return false;
        }
        static end_container () {
            var tok = token();
            if(tok.type === "cont_start") { // </[ident]>
                advance();
                tok = tok.value + token().value;
                if(tok === "</" && token().type === "operator"){
                    advance();
                    tok = token();
                    if(tok.type === "identifier") {
                        advance();
                        advance();
                        return true;
                    } else throw new ParserException("No identifier for end_container",tok);
                } else recover();
            } else if (tok.type === "operator" && tok.value === "/") {// />
                advance();
                tok = tok.value + token().value;
                if(tok === "/>"){
                    advance();
                    return true;
                } else recover();
            }
            return false;
        }
        static expression (option) {
            /*var result = [];
            var chache = [];
            option.forEach( function splitComma (v,i,arr) {
                if(v.type === "operator" && v.value === ",") {
                    result.push(chache);
                    chache = [];
                } else chache.push(v);
                if(i === arr.length -1) result.push(chache);
            });
            chache = result;
            result = [];
            chache.forEach( function toFormulaTree (v) {
                result.push(new Expression(v));
            });
            return result;
            //return new Factor(option);*/
            return option;
        }
    }

    function token () {
        return tokens[i];
    }

    function advance () {
        var result = token();
        i++;
        return result;
    }

    function recover () {
        i--;
    }

    var i = 0;
    var tl = tokens.length-1;
    var WINDOW = new Container("WINDOW");

    while(i < tl) {
        WINDOW.attachChild(token_parser.container());
    }
    return WINDOW;
};

module.exports = parser;