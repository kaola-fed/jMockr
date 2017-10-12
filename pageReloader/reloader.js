"use strict";
exports.__esModule = true;
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
