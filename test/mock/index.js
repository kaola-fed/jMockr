'use strict';
/* eslint-disable */
const commonData = require('./commonFtlData/commonData');
const fileUtil = require('../util/fileUtil');
const arr = require('./urlMap.json');
const extend = require('node.extend');

const tasks = arr.map((page) => {
    return mock(page);
});

function isFrontPage(url) {
    return url == '/' || url == '/index.do';
}

function mock(page) {
    return new Promise((resolve, reject) => {
        page.ftlData = {};

        // 初始化公用ftl数据
        extend(page.ftlData, commonData);

        if (isFrontPage(page.entry)) {
            resolve();
            return;
        }

        // 初始化同步接口数据
        let ftlMockFilePath = __dirname + '/ftlMockData/' + page.entry.slice(1).replace(/\//g, '.') + '.json';
        try {
            extend(page.ftlData, require(ftlMockFilePath));
        } catch(e) {
            // console.info('no ftl data, pass');
        }

        // 初始化异步接口数据
        page.ajax = [];
        const relativePath = page.entry.slice(1).replace(/\//g, '.');
        const ajaxFolderPath = __dirname + '/ajax/' + relativePath;

        // 限制文件返回格式为json; 可以过滤mac中的隐藏文件, 如.DSstore, 防止读取ajax配置失败
        fileUtil.listFiles(ajaxFolderPath, (item) => /\.json/.test(item))
            .then((fileNames) => {
                fileNames.forEach((fileName) => {
                    const json = require(`${ajaxFolderPath}/${fileName}`);
                    page.ajax.push(json);
                });
                resolve();
            }).catch(() => {
                // console.info(`读取ajax配置失败, 跳过${relativePath}`);
                resolve();
            });
    });
}

module.exports = arr;
module.exports.onMockFinish = function(cb) {
    Promise.all(tasks).then(cb);
};
