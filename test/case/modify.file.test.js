/* global beforeAll expect test afterAll */

const fs = require('fs');
const fileUtil = require('../../util/fileUtil');
const path = require('path');
const pify = require('pify');
const request = require('supertest');
const runServer = require('../index');
const { get, kill } = require('../util');
const r = request('http://localhost:4500');

let childProcess;
let originURLs;
const filePath = path.join(__dirname, '../mock/commonAjax/retCode200/url.json5');
let urls;

beforeAll(() => {
    childProcess = runServer('s');
    originURLs = fileUtil.json5Require(filePath);
    urls = originURLs.map((url) => `http://localhost:4500${url}`);
    console.info(urls);
    return new Promise((resolve, reject) => {
        return setTimeout(resolve, 1500);
    });
});


test('get home page should return status 200', () => {
    return r.get('/')
        .expect((res) => {
            expect(res.status).toBe(200);
        });
});


test('Before delete, all url are reachable', async () => {
    expect.assertions(urls.length);
    for (const url of urls) {
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
    const firstURL = originURLs[0];
    const newURL = '/notExists.do';
    const newContent = JSON.stringify([firstURL, newURL]).replace(/^"|"$/g, '');
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

afterAll(() => {
    kill(childProcess.pid);
    fs.writeFile(filePath, JSON.stringify(originURLs).replace(/^"|"$/g, ''));
});
