exports.__esModule = true;
var socketIO = require("socket.io");
var io;
function start(server) {
    io = socketIO(server);
}
exports.start = start;
function reloadPages() {
    io.emit('reload');
}
exports.reloadPages = reloadPages;
//# sourceMappingURL=reloader.js.map