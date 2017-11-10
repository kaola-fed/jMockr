import * as util from 'util'
import * as fileUtil from './file-util'
import extend from 'node.extend'

const logFileName: string = 'log'

//向日志文件中打印日志
function logFile(args: {
    title?: string,
    fileName?: string,
    content?: string,
}): void {
    args = args || {}
    const now: Date = new Date()
    const year: number = now.getFullYear()
    const month: string = padZero(now.getMonth() + 1)
    const date: string = padZero(now.getDate())
    const h: string = padZero(now.getHours())
    const m: string = padZero(now.getMinutes())
    const s: string = padZero(now.getSeconds())
    const logTitle: string = `\n\n===========${year}-${month}-${date} ${h}:${m}:${s}====${args.title || ''}==========\n`

    args.fileName = (args.fileName || '').replace(/[:\/\\\*\?"\|<>]/g, '_')
    const path: string = `log/${args.fileName || logFileName}.txt`
    fileUtil.makeFile({
        path: path,
        content: `${logTitle}${args.content}`,
    })
}

function padZero(n: number): string {
    if (n < 10) { return '0' + n }
    return '' + n
}

function log(obj: {}): void {
    console.info(util.inspect(obj, false, null))
}

function stringify(obj: {
    toJSON: () => string,
}): string {
    obj = extend({}, obj)
    delete obj.toJSON
    return JSON.stringify(obj)
}

//记录远程服务器返回的相应
function logAgentRes(res: {
    type: string,
    header: string,
    body: string,
    text: string,
}): any {
    logFile({
        title: 'type',
        content: JSON.stringify(res.type),
    })
    logFile({
        title: 'header',
        content: JSON.stringify(res.header),
    })
    logFile({
        title: 'body',
        content: JSON.stringify(res.body),
    })
    logFile({
        title: 'text',
        content: res.text,
    })
}

//打印请求信息
function logRequest(req: {
    originalUrl: string,
    query: string,
    body: string,
}): any {
    logFile({
        title: 'request url',
        content: req.originalUrl,
    })
    logFile({
        title: 'request query',
        content: JSON.stringify(req.query),
    })

    //req.param暂时没有使用到, 所以忽略不打印
    logFile({
        title: 'request body',
        content: JSON.stringify(req.body),
    })
}

export default {
    log,
    logFile,
    stringify,
    logRequest,
    logAgentRes,
}
