exports.__esModule = true;
var config_1 = require("../scanner/config");
var cas_1 = require("../auth/cas");
var proxyCfg = config_1["default"].proxyConfig;
var log_util_1 = require("../util/log-util");
var urlRoot = proxyCfg.protocol + "://" + (proxyCfg.useIP ? proxyCfg.ip : proxyCfg.domain);
if (proxyCfg.enablePort) {
    urlRoot += ":" + (proxyCfg.port || '');
}
function init(app) {
    cas_1["default"].login()
        .then(function (superagent) {
        app.use(function (req, res) {
            var m = req.method.toLowerCase();
            var url = "" + urlRoot + req.path;
            log_util_1["default"].logRequest(req);
            superagent[m](url)
                .set({
                'Content-Type': req.get('Content-Type'),
                'User-Agent': req.get('User-Agent')
            })
                .query(req.query)
                .send(req.body)
                .end(function (err, sres) {
                if (err) {
                    console.info('Error in sres');
                    log_util_1["default"].logAgentRes(sres);
                    res.status(500)
                        .json({
                        retCode: 500,
                        retDesc: 'proxy Error'
                    });
                }
                else {
                    console.info('Response arrived.');
                    log_util_1["default"].logAgentRes(sres);
                    res.json(sres.body);
                }
            });
        });
    })["catch"](function (err) {
        console.info('Login CAS error.');
        console.info(err);
    });
}
exports["default"] = {
    init: init
};
//# sourceMappingURL=proxy-ajax.js.map