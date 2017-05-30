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
                            return resolve(judge(res));
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

// test('test promise', async () => {
//     expect.assertions(2);
//     await get('https://www.baidu.com');
//     await get('http://www.qq.com');
// });

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

async function timeout(ms) {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function changeRetCode200() {
    let firstURL = originURLs[0];
    let newURL = '/notExists.do';
    let newContent = JSON.stringify([firstURL, newURL]).replace(/^"|"$/g, '');
    await pify(fs.writeFile)(filePath, newContent);
    await timeout(2000);
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

async function writeFile(path, str) {

}

afterAll(() => {
    childProcess.kill();
    fs.writeFile(filePath, JSON.stringify(originURLs).replace(/^"|"$/g, ''));
});
// get(console.info);
