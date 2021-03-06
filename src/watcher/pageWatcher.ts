const watcher = require('./base')
const config = require('../scanner/config')

const liveReload = config.liveReload || {}

const pageWatcher = watcher.getInstance({
    pathes: liveReload.watch,
    otherOpt: {
        ignored: liveReload.ignore,
    },
})

export default pageWatcher
