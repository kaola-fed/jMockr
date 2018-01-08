import { json5Require, makeFile } from './file-util'
import * as fs from 'fs'
import * as path from 'path'

async function migrate(): Promise<void> {
    console.info(`migrating...`)
    const filePath: string = path.resolve(process.cwd(), 'jmockr.config.json')
    if (!fs.existsSync(filePath)) {
        console.error(`Can't find config file [${filePath}]`)
        throw new Error(`Can't find config file [${filePath}]`)
    }
    try {
        const json: any = json5Require(filePath)
        json.templateType = 'freemarker'
        json.templateRoot = json.ftlFilePath
        const originDataPath: any = json.dataPath
        if (!fs.existsSync(originDataPath.ajax)) {
            throw new Error('ajax folder not found')
        }
        const commonAsyncDataPath: string = originDataPath.ajax + '_migrate-common'
        console.info(`before mkdir`, commonAsyncDataPath)
        fs.mkdirSync(commonAsyncDataPath)
        console.info(`before readfile`)
        const commonAsyncData: string = fs.readFileSync(originDataPath.url200, { encoding: 'utf8' })
        console.info(`here`)
        const newUrl200Path: string = path.resolve(commonAsyncDataPath, path.basename(originDataPath.url200))
        await makeFile({
            mode: 'w',
            path: newUrl200Path,
            content: commonAsyncData,
        })
        json.dataPath = {
            urlMap: originDataPath.urlMap,
            commonSync: originDataPath.commonFtl,
            commonAsync: commonAsyncDataPath,
            pageSync: originDataPath.pageFtl,
            pageAsync: originDataPath.ajax,
        }
        delete json.ftlFilePath
        const newContent: string = JSON.stringify(json, null, 4)
        fs.writeFileSync(filePath, newContent)
        console.info(`url200 file is moved to ${newUrl200Path}`)
        process.exit(0)
    } catch (e) {
        throw e
    }
}

export {
    migrate,
}
