"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function init(app, urlMap, commonAsync) {
    urlMap.forEach(function (page) {
        if (!page.async) {
            return;
        }
        page.async.forEach(function (opt) {
            try {
                opt.method = opt.method || 'post';
                opt.method.split(',').forEach(function (m) {
                    app[m.toLowerCase()](opt.url, function (req, res, next) {
                        res.json(opt.result);
                    });
                });
            }
            catch (e) {
                throw new Error("Error initializing page async data:" + opt.url);
            }
        });
    });
    commonAsync.forEach(function (cfg) {
        try {
            cfg.urls.forEach(function (url) {
                app.use(url, function (req, res) {
                    res.json(cfg.data);
                });
            });
        }
        catch (e) {
            throw new Error("Error initializing common async data.");
        }
    });
    app.use(function (req, res) {
        console.info(404);
        console.info(req.originalUrl);
        res.status(404).send('Page not found.');
    });
}
exports.default = { init: init };
//# sourceMappingURL=no-proxy-ajax.js.map