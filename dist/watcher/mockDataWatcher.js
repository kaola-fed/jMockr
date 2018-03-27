exports.__esModule = true;
var watcher = require('./base');
var config = require('../scanner/config')["default"];
var dataPath = config.dataPath;
var files2Watch = [
    dataPath.urlMap,
    dataPath.url200,
].filter(function (path) { return !!path; });
var directories2Watch = [
    dataPath.commonSync,
    dataPath.pageSync,
    dataPath.pageAsync,
    dataPath.commonAsync,
].filter(function (path) { return !!path; });
var mockDataWatcher = watcher.getInstance({
    files: files2Watch,
    dirs: directories2Watch,
    watchUnlink: true
});
exports["default"] = mockDataWatcher;
//# sourceMappingURL=mockDataWatcher.js.map