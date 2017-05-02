const watcher = require('./base');
const config = require('../scanner/config');

const liveReload = config.liveReload || {};

let pageWatcher = watcher.getInstance({
    pathes: liveReload.watch,
    otherOpt: {
        ignored: liveReload.ignore
    }
});

module.exports = pageWatcher;
