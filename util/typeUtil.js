'use strict';
var type = function(o) {
    var s = Object.prototype.toString.call(o);
    return s.match(/\[object (.*?)\]/)[1].toLowerCase();
};

[
    'Null',
    'Undefined',
    'Object',
    'Array',
    'String',
    'Number',
    'Boolean',
    'Function',
    'RegExp',
    'NaN',
    'Infinite'
].forEach(function(t) {
    let methodName = 'is' + t;
    module.exports[methodName] = function (o) {
        return type(o) === t.toLowerCase();
    };
});

module.exports.getType = type;
