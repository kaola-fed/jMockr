const watcher = require('./base');
const config = require('../scanner/config');

let dataPath = config.dataPath;
let files2Watch = [
    dataPath.urlMap,
    dataPath.url200
].filter(path => !!path);

let directories2Watch = [
    dataPath.commonFtl,
    dataPath.pageFtl,
    dataPath.ajax
].filter(path => !!path);

let mockDataWatcher = watcher.getInstance({
    files: files2Watch,
    dirs: directories2Watch,
    watchUnlink: true
});

module.exports = mockDataWatcher;
