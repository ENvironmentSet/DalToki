/**
 * Created by environmentset on 17. 10. 5.
 */

var Runner = ( () => {
    "use strict";
    var fs = require("fs");
    var path = require("path");
    var interpreter_path = process.argv[1];
    var Exception = require(path.join(interpreter_path,"lib","Exception.js"));
    var LEXER = require(path.join(interpreter_path,"lib","lexer.js"));
    var GENERATED_TOKENS = [];
    var PARSER = require(path.join(interpreter_path,"lib","new_parser.js"));
    var WINDOW;

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
            super("integer",v || 0);
        }

        add (source) {
            this.value += source.value;
        }

        mineus (source) {
            this.value -= source.value;
        }

        mul (source) {
            this.value *= source.value;
        }

        toString () {
            return new _String(String(this.v));
        }
    }

    class _Float extends Value {
        constructor (v) {
            super("float",v || 0);
        }

        add (source) {
            this.value += source.value;
        }

        mineus (source) {
            this.value -= source.value;
        }

        mul (source) {
            this.value *= source.value;
        }

        toString () {
            return new _String(String(this.v));
        }
    }

    class _String extends Value {
        constructor (v) {
            super("string",v.replace(/"/g,"") || "");
        }

        concat (source) {
            this.value += source.value;
        }

        charAt (point) {
            return new _String(this.v.charAt(point));
        }
    }

    class _Array extends Value {
        constructor (v) {
            super("array",_Array.tokenToArray(v) || []);
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

    class Func {
        constructor (func_type,callee_container,args) {
            this.func_type = func_type; // built-in or normal
            this.callee = callee_container;
            this.args = args; // [arg1,arg2, ... ]
        }

        static tokensToArgument (tokens,scope) {
            let result = tokens.map( function saveOnlyValues (v) {
                let item = new Var(v.value,v.type);
                if(item.get().type !== undefined) {
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
            var _value = type ? Var.define(value,type) : Var.define_type_inference(value);

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

        static define (value,type) {
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
                    let value = tree.options.get("VALUE")[0];
                    let variable = new Var(value.value,type ? type.toLowerCase() : value.type);
                    tree.addValue(tree.options.get("NAME").shift().value, variable);
                } else throw new RunnerException("VAR container require Attr [NAME]");
                break;
            default :
                let target = tree.scope[tree.type];
                if(target !== undefined) target.callFunc(tree.options.get("ARGS"),tree.scope);
        }
    }

    function loadSourceCode (File) {
        GENERATED_TOKENS.push(...LEXER(fs.readFileSync(File,"UTF-8").split("\n")));
    }

    function setupWINDOW () {
        WINDOW = PARSER(GENERATED_TOKENS);
        setBuiltInFunctions();
    }

    function setBuiltInFunctions () {
        WINDOW.scope["@PRINT"] = new Func("built-in",print,["string"]);
        function print (string) {
            console.log(string.get_unwrap());
        }
        WINDOW.scope["@ADD"] = new Func("built-in",add,["dis","src"]);
        function add (dis,src) {
            dis = dis.get();
            src = src.get();
            switch (dis.type) {
                case "integer":
                    if(src.type === "integer") {
                        dis.add(src);
                    } else throw new RunnerException("Integer addition is available at only integer type");
                    break;
                case "string":
                    if(src.type === "string") {
                        dis.concat(src);
                    } else throw new RunnerException("String addition is available at only string type");
                    break;
                case "float":
                    if(src.type === "integer" || src.type === "Float") {
                        dis.add(src);
                    } else throw new RunnerException("Float addition is available at only integer and float type");
                    break;
                default :
                    throw new RunnerException("@ADD function's [DIS] arg's type is must integer,string,float");
            }
        }
    }

    function RunProgram () {
        if(GENERATED_TOKENS.length > 0) {
            setupWINDOW();
            for(var i = 0 , l = WINDOW.childs.length; i < l; i++) {
                execute_container(WINDOW.childs[i]);
            }
        } else throw new RunnerException("No WINDOW");
    }

    return {
        "load" : loadSourceCode,
        "execute" : RunProgram
    }
});

module.exports = Runner;