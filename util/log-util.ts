const util = require('util')
const fileUtil = require('./file-util')
const extend = require('node.extend')

const logFileName = 'log'

//向日志文件中打印日志
function logFile(args: {
    title?: string,
    fileName?: string,
    content?: string,
}) {
    args = args || {}
    let now = new Date()
    let year = now.getFullYear()
    let month = padZero(now.getMonth() + 1)
    let date = padZero(now.getDate())
    let h = padZero(now.getHours())
    let m = padZero(now.getMinutes())
    let s = padZero(now.getSeconds())
    let logTitle = `\n\n===========${year}-${month}-${date} ${h}:${m}:${s}====${args.title || ''}==========\n`

    args.fileName = (args.fileName || '').replace(/[:\/\\\*\?"\|<>]/g, '_')
    let path = `log/${args.fileName || logFileName}.txt`
    fileUtil.makeFile({
        path: path,
        content: `${logTitle}${args.content}`,
    })
}

function padZero(n: number) {
    if (n < 10) return '0' + n
    return n
}

function log(obj: {}) {
    console.info(util.inspect(obj, false, null))
}

function stringify(obj: {
    toJSON: () => string,
}) {
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
}) {
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
}) {
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
