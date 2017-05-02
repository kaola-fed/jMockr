'use strict';

const path = require('path');
const fs = require('fs');
const fileUtil = require('../util/fileUtil');
const logUtil = require('../util/logUtil');
const j5require = fileUtil.json5Require;
const config = require('./config');
const Print = require('../util/print');
const extend = require('node.extend');

config.serverConfig = config.serverConfig || {};
/*
 * cPath: 公共ftl数据
 * pPath: 单页ftl数据
 * aPath: 单页ajax数据
 * uPath: url--页面映射
 * url200Path: 只返回{retCode: 200} 的接口列表的文件地址
 */
let cPath, pPath, aPath, uPath, url200Path;
let urlsReturn200;
let initialedPage;
let urlMap;

function initMockData() {
    initialedPage = 0;
    let pathes = convertPathes(config);

    urlMap = j5require(pathes.uPath) || [];

    cPath = pathes.cPath;
    pPath = pathes.pPath;
    aPath = pathes.aPath;

    url200Path = pathes.url200Path;
    urlsReturn200 = j5require(url200Path) || [];

    return {
        mockData: urlMap.map(page => mock(page)),
        url200: urlsReturn200
    };
}

function convertPathes(config) {
    let pathes = Object.assign({
        urlMap: false,
        commonFtl: false,
        pageFtl: false,
        ajax: false,
        url200: false
    }, config.dataPath);

    let errors = [];
    if (!pathes.urlMap) {
        console.error('URLMap not found!');
        process.exit(1);
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
        pathes.pPath = path.resolve(pathes.pageFtl);
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

function mock(page) {
    page.ftlData = {};
    try {
        initCommonFtl(page, cPath);
        initPageFtl(page, pPath);
        initAJAX(page, aPath);
    } catch (e) {
        console.info(e);
    }
    countResolvedPage();
    return page;
}

function countResolvedPage() {
    initialedPage++;
    let percent = (initialedPage / urlMap.length * 100).toFixed(2);
    if (percent == '100.00') percent = 100;
    Print.update(`          Loading configuration ... ${percent}%`);
}

function initCommonFtl(page, cPath) {
    if (!cPath) return;
    let fileIterator = fileUtil.listFilesSync(cPath, (name) => {
        return fs.statSync(`${cPath}/${name}`).isFile();
    });
    fileIterator(function(fileName) {
        let data = j5require(`${cPath}/${fileName}`);
        extend(page.ftlData, data);
    });
}

function initPageFtl(page, pPath) {
    if (!pPath) return;
    let ftlMockFilePath = path.join(pPath, page.entry.slice(1).replace(/\//g, '.'));
    let ftlMockFilePath1 = ftlMockFilePath + '.json';
    let ftlMockFilePath2 = ftlMockFilePath + '.json5';

    extend(page.ftlData, j5require(ftlMockFilePath1));
    extend(page.ftlData, j5require(ftlMockFilePath2));
}

function initAJAX(page, aPath) {
    page.ajax = [];
    if (!aPath || page.entry == '/') return;
    let relativePath = page.entry.slice(1).replace(/\//g, '.');
    let ajaxFolderPath = path.join(aPath, relativePath);

    if (!fs.existsSync(ajaxFolderPath)) return;
    // 限制文件返回格式为json; 可以过滤mac中的隐藏文件, 如.DSstore, 防止读取ajax配置失败
    let fileIterator = fileUtil.listFilesSync(ajaxFolderPath, item => /\.json(5)?$/.test(item));

    fileIterator((fileName) => {
        let json = j5require(path.join(ajaxFolderPath, fileName));
        json && page.ajax.push(json);
    });
}

module.exports.scan = initMockData;
module.exports.ftlPath = config.ftlPath;
module.exports.authConfig = config.authConfig;
module.exports.proxyConfig = config.proxyConfig;
module.exports.serverPort = config.serverConfig.port || 3000;
