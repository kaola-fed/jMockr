
function init(app, urlMap, urlsReturn200) {
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
module.exports = {
    init
};
