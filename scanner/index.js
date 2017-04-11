'use strict';

console.info('\n============Welcome using jMockr============');

const path = require('path');
const fs = require('fs');
const fileUtil = require('../util/fileUtil');
const j5require = fileUtil.json5Require;
const config = require('./config');
const Print = require('../util/print');

config.serverConfig = config.serverConfig || {};


function convertPathes(config) {
    let pathes = Object.assign({
        urlMap: false,
        commonFtl: false,
        pageFtl: false,
        ajax: false,
        url200: false
    }, config.dataPath);

    let errors = []
    if (!pathes.urlMap) {
        errors.push('未配置URLMap');
    } else {
        pathes.uPath = path.resolve(pathes.urlMap);
    }
    if (!pathes.commonFtl) {
        errors.push('未公共Ftl数据存放位置');
    } else {
        pathes.cPath = path.resolve(pathes.commonFtl);
    }
    if (!pathes.pageFtl) {
        errors.push('未找到页面ftl数据存放位置');
    } else {
        pathes.pPath = path.resolve(pathes.pageFtl)
    }
    if (!pathes.ajax) {
        errors.push('未找到异步数据存放位置');
    } else {
        pathes.aPath = path.resolve(pathes.ajax);
    }
    if (pathes.url200) {
        pathes.url200Path = path.resolve(pathes.url200);
    } else {
        errors.push('未找到retCode200接口的数据存放位置');
    }
    errors.forEach((error) => {
        console.error(error);
    });
    return pathes;
}

let pathes = convertPathes(config);

//url--页面映射
const uPath = pathes.uPath
let urlMap = [];
if (uPath) {
    urlMap = j5require(uPath);
}

//公共ftl数据
const cPath = pathes.cPath;

//单页ftl数据
const pPath = pathes.pPath;

//单页ajax数据
const aPath = pathes.aPath;

//retCode200的接口
const url200Path = pathes.url200Path;
let urlsReturn200 = [];
if (url200Path) {
    urlsReturn200 = j5require(url200Path);
}

const extend = require('node.extend');

let initialedPage = 0;
let tasks = urlMap.map((page) => {
    return mock(page);
});


function isFrontPage(url) {
    return url == '/' || url == '/index.do';
}

function mock(page) {
    return new Promise((resolve, reject) => {
        let originResolve = resolve;
        resolve = function() {
            initialedPage ++;
            let percent = (initialedPage / urlMap.length * 100).toFixed(2);
            Print.update(`      Loading configuration ... ${percent}%`);
            if (percent >= 100) console.info('\n      Configuration load finished.');
            originResolve();
        }
        page.ftlData = {};

        //初始化公用ftl数据
        if (cPath) {
            fileUtil.listFiles(cPath, (name) => {
                return fs.statSync(`${cPath}/${name}`).isFile();
            })
            .then(function(fileName) {
                let data = j5require(`${cPath}/${fileName}`);
                extend(page.ftlData, data);
            }).catch((e) => {
                console.info(e);
            });
        }

        if (isFrontPage(page.entry)) {
            resolve();
            return;
        }

        //初始化同步接口数据
        if (pPath) {
            let ftlMockFilePath = path.join(pPath, page.entry.slice(1).replace(/\//g, '.'));
            let ftlMockFilePath1 = ftlMockFilePath + '.json';
            let ftlMockFilePath2 = ftlMockFilePath + '.json5';
            try {
                extend(page.ftlData, j5require(ftlMockFilePath1));
                extend(page.ftlData, j5require(ftlMockFilePath2));
            } catch(e) {
                // console.info('no ftl data, pass');
            }
        }

        //初始化异步接口数据
        page.ajax = [];
        if (aPath) {
            let relativePath = page.entry.slice(1).replace(/\//g, '.');
            let ajaxFolderPath = path.join(aPath, relativePath);

            // 限制文件返回格式为json; 可以过滤mac中的隐藏文件, 如.DSstore, 防止读取ajax配置失败
            fileUtil.listFiles(ajaxFolderPath, item => /\.json(5)?$/.test(item))
            .then((fileNames) => {
                fileNames.forEach((fileName) => {
                    let json = j5require(`${ajaxFolderPath}/${fileName}`);
                    json && page.ajax.push(json);
                });
                resolve();
            }).catch(() => {
                //console.info(`读取ajax配置失败, 跳过${relativePath}`);
                resolve();
            });
        }
    });
}

module.exports = urlMap;
module.exports.url200 = urlsReturn200;
module.exports.ftlPath = config.ftlPath;
module.exports.authConfig = config.authConfig;
module.exports.proxyConfig = config.proxyConfig;
module.exports.serverPort = config.serverConfig.port || 3000;

module.exports.onMockFinish = function(cb) {
    Promise.all(tasks)
    .then(cb)
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
};
