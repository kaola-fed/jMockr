'use strict'
/**
 * @author hzyubaoquan
 * @description 模拟ms中的图片上传服务
 * @type {any}
 */

const fs = require('fs')
const multer = require('multer')
const path = require('path')
const sizeOf = require('image-size')
const logUtil = require('../util/log-util')

const storage = multer.diskStorage({
    destination(req: any, file: any, cb: (a: any, b: boolean) => void) {
        cb(null, path.join(__dirname, '../fileStorage'))
    },
    filename(req: any, file: any, cb: (a: any, b: string) => void) {
        const fileNewName = `${Date.now()}-${file.originalname}`
        cb(null, fileNewName)
    },
})
let upload = multer({
    storage: storage,
    fileFilter(req: any, file: any, cb: (a: any, b: boolean) => void) { // 本来打算在这里做图片尺寸校验, 但是发现file参数的属性不够
        cb(null, true)
        // cb(new Error('I don\'t have a clue!'))
    },
})

upload = upload.fields([{ name: 'imgFile' }])

function dealUpload(req: any, res: any) {
    return new Promise((resolve, reject) => {
        upload(req, res, (err: any) => {
            if (err) {
                reject(err)
            } else {
                resolve()
            }
        })
    })
}

/**
 *
 * @param limit 调用上传图片接口时的请求参数
 * @param imgInfo 从图片文件中获得到的图片参数
 * @returns {number} 0: 校验通过
 *                   1: 图片尺寸不对
 *                   2: 图片格式不对(不允许上传png)
 */
function imgValid(limit: {
    size?: string,
    isAllowPng?: number,
}, imgInfo: {
    type: string,
    width: number,
    height: number,
}) {
    const widthAndHeight: string = `${imgInfo.width}*${imgInfo.height}`
    if (!!limit.size && widthAndHeight != limit.size) return 1
    if (limit.isAllowPng != 1 && imgInfo.type == 'png') return 2
    return 0
}

export default function(app: any) {
    app.post('/frontpage/uploadimg.do', (req: any, res: any) => {
        const moduleId = req.query.module
        dealUpload(req, res)
            .then(() => {
                const imgName = req.files.imgFile[0].filename
                const limit = {
                    size: req.query.imgSize,
                    // type: req.query.isAllowPng,
                    isAllowPng: req.query.isAllowPng,
                }

                const imgPath = path.join(__dirname, `../fileStorage/${imgName}`)
                // 需要先把图片保存才能得到图片的尺寸, 然后按照nos的规则将图片文件重命名以便前端根据图片名进行尺寸二次判断的操作
                const imgInfo = sizeOf(imgPath)
                const newImgName = `img${Date.now()}_${imgInfo.width}_${imgInfo.height}.${imgInfo.type}`
                const newImgPath = path.join(__dirname, `../fileStorage/${newImgName}`)
                fs.renameSync(imgPath, newImgPath)

                switch (imgValid(limit, imgInfo)) {
                    case 0:
                        res.send(`<script>window.top.${moduleId}("/mock_server/fileStorage/${newImgName}");</script>`)
                        break
                    case 1:
                        res.send(`<script>window.top.${moduleId}("","图片上传失败：尺寸不符规格！");</script>`)
                        break
                    case 2:
                        res.send(`<script>window.top.${moduleId}("","图片上传失败：不支持png上传！");</script>`)
                        break
                    default:
                        res.send(`<script>window.top.${moduleId}("/mock_server/fileStorage/${newImgName}");</script>`)
                }
            })
            .catch((err) => {
                logUtil.log(err)
                res.status(403).send(`<script>window.top.${moduleId}("","图片上传失败：某些未定义问题！");</script>`)
            })
    })
}
