const watcher = require('./base');
const config = require('../scanner/config');

const dataPath = config.dataPath;
const files2Watch = [
    dataPath.urlMap,
    dataPath.url200,
].filter((path) => !!path);

const directories2Watch = [
    dataPath.commonFtl,
    dataPath.pageFtl,
    dataPath.ajax,
    dataPath.commonAjax,
].filter((path) => !!path);

const mockDataWatcher = watcher.getInstance({
    files: files2Watch,
    dirs: directories2Watch,
    watchUnlink: true,
});

module.exports = mockDataWatcher;
