const fs = require('fs');
const request = require('supertest');
const runServer = require('../index');
const path = require('path');

const r = request('http://localhost:4500');

let childProcess;
beforeAll(async () => {
    childProcess = runServer('s');
    return new Promise((resolve, reject) => {
        return setTimeout(resolve, 1500);
    });
});

test.only('get home page should return status 200', () => {
    return r.get('/')
        .expect((res) => {
            expect(res.status).toBe(200);
        });
});

afterAll(() => {
    childProcess.kill();
});
