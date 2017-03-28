#!/usr/bin/env node
'use strict';

const path = require('path');
const cmdify = require('cmdify');
const config = require('../scanner/config');

const version = require('../package.json').version;
const parseArgv = require('minimist');

const nodemon = require('nodemon');
const app = require('../app');
const spawn = require('child_process').spawn;
let args = parseArgv(process.argv.slice(2));

index(args);

function index(args) {
    sayHello();
    if (argsUnknown(args) || args.h || args.help) {
        return showHelp();
    }
    if (args.n || args.normal) {
        console.info('普通启动');
        return app.run();
    }
    if (args.s || args.start) {
        console.info('mock 数据热更新启动');
        return nodemon({
            script: path.resolve(__dirname, '../appLauncher.js'),
            ext: 'js json'
        });
    }
    if (args.l || args.live) {
        //https://browsersync.io/docs/options
        console.info('页面live reload 启动(alpha)');
        nodemon({
            script: path.resolve(__dirname, '../appLauncher.js'),
            ext: 'js json'
        });
        let path2Watch = config.liveReload.watch.join(', ');
        let path2Ignore = config.liveReload.ignore.map(p => `!${p}`).join(', ');
        spawn(cmdify('browser-sync'), [
            'start', '--proxy', `localhost:${config.serverConfig.port}`, `--files`, `${path2Watch}, ${path2Ignore}`],
            {stdio: 'inherit'});
    }
    if (args.v || args.version) {
        console.info(version);
    }
}

function argsUnknown(args) {
    return [
        'h', 'help',
        'n', 'normal',
        'l', 'live',
        's', 'start',
        'v', 'version'
    ].every((name) => {
        return !args.hasOwnProperty(name);
    });
}

function showHelp() {
    console.info('=======================================');
    console.info('-h, --help\tshow help');
    console.info('-n, --normal\t普通启动, 修改mock数据或页面代码, 不会重启服务器');
    console.info('-s, --start\t热启动, 修改mock数据会触发jmockr重启');
    console.info('-l, --live\t带有live reload功能的热启动, 修改页面代码时会自动刷新浏览器');
    console.info('=======================================');
}

function sayHello() {
    console.info('============Welcome using jMockr=======');
}
