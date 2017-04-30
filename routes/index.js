'use strict';

const ftlParser = require('../ftl_parse');
const scanner = require('../scanner/index');
const logUtil = require(`../util/logUtil`);
const uploadImg = require('./uploadImg');
const uploadFile = require('./uploadFile');
const noProxyAjax = require('./noProxyAjax');
const proxyAjax = require('./proxyAjax');
const proxyConfig = scanner.proxyConfig;

function initRequestMap(app, cb) {
    let {mockData, url200} = scanner.scan();

    app.all('*', (req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');
        res.header('Access-Control-Allow-Methods', 'POST, GET');
        next();
    });
    //初始化页面入口路由
    mockData.forEach((page) => {
        try {
            app.get(page.entry, (req, res, next) => {
                if (req.xhr) {
                    next();
                } else {
                    page.ftlData.RequestParameters = req.query || {};
                    ftlParser.render(page.ftlPath, (html) => {
                        res.send(html);
                    }, page.ftlData);
                }
            });
        } catch (e) {
            throw new Error(`Error initializing page entry:${page.entry}`);
        }
    });

    //初始化图片上传路由
    uploadImg(app);
    //初始化上传文件
    uploadFile(app);

    if (proxyConfig.enable) { //初始化ajax路由(返回本地配置的mock数据)
        proxyAjax.init(app);
    } else { //初始化ajax路由(代理到远程测试服务器)
        noProxyAjax.init(app, mockData, url200);
    }
    return cb();
}

module.exports = initRequestMap;
