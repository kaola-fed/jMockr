'use strict';
exports.__esModule = true;
/**
 * @author yubaoquan
 * @description 前端模拟服务器, 前后端分离开发用
 */
var config_1 = require("./scanner/config");
var express = require("express");
var path = require("path");
var bodyParser = require('body-parser');
var routes = require('./routes/index');
var opn = require('opn');
var print = require("./util/print");
var reloader = require("./pageReloader/reloader");
var server;
var sockets;
var serverConfig = config_1["default"].serverConfig;
var openPageAfterLaunch = !!serverConfig.initialURL || (serverConfig.noOpenPage !== true);
function start() {
    var app = express();
    // http://stackoverflow.com/questions/10888610/ignore-invalid-self-signed-ssl-certificate-in-node-js-with-https-request
    // Ignore invalid self-signed ssl certificate in node.js with https.request
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    app.use(express.static(config_1["default"].serverConfig.static));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    // app.use(cookieParser())
    app.use(express.static(path.resolve(config_1["default"].serverConfig.static)));
    // development error handler
    // will print stacktrace
    if (app.get('env') === 'development') {
        app.use(function (err, req, res, next) {
            console.info(err);
            res.status(err.status || 500).send('Server crashed.');
        });
    }
    // production error handler
    // no stacktraces leaked to user
    app.use(function (err, req, res, next) {
        console.info(err);
        res.status(err.status || 500).send('Server crashed.');
    });
    try {
        routes(app, function () {
            server = app.listen(config_1["default"].serverConfig.port, function () {
                print.update("          jMockr listening on port " + config_1["default"].serverConfig.port + "!\n");
                if (openPageAfterLaunch) {
                    var url = config_1["default"].serverConfig.initialURL || "http://localhost:" + config_1["default"].serverConfig.port;
                    opn(url);
                    openPageAfterLaunch = false; // only open once
                }
            });
            server.on('error', function (e) {
                if (e.code == 'EADDRINUSE') {
                    console.log("\nPort " + config_1["default"].serverConfig.port + " is in use, please check.");
                    server.close();
                    process.exit();
                }
            });
            sockets = [];
            reloader.start(server);
            server.on('connection', function (socket) {
                sockets.push(socket);
                console.info('');
            });
        });
    }
    catch (e) {
        console.info('jMockr crashed!');
        console.info(e);
    }
}
function restart() {
    sockets.forEach(function (socket) { return socket.destroy(); });
    server.close(start);
}
exports["default"] = {
    start: start,
    restart: restart,
    reloadPages: reloader.reloadPages
};
