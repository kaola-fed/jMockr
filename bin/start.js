#!/usr/bin/env node
'use strict';

const version = require('../package.json').version;
const parseArgv = require('minimist');

const nodemon = require('nodemon');
const app = require('../app');

let args = parseArgv(process.argv.slice(2));

index(args);

function index(args) {
    if (args.n || args.normal) {
        console.info('普通启动');
        app.run();
    }
    if (args.s || args.start) {
        console.info('mock 数据热更新启动');
        nodemon({
          script: 'appLauncher.js',
          ext: 'js json'
        });
    }
    if (args.h || args.hot) {
        //https://browsersync.io/docs/options
        console.info('页面live reload 启动(暂不支持)')
    }
    if (args.v || args.version) {
        console.info(version);
    }
}
