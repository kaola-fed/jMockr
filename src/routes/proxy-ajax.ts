import configData from '../scanner/config'
import authTool from '../auth/cas'
const proxyCfg: any = configData.proxyConfig
import logUtil from '../util/log-util'

let urlRoot: string = `${proxyCfg.protocol}://${proxyCfg.useIP ? proxyCfg.ip : proxyCfg.domain}`

if (proxyCfg.enablePort) {
    urlRoot += `:${proxyCfg.port || ''}`
}

function init(app: any): any {
    authTool.login()
        .then((superagent: any) => {
            app.use((req: any, res: any) => {
                const m: string = req.method.toLowerCase()
                const url: string = `${urlRoot}${req.path}`
                logUtil.logRequest(req)
                superagent[m](url)
                    .set({
                        'Content-Type': req.get('Content-Type'),
                        'User-Agent': req.get('User-Agent'),
                    })
                    .query(req.query)
                    .send(req.body)
                    .pipe(res)
                    .on('error',function(err: any){
                        res.status(500)
                                .json({
                                    retCode: 500,
                                    retDesc: 'proxy Error',
                                })
                    });
            })
        })
        .catch((err: any) => {
            console.info('Login CAS error.')
            console.info(err)
        })
}

export default {
    init,
}
