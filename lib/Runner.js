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
    var JAVASCRIPT_MODULES = [];
    var WINDOW;

    function log (l) {
        console.log(require("util").inspect(l,{showHidden : false,depth : null}));
    }

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

        static removeComma (tokens) {
            var result = tokens.map( function saveOnlyValues (v) {
                if(v.type !== "operator" && v.value !== ",") return v;
            });
            return result.filter(function removeUndefined (v) {
                return v !== undefined;
            });
        }

        getValue () {
            return this.value;
        }

        getType () {
            return this.type;
        }
    }

    class _Integer extends Value {
        constructor (v = 0) {
            super("integer",v);
        }

        add (source) {
            this.value += source.value;
        }

        sub (source) {
            this.value -= source.value;
        }

        mul (source) {
            this.value *= source.value;
        }

        div (source) {
            this.value = Math.floor(this.value / source.value);
        }

        toString () {
            return new _String(String(this.v));
        }
    }

    class _Float extends Value {
        constructor (v = 0) {
            super("float",v);
        }

        add (source) {
            this.value += source.value;
        }

        sub (source) {
            this.value -= source.value;
        }

        mul (source) {
            this.value *= source.value;
        }

        div (source) {
            this.value /= source.value;
        }

        toString () {
            return new _String(String(this.v));
        }
    }

    class _String extends Value {
        constructor (v = "") {
            super("string",v);
        }

        concat (source) {
            this.value += source.value;
        }

        charAt (point) {
            return new _String(this.v.charAt(point));
        }
    }

    class _Void extends Value {
        constructor() {
            super("void",null);
        }
    }

    class _Array extends Value {

    }

    class _Object extends Value {

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

        callFunc (args,_scope,_callback) {
            args = Func.tokensToArgument(args,_scope);
            switch (this.func_type) {
                case "normal":
                    this.callNormalFunction(args);
                    break;
                case "built-in":
                    args.push(_scope,_callback);
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
                    callee.scope[value.value] = args.shift();
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
            var _value;

            this.is_refernce = false;

            if(value !== undefined) {
                _value = type ? Var.define(value,type) : Var.define_type_inference(value);
            } else if(type !== undefined) {
                _value = Var.define(undefined,type);
            } else _value = new Value();

            this.get = function getValue () {
                return _value;
            };

            this.get_unwrap = function getValueUnwrap () {
                return _value.getValue();
            };

            this.change = function remakeValue (value,type) {
                if(value !== undefined) {
                    _value = type !== undefined ? Var.define(value,type) : Var.define_type_inference(value);
                } else if(type !== undefined) {
                    _value = Var.define(undefined,type);
                } else _value = new _Void();
            };

            this.refernce = function pointVariable (Var) {
                this.is_refernce = true;
                _value = Var;
            };
        }

        static define_type_inference (value) {
            var type = value.constructor;
            if(type === String) {
                return new _String(value);
            } else if(type === Number) {
                return new _Float(value);
            } else return new _Void();
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
                case "void":
                    return new _Void();
                default :
                    throw new RunnerException("unexpected type");
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
                if(tree.hasAttrs(["NAME","ARGS"])) { // 나중에 new Var로 변경
                    let name = tree.options.get("NAME")[0].value;
                    let argument_list = tree.options.get("ARGS");
                    let F = new Func("normal",tree,Value.removeComma(argument_list));
                    tree.addValue(name,F);
                } else throw new RunnerException("FUNC container require Attr [NAME,ARGS]");
                break;
            case "VAR":
                if(tree.hasAttrs(["NAME"])) { // 나중에 new Var로 변경
                    let type = tree.options.get("TYPE");
                    let value = tree.options.get("VALUE");
                    let name = tree.options.get("NAME")[0].value;
                    let variable;
                    if(value !== undefined) {
                        value = value[0];
                        variable = new Var(value.value,type !== undefined ? type[0].value.toLowerCase() : value.type);
                    } else variable = new Var(undefined,type !== undefined ? type[0].value.toLowerCase(): undefined);
                    tree.addValue(name, variable);
                } else throw new RunnerException("VAR container require Attr [NAME]");
                break;
            default :
                let target = tree.scope[tree.type];
                if(target !== undefined) {
                    let InstantFunctionCallback;
                    if(tree.hasAttrs(["CALLBACK"])) InstantFunctionCallback = new Func("normal",tree,[]);
                    target.callFunc(tree.options.get("ARGS"),tree.scope,InstantFunctionCallback);
                    if(InstantFunctionCallback && target.type === "normal") InstantFunctionCallback.callFunc([],tree.scope); // callback
                }
        }
    }

    function loadSourceCode (File) {
        switch (path.parse(File).ext) {
            case ".ttkh" :
                loadTTeokHeaderFile(File);
                break;
            case ".js":
                loadJSModuleFile(File);
                break;
            case ".ttks":
                loadTTeokHeaderFile(File);
                break;
            default :
                throw new RunnerException("unknown dependencies file");
        }
    }

    function loadTTeokHeaderFile(File) {
        GENERATED_TOKENS.push(...LEXER(fs.readFileSync(File,"UTF-8").split("\n")));
    }

    function loadJSModuleFile(File) {
        JAVASCRIPT_MODULES.push(File);
    }

    function setupWINDOW () {
        WINDOW = PARSER(GENERATED_TOKENS);
        setUpJSModule();
    }

    function setUpJSModule () {
        JAVASCRIPT_MODULES.map(function loadJAVASCRIPTS(File) {
            require(File)(WINDOW,Var,Func,RunnerException);
        });
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