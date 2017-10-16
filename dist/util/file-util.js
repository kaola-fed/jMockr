"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require('fs');
var JSON5 = require('json5');
function listFiles(path, myFilter) {
    return new Promise(function (resolve, reject) {
        fs.readdir(path, function (err, files) {
            if (err) {
                reject(err);
            }
            else {
                resolve(files.filter(myFilter || (function () { return true; })));
            }
        });
    });
}
exports.listFiles = listFiles;
function listFilesSync(path, myFilter) {
    if (myFilter === void 0) { myFilter = function () { return true; }; }
    var files = fs.readdirSync(path).filter(myFilter);
    return function (operation) {
        files.forEach(function (file) {
            operation(file);
        });
    };
}
exports.listFilesSync = listFilesSync;
function readFile(path) {
    return new Promise(function (resolve, reject) {
        fs.readFile(path, 'utf-8', function (err, data) {
            if (err) {
                console.error('read error');
                reject();
                throw err;
            }
            else {
                resolve(data);
            }
        });
    });
}
exports.readFile = readFile;
function makeFile(args) {
    return new Promise(function (resolve, reject) {
        fs.open(args.path, args.mode || 'a', function (err, fd) {
            if (err) {
                reject(err);
                console.info('打开失败');
                console.info(err);
            }
            else {
                writeFile(fd, args.content)
                    .then(resolve)
                    .catch(reject);
            }
        });
    });
}
exports.makeFile = makeFile;
function writeFile(fd, data) {
    return new Promise(function (resolve, reject) {
        fs.appendFile(fd, data, 'utf-8', function (err, data) {
            if (err) {
                reject();
            }
            else {
                resolve();
            }
        });
    });
}
function json5Require(filePath) {
    if (!fs.existsSync(filePath)) {
        return null;
    }
    try {
        if (/\.js$/.test(filePath)) {
            purgeCache(filePath);
            return require(filePath);
        }
        var fileContent = fs.readFileSync(filePath);
        return JSON5.parse(fileContent);
    }
    catch (e) {
        console.info("require json5 file [" + filePath + "] failed", e);
        return null;
    }
}
exports.json5Require = json5Require;
function isImportable(fileName) {
    return /\.(js|json|json5)$/.test(fileName);
}
exports.isImportable = isImportable;
function purgeCache(moduleName) {
    searchCache(moduleName, function (mod) {
        delete require.cache[mod.id];
    });
    Object.keys(module.constructor._pathCache).forEach(function (cacheKey) {
        if (cacheKey.indexOf(moduleName) > 0) {
            delete module.constructor._pathCache[cacheKey];
        }
    });
}
function searchCache(moduleName, callback) {
    var mod = require.resolve(moduleName);
    if (mod && ((mod = require.cache[mod]) !== undefined)) {
        (function traverse(mod) {
            mod.children.forEach(function (child) {
                traverse(child);
            });
            callback(mod);
        }(mod));
    }
}
//# sourceMappingURL=file-util.js.map