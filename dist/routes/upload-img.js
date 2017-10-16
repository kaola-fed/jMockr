'use strict';
var fs = require('fs');
var multer = require('multer');
var path = require('path');
var sizeOf = require('image-size');
var logUtil = require('../util/log-util');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../fileStorage'));
    },
    filename: function (req, file, cb) {
        var fileNewName = Date.now() + "-" + file.originalname;
        cb(null, fileNewName);
    },
});
var upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        cb(null, true);
    },
});
upload = upload.fields([{ name: 'imgFile' }]);
function dealUpload(req, res) {
    return new Promise(function (resolve, reject) {
        upload(req, res, function (err) {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}
function imgValid(limit, imgInfo) {
    var widthAndHeight = imgInfo.width + "*" + imgInfo.height;
    if (!!limit.size && widthAndHeight != limit.size)
        return 1;
    if (limit.isAllowPng != 1 && imgInfo.type == 'png')
        return 2;
    return 0;
}
module.exports = function (app) {
    app.post('/frontpage/uploadimg.do', function (req, res) {
        var moduleId = req.query.module;
        dealUpload(req, res)
            .then(function () {
            var imgName = req.files.imgFile[0].filename;
            var limit = {
                size: req.query.imgSize,
                isAllowPng: req.query.isAllowPng,
            };
            var imgPath = path.join(__dirname, "../fileStorage/" + imgName);
            var imgInfo = sizeOf(imgPath);
            var newImgName = "img" + Date.now() + "_" + imgInfo.width + "_" + imgInfo.height + "." + imgInfo.type;
            var newImgPath = path.join(__dirname, "../fileStorage/" + newImgName);
            fs.renameSync(imgPath, newImgPath);
            switch (imgValid(limit, imgInfo)) {
                case 0:
                    res.send("<script>window.top." + moduleId + "(\"/mock_server/fileStorage/" + newImgName + "\");</script>");
                    break;
                case 1:
                    res.send("<script>window.top." + moduleId + "(\"\",\"\u56FE\u7247\u4E0A\u4F20\u5931\u8D25\uFF1A\u5C3A\u5BF8\u4E0D\u7B26\u89C4\u683C\uFF01\");</script>");
                    break;
                case 2:
                    res.send("<script>window.top." + moduleId + "(\"\",\"\u56FE\u7247\u4E0A\u4F20\u5931\u8D25\uFF1A\u4E0D\u652F\u6301png\u4E0A\u4F20\uFF01\");</script>");
                    break;
                default:
                    res.send("<script>window.top." + moduleId + "(\"/mock_server/fileStorage/" + newImgName + "\");</script>");
            }
        })
            .catch(function (err) {
            logUtil.log(err);
            res.status(403).send("<script>window.top." + moduleId + "(\"\",\"\u56FE\u7247\u4E0A\u4F20\u5931\u8D25\uFF1A\u67D0\u4E9B\u672A\u5B9A\u4E49\u95EE\u9898\uFF01\");</script>");
        });
    });
};
//# sourceMappingURL=upload-img.js.map