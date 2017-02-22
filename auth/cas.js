
const config = require('../scanner/index');
const cfg = config.authConfig;
const sg = require('superagent');

const superagent = sg.agent();//直接用sg的话, 不会保存cookie

function getRedirectLocation(url, opt) {
    return new Promise((resolve, reject) => {
        opt = opt || {};
        superagent.get(url)
            .set({
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.90 Safari/537.36',
                'Cookie': opt.cookie || {},
                'Connection': 'keep-alive'
            })
            .end((err, res) => {
                if (err) {
                    console.info('Error on getting redirect location.');
                    reject(err);
                } else {
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
    return new Promise((resolve, reject) => {
        getRedirectLocation('https://casserver-test.kaola.com/login.do')
            .then((ret) => {
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
    return new Promise((resolve, reject) => {
        getExecutionValue()
            .then((result) => {
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
                    .end((err, res) => {
                        if (err) {
                            console.info('Error on sending login request.');
                            reject(err);
                        } else {
                            let tempUrl = 'https://globalms.netease.com';
                            superagent.get(tempUrl)
                                .end((err, res) => {
                                    if (err) {
                                        console.info('Login error.');
                                        reject(err);
                                    } else {
                                        console.info('Login finished !')
                                        resolve(superagent);
                                    }
                                });
                        }
                    });
            }).catch((err) => {
                console.info('Error getting execution value.');
                reject(err);
            });
    });
}
module.exports = {
    login
};
