'use strict';
const path = require('path');
const fs = require('fs');

const config = require('../../jmockr.config.json');
const configParentPath = path.resolve('..');

//url--页面映射
const uPath = path.resolve(configParentPath, config.dataPath.urlMap);
if (!uPath) {
    console.error('未配置urlMap');
    process.exit(1);
}
const arr = require(uPath);

//公共ftl数据
const cPath = path.resolve(configParentPath, config.dataPath.commonFtl);

//单页ftl数据
const pPath = path.resolve(configParentPath, config.dataPath.pageFtl);
//单页ajax数据
const aPath = path.resolve(configParentPath, config.dataPath.ajax);

//retCode200的接口
const url200Path = path.resolve(configParentPath, config.dataPath.url200);
const urlsReturn200 = require(url200Path);

const fileUtil = require('../util/fileUtil');
const extend = require('node.extend');

console.info('starting...');

let tasks = arr.map((page) => {
    return mock(page);
});

function isFrontPage(url) {
    return url == '/' || url == '/index.do';
}

function mock(page) {
    return new Promise((resolve, reject) => {
        page.ftlData = {};

        //初始化公用ftl数据
        if (cPath) {
            fileUtil.listFiles(cPath, (name) => {
                return fs.statSync(`${cPath}/${name}`).isFile();
            })
            .then(function(fileName) {
                let data = require(`${cPath}/${fileName}`);
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
            let ftlMockFilePath = path.join(pPath, page.entry.slice(1).replace(/\//g, '.'), 'json');
            try {
                extend(page.ftlData, require(ftlMockFilePath));
            } catch(e) {
                //console.info('no ftl data, pass');
            }
        }

        //初始化异步接口数据
        page.ajax = [];
        if (aPath) {
            let relativePath = page.entry.slice(1).replace(/\//g, '.');
            let ajaxFolderPath = path.join(aPath, relativePath);

            // 限制文件返回格式为json; 可以过滤mac中的隐藏文件, 如.DSstore, 防止读取ajax配置失败
            fileUtil.listFiles(ajaxFolderPath, item => /\.json/.test(item))
            .then((fileNames) => {
                fileNames.forEach((fileName) => {
                    let json = require(`${ajaxFolderPath}/${fileName}`);
                    page.ajax.push(json);
                });
                resolve();
            }).catch(() => {
                //console.info(`读取ajax配置失败, 跳过${relativePath}`);
                resolve();
            });
        }
    });
}

module.exports = arr;
module.exports.url200 = urlsReturn200;
module.exports.authConfig = config.authConfig;
module.exports.proxyConfig = config.proxyConfig;
module.exports.onMockFinish = function(cb) {
    Promise.all(tasks).then(cb);
};
