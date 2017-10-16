"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util = require('util');
var fileUtil = require('./file-util');
var extend = require('node.extend');
var logFileName = 'log';
function logFile(args) {
    args = args || {};
    var now = new Date();
    var year = now.getFullYear();
    var month = padZero(now.getMonth() + 1);
    var date = padZero(now.getDate());
    var h = padZero(now.getHours());
    var m = padZero(now.getMinutes());
    var s = padZero(now.getSeconds());
    var logTitle = "\n\n===========" + year + "-" + month + "-" + date + " " + h + ":" + m + ":" + s + "====" + (args.title || '') + "==========\n";
    args.fileName = (args.fileName || '').replace(/[:\/\\\*\?"\|<>]/g, '_');
    var path = "log/" + (args.fileName || logFileName) + ".txt";
    fileUtil.makeFile({
        path: path,
        content: "" + logTitle + args.content,
    });
}
function padZero(n) {
    if (n < 10)
        return '0' + n;
    return n;
}
function log(obj) {
    console.info(util.inspect(obj, false, null));
}
function stringify(obj) {
    obj = extend({}, obj);
    delete obj.toJSON;
    return JSON.stringify(obj);
}
function logAgentRes(res) {
    logFile({
        title: 'type',
        content: JSON.stringify(res.type),
    });
    logFile({
        title: 'header',
        content: JSON.stringify(res.header),
    });
    logFile({
        title: 'body',
        content: JSON.stringify(res.body),
    });
    logFile({
        title: 'text',
        content: res.text,
    });
}
function logRequest(req) {
    logFile({
        title: 'request url',
        content: req.originalUrl,
    });
    logFile({
        title: 'request query',
        content: JSON.stringify(req.query),
    });
    logFile({
        title: 'request body',
        content: JSON.stringify(req.body),
    });
}
exports.default = {
    log: log,
    logFile: logFile,
    stringify: stringify,
    logRequest: logRequest,
    logAgentRes: logAgentRes,
};
//# sourceMappingURL=log-util.js.map