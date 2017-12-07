/**
 * Created by environmentset on 17. 10. 5.
 */

var Runner = ( (file) => {
    "use strict";
    var fs = require("fs");
    var Exception = require ('./Exception');
    var GENERATED_TOKENS = require("./lexer")(fs.readFileSync(file,"UTF-8").split("\n"));
    var WINDOW = require("./parser")(GENERATED_TOKENS);

    class RunnerException extends Exception {
        constructor (msg) {
            super(msg);
        }

        toString () {
            return `RunnerException : ${this.msg} `;
        };
    }

    var BUILT_IN = {
      "@PRINT" : function print (string) {
          console.log(new Var(string.value).get_unwrap());
      }
    };

    function log (obj) { // for debug
        console.log(require("util").inspect(obj,{showHidden : false,depth : null}));
    }

    //types
    class Value { // t : integer,string,array,boolean [undefined는 접근 불가]
        constructor(t = undefined,v = undefined) {
            this.type = t;
            this.value = v;
        }
    }

    class _Integer extends Value {
        constructor (v) {
            super("Integer",v || 0);
        }

        add (source) {
            this.v += source.v;
        }

        mineus (source) {
            this.v -= source.v;
        }

        mul (source) {
            this.v *= source.v;
        }

        toString () {
            return new _String(String(this.v));
        }

        toBoolean () {
            return new Boolean(this.v > 0 ? true : false);
        }
    }

    class _String extends Value {
        constructor (v) {
            super("String",v.slice(1,v.length-1) || "");
        }

        concat (source) {
            this.v += source;
        }

        charAt (point) {
            return new _String(this.v.charAt(point));
        }

        toBoolean () {
            return new Boolean(this.v.length > 0 ? true : false);
        }
    }

    class _Boolean extends Value {
        constructor (v) {
            super("Boolean",v || false);
        }

        toInteger () {
            return new _Integer(this.v ? 1 : 0);
        }
    }

    //container inside impl
    class Func {
        constructor (inside_containers,args) {
            this.inside = inside_containers;
            this.args = args; // [arg1,arg2, ... ]
        }

        static call (callee_container,args) {
            callee_container.args.forEach(function setUpArguments (value) {
                callee_container.addValue(value,args.shift());
            });
            for(var i = 0,l = callee_container.inside.length; i < l ; i++) {
                execute_container(callee_container.inside[i]);
            }
            callee_container.initScope();
        }

        static builtin_call (callee_name,args) {
            BUILT_IN[callee_name](...args);
        }
    }

    class Var {
        constructor (value,type) {
            var _value = type ? Var.define(type,value) : Var.define_type_inference(value);

            this.get = function getValue () {
                return _value;
            };

            this.get_unwrap = function getValueUnwrap () {
                return _value.value;
            };
        }

        static define_type_inference (value) {
            switch (typeof value) {
                case "number":
                    return new _Integer(value);
                    break;
                case "string":
                    return new _String(value);
                    break;
                case "boolean" :
                    return new _Boolean(value);
                    break;
                default :
                    return new Value();
            }
        }

        static define (type,value) {
            switch (type) {
                case "number":
                    return new _Integer(value);
                    break;
                case "string":
                    return new _String(value);
                    break;
                case "boolean" :
                    return new _Boolean(value);
                    break;
                default :
                    return new Value();
            }
        }
    }

    function execute_container (tree) {
        switch (tree.type) {
            case "MAIN":
                tree.childs.forEach( function executeChilds (v) {
                    execute_container(v);
            });
                break;
            case "FUNC":
                break;
            case "VAR":
                break;
            default :
                if(tree.scope.__proto__[tree.type]) {

                } else if(tree.type in BUILT_IN) {
                    Func.builtin_call(tree.type,tree.options.get("ARGS"));
                }
        }
    }
    for(var i = 0 , l = WINDOW.childs.length; i < l; i++) {
        execute_container(WINDOW.childs[i]);
    }

});

module.exports = Runner;