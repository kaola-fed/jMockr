'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var path = require('path');
var config_1 = require("../scanner/config");
var index_1 = require("../scanner/index");
var upload_img_1 = require("./upload-img");
var upload_file_1 = require("./upload-file");
var no_proxy_ajax_1 = require("./no-proxy-ajax");
var proxyAjax = require('./proxy-ajax');
var proxyConfig = index_1.default.proxyConfig;
var injector = require('connect-inject');
function getRender(type) {
    if (type === void 0) { type = 'freemarker'; }
    switch (type) {
        case 'freemarker':
            return require('@ybq/jmockr-ftl-render')({
                templateRoot: config_1.default.templateRoot,
                moduleFtlPathes: config_1.default.moduleFtlPathes,
            });
        case 'thymeleaf':
            var _a = require('thymeleaf'), TemplateEngine = _a.TemplateEngine, StandardDialect = _a.StandardDialect;
            var engine_1 = new TemplateEngine({
                dialects: [new StandardDialect('th')],
            });
            return function (template, syncData, cb) {
                var absolutePath = path.resolve(config_1.default.templateRoot, template);
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
    var render = getRender(config_1.default.templateType || 'freemarker');
    var _a = index_1.default.scan(), commonAsyncMock = _a.commonAsyncMock, mockData = _a.mockData;
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
    upload_img_1.default(app);
    upload_file_1.default(app);
    if (proxyConfig.enable) {
        proxyAjax.init(app);
    }
    else {
        no_proxy_ajax_1.default.init(app, mockData, commonAsyncMock);
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