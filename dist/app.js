'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var config_1 = require("./scanner/config");
var express = require("express");
var path = require("path");
var bodyParser = require('body-parser');
var index_1 = require("./routes/index");
console.info(index_1.default);
var opn = require('opn');
var print = require("./util/print");
var reloader = require("./pageReloader/reloader");
var server;
var sockets;
var serverConfig = config_1.default.serverConfig;
var openPageAfterLaunch = !!serverConfig.initialURL || (serverConfig.noOpenPage !== true);
function start() {
    var app = express();
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    app.use(express.static(config_1.default.serverConfig.static));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(express.static(path.resolve(config_1.default.serverConfig.static)));
    if (app.get('env') === 'development') {
        app.use(function (err, req, res, next) {
            console.info(err);
            res.status(err.status || 500).send('Server crashed.');
        });
    }
    app.use(function (err, req, res, next) {
        console.info(err);
        res.status(err.status || 500).send('Server crashed.');
    });
    try {
        index_1.default(app, function () {
            server = app.listen(config_1.default.serverConfig.port, function () {
                print.update("          jMockr listening on port " + config_1.default.serverConfig.port + "!\n");
                if (openPageAfterLaunch) {
                    var url = config_1.default.serverConfig.initialURL || "http://localhost:" + config_1.default.serverConfig.port;
                    opn(url);
                    openPageAfterLaunch = false;
                }
            });
            server.on('error', function (e) {
                if (e.code == 'EADDRINUSE') {
                    console.log("\nPort " + config_1.default.serverConfig.port + " is in use, please check.");
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
exports.default = {
    start: start,
    restart: restart,
    reloadPages: reloader.reloadPages,
};
//# sourceMappingURL=app.js.map