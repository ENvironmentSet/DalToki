/**
 * Created by environmentset on 17. 10. 5.
 */
var Stringbuffer = ( () => {
    "use strict";
    var path = require("path");
    var interpreter_path = process.argv[1];
    var Exception = require (path.join(interpreter_path,"lib","Exception.js"));
    var type = require (path.join(interpreter_path,"lib","typeCheck.js"));

    class StringBufferException extends Exception {
        constructor (msg,buffer) {
            super(msg);
            this.self = JSON.stringify(buffer) | "No Buffer info";
        }

        toString () {
            return `StringBufferException : ${this.constructor.constructor.toString.call(this)} \n ${this.self}`;
        };
    }

    class StringBuffer {
        constructor (s) { // s = string
            //문자열
            this.s = typeof s==="string" ? s.trim() : "";
            //포인터
            this.ptr = 0;
        }
        //@return boolean is_readAble
        //버퍼가 현재 읽을 수 있는 상태인지 확인합니다.
        check () {
            return this.ptr<=this.s.length-1;
        }
        //@return String
        //포인터를 앞으로 이동시키지 않고 문자열을 가져옵니다.
        ncread () {
            if(!this.check()) throw new StringBuffer("Buffer is empty",this);
            return this.s[this.ptr];
        }
        //@return String
        //문자열을 가져온 뒤에 포인터를 이동시킵니다
        read () {
            if(!this.check()) {
                throw new StringBuffer("Buffer is empty",this);
            }
            return this.s[this.ptr++];
        }
        //@return String
        //공백이 아닌 문자가 나올떄까지 포인터를 이동시킵니다.
        trim () {
            while(this.check()) {
                if(!type.is_blank(this.ncread())) break;
                    this.ptr++;
            }
        }
        //@return String numbers
        //버퍼에서 숫자가 아닌 문자가 나올때까지 문자를 읽고 결과에 따라 Nothing 토큰과 Number 토큰을 반환합니다.
        get_number () {
            this.trim();
            if(!this.check()) {
                throw new StringBufferException("empty Buffer",this);
            } else if (!type.is_digit(this.ncread())) {
                throw new StringBufferException("invalid Number expression",this);
            }

            var result = "";
            while(this.check()) {
                if(!type.is_digit(this.ncread())) break;
                result += this.read();
            }

            if(this.ncread() === ".") {
                result += this.read();
                while(this.check()) {
                    if(!type.is_digit(this.ncread())) break;
                    result += this.read();
                }
                return {type:"FLOAT",value:Number(result)};
            }

            return {type:"INTEGER",value:result<<0};
        }
        //@return String identifier
        //버퍼에서 식별자가 아닌 문자가 나올때까지 문자를 읽고 Nothing 토큰과  identifier 토큰을 반환합니다.
        get_identifier () {
            this.trim();
            if(!this.check()) {
                throw new StringBufferException("empty Buffer",this);
            } else if (!type.is_Identifiler(this.ncread())) {
                throw new StringBufferException("invalid Identifier",this);
            }

            var result = "";
            while(this.check()) {
                if(!type.is_Identifiler(this.ncread())) break;
                result += this.read();
            }

            return {type:"IDENTIFIER",value:result.toUpperCase()};
        }
        //@return string
        //버퍼에서 문자열이 끝날떄까지 문자를 읽고 Nothing 토큰과 string 토큰을 반환합니다.
        get_string () {
            this.trim();
            if(!this.check()) {
                throw new StringBufferException("empty Buffer",this);
            }
            this.read();

            var result = "";
            while(this.check()) {
                if(this.ncread() === "\"") {
                    this.read();
                    break;
                }
                if(this.ncread() === "\\"){
                    this.read();
                    result += this.read();
                } else result += this.read();
            }

            return {type:"STRING",value:result};
        }
        get_option () {
            this.trim();
            if(!this.check()) {
                throw new StringBufferException("empty Buffer",this);
            }

            this.read();
            var result = [];
            var s;
            while(this.check()) {
                this.trim();
                if(this.ncread() !== "\`") {
                    if(!this.check()) throw new StringBufferException("empty buffer",this);
                    s = this.ncread();
                    if(type.is_digit(s)) {
                        result.push(this.get_number());
                    } else if (type.is_Identifiler(s)) {
                        result.push(this.get_identifier());
                    } else if (s === "\"") {
                        result.push(this.get_string());
                    } else if (type.is_operator(s)) {
                        result.push(this.get_operator());
                    } else break;
                } else break;
            }
            this.read();
            return {type:"OPTION",value:result};
        }
        //@return operator
        //버퍼의 포인터가 가르키는 문자가 연산자이면 연산자 토큰을 반환하고, 아니면  Nothing 토큰을 반환합니다.
        get_operator () {
            this.trim();
            if(!this.check()) {
                throw new StringBufferException("empty Buffer",this);
            } else if (!type.is_operator(this.ncread())) {
                throw new StringBufferException("invalid Operator",this);
            }
            return {type:"OPERATOR",value:this.read()};
        }

        get_token () {
            try {
                this.trim();
                if(!this.check()) throw new StringBufferException("empty buffer",this);
                var s = this.ncread();
                if(type.is_digit(s)) {
                    s = this.get_number();
                } else if (type.is_Identifiler(s)) {
                    s = this.get_identifier();
                } else if (s === "\"") {
                    s = this.get_string();
                } else if (s === "\`") {
                    s = this.get_option();
                } else if (s === "<") {
                    s = {type:"CONT_START",value:this.read()};
                } else if (s === ">") {
                    s = {type:"CONT_END",value:this.read()};
                } else if (type.is_operator(s)) {
                    s = this.get_operator();
                } else  s = {type:"NOTHING",value:null};
                return s;
            } catch (e) {
                if(e instanceof Exception) {
                }
                return null;
            }
        }
    }
    return StringBuffer;
})();

module.exports = Stringbuffer;

