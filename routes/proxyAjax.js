const proxyCfg = require('../jmockr.config.json').proxyConfig;
const authTool = require('../auth/cas');
const logUtil = require('../util/logUtil');

let urlRoot = `${proxyCfg.protocol}://${proxyCfg.useIP ? proxyCfg.ip : proxyCfg.domain}`;

if (proxyCfg.enablePort) urlRoot += `:${proxyCfg.port || ''}`;

function init(app) {
    authTool.login()
        .then((superagent) => {
            app.use((req, res) => {
                var m = req.method.toLowerCase();
                var url = `${urlRoot}${req.path}`;
                console.info(url);
                logUtil.logRequest(req);
                superagent[m](url)
                    .set({
                        'Content-Type': req.get('Content-Type'),
                        'User-Agent': req.get('User-Agent')
                    })
                    .query(req.query)
                    .send(req.body)
                    .end((err, sres) => {
                        if (err) {
                            console.info('Error in sres');
                            logUtil.logAgentRes(sres);
                            res.status(500)
                                .json({
                                    retCode: 500,
                                    retDesc: 'proxy Error'
                                });
                        } else {
                            console.info('Response arrived.');
                            logUtil.logAgentRes(sres);
                            res.json(sres.body);
                        }
                    });
            });
        })
        .catch((err) => {
            console.info('Login CAS error.');
            console.info(err);
        });
}

module.exports = {
    init
};
