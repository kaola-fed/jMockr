/* global beforeAll afterAll */
const runServer = require('./index')

let childProcess
let counter = 0
beforeAll(async () => {
    console.info(counter++)
    childProcess = runServer('s')
    return new Promise((resolve, reject) => {
        return setTimeout(resolve, 1500)
    })
})

afterAll(() => {
    childProcess.kill()
})
