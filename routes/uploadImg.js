'use strict'
/**
 * @author hzyubaoquan
 * @description 模拟ms中的图片上传服务
 * @type {any}
 */

const fs = require('fs');
const multer  = require('multer');
const path = require('path');
const sizeOf = require('image-size');
const logUtil = require('../util/logUtil');

var storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, path.join(__dirname, '../fileStorage'));
    },
    filename (req, file, cb) {
        var fileNewName = `${Date.now()}-${file.originalname}`;
        cb(null, fileNewName);
    }
});
var upload = multer({
    storage: storage,
    fileFilter(req, file, cb) { //本来打算在这里做图片尺寸校验, 但是发现file参数的属性不够
        cb(null, true);
        //cb(new Error('I don\'t have a clue!'))
    }
});

upload = upload.fields([{name: 'imgFile'}]);

function dealUpload(req, res) {
    return new Promise(function (resolve, reject) {
        upload(req, res, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

/**
 *
 * @param limit 调用上传图片接口时的请求参数
 * @param imgInfo 从图片文件中获得到的图片参数
 * @returns {number} 0: 校验通过
 *                   1: 图片尺寸不对
 *                   2: 图片格式不对(不允许上传png)
 */
function imgValid(limit, imgInfo) {
    var widthAndHeight = `${imgInfo.width}*${imgInfo.height}`;
    if (!!limit.size && widthAndHeight != limit.size) return 1;
    if (limit.isAllowPng != 1 && imgInfo.type == 'png') return 2;
    return 0;
}

module.exports = function(app) {
    app.post('/frontpage/uploadimg.do', function (req, res, next) {
        var moduleId = req.query.module;
        dealUpload(req, res)
            .then(() => {
                var imgName = req.files['imgFile'][0].filename,
                    limit = {
                        size: req.query.imgSize,
                        //type: req.query.isAllowPng,
                        isAllowPng: req.query.isAllowPng
                    };

                let imgPath = path.join(__dirname, `../fileStorage/${imgName}`);
                //需要先把图片保存才能得到图片的尺寸, 然后按照nos的规则将图片文件重命名以便前端根据图片名进行尺寸二次判断的操作
                let imgInfo = sizeOf(imgPath);
                let newImgName = `img${Date.now()}_${imgInfo.width}_${imgInfo.height}.${imgInfo.type}`;
                let newImgPath = path.join(__dirname, `../fileStorage/${newImgName}`);
                fs.renameSync(imgPath, newImgPath);

                switch(imgValid(limit, imgInfo)) {
                    case 0:
                        res.send(`<script>window.top.${moduleId}("/mock_server/fileStorage/${newImgName}");</script>`);
                        break;
                    case 1:
                        res.send(`<script>window.top.${moduleId}("","图片上传失败：尺寸不符规格！");</script>`);
                        break;
                    case 2:
                        res.send(`<script>window.top.${moduleId}("","图片上传失败：不支持png上传！");</script>`);
                        break;
                    default:
                        res.send(`<script>window.top.${moduleId}("/mock_server/fileStorage/${newImgName}");</script>`);
                }
            })
            .catch((err) => {
                logUtil.log(err);
                res.status(403).send(`<script>window.top.${moduleId}("","图片上传失败：某些未定义问题！");</script>`);
            });
    });
};