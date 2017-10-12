"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var package_json_1 = require("../package.json");
var parseArgv = require("minimist");
var chalk = require("chalk");
var mockDataWatcher_1 = require("../watcher/mockDataWatcher");
var pageWatcher_1 = require("../watcher/pageWatcher");
var app_1 = require("../app");
var args = parseArgv(process.argv.slice(2));
var AvailableFullCommands;
(function (AvailableFullCommands) {
    AvailableFullCommands["help"] = "help";
    AvailableFullCommands["normal"] = "normal";
    AvailableFullCommands["live"] = "live";
    AvailableFullCommands["start"] = "start";
    AvailableFullCommands["version"] = "version";
})(AvailableFullCommands || (AvailableFullCommands = {}));
var AvailableShortCommands;
(function (AvailableShortCommands) {
    AvailableShortCommands["h"] = "h";
    AvailableShortCommands["n"] = "n";
    AvailableShortCommands["l"] = "l";
    AvailableShortCommands["s"] = "s";
    AvailableShortCommands["v"] = "v";
})(AvailableShortCommands || (AvailableShortCommands = {}));
index(args);
function index(args) {
    sayHi();
    if (argsUnknown(args) || args.h || args.help) {
        showHelp();
    }
    else if (args.v || args.version) {
        console.info(package_json_1.default.version);
        process.exit(0);
    }
    else {
        app_1.default.start();
        if (args.n || args.normal)
            return;
        mockDataWatcher_1.default.addListener(function () {
            console.info('Mock data changed, restart server...');
            app_1.default.restart();
        });
        if (args.s || args.start)
            return;
        pageWatcher_1.default.addListener(function () {
            app_1.default.reloadPages();
        });
    }
}
function sayHi() {
    var welcomeMsg = '\n============Welcome using jMockr============';
    console.info(chalk.bgGreen.bold(welcomeMsg));
}
function argsUnknown(args) {
    return Object.keys(args).every(function (name) {
        return !(name in AvailableFullCommands) && !(name in AvailableShortCommands);
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
//# sourceMappingURL=start.js.map