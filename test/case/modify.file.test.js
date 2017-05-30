const fs = require('fs');
const fileUtil = require('../../util/fileUtil');
const request = require('supertest');
const runServer = require('../index');
const path = require('path');
const pify = require('pify');
const sg = require('superagent');

const r = request('http://localhost:4500');
// const r = request('https://www.baidu.com');

let childProcess;
let originURLs;
let filePath = path.join(__dirname, '../mock/ajax/retCode200.json');
let urls;

beforeAll(() => {
    childProcess = runServer('s');
    originURLs = fileUtil.json5Require(filePath)
    urls = originURLs.map(url => `http://localhost:4500${url}`);
    console.info(urls);
    return new Promise((resolve, reject) => {
        return setTimeout(resolve, 1500);
    });
});

function get(url, judge) {
    return new Promise((resolve, reject) => {
        try {
            sg.get(url)
                .end((err, res) => {
                    try {
                        if (err) {
                            if (judge) return resolve(judge(res));
                            else return resolve(expect(res.status).toBe(200));
                        }
                        if (judge) {
                            resolve(judge(res));
                        } else {
                            resolve(expect(res.status).toBe(200));
                        }
                    } catch (e) {
                        console.error('inner reject');
                        console.error('error on url ', url);
                        console.error(e);
                        resolve(e);
                    }
                });
        } catch (e) {
            console.error('outer reject')
            console.error(e);
            reject(e);
        }
    });
}

test('get home page should return status 200', () => {
    return r.get('/')
        .expect((res) => {
            expect(res.status).toBe(200);
        });
});

test('Before delete, all url are reachable', async () => {
    expect.assertions(urls.length);
    for (let url of urls) {
        await get(url, (res) => {
            expect(res && res.body && res.body.retCode).toBe(200);
        });
    }
});

test('After delete and add, route changes', async () => {
    expect.assertions(urls.length + 1);
    await changeRetCode200();
});

async function changeRetCode200() {
    let firstURL = originURLs[0];
    let newURL = '/notExists.do';
    let newContent = JSON.stringify([firstURL, newURL]).replace(/^"|"$/g, '');
    await pify(fs.writeFile)(filePath, newContent);
    await timeout(1000);
    for (let i = 0; i < urls.length; i++) {
        if (i === 0) {
            await get(urls[i]);
        } else {
            await get(urls[i], (res) => {
                expect(res.statusCode).toBe(404);
            });
        }
    }
    await get('http://localhost:4500' + newURL);
}


async function timeout(ms) {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// test('ignore', async () => {
//     await timeout(1000);
//     expect(1).toBeTruthy();
// });
var psTree = require('ps-tree');

var kill = function (pid, signal, callback) {
    signal   = signal || 'SIGKILL';
    callback = callback || function () {};
    var killTree = true;
    if(killTree) {
        psTree(pid, function (err, children) {
            [pid].concat(
                children.map(function (p) {
                    return p.PID;
                })
            ).forEach(function (tpid) {
                try { process.kill(tpid, signal) }
                catch (ex) { }
            });
            callback();
        });
    } else {
        try { process.kill(pid, signal) }
        catch (ex) { }
        callback();
    }
};

afterAll(() => {
    // childProcess.kill('SIGTERM');
    kill(childProcess.pid);
    // process.kill(childProcess.pid, 'SIGTERM');
    fs.writeFile(filePath, JSON.stringify(originURLs).replace(/^"|"$/g, ''));
});
