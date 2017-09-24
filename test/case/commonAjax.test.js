/* global beforeAll expect test afterAll */

const runServer = require('../index');
const { get, kill } = require('../util');

let childProcess;

const commonAsyncCfg = [
    {
        urls: [
            '/abc/def.do',
            '/xxx/xxx.html',
        ],
        data: {
            data: {
                name: 'Jerry',
            },
        },
    }, {
        urls: [
            '/getTheNumber/please',
            '/tell.me.the.number',
        ],
        data: {
            number: 123,
        },
    }, {
        urls: [
            '/house.ajax.fu',
            '/houseInfo.com',
        ],
        data: {
            house: {
                name: 'the house',
                people: [
                    {
                        name: 'person1',
                        age: 12,
                    }, {
                        name: 'person2',
                        age: 22,
                    },
                ],
            },
        },
    },
];


beforeAll(() => {
    childProcess = runServer('s');
    return new Promise((resolve, reject) => {
        return setTimeout(resolve, 1500);
    });
});

test('Common ajax config runs well', async () => {
    expect.assertions();
    commonAsyncCfg.forEach((cfg) => {
        cfg.urls.forEach((url) => {
            get(`http://localhost:4500${url}`, (res) => {
                expect(res.body).toEqual(cfg.data);
            });
        });
    });
});

afterAll(() => {
    kill(childProcess.pid);
});
