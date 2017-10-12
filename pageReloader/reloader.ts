const socketIO = require('socket.io')

let io: any

const start = (server: any) => {
    io = socketIO(server)
}

const reloadPages = () => {
    io.emit('reload')
}

export {
    start,
    reloadPages,
}
