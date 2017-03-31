'use strict';

const ftlParser = require('../ftl_parse');
const urlMap = require('../scanner/index');
const logUtil = require(`../util/logUtil`);
const uploadImg = require('./uploadImg');
const uploadFile = require('./uploadFile');
const noProxyAjax = require('./noProxyAjax');
const proxyAjax = require('./proxyAjax');
const proxyConfig = urlMap.proxyConfig;

function initRequestMap(app) {
    app.all('*', (req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');
        res.header('Access-Control-Allow-Methods', 'POST, GET');
        next();
    });
    //初始化页面入口路由
    urlMap.forEach(function(page) {
        try {
            app.get(page.entry, (req, res, next) => {
                if (req.xhr) {
                    next();
                } else {
                    ftlParser.render(page.ftlPath, (html) => {
                        res.send(html);
                    }, page.ftlData);
                }
            });
        } catch (e) {
            throw `Error initializing page entry:${page.entry}`;
        }
    });

    //初始化图片上传路由
    uploadImg(app);
    //初始化上传文件
    uploadFile(app);

    if (proxyConfig.enable) { //初始化ajax路由(返回本地配置的mock数据)
        proxyAjax.init(app);
    } else { //初始化ajax路由(代理到远程测试服务器)
        noProxyAjax.init(app, urlMap, urlMap.url200);
    }
}

module.exports = function(app) {
    return new Promise((resolve, reject) => {
        try {
            urlMap.onMockFinish(() => {
                try {
                    initRequestMap(app);
                    resolve();
                } catch (e) {
                    reject(e);
                }
            });
        } catch(e) {
            reject(e);
        }
    });
};
