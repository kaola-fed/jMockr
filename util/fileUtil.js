const fs = require('fs');
const JSON5 = require('json5');

function listFiles(path, myFilter) {
    return new Promise(function(resolve, reject) {
        fs.readdir(path, function(err, files) {
            if (err) {
                // console.info(`读取目录[${path}]失败`);
                // console.info(err);
                reject(err);
            } else {
                resolve(files.filter(myFilter || (() => true)));
            }
        });
    });
}

function listFilesSync(path, myFilter = () => true) {
    const files = fs.readdirSync(path).filter(myFilter);
    return (operation) => {
        files.forEach((file) => {
            operation(file);
        });
    };
}

function readFile(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, 'utf-8', (err, data) => {
            if (err) {
                console.error('read error');
                reject();
                throw err;
            } else {
                resolve(data);
            }
        });
    });
}

function makeFile(args) {
    return new Promise((resolve, reject) => {
        fs.open(args.path, args.mode || 'a', (err, fd) => {
            if (err) {
                reject(err);
                console.info('打开失败');
                console.info(err);
            } else {
                writeFile(fd, args.content)
                    .then(resolve)
                    .catch(reject);
            }
        });
    });
}

function writeFile(fd, data) {
    return new Promise((resolve, reject) => {
        fs.appendFile(fd, data, 'utf-8', (err, data) => {
            if (err) {
                reject();
            } else {
                resolve();
            }
        });
    });
}

function json5Require(filePath) {
    if (!fs.existsSync(filePath)) {
        // console.info(`File [${path}] not exist!`);
        return null;
    }
    try {
        if (/\.js$/.test(filePath)) {
            purgeCache(filePath);
            return require(filePath);
        }

        const fileContent = fs.readFileSync(filePath);
        return JSON5.parse(fileContent);
    } catch (e) {
        console.info(`require json5 file [${filePath}] failed`, e);
        return null;
    }
}

function isImportable(fileName) {
    return /\.(js|json|json5)$/.test(fileName);
}

/**
 * Removes a module from the cache
 */
function purgeCache(moduleName) {
    // Traverse the cache looking for the files
    // loaded by the specified module name
    searchCache(moduleName, function(mod) {
        delete require.cache[mod.id];
    });

    // Remove cached paths to the module.
    // Thanks to @bentael for pointing this out.
    Object.keys(module.constructor._pathCache).forEach(function(cacheKey) {
        if (cacheKey.indexOf(moduleName) > 0) {
            delete module.constructor._pathCache[cacheKey];
        }
    });
};

/**
 * Traverses the cache to search for all the cached
 * files of the specified module name
 */
function searchCache(moduleName, callback) {
    // Resolve the module identified by the specified name
    let mod = require.resolve(moduleName);

    // Check if the module has been resolved and found within
    // the cache
    if (mod && ((mod = require.cache[mod]) !== undefined)) {
        // Recursively go over the results
        (function traverse(mod) {
            // Go over each of the module's children and
            // traverse them
            mod.children.forEach(function(child) {
                traverse(child);
            });

            // Call the specified callback providing the
            // found cached module
            callback(mod);
        }(mod));
    }
};

module.exports = {
    listFiles,
    listFilesSync,
    readFile,
    makeFile,
    json5Require,
    isImportable,
};
