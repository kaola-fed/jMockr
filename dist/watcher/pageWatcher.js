"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var watcher = require('./base');
var config = require('../scanner/config');
var liveReload = config.liveReload || {};
var pageWatcher = watcher.getInstance({
    pathes: liveReload.watch,
    otherOpt: {
        ignored: liveReload.ignore,
    },
});
exports.default = pageWatcher;
//# sourceMappingURL=pageWatcher.js.map