const fs = require('fs');
const JSON5 = require('json5');

function listFiles(path, myFilter) {
    return new Promise(function(resolve, reject) {
        fs.readdir(path, function(err, files) {
            if (err) {
                //console.info(`读取目录[${path}]失败`);
                //console.info(err);
                reject(err);
            } else {
                resolve(files.filter(myFilter||function(){return true}));
            }
        });
    });
}

function readFile(path) {
    return new Promise(function (resolve, reject) {
        fs.readFile(path, 'utf-8', function (err, data) {
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
    return new Promise(function (resolve, reject) {
        fs.open(args.path, args.mode || 'a', function(err ,fd) {
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
    return new Promise(function(resolve, reject) {
        fs.appendFile(fd, data, 'utf-8', function(err, data) {
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
        if (/\.js$/.test(filePath)) return require(filePath);

        let fileContent = fs.readFileSync(filePath);
        return JSON5.parse(fileContent);
    } catch (e) {
        console.info(`require json5 file [${filePath}] failed`, e);
        return null;
    }
}

module.exports = {
    listFiles,
    readFile,
    makeFile,
    json5Require
};
