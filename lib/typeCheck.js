/**
 * Created by environmentset on 17. 10. 5.
 */
//@param String [s]
///@return boolean is_digit
module.exports.is_digit = (s) => {
    var reg = /[0-9]/;
    return reg.test(s);
};

//@param String [s]
///@return boolean is_alphabet
module.exports.is_Identifiler = (s) => {
    var reg = /[a-zA-Z_#@]/;
    return reg.test(s);
};

//@param String [s]
///@return boolean is_blank
module.exports.is_blank = (s) => {
    var reg = / |\t/;
    return reg.test(s);
};

//@param String [s]
///@return boolean is_operator
module.exports.is_operator = (s) => {
    var reg = /\+|-|\/|\*|,|\!|\(|\)|=|{|}|./;
    return reg.test(s);
};