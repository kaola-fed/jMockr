const path = require('path')
const fileUtil = require('../util/file-util')
const config = fileUtil.json5Require(path.resolve('./jmockr.config.json'))
export default config
