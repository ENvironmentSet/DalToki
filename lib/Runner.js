/**
 * Created by environmentset on 17. 10. 5.
 */

var Runner = ( (file) => {
    "use strict";
    var fs = require("fs");
    var Exception = require ('./Exception');
    var GENERATED_TOKENS = require("./lexer")(fs.readFileSync(file,"UTF-8").split("\n"));
    var WINDOW = require("./new_parser")(GENERATED_TOKENS);

    class RunnerException extends Exception {
        constructor (msg) {
            super(msg);
        }

        toString () {
            return `RunnerException : ${this.msg} `;
        };
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
    }

    class _Float extends Value {
        constructor (v) {
            super("Float",v || 0);
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
    }

    class _String extends Value {
        constructor (v) {
            super("String",v.replace(/"/g,"") || "");
        }

        concat (source) {
            this.v += source;
        }

        charAt (point) {
            return new _String(this.v.charAt(point));
        }
    }

    class _Array extends Value {
        constructor (v) {
            super("Array",_Array.tokenToArray(v) || []);
        }

        static tokenToArray(value_tokens) {
            let result = value_tokens.map( function saveOnlyValues (v) {
                let item = Var.define(v.type,v.value);
                if(item.type !== undefined) return item;
            });
            return result.filter(function removeUndefined (v) {
                return v !== undefined;
            });
        }

        static unwrapALLvalues (_array) {
            return _array.map( function saveOnlyValues (v) {
                return v.value;
            });
        }
    }

    //container inside impl
    /*class Func {
        constructor (func_type,scope,inside_containers,args) {
            this.type = "Function";
            this.func_type = func_type; // built-in or normal
            this.inside = inside_containers;
            this.args = args; // [arg1,arg2, ... ]
            this.scope = Object.create(scope);
        }

        static tokensToArgument (tokens) {
            return _Array.tokenToArray(tokens);
        }

        canCallFunction (arglen) {
            return this.args.length === arglen;
        }

        callFunc (args) {
            switch (this.func_type) {
                case "normal":
                    this.callNormalFunction(args);
                    break;
                case "built-in":
                    this.callBuiltInFunction(args);
                    break;
                default :
                    throw new RunnerException("unknown error");
            }
        }

        callNormalFunction (args) {
            this.args.forEach(function setUpArguments (value) {
                this.addValue(value,args.shift());
            });
            for(var i = 0,l = this.inside.length; i < l ; i++) {
                execute_container(this.inside[i]);
            }
            this.initScope();
        }

        callBuiltInFunction () {

        }

        initScope () {
            var iterator = this.scope.keys();
            var item;
            while(!(item = iterator.next()).done) {
                this.scope[item] = undefined;
            }
        }

        addValue (name,value) {
            this.scope[name] = value;
        }
    } */ // function

    class Func {
        constructor (func_type,callee_container,args) {
            this.func_type = func_type; // built-in or normal
            this.callee = callee_container;
            this.args = args; // [arg1,arg2, ... ]
        }

        static tokensToArgument (tokens,scope) {
            let result = tokens.map( function saveOnlyValues (v) {
                let item = Var.define(v.type,v.value);
                if(item.type !== undefined) {
                    return item;
                } else if(v.type === "identifier") {
                    return scope[v.value];
                }
            });
            return result.filter(function removeUndefined (v) {
                return v !== undefined;
            });
        } //식별자 인식

        canCallFunction (arglen) {
            return this.args.length <= arglen;
        }

        callFunc (args,_scope) {
            args = Func.tokensToArgument(args,_scope);
            switch (this.func_type) {
                case "normal":
                    this.callNormalFunction(args);
                    break;
                case "built-in":
                    this.callBuiltInFunction(args);
                    break;
                default :
                    throw new RunnerException("unknown error");
            }
        }

        callNormalFunction (args) {
            if(this.canCallFunction(args.length)) {
                var callee = this.callee;
                this.args.forEach(function setUpArguments (value) {
                    callee.scope[value] = args.shift();
                });
                for(var i = 0,l = callee.childs.length; i < l ; i++) {
                    execute_container(callee.childs[i]);
                }
                callee.initScope();
            }
        }

        callBuiltInFunction (args) {
            if(this.canCallFunction(args.length)) this.callee(...args);
        }
    }

    class Var {
        constructor (value,type) {
            var _value = type ? Var.define(type,value) : Var.define_type_inference(value);

            this.get = function getValue () {
                return _value;
            };

            this.get_unwrap = function getValueUnwrap () {
                if(_value.value !== undefined) return _value.value;
                throw new RunnerException("Can't use undefined variable");
            };
        }

        static define_type_inference (value) {
            switch (typeof value) {
                case "number":
                    return new _Float(value);
                    break;
                case "string":
                    return new _String(value);
                    break;
                default :
                    return new Value();
            }
        }

        static define (type,value) {
            switch (type) {
                case "integer":
                    return new _Integer(value);
                    break;
                case "float":
                    return new _Float(value);
                    break;
                case "string":
                    return new _String(value);
                    break;
                default :
                    return new Value();
            }
        }
    }

    function execute_container (tree) { // 전부 부모 스코프에 들어가게 코딩 요망.
        switch (tree.type) {
            case "MAIN":
                tree.childs.forEach( function executeChilds (v) {
                    execute_container(v);
                });
                break;
            case "FUNC":
                if(tree.hasAttrs(["NAME","ARGS"])) { // 나중에 new Var로 변경
                    let name = tree.options.get("NAME").shift().value;
                    let argument_list = tree.options.get("ARGS");
                    let F = new Func("normal",tree,_Array.unwrapALLvalues(argument_list));
                    tree.addValue(name,F);
                } else throw new RunnerException("FUNC container require Attr [NAME,ARGS]");
                break;
            case "VAR":
                if(tree.hasAttrs(["NAME"])) { // 나중에 new Var로 변경
                    let type = tree.options.get("TYPE");
                    let value = tree.options.get("VALUE");
                    let variable = new Var(type,value);
                    tree.addValue(tree.options.get("NAME").shift().value, variable);
                } else throw new RunnerException("VAR container require Attr [NAME]");
                break;
            case "ARRAY":
                if(tree.hasAttrs(["NAME"])) {
                    let values = tree.options.get("VALUES");
                    let variable = new _Array(values || []);
                    tree.addValue(tree.options.get("NAME").shift().value, variable);
                } else throw new RunnerException("ARRAY container require Attr [NAME]");
                break;
            default :
                let target = tree.scope[tree.type];
                if(target !== undefined) target.callFunc(tree.options.get("ARGS"),tree.scope);
        }
    }

    WINDOW.scope["@PRINT"] = new Func("built-in",print,["string"]);
    function print (string) {
        console.log(new Var(string.value).get_unwrap());
    }

    for(var i = 0 , l = WINDOW.childs.length; i < l; i++) {
        execute_container(WINDOW.childs[i]);
    }
});

module.exports = Runner;