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
 * aPath: 单页异步数据
 * uPath: url--页面映射
 * url200Path: 只返回{retCode: 200} 的接口列表的文件地址
 */
let cPath;
let pPath;
let aPath;
let url200Path;
let urlsReturn200;
let initialedPage;
let urlMap;
let suffix = '.ftl';
if (config.templateType === 'thymeleaf') {
    suffix = '.html';
}

function initMockData() {
    initialedPage = 0;
    const paths = convertPathes(config);

    urlMap = j5require(paths.uPath) || [];

    cPath = paths.cPath;
    pPath = paths.pPath;
    aPath = paths.aPath;

    url200Path = paths.url200Path;
    urlsReturn200 = j5require(url200Path) || [];

    return {
        commonAsyncMock: initCommonAsyncData(paths.commonAsync),
        mockData: urlMap.map((page) => mock(page)),
        url200: urlsReturn200,
    };
}

function convertPathes(config) {
    const paths = Object.assign({
        urlMap: false,
        commonSync: false,
        pageSync: false,
        commonAsync: false,
        async: false,
        url200: false,
    }, config.dataPath);

    const errors = [];
    if (paths.urlMap) {
        paths.uPath = path.resolve(paths.urlMap);
    } else {
        console.error('URLMap not found!');
        process.exit(1);
    }
    if (paths.commonSync) {
        paths.cPath = path.resolve(paths.commonSync);
    } else {
        errors.push('Common ftl mock data not found.');
    }
    if (paths.pageSync) {
        paths.pPath = path.resolve(paths.pageSync);
    } else {
        errors.push('Page ftl mock data not found.');
    }
    if (paths.commonAsync) {
        paths.commonAsync = path.resolve(paths.commonAsync);
    } else {
        errors.push('Common async mock data not found');
    }
    if (paths.pageAsync) {
        paths.aPath = path.resolve(paths.pageAsync);
    } else {
        errors.push('Page async mock data not found.');
    }
    if (paths.url200) {
        paths.url200Path = path.resolve(paths.url200);
    }
    errors.forEach((error) => {
        console.error(error);
    });
    return paths;
}

function mock(page) {
    page.syncData = {};
    page.template += suffix;
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
    if (percent == '100.00') {
        percent = 100;
    }
    Print.update(`          Loading configuration ... ${percent}%`);
}

function initCommonFtl(page, cPath) {
    if (!cPath) {
        return;
    }
    const fileIterator = fileUtil.listFilesSync(cPath, (name) => {
        if (!fileUtil.isImportable(name)) {
            return false;
        }
        return fs.statSync(`${cPath}/${name}`).isFile();
    });
    fileIterator(function(fileName) {
        const data = j5require(`${cPath}/${fileName}`);
        extend(page.syncData, data);
    });
}

function initPageFtl(page, pPath) {
    if (!pPath) {
        return;
    }
    const ftlMockFilePath = path.join(pPath, page.entry.slice(1).replace(/\//g, '.'));
    const ftlMockFilePath1 = ftlMockFilePath + '.json';
    const ftlMockFilePath2 = ftlMockFilePath + '.json5';

    extend(page.syncData, j5require(ftlMockFilePath1));
    extend(page.syncData, j5require(ftlMockFilePath2));
}

function initAJAX(page, aPath) {
    page.async = [];
    if (!aPath || page.entry == '/') {
        return;
    }
    const relativePath = page.entry.slice(1).replace(/\//g, '.');
    const asyncFolderPath = path.join(aPath, relativePath);

    if (!fs.existsSync(asyncFolderPath)) {
        return;
    }
    // 限制文件返回格式为json; 可以过滤mac中的隐藏文件, 如.DSstore, 防止读取异步数据配置失败
    const fileIterator = fileUtil.listFilesSync(asyncFolderPath, (item) => /\.json(5)?$/.test(item));

    fileIterator((fileName) => {
        const json = j5require(path.join(asyncFolderPath, fileName));
        json && page.async.push(json);
    });
}
function initCommonAsyncData(folder) {
    const res = [];
    if (!folder) {
        return res;
    }
    const subFolderIterator = fileUtil.listFilesSync(folder, (f) => {
        return fs.statSync(path.join(folder, f)).isDirectory();
    });
    subFolderIterator((f) => {
        const urls = mergeRequire(
            path.join(folder, f, 'url'),
            Array
        );

        const data = mergeRequire(path.join(folder, f, 'data'));
        res.push({ urls, data });
    });


    return res;
}

function mergeRequire(pathLeft, type = Object) {
    const paths = ['.js', '.json', '.json5'].map((suffix) => {
        return pathLeft + suffix;
    });
    const defaultData = getDefaultData(type);
    const res = getDefaultData(type);
    paths.forEach((p) => {
        const data = fileUtil.json5Require(p) || defaultData;
        if (type === Array) {
            res.push(...data);
        } else {
            Object.assign(res, data);
        }
    });
    return res;
}

function getDefaultData(type) {
    switch (type) {
        case Array: return [];
        default: return {};
    }
}

module.exports.scan = initMockData;
module.exports.template = config.template;
module.exports.authConfig = config.authConfig;
module.exports.proxyConfig = config.proxyConfig;
module.exports.serverPort = config.serverConfig.port || 3000;
module.exports.moduleFtlPathes = module.exports.moduleFtlPathes || [];
