"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require('path');
var fileUtil = require('../util/file-util');
var config = fileUtil.json5Require(path.resolve('./jmockr.config.json'));
exports.default = config;
//# sourceMappingURL=config.js.map