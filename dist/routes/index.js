'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var path = require('path');
var config = require('../scanner/config');
var scanner = require('../scanner/index');
var uploadImg = require('./upload-img');
var uploadFile = require('./upload-file');
var noProxyAjax = require('./noProxyAjax');
var proxyAjax = require('./proxyAjax');
var proxyConfig = scanner.proxyConfig;
var injector = require('connect-inject');
function getRender(type) {
    if (type === void 0) { type = 'freemarker'; }
    switch (type) {
        case 'freemarker':
            return require('@ybq/jmockr-ftl-render')({
                templateRoot: config.templateRoot,
                moduleFtlPathes: config.moduleFtlPathes,
            });
        case 'thymeleaf':
            var _a = require('thymeleaf'), TemplateEngine = _a.TemplateEngine, StandardDialect = _a.StandardDialect;
            var engine_1 = new TemplateEngine({
                dialects: [new StandardDialect('th')],
            });
            return function (template, syncData, cb) {
                var absolutePath = path.resolve(config.templateRoot, template);
                engine_1.processFile(absolutePath, syncData)
                    .then(function (result) {
                    cb(result);
                })
                    .catch(function (e) {
                    console.error('render error', e);
                    cb(e);
                });
            };
        default:
            console.error('Invalid template type:', type);
            throw new Error("Invalid template type:" + type);
    }
}
function initRequestMap(app, cb) {
    var render = getRender(config.templateType || 'freemarker');
    var _a = scanner.scan(), commonAsyncMock = _a.commonAsyncMock, mockData = _a.mockData;
    initCORS(app);
    initWebSocket(app);
    mockData.forEach(function (page) {
        try {
            app.get(page.entry, function (req, res, next) {
                if (req.xhr) {
                    next();
                }
                else {
                    page.syncData.RequestParameters = req.query || {};
                    render(page.template, page.syncData, function (html) {
                        res.send(html);
                    });
                }
            });
        }
        catch (e) {
            throw new Error("Error initializing page entry:" + page.entry);
        }
    });
    uploadImg(app);
    uploadFile(app);
    if (proxyConfig.enable) {
        proxyAjax.init(app);
    }
    else {
        noProxyAjax.init(app, mockData, commonAsyncMock);
    }
    return cb();
}
function initCORS(app) {
    app.all('*', function (req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');
        res.header('Access-Control-Allow-Methods', 'POST, GET');
        next();
    });
}
function initWebSocket(app) {
    app.get('/socket.io.js', function (req, res, next) {
        res.sendFile(path.resolve(__dirname, '../script/socket.io.js'));
    });
    app.use(injector({
        snippet: "\n        <script src=\"/socket.io.js\"></script>\n        <script>\n            var socket = io()\n            socket.on('reload', function(msg) {\n                location.reload()\n            })\n        </script>\n        ",
    }));
}
exports.default = initRequestMap;
//# sourceMappingURL=index.js.map