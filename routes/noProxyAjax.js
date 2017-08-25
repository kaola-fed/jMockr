
function init(app, urlMap, commonAjax) {
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
                throw new Error(`Error initializing ajax:${opt.url}`);
            }
        });
    });

    commonAjax.forEach((cfg) => {
        try {
            cfg.urls.forEach((url) => {
                app.use(url, (req, res) => {
                    res.json(cfg.data);
                });
            });
        } catch (e) {
            throw new Error(`Error initializing common ajax.`);
        }
    });

    app.use((req, res) => {
        console.info(404);
        console.info(req.originalUrl);
        res.status(404).send('Page not found.');
    });
}
module.exports = { init };
