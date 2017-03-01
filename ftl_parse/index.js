'use strict';
const path = require('path');
const Freemarker = require('freemarker.js');
const config = require('../jmockr.config.json');
console.info(path.join(__dirname, '..', config.ftlFilePath))
var fm = new Freemarker({
    viewRoot: path.join(__dirname, '..', config.ftlFilePath),
    options: {

    }
});

module.exports.render = function(tpl, cb, dataObject) {
    fm.render(tpl, dataObject || {}, function(err, html, output) {
        if (err) {
            console.info(`渲染出错:${tpl}`);
            html = `
                <div>渲染出错:${tpl}</div>
                <div>${err}</div>
            `;
        }
        cb(html);
    });
};
