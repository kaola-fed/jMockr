'use strict';
const commonData = require('./commonFtlData/commonData');
const fileUtil = require('../util/fileUtil');
const typeUtil = require('../util/typeUtil');
const arr = require('./urlMap.json');
const logUtil = require('../util/logUtil');
const events = require('events');
const extend = require('node.extend');

var initFinished = 0;
var eventEmitter = new events.EventEmitter();

arr.forEach((page) => {
    mock(page);
});

function isFrontPage(url) {
    return url == '/' || url == '/index.do';
}

function mock(page) {
    page.ftlData = {};

    //初始化公用ftl数据
    extend(page.ftlData, commonData);

    if (isFrontPage(page.entry)) {
        countInitedNum();
        return;
    }

    //初始化同步接口数据
    let ftlMockFilePath = __dirname + '/ftlMockData/' + page.entry.slice(1).replace(/\//g, '.') + '.json';
    try {
        extend(page.ftlData, require(ftlMockFilePath));
    } catch(e) {
        //console.info('no ftl data, pass');
    }

    //初始化异步接口数据
    page.ajax = [];
    let relativePath = page.entry.slice(1).replace(/\//g, '.');
    let ajaxFolderPath = __dirname + '/ajax/' + relativePath;

    fileUtil.listFiles(ajaxFolderPath)
    .then((fileNames) => {
        fileNames.forEach((fileName) => {
            let modulePath = `${ajaxFolderPath}/${fileName}`;
            let json = require(modulePath);
            page.ajax.push(json);
        });
        countInitedNum();
    }).catch(() => {
        console.info(`读取ajax配置失败, 跳过${relativePath}`);
        countInitedNum();
    });
}

/**
 * 记录初始化完成的页面数
 */
function countInitedNum() {
    initFinished ++;
    (initFinished == arr.length) && eventEmitter.emit('initFinished');
}

module.exports = arr;
module.exports.onMockFinish = function(cb) {
    eventEmitter.on('initFinished', cb);
};
