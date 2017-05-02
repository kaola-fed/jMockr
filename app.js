'use strict';
/**
 * @author yubaoquan
 * @description 前端模拟服务器, 前后端分离开发用
 */

const config = require('./scanner/config');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const routes = require('./routes/index');
const opn = require('opn');
const print = require('./util/print');
const reloader = require('./pageReloader/reloader');

let server, sockets;
let serverConfig = config.serverConfig;
let openPageAfterLaunch = !!serverConfig.initialURL || (serverConfig.noOpenPage !== true);

function start() {
    let app = express();
    //http://stackoverflow.com/questions/10888610/ignore-invalid-self-signed-ssl-certificate-in-node-js-with-https-request
    //Ignore invalid self-signed ssl certificate in node.js with https.request
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    app.use(express.static(config.serverConfig.static));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    // app.use(cookieParser());
    app.use(express.static(path.resolve(config.serverConfig.static)));

    // development error handler
    // will print stacktrace
    if (app.get('env') === 'development') {
        app.use((err, req, res, next) => {
            console.info(err);
            res.status(err.status || 500).send('Server crashed.');
        });
    }

    // production error handler
    // no stacktraces leaked to user
    app.use((err, req, res, next) => {
        console.info(err);
        res.status(err.status || 500).send('Server crashed.');
    });

    try {
        routes(app, () => {
            server = app.listen(config.serverConfig.port, () => {
                print.update(`          jMockr listening on port ${config.serverConfig.port}!\n`);
                if (openPageAfterLaunch) {
                    let url = config.serverConfig.initialURL || `http://localhost:${config.serverConfig.port}`;
                    opn(url);
                    openPageAfterLaunch = false; //only open once
                }
            });
            sockets = [];
            reloader.start(server);
            server.on('connection', socket => {
                sockets.push(socket);
            });
        });
    } catch (e) {
        console.info('jMockr crashed!');
        console.info(e);
    }
};

function restart() {
    server.close(start);
    sockets.forEach(socket => socket.destroy());
};

module.exports.start = start;
module.exports.restart= restart;
module.exports.reloadPages = reloader.reloadPages;
