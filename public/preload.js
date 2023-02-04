const fs = require('fs')
const http = require('http');

/**
 * 复制图片到剪贴板
 * @param filePath
 */
window.copyImage = (filePath) => {
    let localFilePath = filePath.replace("file://", "")
    let copyResult = utools.copyFile(localFilePath)
    copyResult && utools.hideMainWindow()
}

/**
 * 下载图片到本地临时目录
 * @param resolve
 * @param url
 * @param callback
 */
window.downloadImage = (resolve, url, callback) => {
    console.log(url)
    const nameArr = url.split("/")
    let fileName = `/${nameArr[nameArr.length - 1]}`

    const filePath = `${utools.getPath("temp")}${fileName}`

    http.get(url, res => {
        res.pipe(fs.createWriteStream(filePath))
            .on('close', () => callback(filePath) && resolve())
    });
}


