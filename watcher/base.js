const chokidar = require('chokidar')

module.exports.getInstance = (args = {}) => {
    args.files = args.files || []
    args.dirs = args.dirs || []
    args.pathes = args.pathes || [...args.files, ...args.dirs]
    args.watchUnlink = !!args.watchUnlink
    args.otherOpt = Object.assign(args.otherOpt || {}, {
        ignoreInitial: true,
        persistent: true,
    })

    const ret = {
        fileChangeListeners: [],
        addListener: (fn) => {
            ret.fileChangeListeners.push(fn)
        },
    }
    ret.watcher = chokidar.watch(args.pathes, args.otherOpt)

    const watcher = ret.watcher
    watcher.on('change', onChange) // File content changed.
    if (args.watchUnlink) {
        watcher.on('unlink', onChange) // File removed.
        watcher.on('unlinkDir', onChange) // Directory removed.
    }

    watcher.on('add', onAdd) // New file added.
    watcher.on('addDir', onAdd) // New directory added.

    function onAdd(pathOrDir) {
        onChange()
        watcher.add(pathOrDir)
    }

    function onChange() {
        ret.fileChangeListeners.forEach((fn) => fn())
    }

    return ret
}
