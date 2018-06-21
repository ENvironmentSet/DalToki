module.exports = setBuiltInFunctions;

function setBuiltInFunctions (WINDOW,Var,Func,Exception) {
    WINDOW.scope["@PRINT"] = new Func("BUILT-IN",print,["src"]);
    function print (variable,_scope,_callback) {
        if(variable.get().type !== "string") variable = variable.get().toString();
        console.log(variable.get_unwrap());
    }
    WINDOW.scope["@ADD"] = new Func("BUILT-IN",add,["dis","src"]);
    function add (dis,src,_scope,_callback) {
        dis = dis.get();
        src = src.get();
        switch (dis.type) {
            case "INTEGER":
                if(src.type === "INTEGER") {
                    dis.add(src);
                } else throw new RunnerException("Integer addition is available at only integer type");
                break;
            case "STRING":
                if(src.type === "STRING") {
                    dis.concat(src);
                } else throw new RunnerException("String addition is available at only string type");
                break;
            case "FLOAT":
                if(src.type === "INTEGER" || src.type === "FLOAT") {
                    dis.add(src);
                } else throw new RunnerException("Float addition is available at only integer and float type");
                break;
            default :
                throw new RunnerException("@ADD function's [DIS] arg's type is must integer,string,float");
        }
    }
    WINDOW.scope["@SUB"] = new Func("BUILT-IN",sub,["dis","src"]);
    function sub (dis,src,_scope,_callback) {
        dis = dis.get();
        src = src.get();
        switch (dis.type) {
            case "INTEGER":
                if(src.type === "INTEGER") {
                    dis.sub(src);
                } else throw new RunnerException("Integer sub is available at only integer type");
                break;
            case "FLOAT":
                if(src.type === "INTEGER" || src.type === "FLOAT") {
                    dis.sub(src);
                } else throw new RunnerException("Float sub is available at only integer and float type");
                break;
            default :
                throw new RunnerException("@SUB function's [DIS] arg's type is must integer,float");
        }
    }
    WINDOW.scope["@MUL"] = new Func("BUILT-IN",mul,["dis","src"]);
    function mul (dis,src,_scope,_callback) {
        dis = dis.get();
        src = src.get();
        switch (dis.type) {
            case "INTEGER":
                if(src.type === "INTEGER") {
                    dis.mul(src);
                } else throw new RunnerException("Integer sub is available at only integer type");
                break;
            case "FLOAT":
                if(src.type === "INTEGER" || src.type === "FLOAT") {
                    dis.mul(src);
                } else throw new RunnerException("Float sub is available at only integer and float type");
                break;
            default :
                throw new RunnerException("@SUB function's [DIS] arg's type is must integer,float");
        }
    }
    WINDOW.scope["@DEBUG_LOG"] =  new Func("BUILT-IN",debug_log,["src"]);
    function debug_log (item,_scope,_callback) {
        console.log(require("util").inspect(item.get_unwrap(),{showHidden : false,depth : null}));
    }
    WINDOW.scope["@ASSIGNMENT"] = new Func("BUILT-IN",assignment,["dis","src"]);
    function assignment (dis,src,_scope,_callback) {
        src = src.get();
        dis.change(src.value,src.type); // src.value 가 _Element일 경우, 그 참조가 넘어가짐.
    }
}