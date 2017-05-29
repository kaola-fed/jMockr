const fs = require('fs');
const pify = require('pify');
const request = require('supertest');
const runServer = require('../index');
const path = require('path');

const r = request('http://localhost:4500');

let childProcess;
beforeAll(async () => {
    console.info('Run server...');
    childProcess = runServer();
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

afterAll(() => {
    childProcess.kill();
    console.info('Kill server.');
});
