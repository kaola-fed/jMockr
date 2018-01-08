'use strict'

function type(o) {
    const s = Object.prototype.toString.call(o)
    return s.match(/\[object (.*?)\]/)[1].toLowerCase()
}

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
    'Infinite',
].forEach(function(t) {
    const methodName = 'is' + t
    module.exports[methodName] = function(o) {
        return type(o) === t.toLowerCase()
    }
})

module.exports.getType = type
