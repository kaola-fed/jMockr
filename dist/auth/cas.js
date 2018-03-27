exports.__esModule = true;
var config = require('../scanner/index');
var cfg = config.authConfig;
var sg = require('superagent');
var superagent = sg.agent();
function getRedirectLocation(url, opt) {
    return new Promise(function (resolve, reject) {
        opt = opt || {};
        superagent.get(url)
            .set({
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.90 Safari/537.36',
            'Cookie': opt.cookie || {},
            'Connection': 'keep-alive'
        })
            .end(function (err, res) {
            if (err) {
                console.info('Error on getting redirect location.');
                reject(err);
            }
            else {
                var redirectLocation = res.redirects[0];
                resolve({
                    url: redirectLocation,
                    res: res
                });
            }
        });
    });
}
function getExecutionValue() {
    return new Promise(function (resolve, reject) {
        getRedirectLocation(cfg.casDomain)
            .then(function (ret) {
            var reg = /execution=(.+)/;
            var value = reg.exec(ret.url)[1];
            resolve({
                value: value,
                url: ret.url
            });
        });
    });
}
function login() {
    console.info('Login...');
    return new Promise(function (resolve, reject) {
        getExecutionValue()
            .then(function (result) {
            superagent.post(result.url)
                .set({
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Host': 'casserver-test.kaola.com'
            })
                .send({
                username: cfg.username,
                password: cfg.password,
                lt: result.value,
                _eventId: 'submit'
            })
                .end(function (err, res) {
                if (err) {
                    console.info('Error on sending login request.');
                    reject(err);
                }
                else {
                    var tempUrl = 'https://globalms.netease.com';
                    superagent.get(tempUrl)
                        .end(function (err, res) {
                        if (err) {
                            console.info('Login error.');
                            reject(err);
                        }
                        else {
                            console.info('Login finished !');
                            resolve(superagent);
                        }
                    });
                }
            });
        })["catch"](function (err) {
            console.info('Error getting execution value.');
            reject(err);
        });
    });
}
exports["default"] = { login: login };
//# sourceMappingURL=cas.js.map