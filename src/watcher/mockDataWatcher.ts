const watcher: any = require('./base')
const config: any = require('../scanner/config').default
const dataPath: any = config.dataPath
const files2Watch: string[] = [
    dataPath.urlMap,
    dataPath.url200,
].filter((path: string) => !!path)

const directories2Watch: string[] = [
    dataPath.commonSync,
    dataPath.pageSync,
    dataPath.pageAsync,
    dataPath.commonAsync,
].filter((path: string) => !!path)

const mockDataWatcher: any = watcher.getInstance({
    files: files2Watch,
    dirs: directories2Watch,
    watchUnlink: true,
})

export default mockDataWatcher
