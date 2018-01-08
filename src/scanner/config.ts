// const path: any = require('path')
import * as path from 'path'
import * as fileUtil from '../util/file-util'
const config: any = fileUtil.json5Require(path.resolve('./jmockr.config.json'))
export default config
