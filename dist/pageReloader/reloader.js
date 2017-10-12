"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var socketIO = require('socket.io');
var io;
var start = function (server) {
    io = socketIO(server);
};
exports.start = start;
var reloadPages = function () {
    io.emit('reload');
};
exports.reloadPages = reloadPages;
//# sourceMappingURL=reloader.js.map