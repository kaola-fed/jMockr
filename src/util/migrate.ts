import { json5Require, makeFile } from './file-util'
import * as fs from 'fs'
import * as path from 'path'

async function migrate(): Promise<void> {
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
        const newRetCode200Folder: string = path.resolve(commonAsyncDataPath, 'retCode200')

        if (!fs.existsSync(commonAsyncDataPath)) {
            fs.mkdirSync(commonAsyncDataPath)
        }
        if (!fs.existsSync(newRetCode200Folder)) {
            fs.mkdirSync(newRetCode200Folder)
        }
        const retCode200URLs: string = fs.readFileSync(originDataPath.url200, { encoding: 'utf8' })
        const newUrl200Path: string = path.resolve(newRetCode200Folder, `url.json5`)
        await makeFile({
            mode: 'w',
            path: newUrl200Path,
            content: retCode200URLs,
        })
        const newURL200DataPath: string = path.resolve(newRetCode200Folder, 'data.json5')
        await makeFile({
            mode: 'w',
            path: newURL200DataPath,
            content: JSON.stringify({ retCode: 200 }, null, 4),
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
        console.info(`url200 file is moved to ${newRetCode200Folder}`)
        process.exit(0)
    } catch (e) {
        throw e
    }
}

export {
    migrate,
}
