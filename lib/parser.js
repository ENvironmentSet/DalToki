var parser = function parser (tokens) {
    "use strict";
    var Exception = require ('./Exception');
    var {Tree} = require ('./data_structure');
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

    class Container {
        constructor () {
            this.scope = null;
            this.parent = null;
            this.options = new Map();// option_name = [option_value,]
            this.childs = [];
        }
    }

    class Expression extends Conjunction {
        constructor (expression) {
            super(expression);
        }
    }

    class Conjunction extends Equality {
        constructor (expression) {
            super(expression);
        }
    }

    class Equality extends Relation {
        constructor (expression) {
            super(expression);
        }
    }

    class Relation extends Refernce {
        constructor (expression) {
            super(expression);
        }
    }

    class Refernce extends Addition {
        constructor (expression) {
            super(expression);
        }
    }

    class Addition extends Term{
        constructor (expression) {
            super(expression);
        }
    }

    class Term extends Factor {
        constructor (expression) {
            super(expression);
        }
    }

    class Factor extends Primary {
        constructor (expression) {
            super(expression);
        }
    }

    class Primary {
        constructor (expression) {
            
        }
    }

};

module.exports = parser;