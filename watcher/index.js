const chokidar = require('chokidar');
const config = require('../scanner/config');
const fileChangeListeners = [];

let dataPath = config.dataPath;
let files2Watch = [
    dataPath.urlMap,
    dataPath.url200
];

let directories2Watch = [
    dataPath.commonFtl,
    dataPath.pageFtl,
    dataPath.ajax
];

let watcher = chokidar.watch([...files2Watch, ...directories2Watch], {
    ignoreInitial: true,
    persistent: true
});

watcher.on('change', onChange); // File content changed.
watcher.on('unlink', onChange); // File removed.
watcher.on('unlinkDir', onChange); // Directory removed.

watcher.on('add', onAdd); // New file added.
watcher.on('addDir', onAdd); // New directory added.

function onChange() {
    fileChangeListeners.forEach(fn => fn());
}

function onAdd(pathOrDir) {
    onChange();
    watcher.add(pathOrDir);
}

module.exports.addListener = (fn) => {
    fileChangeListeners.push(fn);
};
