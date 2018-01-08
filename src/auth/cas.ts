const config: any = require('../scanner/index')
const cfg: any = config.authConfig
const sg: any = require('superagent')

const superagent: any = sg.agent() //直接用sg的话, 不会保存cookie

function getRedirectLocation(url: string, opt?: any): Promise<any> {
    return new Promise((resolve: (param: any) => void, reject: (e: any) => void): void => {
        opt = opt || {}
        superagent.get(url)
            .set({
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.90 Safari/537.36',
                'Cookie': opt.cookie || {},
                'Connection': 'keep-alive',
            })
            .end((err: any, res: any) => {
                if (err) {
                    console.info('Error on getting redirect location.')
                    reject(err)
                } else {
                    const redirectLocation: string = res.redirects[0]
                    resolve({
                        url: redirectLocation,
                        res: res,
                    })
                }
            })
    })
}

function getExecutionValue(): Promise<any> {
    return new Promise((resolve: Function, reject: Function): void => {
        getRedirectLocation(cfg.casDomain)
            .then((ret: any) => {
                const reg: RegExp = /execution=(.+)/
                const value: string = reg.exec(ret.url)![1]
                resolve({
                    value: value,
                    url: ret.url,
                })
            })
    })
}

function login(): Promise<any> {
    console.info('Login...')
    return new Promise((resolve: Function, reject: Function): void => {
        getExecutionValue()
            .then((result: any) => {
                superagent.post(result.url)
                    .set({
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Host': 'casserver-test.kaola.com',
                    })
                    .send({
                        username: cfg.username,
                        password: cfg.password,
                        lt: result.value,
                        _eventId: 'submit',
                    })
                    .end((err: any, res: any) => {
                        if (err) {
                            console.info('Error on sending login request.')
                            reject(err)
                        } else {
                            const tempUrl: string = 'https://globalms.netease.com'
                            superagent.get(tempUrl)
                                .end((err: any, res: any) => {
                                    if (err) {
                                        console.info('Login error.')
                                        reject(err)
                                    } else {
                                        console.info('Login finished !')
                                        resolve(superagent)
                                    }
                                })
                        }
                    })
            }).catch((err: any) => {
                console.info('Error getting execution value.')
                reject(err)
            })
    })
}
export default { login }
