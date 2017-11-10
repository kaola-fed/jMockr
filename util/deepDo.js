const typeUtil = require('./typeUtil')

/**
 *
 * @param target 被执行的对象/数组/普通数据
 * @param cb 操作函数
 * @returns {*} 被造作完的数据
 */
module.exports = function(target, cb) {
    if (typeUtil.isArray(target)) {
        target = target.map(function(item) {
            return cb(item)
        })
    } else if (typeUtil.isObject(target)) {
        for (const p in target) {
            target[p] = cb(target[p])
        }
    } else {
        return cb(target)
    }
    return target
}
