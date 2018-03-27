'use strict';
exports.__esModule = true;
var path = require('path');
var fs = require('fs');
var fileUtil = require('../util/file-util');
var j5require = fileUtil.json5Require;
var config_1 = require("./config");
var Print = require('../util/print');
var extend = require('node.extend');
config_1["default"].serverConfig = config_1["default"].serverConfig || {};
var cPath;
var pPath;
var aPath;
var initialedPage;
var urlMap;
var suffix = '.ftl';
if (config_1["default"].templateType === 'thymeleaf') {
    suffix = '.html';
}
function initMockData() {
    initialedPage = 0;
    var paths = convertPathes(config_1["default"]);
    urlMap = j5require(paths.uPath) || [];
    cPath = paths.cPath;
    pPath = paths.pPath;
    aPath = paths.aPath;
    return {
        commonAsyncMock: initCommonAsyncData(paths.commonAsync),
        mockData: urlMap.map(function (page) { return mock(page); })
    };
}
function convertPathes(config) {
    var paths = Object.assign({
        urlMap: false,
        commonSync: false,
        pageSync: false,
        commonAsync: false,
        async: false
    }, config.dataPath);
    var errors = [];
    if (paths.urlMap) {
        paths.uPath = path.resolve(paths.urlMap);
    }
    else {
        console.error('URLMap not found!');
        process.exit(1);
    }
    if (paths.commonSync) {
        paths.cPath = path.resolve(paths.commonSync);
    }
    else {
        errors.push('Common ftl mock data not found.');
    }
    if (paths.pageSync) {
        paths.pPath = path.resolve(paths.pageSync);
    }
    else {
        errors.push('Page ftl mock data not found.');
    }
    if (paths.commonAsync) {
        paths.commonAsync = path.resolve(paths.commonAsync);
    }
    else {
        errors.push('Common async mock data not found');
    }
    if (paths.pageAsync) {
        paths.aPath = path.resolve(paths.pageAsync);
    }
    else {
        errors.push('Page async mock data not found.');
    }
    errors.forEach(function (error) {
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
    }
    catch (e) {
        console.info(e);
    }
    countResolvedPage();
    return page;
}
function countResolvedPage() {
    initialedPage++;
    var percent = (initialedPage / urlMap.length * 100).toFixed(2);
    if (percent == '100.00') {
        percent = 100;
    }
    Print.update("          Loading configuration ... " + percent + "%");
}
function initCommonFtl(page, cPath) {
    if (!cPath) {
        return;
    }
    var fileIterator = fileUtil.listFilesSync(cPath, function (name) {
        if (!fileUtil.isImportable(name)) {
            return false;
        }
        return fs.statSync(cPath + "/" + name).isFile();
    });
    fileIterator(function (fileName) {
        var data = j5require(cPath + "/" + fileName);
        extend(page.syncData, data);
    });
}
function initPageFtl(page, pPath) {
    if (!pPath) {
        return;
    }
    var basename = page.entry.slice(1).replace(/\//g, '.');
    var ftlMockFilePath = path.join(pPath, basename || 'index');
    var ftlMockFilePath1 = ftlMockFilePath + '.json';
    var ftlMockFilePath2 = ftlMockFilePath + '.json5';
    extend(page.syncData, j5require(ftlMockFilePath1));
    extend(page.syncData, j5require(ftlMockFilePath2));
}
function initAJAX(page, aPath) {
    page.async = [];
    if (!aPath || page.entry == '/') {
        return;
    }
    var relativePath = page.entry.slice(1).replace(/\//g, '.');
    var asyncFolderPath = path.join(aPath, relativePath);
    if (!fs.existsSync(asyncFolderPath)) {
        return;
    }
    var fileIterator = fileUtil
        .listFilesSync(asyncFolderPath, function (item) { return /\.json(5)?$/.test(item); });
    fileIterator(function (fileName) {
        var filename = path.join(asyncFolderPath, fileName);
        var jsFilename = '';
        var handler = null;
        if (filename.match(/\.json5$/)) {
            jsFilename = filename.slice(0, filename.length - 3);
        }
        if (filename.match(/\.json$/)) {
            jsFilename = filename.slice(0, filename.length - 2);
        }
        if (fs.existsSync(jsFilename)) {
            handler = require(jsFilename);
        }
        var json = j5require(filename);
        if (json) {
            json.handler = handler;
            page.async.push(json);
        }
    });
}
function initCommonAsyncData(folder) {
    var res = [];
    if (!folder) {
        return res;
    }
    var subFolderIterator = fileUtil.listFilesSync(folder, function (f) {
        return fs.statSync(path.join(folder, f)).isDirectory();
    });
    subFolderIterator(function (f) {
        var urls = mergeRequire(path.join(folder, f, 'url'), Array);
        var data = mergeRequire(path.join(folder, f, 'data'));
        res.push({ urls: urls, data: data });
    });
    return res;
}
function mergeRequire(pathLeft, type) {
    if (type === void 0) { type = Object; }
    var paths = ['.js', '.json', '.json5'].map(function (suffix) {
        return pathLeft + suffix;
    });
    var defaultData = getDefaultData(type);
    var res = getDefaultData(type);
    paths.forEach(function (p) {
        var data = fileUtil.json5Require(p) || defaultData;
        console.info(pathLeft, '===============');
        console.info(data);
        if (type === Array) {
            (_a = res).push.apply(_a, data);
        }
        else {
            Object.assign(res, data);
        }
        var _a;
    });
    return res;
}
function getDefaultData(type) {
    switch (type) {
        case Array: return [];
        default: return {};
    }
}
exports["default"] = {
    scan: initMockData,
    template: config_1["default"].template,
    authConfig: config_1["default"].authConfig,
    proxyConfig: config_1["default"].proxyConfig,
    serverPort: config_1["default"].serverConfig.port || 3000
};
//# sourceMappingURL=index.js.map