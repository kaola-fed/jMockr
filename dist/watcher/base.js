var chokidar = require('chokidar');
module.exports.getInstance = function (args) {
    if (args === void 0) { args = {}; }
    args.files = args.files || [];
    args.dirs = args.dirs || [];
    args.pathes = args.pathes || args.files.concat(args.dirs);
    args.watchUnlink = !!args.watchUnlink;
    args.otherOpt = Object.assign(args.otherOpt || {}, {
        ignoreInitial: true,
        persistent: true
    });
    var ret = {
        fileChangeListeners: [],
        addListener: function (fn) {
            ret.fileChangeListeners.push(fn);
        },
        watcher: chokidar.watch(args.pathes, args.otherOpt)
    };
    var watcher = ret.watcher;
    watcher.on('change', onChange);
    if (args.watchUnlink) {
        watcher.on('unlink', onChange);
        watcher.on('unlinkDir', onChange);
    }
    watcher.on('add', onAdd);
    watcher.on('addDir', onAdd);
    function onAdd(pathOrDir) {
        onChange();
        watcher.add(pathOrDir);
    }
    function onChange() {
        ret.fileChangeListeners.forEach(function (fn) { return fn(); });
    }
    return ret;
};
//# sourceMappingURL=base.js.map