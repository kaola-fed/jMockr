/* global expect */

const psTree = require('ps-tree')
const treeKill = require('tree-kill')
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
        try {
            treeKill(pid, signal, (err, children) => {
                if (err) {
                    console.info('errrrrrrr')
                    return console.error('Error exec psTree', err);
                }
                console.info(`killed`)
                callback && callback()
            })
        } catch (e) {
            console.error('Error on kill process', e);
        }
    } else {
        try {
            process.kill(pid, signal)
        } catch (ex) {
            console.error('error kill process', ex)
        }
        callback()
    }
};


module.exports.get = get
module.exports.kill = kill
