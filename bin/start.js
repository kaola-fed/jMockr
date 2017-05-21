#!/usr/bin/env node
'use strict';

const path = require('path');
const config = require('../scanner/config');
const version = require('../package.json').version;
const parseArgv = require('minimist');
const chalk = require('chalk');

const watcher = require('../watcher/base');
const mockDataWatcher = require('../watcher/mockDataWatcher');
const pageWatcher = require('../watcher/pageWatcher');
const app = require('../app');

let args = parseArgv(process.argv.slice(2));

index(args);

function index(args) {
    sayHi();
    if (argsUnknown(args) || args.h || args.help) {
        showHelp();
    } else if (args.v || args.version) {
        console.info(version);
        process.exit(0);
    } else {
        app.start();
        if (args.n || args.normal) return; // Normal start, no file change detect.

        mockDataWatcher.addListener(() => {
            console.info('Mock data changed, restart server...');
            app.restart();
        });
        if (args.s || args.start) return; // Only restart when mock data changed.

        //Reload when page content changed.
        pageWatcher.addListener(() => {
            app.reloadPages();
        });
    }
}

function sayHi() {
    let welcomeMsg = '\n============Welcome using jMockr============';
    console.info(chalk.bgGreen.bold(welcomeMsg));
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
