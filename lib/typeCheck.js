/**
 * Created by environmentset on 17. 10. 5.
 */
"use strict";

module.exports.is_digit = (s) => {
    var reg = /[0-9]/;
    return reg.test(s);
};

module.exports.is_Letter = (s) => {
    var reg = /[a-zA-Z_@]/;
    return reg.test(s);
};

module.exports.is_Identifiler = (s) => {
    return module.exports.is_digit(s) | module.exports.is_Letter(s);
};

module.exports.is_blank = (s) => {
    var reg = /\s/;
    return reg.test(s);
};

module.exports.is_operator = (s) => {
    var reg = /\+|-|\/|\*|,|\!|\(|\)|=|\.|<|>|\[|\]/;
    return reg.test(s);
};