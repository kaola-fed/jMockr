import * as socketIO from 'socket.io'

let io: any

function start(server: any): void {
    io = socketIO(server)
}

function reloadPages(): void {
    io.emit('reload')
}

export {
    start,
    reloadPages,
}
