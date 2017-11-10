'use strict'
/**
 * @author yubaoquan
 * @description 前端模拟服务器, 前后端分离开发用
 */

import config from './scanner/config'
import * as express from 'express'
import * as path from 'path'
import * as bodyParser from 'body-parser'
import routes from './routes/index'
console.info(routes)
import * as opn from 'opn'
import * as print from './util/print'
import * as reloader from './pageReloader/reloader'

let server: any
let sockets: any[]
const serverConfig: any = config.serverConfig
let openPageAfterLaunch: any = !!serverConfig.initialURL || (serverConfig.noOpenPage !== true)

function start(): void {
    const app: any = express()
    // http://stackoverflow.com/questions/10888610/ignore-invalid-self-signed-ssl-certificate-in-node-js-with-https-request
    // Ignore invalid self-signed ssl certificate in node.js with https.request
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

    app.use(express.static(config.serverConfig.static))
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: false }))
    // app.use(cookieParser())
    app.use(express.static(path.resolve(config.serverConfig.static)))

    // development error handler
    // will print stacktrace
    if (app.get('env') === 'development') {
        app.use((err: any, req: any, res: any, next: any) => {
            console.info(err)
            res.status(err.status || 500).send('Server crashed.')
        })
    }

    // production error handler
    // no stacktraces leaked to user
    app.use((err: any, req: any, res: any, next: any) => {
        console.info(err)
        res.status(err.status || 500).send('Server crashed.')
    })

    try {
        routes(app, (): void => {
            server = app.listen(config.serverConfig.port, () => {
                print.update(`          jMockr listening on port ${config.serverConfig.port}!\n`)
                if (openPageAfterLaunch) {
                    const url: string = config.serverConfig.initialURL || `http://localhost:${config.serverConfig.port}`
                    opn(url)
                    openPageAfterLaunch = false // only open once
                }
            })
            server.on('error', (e: any) => {
                if (e.code == 'EADDRINUSE') {
                    console.log(`\nPort ${config.serverConfig.port} is in use, please check.`)
                    server.close()
                    process.exit()
                }
            })
            sockets = []
            reloader.start(server)
            server.on('connection', (socket: any) => {
                sockets.push(socket)
                console.info('')

            })
        })
    } catch (e) {
        console.info('jMockr crashed!')
        console.info(e)
    }
}

function restart(): void {
    sockets.forEach((socket: any) => socket.destroy())
    server.close(start)
}

export default {
    start,
    restart,
    reloadPages: reloader.reloadPages,
}
