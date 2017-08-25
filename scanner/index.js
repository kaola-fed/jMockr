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
let cPath;
let pPath;
let aPath;
let url200Path;
let urlsReturn200;
let initialedPage;
let urlMap;

function initMockData() {
    initialedPage = 0;
    const pathes = convertPathes(config);

    urlMap = j5require(pathes.uPath) || [];

    cPath = pathes.cPath;
    pPath = pathes.pPath;
    aPath = pathes.aPath;

    url200Path = pathes.url200Path;
    urlsReturn200 = j5require(url200Path) || [];

    return {
        commonAjaxMock: initCommonAjax(pathes.commonAjax),
        mockData: urlMap.map((page) => mock(page)),
        url200: urlsReturn200,
    };
}

function convertPathes(config) {
    const pathes = Object.assign({
        urlMap: false,
        commonFtl: false,
        pageFtl: false,
        commonAjax: false,
        ajax: false,
        url200: false,
    }, config.dataPath);

    const errors = [];
    if (pathes.urlMap) {
        pathes.uPath = path.resolve(pathes.urlMap);
    } else {
        console.error('URLMap not found!');
        process.exit(1);
    }
    if (pathes.commonFtl) {
        pathes.cPath = path.resolve(pathes.commonFtl);
    } else {
        errors.push('Common ftl mock data not found.');
    }
    if (pathes.pageFtl) {
        pathes.pPath = path.resolve(pathes.pageFtl);
    } else {
        errors.push('Page ftl mock data not found.');
    }
    if (pathes.commonAjax) {
        pathes.commonAjax = path.resolve(pathes.commonAjax);
        console.info(pathes.commonAjax);
    } else {
        errors.push('Common ajax mock data not found');
    }
    if (pathes.ajax) {
        pathes.aPath = path.resolve(pathes.ajax);
    } else {
        errors.push('Page ajax mock data not found.');
    }
    if (pathes.url200) {
        pathes.url200Path = path.resolve(pathes.url200);
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
    const fileIterator = fileUtil.listFilesSync(cPath, (name) => {
        if (!fileUtil.isImportable(name)) return false;
        return fs.statSync(`${cPath}/${name}`).isFile();
    });
    fileIterator(function(fileName) {
        const data = j5require(`${cPath}/${fileName}`);
        extend(page.ftlData, data);
    });
}

function initPageFtl(page, pPath) {
    if (!pPath) return;
    const ftlMockFilePath = path.join(pPath, page.entry.slice(1).replace(/\//g, '.'));
    const ftlMockFilePath1 = ftlMockFilePath + '.json';
    const ftlMockFilePath2 = ftlMockFilePath + '.json5';

    extend(page.ftlData, j5require(ftlMockFilePath1));
    extend(page.ftlData, j5require(ftlMockFilePath2));
}

function initAJAX(page, aPath) {
    page.ajax = [];
    if (!aPath || page.entry == '/') return;
    const relativePath = page.entry.slice(1).replace(/\//g, '.');
    const ajaxFolderPath = path.join(aPath, relativePath);

    if (!fs.existsSync(ajaxFolderPath)) return;
    // 限制文件返回格式为json; 可以过滤mac中的隐藏文件, 如.DSstore, 防止读取ajax配置失败
    const fileIterator = fileUtil.listFilesSync(ajaxFolderPath, (item) => /\.json(5)?$/.test(item));

    fileIterator((fileName) => {
        const json = j5require(path.join(ajaxFolderPath, fileName));
        json && page.ajax.push(json);
    });
}
function initCommonAjax(folder) {
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
module.exports.ftlPath = config.ftlPath;
module.exports.authConfig = config.authConfig;
module.exports.proxyConfig = config.proxyConfig;
module.exports.serverPort = config.serverConfig.port || 3000;
module.exports.moduleFtlPathes = module.exports.moduleFtlPathes || [];
