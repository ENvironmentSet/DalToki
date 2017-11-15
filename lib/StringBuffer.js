/**
 * Created by environmentset on 17. 10. 5.
 */
var Stringbuffer = ( () => {
    //예외 처리 생성자 함수 로드
    var Exception = require ('./Exception.js');
    //문자열이 그 문법의 형식에 맞는지 체크하기 위한 모듈 로딩
    var type = require ('./typeCheck.js');

    /*
    * @param
    * String [name],String [msg],Object StringBuffer [buffer]
    * @return Object StringBufferException
    * 버퍼 예외 출력.
    * */
    class StringBufferException extends Exception {
        constructor (msg,buffer) {
            super(msg);
            this.self = JSON.stringify(buffer) | "No Buffer info";
        }

        toString () {
            return `StringBufferException : ${this.constructor.constructor.toString.call(this)} \n ${this.self}`;
        };
    }
    /*
    * @param
    * String [s]
    * @return
    * Object StringBuffer
    * 문자열을 파라미터로 받으며 , 받은 문자열을 한 글자씩 읽을 수 있게 Generator 객체를 만들어준다. (function* 쓰란말이야아아악)
    * */

    class StringBuffer {
        constructor (s) { // s = string
            //문자열
            this.s = typeof s==="string" ? s : "";
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

            return {type:"number",value:result};
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

            return {type:"identifier",value:result};
        }
        //@return string
        //버퍼에서 문자열이 끝날떄까지 문자를 읽고 Nothing 토큰과 string 토큰을 반환합니다.
        get_string () {
            this.trim();
            if(!this.check()) {
                throw new StringBufferException("empty Buffer",this);
            }

            var result = this.read(); // \"
            while(this.check()) {
                if(this.ncread() === "\"") {
                    result += this.read();
                    break;
                }
                result += this.read();
            }

            return {type:"string",value:result};
        }
        get_option () {
            this.trim();
            if(!this.check()) {
                throw new StringBufferException("empty Buffer",this);
            }

            var result = this.read(); // \'
            while(this.check()) {
                if(this.ncread() === "\'") {
                    result += this.read();
                    break;
                }
                result += this.read();
            }

            return {type:"option",value:result};
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

            return {type:"operator",value:this.read()};
        }
        //@return String token
        // 공백은 무시하고 다음 문자열이 메모리 연산,숫자,식별자,문자열,연산자인지 확인하고 맞으면 그 형식을 읽어들이는 메서드를 통해 읽은 다음 반환합니다.
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
                } else if (s === "\'") {
                    s = this.get_option();
                } else if (type.is_operator(s)) {
                    s = this.get_operator();
                } else if (s === "<") {
                    if((s+this.s[this.ptr+1]) === "</") {
                        s = {type:"end-cont_start",value:this.read()+this.read()};
                    } else {
                        s = {type:"cont_start",value:this.read()};
                    }
                } else if (s === ">") {
                    if((s+this.s[this.ptr+1]) === "/>") {
                        s = {type:"end-cont_end",value:this.read()+this.read()};
                    } else {
                        s = {type:"cont_end",value:this.read()};
                    }
                } else s = {type:"Nothing",value:null};

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
