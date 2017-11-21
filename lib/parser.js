var parser = function parser (tokens) {
    var tree = [];
    var Exception = require ('./Exception');

    class StringBufferException extends Exception {
        constructor (msg,token) {
            super(msg);
            this.self = JSON.stringify(token) | "No Token info";
        }

        toString () {
            return `ParserException : ${this.constructor.constructor.toString.call(this)} \n ${this.self}`;
        };
    }

    class node {
        constructor () {
            this.type = null;
            this.attribute = {};
            this.scope = {};
            this.parent_scope = null;
            this.childs = [];
        }

        set_type (type) {
            this.type = type;
        }

        set_attribute (name,value) {
            this.attribute[name] = value;
        }

        add_scope (item,value) {
            this.scope[item] = value;
        }

        add_child (element) {
            element.parent_scope = this;
            this.childs.push(element);
        }
    }

    class expression {
        constructor () {
            this.left = null;
            this.right = null;
            this.operator = null;
            this.scope = {};
            this.parent_scope = null;
        }

        set_left (item) {
            this.left = item;
        }

        set_right (item) {
            this.right = item;
        }

        set_operator (item) {
            this.operator = item;
        }

        add_scope (item,value) {
            this.scope[item] = value;
        }
    }

    /*while(tokens.length) {
        let token = tokens.shift();
        let element = null;

        if(element === null) {
            if(token.type === "cont_start") {
                let attrs = [];

                while ((token = tokens.shift()) && (token.type !== "cont_end" && token.type !== "end-cont_end")) {
                    attrs.push(token);
                }
                element = new node();
                element.set_type(attrs.shift());
                while (attrs.length) {
                    let item = attrs.shift();
                    if (attrs.length >= 2 && attrs[0].value === "" && attrs[1].type === "option") {
                        attrs.shift();
                        element.set_attribute(item.value, attrs.shift().value);
                    } else {
                        element.set_attribute(item.value, null);
                    }
                }
            }
        } else {
            if(token.type === "end-cont_start" || token.type === "end-cont_start") {
                tokens.shift();
                tokens.shift();
                tree.push(element);
                element = null;
            } else {
                let exp = new expression();
                exp.set_left(token);
                exp.set_right(tokens.shift());
                exp.set_operator(tokens.shift());
                element.add_child(exp);
            }
        }
    }*/

    while(tokens.length) {
        let token = tokens.shift();
        let element;

    }

};

module.exports = parser;