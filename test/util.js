/* global expect */

const psTree = require('ps-tree')
const sg = require('superagent')
function get(url, judge) {
    return new Promise((resolve, reject) => {
        try {
            sg.get(url)
                .end((err, res) => {
                    try {
                        if (err) {
                            if (judge) {
                                return resolve(judge(res))
                            } else {
                                return resolve(expect(res.status).toBe(200))
                            }
                        }
                        if (judge) {
                            resolve(judge(res))
                        } else {
                            resolve(expect(res.status).toBe(200))
                        }
                    } catch (e) {
                        console.error('inner reject')
                        console.error('error on url ', url)
                        console.error(e)
                        resolve(e)
                    }
                })
        } catch (e) {
            console.error('outer reject')
            console.error(e)
            reject(e)
        }
    })
}

function kill(pid, signal, callback) {
    signal = signal || 'SIGKILL'
    callback = callback || function() {}
    const killTree = true
    if (killTree) {
        psTree(pid, (err, children) => {
            [pid].concat(
                children.map(p => p.PID)
            ).forEach(tpid => {
                try {
                    process.kill(tpid, signal)
                } catch (ex) {
                    console.error(ex)
                }
            })
            callback()
        })
    } else {
        try {
            process.kill(pid, signal)
        } catch (ex) {
            console.info(ex)
        }
        callback()
    }
};


module.exports.get = get
module.exports.kill = kill
