module.exports = setBuiltInFunctions;

function setBuiltInFunctions (WINDOW,Var,Func,Exception) {
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
    WINDOW.scope["@SUB"] = new Func("built-in",sub,["dis","src"]);
    function sub (dis,src) {
        dis = dis.get();
        src = src.get();
        switch (dis.type) {
            case "integer":
                if(src.type === "integer") {
                    dis.sub(src);
                } else throw new RunnerException("Integer sub is available at only integer type");
                break;
            case "float":
                if(src.type === "integer" || src.type === "Float") {
                    dis.sub(src);
                } else throw new RunnerException("Float sub is available at only integer and float type");
                break;
            default :
                throw new RunnerException("@SUB function's [DIS] arg's type is must integer,float");
        }
    }
    WINDOW.scope["@INDEXING"] = new Func("built-in",array_indexing,["dis","array","index"]);
    function array_indexing(dis,array,index) {
        if(array.type !== "array") new Exception("only array allow indexing");
        if(index.type !== "integer") new Exception("only integer can be index");
        if(dis.constructor !== Var) new Exception("destination is not a variable");
        dis.change(array.read(index.get_unwrap()).get_unwrap());
    }
    WINDOW.scope["@SETVALUE"] = new Func("built-in",array_setValue,["array","index","value"]);
    function array_setValue(array,index,value) {
        if(array.type !== "array") new Exception("only array allow indexing");
        if(index.type !== "integer") new Exception("only integer can be index");
        if(value.constructor !== Var) new Exception("destination is not a variable");
        array.set(index.get_unwrap(),value);
    }
    WINDOW.scope["@READPROP"] = new Func("built-in",object_readProp,["dis","object","key"]);
    function object_readProp(dis,object,key) {
        if(object.type !== "object") new Exception("only object allow property-reading");
        if(key.type !== "string") new Exception("only string can be index");
        if(dis.constructor !== Var) new Exception("destination is not a variable");
        dis.change(object.read(key.get_unwrap()).get_unwrap());
    }
    WINDOW.scope["@SETPROP"] = new Func("built-in",object_setProp,["object","key","value"]);
    function object_setProp(object,key,value) {
        if(object.type !== "object") new Exception("only object allow property-reading");
        if(key.type !== "string") new Exception("only string can be index");
        object.read(key.get_unwrap()).change(value.get_unwrap());
    }
    WINDOW.scope["@DEBUG_LOG"] =  new Func("built-in",debug_log,["item"]);
    function debug_log (item) {
        console.log(require("util").inspect(item.get_unwrap(),{showHidden : false,depth : null}));
    }
}