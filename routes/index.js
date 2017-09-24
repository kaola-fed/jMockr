'use strict';

const path = require('path');
const config = require('../scanner/config');
const scanner = require('../scanner/index');
const uploadImg = require('./uploadImg');
const uploadFile = require('./uploadFile');
const noProxyAjax = require('./noProxyAjax');
const proxyAjax = require('./proxyAjax');
const proxyConfig = scanner.proxyConfig;
const injector = require('connect-inject');

function getRender(type = 'freemarker') {
    switch (type) {
        case 'freemarker':
            return require('@ybq/jmockr-ftl-render')({
                templateRoot: path.dirname(config.templateRoot),
                moduleFtlPathes: config.moduleFtlPathes,
            });
        case 'thymeleaf':
            const { TemplateEngin } = require('thymeleaf');
            const enginInstance = new TemplateEngin();
            return enginInstance.processFile.bind(enginInstance);
        default:
            console.error('Invalid template type:', type);
            throw new Error(`Invalid template type:${type}`);
    }
}
function initRequestMap(app, cb) {
    const render = getRender(config.templateType || 'freemarker');
    const { commonAsyncMock, mockData } = scanner.scan();

    initCORS(app);
    initWebSocket(app);

    // 初始化页面入口路由
    mockData.forEach((page) => {
        try {
            app.get(page.entry, (req, res, next) => {
                if (req.xhr) {
                    next();
                } else {
                    page.syncData.RequestParameters = req.query || {};
                    render(page.template, page.syncData, (html) => {
                        res.send(html);
                    });
                }
            });
        } catch (e) {
            throw new Error(`Error initializing page entry:${page.entry}`);
        }
    });

    // Init upload image
    uploadImg(app);
    // Init upload file
    uploadFile(app);

    if (proxyConfig.enable) { // 初始化异步接口(返回本地配置的mock数据)
        proxyAjax.init(app);
    } else { // 初始化异步接口(代理到远程测试服务器)
        noProxyAjax.init(app, mockData, commonAsyncMock);
    }
    return cb();
}

function initCORS(app) {
    app.all('*', (req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');
        res.header('Access-Control-Allow-Methods', 'POST, GET');
        next();
    });
}

function initWebSocket(app) {
    app.get('/socket.io.js', (req, res, next) => {
        res.sendFile(path.resolve(__dirname, '../script/socket.io.js'));
    });
    app.use(injector({
        snippet: `
        <script src="/socket.io.js"></script>
        <script>
            var socket = io();
            socket.on('reload', function(msg) {
                location.reload();
            });
        </script>
        `,
    }));
}

module.exports = initRequestMap;
