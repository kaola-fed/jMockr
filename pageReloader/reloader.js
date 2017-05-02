const socketIO = require('socket.io');
const scanner = require('../scanner/index');

let io;

module.exports.start = (server) => {
    io = socketIO(server);
};

module.exports.reloadPages = () => {
    io.emit('reload');
};
