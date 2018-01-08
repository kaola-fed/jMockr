"use strict";
exports.__esModule = true;
var watcher = require('./base');
var config = require('../scanner/config');
var liveReload = config.liveReload || {};
var pageWatcher = watcher.getInstance({
    pathes: liveReload.watch,
    otherOpt: {
        ignored: liveReload.ignore
    }
});
exports["default"] = pageWatcher;
//# sourceMappingURL=pageWatcher.js.map