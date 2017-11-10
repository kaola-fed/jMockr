import * as fs from 'fs'
import * as JSON5 from 'json5'

interface ReturnVoid {
    (value?: any): void
}

interface Filter {
    (input?: any): boolean
}

function listFiles(path: string, myFilter: ((p: string) => {r: boolean})): any {
    return new Promise((resolve: ReturnVoid, reject: any): void => {
        fs.readdir(path, (err: any, files: string[]): void => {
            if (err) {
                reject(err)
            } else {
                resolve(files.filter(myFilter || ((): boolean => true)))
            }
        })
    })
}

function listFilesSync(path: string, myFilter: Filter = ((): boolean => true)): ReturnVoid {
    const files: string[] = fs.readdirSync(path).filter(myFilter)
    return (operation: ReturnVoid): void => {
        files.forEach((file: string) => {
            operation(file)
        })
    }
}

function readFile(path: string): any {
    return new Promise((resolve: ReturnVoid, reject: ReturnVoid): void => {
        fs.readFile(path, 'utf-8', (err: any, data: any): void => {
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
    mode?: string,
}): any {
    return new Promise((resolve: ReturnVoid, reject: ReturnVoid): void => {
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

function writeFile(fd: any, data: any): any {
    return new Promise((resolve: ReturnVoid, reject: ReturnVoid): void => {
        fs.appendFile(fd, data, 'utf-8', (err: any): void => {
            if (err) {
                reject()
            } else {
                resolve()
            }
        })
    })
}

function json5Require(filePath: string): string | null {
    if (!fs.existsSync(filePath)) {
        // console.info(`File [${path}] not exist!`)
        return null
    }
    try {
        if (/\.js$/.test(filePath)) {
            purgeCache(filePath)
            return require(filePath)
        }

        const fileContent: string = fs.readFileSync(filePath, {})
        return JSON5.parse(fileContent)
    } catch (e) {
        console.info(`require json5 file [${filePath}] failed`, e)
        return null
    }
}

function isImportable(fileName: string): boolean {
    return /\.(js|json|json5)$/.test(fileName)
}

/**
 * Removes a module from the cache
 */
function purgeCache(moduleName: string): void {
    // Traverse the cache looking for the files
    // loaded by the specified module name
    searchCache(moduleName, function(mod: { id: string | number }): void {
        delete require.cache[mod.id]
    })

    // Remove cached paths to the module.
    // Thanks to @bentael for pointing this out.
    Object.keys((<any> module.constructor)._pathCache).forEach((cacheKey: string): void => {
        if (cacheKey.indexOf(moduleName) > 0) {
            delete (module.constructor as any)._pathCache[cacheKey]
        }
    })
}

/**
 * Traverses the cache to search for all the cached
 * files of the specified module name
 */
function searchCache(moduleName: string, callback: ReturnVoid): void {
    // Resolve the module identified by the specified name
    let mod: any = require.resolve(moduleName)

    // Check if the module has been resolved and found within
    // the cache
    if (mod && ((mod = require.cache[mod]) !== undefined)) {
        // Recursively go over the results
        (function traverse(mod: any): void {
            // Go over each of the module's children and
            // traverse them
            mod.children.forEach(function(child: any): void {
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
