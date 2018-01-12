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
    class Value { // t : integer,string,array,object [undefined는 접근 불가]
        constructor(value = null,type = "VOID") {
            this.type = type;
            this.value = value;
        }

        static removeComma (tokens) {
            var result = tokens.map( function saveOnlyValues (v) {
                if(v.type !== "OPERATOR" && v.value !== ",") return v;
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

        toString () {
            return new Var(String(this.value),"STRING");
        }
    }

    class _Integer extends Value {
        constructor (value = 0) {
            super(value,"INTEGER");
        }

        add (source) {
            return this.value += source.value;
        }

        sub (source) {
            return this.value -= source.value;
        }

        mul (source) {
            return this.value *= source.value;
        }

        div (source) {
            return this.value = Math.floor(this.value / source.value);
        }
    }

    class _Float extends Value {
        constructor (value = 0) {
            super(value,"FLOAT");
        }

        add (source) {
            return this.value += source.value;
        }

        sub (source) {
            return this.value -= source.value;
        }

        mul (source) {
            return this.value *= source.value;
        }

        div (source) {
            return this.value /= source.value;
        }
    }

    class _String extends Value {
        constructor (value = "") {
            super(value,"STRING");
        }

        concat (source) {
            return this.value += source.value;
        }

        charAt (point) {
            return new _String(this.v.charAt(point));
        }
    }

    class _Void extends Value {
        constructor() {
            super(null,"VOID");
        }

        toString () {
            return new Var("VOID","STRING");
        }
    }

    class _Array extends Value {
        constructor (values) {
            super(values,"ARRAY");
        }

        static tokekToLinkedList (tokens) {
            var result = null;
            var context = null;
            tokens = Value.removeComma(tokens);
            for (let token of tokens) {
                if(result === null) context = result = new _Element(token.value,token.type);
                else context = context.attach(new _Element(token.value,token.type));
            }
            return result;
        }

        toString () { // 수정요함
            var result = "[";
            var context = this.value;
            while(context != null) {
                result += `${context.get().get().toString().get_unwrap()} ,`;
                context = context.getNext();
            }
            result += "]";
            return new Var(result,"STRING");
        }
    }

    class _Element {
        constructor (value,type) {
            var _variable = new Var(value,type);
            var _next = null;

            this.get = function getter () {
                return _variable;
            };

            this.set = function setter (value,type) {
                return _variable.change(value,type);
            };

            this.refernce = function refToVariable (variable) {
                return _variable.refernce(variable);
            };

            this.remove = function remove () {
                if(_next !== null) {
                    _next.remove();
                    _next = null;
                }
                return this;
            };

            this.attach = function attach (element) {
                if(_next !== null) this.remove();
                return _next = element;
            };

            this.getNext = function next() {
                return _next;
            };
        }
    }

    class Func {
        constructor (func_type,callee_container,args) {
            this.func_type = func_type; // BUILT-IN or NORMAL
            this.callee = callee_container;
            this.args = args; // [arg1,arg2, ... ]
        }

        static tokensToArgument (tokens,scope) {
            let result = tokens.map( function saveOnlyValues (token) {
                let item = scope[token.value];
                if(token.type !== "IDENTIFIER" && item === undefined) {
                    item = new Var(token.value,token.type);
                }
                return item;
            });
            return result;
        } //식별자 인식

        canCallFunction (arglen) {
            return this.args.length <= arglen;
        }

        callFunc (args,_scope,_callback) {
            args = Func.tokensToArgument(args,_scope);
            switch (this.func_type) {
                case "NORMAL":
                    this.callNormalFunction(args);
                    break;
                case "BUILT-IN":
                    args.push(_scope,_callback); //args.push(Object.create(_scope),_callback);
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
            } else throw new RunnerException("Not enough parameter to call Func");
        }

        callBuiltInFunction (args) {
            if(this.canCallFunction(args.length)) this.callee(...args);
        }
    }

    class Var { // 배열 관련 작업 필요
        constructor (value,type) {
            var _value;

            this.is_refernce = false;

            if(value !== undefined) {
                _value = type ? Var.define(value,type) : Var.define_type_inference(value);
            } else if(type !== undefined) {
                _value = Var.define(undefined,type);
            } else _value = new Value();

            this.get = function getValue () {
                if(!this.is_refernce) return _value;
                return _value.get();
            };

            this.get_unwrap = function getValueUnwrap () {
                if(!this.is_refernce) return _value.getValue();
                return _value.get_unwrap();
            };

            this.change = function remakeValue (value,type) {
                if(value !== undefined) {
                    _value = type !== undefined ? Var.define(value,type) : Var.define_type_inference(value);
                } else if(type !== undefined) {
                    _value = Var.define(undefined,type);
                } else _value = new _Void();
                return _value;
            };

            this.refernce = function pointVariable (Var) {
                this.is_refernce = true;
                return _value = Var;
            };
        }

        static define_type_inference (value) {
            var type = value.constructor;
            if(type === String) {
                return new _String(value);
            } else if(type === Number) {
                return new _Float(value);
            } else if (type === _Element) {
                return new _Array(value);
            } else if (type === Array) {
                return new _Array(_Array.tokekToLinkedList(value));
            }else return new _Void();
        }

        static define (value,type) {
            switch (type) {
                case "INTEGER":
                    return new _Integer(value);
                    break;
                case "FLOAT":
                    return new _Float(value);
                    break;
                case "STRING":
                    return new _String(value);
                    break;
                case "VOID":
                    return new _Void();
                    break;
                case "ARRAY":
                    if(value.constructor === _Element) return new _Array(value);
                    return new _Array(_Array.tokekToLinkedList(value));
                    break;
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
                    let F = new Func("NORMAL",tree,Value.removeComma(argument_list));
                    tree.addValue(name,F);
                } else throw new RunnerException("FUNC container require Attr [NAME,ARGS]");
                break;
            case "VAR":
                if(tree.hasAttrs(["NAME"])) {
                    let type = tree.options.get("TYPE");
                    let value = tree.options.get("VALUE");
                    let name = tree.options.get("NAME")[0].value;
                    let variable;
                    if(value !== undefined) {
                        if(value.length === 1) {
                            value = value[0];
                            variable = new Var(value.value,type !== undefined ? type[0].value : value.type);
                        } else {
                            variable = new Var(value,"ARRAY");
                        }
                    } else variable = new Var(undefined,type !== undefined ? type[0].value : undefined);
                    tree.addValue(name, variable);
                } else throw new RunnerException("VAR container require Attr [NAME]");
                break;
            case "ARRAY":
                if(tree.hasAttrs(["NAME"])) {
                    let values = tree.options.get("VALUES");
                    let name = tree.options.get("NAME")[0].value;
                    let array = new Var(values,"ARRAY");
                    tree.addValue(name, array);
                } else throw new RunnerException("VAR container require Attr [NAME]");
                break;
            default :
                let target = tree.scope[tree.type];
                if(target !== undefined) {
                    let InstantFunctionCallback = null;
                    if(tree.hasAttrs(["CALLBACK"]) && tree.options.get("CALLBACK") == true) InstantFunctionCallback = new Func("NORMAL",tree,[]);
                    target.callFunc(tree.options.get("ARGS"),tree.scope,InstantFunctionCallback);
                    if(InstantFunctionCallback !== null && target.func_type === "NORMAL") InstantFunctionCallback.callFunc([],tree.scope); // callback
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