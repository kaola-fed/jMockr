const fs = require('fs')

const binFilePath = './dist/bin/start.js'
const content = fs.readFileSync(binFilePath, { encoding: 'utf8' })
const shebang = '#!/usr/bin/env node'
const newContent = `${shebang}\n${content}`
fs.writeFileSync(binFilePath, newContent, { encoding: 'utf8' })
