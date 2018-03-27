'use strict'

const path: any = require('path')
const fs: any = require('fs')
const fileUtil: any = require('../util/file-util')
const j5require: any = fileUtil.json5Require
import config from './config'
const Print: {
    update(input: string): void,
} = require('../util/print')
const extend: any = require('node.extend')

config.serverConfig = config.serverConfig || {}

/*
 * cPath: 公共ftl数据
 * pPath: 单页ftl数据
 * aPath: 单页异步数据
 * uPath: url--页面映射
 * url200Path: 只返回{retCode: 200} 的接口列表的文件地址
 */
let cPath: string
let pPath: string
let aPath: string
let initialedPage: number
let urlMap: [{
    [prop: string]: any,
}]

interface Page {
    syncData: {}
    template: string
    entry: string
    async: any[],
}

interface FileIterator {
    (fn: FileIteratorCallback): void
}

interface FileIteratorCallback {
    (filename: string): void
}

let suffix: string = '.ftl'
if (config.templateType === 'thymeleaf') {
    suffix = '.html'
}

function initMockData(): any {
    initialedPage = 0
    const paths: any = convertPathes(config)

    urlMap = j5require(paths.uPath) || []

    cPath = paths.cPath
    pPath = paths.pPath
    aPath = paths.aPath

    return {
        commonAsyncMock: initCommonAsyncData(paths.commonAsync),
        mockData: urlMap.map((page: {
            entry: string;
            template: string;
            syncData: {};
            async: any[];
        }) => mock(page)),
    }
}

function convertPathes(config: {
    dataPath: string,
}): {} {
    const paths: any = (<any> Object).assign({
        urlMap: false,
        commonSync: false,
        pageSync: false,
        commonAsync: false,
        async: false,
    }, config.dataPath)

    const errors: string[] = []
    if (paths.urlMap) {
        paths.uPath = path.resolve(paths.urlMap)
    } else {
        console.error('URLMap not found!')
        process.exit(1)
    }
    if (paths.commonSync) {
        paths.cPath = path.resolve(paths.commonSync)
    } else {
        errors.push('Common ftl mock data not found.')
    }
    if (paths.pageSync) {
        paths.pPath = path.resolve(paths.pageSync)
    } else {
        errors.push('Page ftl mock data not found.')
    }
    if (paths.commonAsync) {
        paths.commonAsync = path.resolve(paths.commonAsync)
    } else {
        errors.push('Common async mock data not found')
    }
    if (paths.pageAsync) {
        paths.aPath = path.resolve(paths.pageAsync)
    } else {
        errors.push('Page async mock data not found.')
    }
    errors.forEach((error: string): void => {
        console.error(error)
    })
    return paths
}

function mock(page: Page): {} {
    page.syncData = {}
    page.template += suffix
    try {
        initCommonFtl(page, cPath)
        initPageFtl(page, pPath)
        initAJAX(page, aPath)
    } catch (e) {
        console.info(e)
    }
    countResolvedPage()
    return page
}

function countResolvedPage(): void {
    initialedPage++
    let percent: string | number = (initialedPage / urlMap.length * 100).toFixed(2)
    if (percent == '100.00') {
        percent = 100
    }
    Print.update(`          Loading configuration ... ${percent}%`)
}

function initCommonFtl(page: Page, cPath: string | undefined): void {
    if (!cPath) {
        return
    }
    const fileIterator: FileIterator = fileUtil.listFilesSync(cPath, (name: string) => {
        if (!fileUtil.isImportable(name)) {
            return false
        }
        return fs.statSync(`${cPath}/${name}`).isFile()
    })
    fileIterator(function(fileName: string): void {
        const data: {} = j5require(`${cPath}/${fileName}`)
        extend(page.syncData, data)
    })
}

function initPageFtl(page: Page, pPath: string | undefined): void {
    if (!pPath) {
        return
    }
    const basename: string = page.entry.slice(1).replace(/\//g, '.')
    const ftlMockFilePath: string = path.join(pPath, basename || 'index')
    const ftlMockFilePath1: string = ftlMockFilePath + '.json'
    const ftlMockFilePath2: string = ftlMockFilePath + '.json5'

    extend(page.syncData, j5require(ftlMockFilePath1))
    extend(page.syncData, j5require(ftlMockFilePath2))
}

function initAJAX(page: Page, aPath: string | undefined): void {
    page.async = <any> []
    if (!aPath || page.entry == '/') {
        return
    }
    const relativePath: string = page.entry.slice(1).replace(/\//g, '.')
    const asyncFolderPath: string = path.join(aPath, relativePath)

    if (!fs.existsSync(asyncFolderPath)) {
        return
    }
    // 限制文件返回格式为json; 可以过滤mac中的隐藏文件, 如.DSstore, 防止读取异步数据配置失败
    const fileIterator: FileIterator = fileUtil
        .listFilesSync(asyncFolderPath, (item: string) => /\.json(5)?$/.test(item))

    fileIterator((fileName: string) => {
        const filename: string = path.join(asyncFolderPath, fileName)
        let jsFilename: string = ''
        let handler: any = null
        if (filename.match(/\.json5$/)) {
            jsFilename = filename.slice(0, filename.length - 3)
        }
        if (filename.match(/\.json$/)) {
            jsFilename = filename.slice(0, filename.length - 2)
        }
        if (fs.existsSync(jsFilename)) {
            handler = require(jsFilename)
        }
        const json: any = j5require(filename)
        if (json) {
            json.handler = handler
            page.async.push(json)
        }
    })
}
function initCommonAsyncData(folder: string | undefined): any[] {
    const res: any[] = <any> []
    if (!folder) {
        return res
    }
    const subFolderIterator: FileIterator = fileUtil.listFilesSync(folder, (f: string) => {
        return fs.statSync(path.join(folder, f)).isDirectory()
    })
    subFolderIterator((f: string): void => {
        const urls: string[] = <string[]> mergeRequire(
            path.join(folder, f, 'url'),
            Array,
        )

        const data: any = mergeRequire(path.join(folder, f, 'data'))
        res.push({ urls, data })
    })

    return res
}

function mergeRequire(pathLeft: string, type: Array<any> | Object = Object): any {
    const paths: string[] = ['.js', '.json', '.json5'].map((suffix: string): string => {
        return pathLeft + suffix
    })
    const defaultData: any[] | {} = getDefaultData(type)
    const res: any[] | {} = getDefaultData(type)
    paths.forEach((p: string): void => {
        const data: any[] | {} = fileUtil.json5Require(p) || defaultData
        console.info(pathLeft, '===============')
        console.info(data)
        if (type === Array) {
            (<any[]> res).push(...(<any[]> data))
        } else {
            (<any> Object).assign(res, data)
        }
    })
    return res
}

function getDefaultData(type: any): any[] | {} {
    switch (type) {
        case Array: return []
        default: return {}
    }
}

export default {
    scan: initMockData,
    template: config.template,
    authConfig: config.authConfig,
    proxyConfig: config.proxyConfig,
    serverPort: config.serverConfig.port || 3000,
}
