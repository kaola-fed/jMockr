const fs = require('fs')
const JSON5 = require('json5')

function listFiles(path: string, myFilter: ((p: string) => {r: boolean})) {
    return new Promise((resolve: ((value?: any) => void), reject: any) => {
        fs.readdir(path, function(err: any, files: string[]) {
            if (err) {
                reject(err)
            } else {
                resolve(files.filter(myFilter || (() => true)))
            }
        })
    })
}

function listFilesSync(path: string, myFilter = () => true) {
    const files = fs.readdirSync(path).filter(myFilter)
    return (operation: (value: string) => void) => {
        files.forEach((file: string) => {
            operation(file)
        })
    }
}

function readFile(path: string) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, 'utf-8', (err: string, data: any) => {
            if (err) {
                console.error('read error')
                reject()
                throw err
            } else {
                resolve(data)
            }
        })
    })
}

function makeFile(args: {
    content: string,
    path: string,
    mode: string,
}) {
    return new Promise((resolve, reject) => {
        fs.open(args.path, args.mode || 'a', (err: any, fd: any) => {
            if (err) {
                reject(err)
                console.info('打开失败')
                console.info(err)
            } else {
                writeFile(fd, args.content)
                    .then(resolve)
                    .catch(reject)
            }
        })
    })
}

function writeFile(fd: any, data: any) {
    return new Promise((resolve, reject) => {
        fs.appendFile(fd, data, 'utf-8', (err: any, data: any) => {
            if (err) {
                reject()
            } else {
                resolve()
            }
        })
    })
}

function json5Require(filePath: string) {
    if (!fs.existsSync(filePath)) {
        // console.info(`File [${path}] not exist!`)
        return null
    }
    try {
        if (/\.js$/.test(filePath)) {
            purgeCache(filePath)
            return require(filePath)
        }

        const fileContent = fs.readFileSync(filePath)
        return JSON5.parse(fileContent)
    } catch (e) {
        console.info(`require json5 file [${filePath}] failed`, e)
        return null
    }
}

function isImportable(fileName: string) {
    return /\.(js|json|json5)$/.test(fileName)
}

/**
 * Removes a module from the cache
 */
function purgeCache(moduleName: string) {
    // Traverse the cache looking for the files
    // loaded by the specified module name
    searchCache(moduleName, function(mod: { id: string | number }) {
        delete require.cache[mod.id]
    })

    // Remove cached paths to the module.
    // Thanks to @bentael for pointing this out.
    Object.keys((module.constructor as any)._pathCache).forEach(function(cacheKey) {
        if (cacheKey.indexOf(moduleName) > 0) {
            delete (module.constructor as any)._pathCache[cacheKey]
        }
    })
}

/**
 * Traverses the cache to search for all the cached
 * files of the specified module name
 */
function searchCache(moduleName: string, callback: (x: any) => void) {
    // Resolve the module identified by the specified name
    let mod: any = require.resolve(moduleName)

    // Check if the module has been resolved and found within
    // the cache
    if (mod && ((mod = require.cache[mod]) !== undefined)) {
        // Recursively go over the results
        (function traverse(mod) {
            // Go over each of the module's children and
            // traverse them
            mod.children.forEach(function(child: any) {
                traverse(child)
            })

            // Call the specified callback providing the
            // found cached module
            callback(mod)
        }(mod))
    }
}

export {
    listFiles,
    listFilesSync,
    readFile,
    makeFile,
    json5Require,
    isImportable,
}
