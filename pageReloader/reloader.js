const socketIO = require('socket.io');

let io;

module.exports.start = (server) => {
    io = socketIO(server);
};

module.exports.reloadPages = () => {
    io.emit('reload');
};
