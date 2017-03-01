const path = require('path');
const fileUtil = require('../util/fileUtil');
const config = fileUtil.json5Require(path.resolve(__dirname, '../jmockr.config.json'));

module.exports = config;
