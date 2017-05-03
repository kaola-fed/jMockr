'use strict';
const path = require('path');
const Render = require('fast-ftl').Render;
const config = require('../scanner/config');
const makeErrorHtml = require('./makeErrorHtml');

const render = Render({
    root: path.resolve(config.ftlFilePath),
    paths: config.moduleFtlPathes,
    defaultEncoding: "utf-8",  // 默认 encoding
    urlEscapingCharsetSet: "utf-8", // URLEscapingCharset
    numberFormat: "0.##########" // 数字格式化方式
});

module.exports.render = function(tpl, cb, dataObject) {
    if (tpl.startsWith('/')) tpl = tpl.slice(1);
    render.parse(tpl, dataObject)
        .then(cb)
        .catch(e => {
            console.info(`渲染出错:${tpl}`);
            try {
                cb(makeErrorHtml(tpl, e));
            } catch (e) {
                console.info(e);
            }
        });
};
