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

const fetchFile = (url, filePath) => {
    return new Promise(resolve => http.get(url, res => {
        res.pipe(fs.createWriteStream(filePath))
            .on('close', () => resolve(filePath))
    }))
}

/**
 * 下载图片到本地临时目录
 * @param resolve
 * @param url
 * @param callback
 */
window.downloadImage = async (url) => {
    const nameArr = url.split("/")
    let fileName = `/${nameArr[nameArr.length - 1]}`

    const filePath = `${utools.getPath("temp")}${fileName}`
    if (!fs.existsSync(filePath)) {
        await fetchFile(url, filePath)
    }

    return {
        imgSrc: url,
        fileSrc: `file://${filePath}`,
    }
}


