const watcher = require('./base')
const config = require('../scanner/config')

const dataPath = config.dataPath
const files2Watch = [
    dataPath.urlMap,
    dataPath.url200,
].filter((path) => !!path)

const directories2Watch = [
    dataPath.commonSync,
    dataPath.pageSync,
    dataPath.pageAsync,
    dataPath.commonAsync,
].filter((path) => !!path)

const mockDataWatcher = watcher.getInstance({
    files: files2Watch,
    dirs: directories2Watch,
    watchUnlink: true,
})

export default mockDataWatcher
