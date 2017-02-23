'use strict';
/**
 * @author yubaoquan
 * @description 前端模拟服务器, 前后端分离开发用
 */

const config = require('./scanner/index');
const express = require('express');
const path = require('path');
// var favicon = require('serve-favicon');
const logger = require('morgan');
// var cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const routes = require('./routes/index');

module.exports.run = function() {
    const app = express();

    //http://stackoverflow.com/questions/10888610/ignore-invalid-self-signed-ssl-certificate-in-node-js-with-https-request
    //Ignore invalid self-signed ssl certificate in node.js with https.request
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    // app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
    //app.use(logger('dev'));   //日志太多, 先注释掉 想看自己打开
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    // app.use(cookieParser());
    app.use(express.static(path.join(__dirname, '../')));

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

    routes(app)
    .then(() => {
        app.listen(config.serverPort, () => {
            console.info(`Mock server listening on port ${config.serverPort}!`);
        });
    })
    .catch((e) => {
        console.info(e);
        console.error('Mock server crashed');
    });
}

module.exports.foo = function() {
    console.info('bar');
}
