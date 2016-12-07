const ftlParser = require('../ftl_parse');
const urlMap = require('../mock/index');
const onMockFinish = urlMap.onMockFinish;
const logUtil = require(`../util/logUtil`);
const uploadImg = require('./uploadImg');
const urlsReturn200 = require('../mock/ajax/retCode200');

function initRequestMap(app) {
    //初始化页面入口路由
    urlMap.forEach(function(page) {
        try {
            app.get(page.entry, (req, res, next) => {
                if (req.xhr) {
                    next();
                } else {
                    ftlParser.render(page.ftlPath, (html) => {
                        res.send(html);
                    }, page.ftlData);
                }
            });
        } catch (e) {
            throw `Error initializing page entry:${page.entry}`;
        }
    });
    //初始化ajax路由
    urlMap.forEach((page) => {
        if (!page.ajax) return;
        page.ajax.forEach((opt) => {
            try {
                opt.method = opt.method || 'post';
                opt.method.split(',').forEach(function(m) {
                    app[m.toLowerCase()](opt.url, (req, res, next) => {
                        res.json(opt.result);
                    });
                });
            } catch (e) {
                throw `Error initializing ajax:${opt.url}`;
            }
        });
    });

    urlsReturn200.forEach((url) => {
        try {
            app.use(url, (req, res) => {
                res.json({
                    retCode: 200
                });
            });
        } catch (e) {
            throw `Error initializing retCode200 ajax:${url}`;
        }
    });

    app.use((req, res) => {
        console.info(404);
        console.info(req.originalUrl);
        res.status(404).send('Page not found.');
    });
}

module.exports = function(app) {
    return new Promise((resolve, reject) => {
        try {
            //初始化图片上传路由
            uploadImg(app);

            onMockFinish(() => {
                try {
                    initRequestMap(app);
                    resolve();
                } catch (e) {
                    reject(e);
                }
            });
        } catch(e) {
            reject(e);
        }
    });
};
