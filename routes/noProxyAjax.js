
function init(app, urlMap, commonAsync) {
    urlMap.forEach((page) => {
        if (!page.async) {
            return;
        }
        page.async.forEach((opt) => {
            try {
                opt.method = opt.method || 'post';
                opt.method.split(',').forEach(function(m) {
                    app[m.toLowerCase()](opt.url, (req, res, next) => {
                        res.json(opt.result);
                    });
                });
            } catch (e) {
                throw new Error(`Error initializing page async data:${opt.url}`);
            }
        });
    });

    commonAsync.forEach((cfg) => {
        try {
            cfg.urls.forEach((url) => {
                app.use(url, (req, res) => {
                    res.json(cfg.data);
                });
            });
        } catch (e) {
            throw new Error(`Error initializing common async data.`);
        }
    });

    app.use((req, res) => {
        console.info(404);
        console.info(req.originalUrl);
        res.status(404).send('Page not found.');
    });
}
module.exports = { init };
