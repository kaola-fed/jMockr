module.exports = function (app) {
    app.post('/batchUploadFile.do', function (req, res) {
        res.json({
            "retCode": 200,
            "retDesc": "操作成功",
            "md5": "3b7ef9e6de488f9f58a820061cd2753c",
            "fileName": "1481594190007x.zip",
            "url": "http://haitao.nosdn1.127.net/1481594190007x.zip"
        });
    });
};