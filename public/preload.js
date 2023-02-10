const fs = require('fs')
const http = require('http');
const crypto = require('crypto');

/**
 * 复制图片到剪贴板
 * @param filePath
 */
window.copyImage = (filePath) => {
    let localFilePath = filePath.replace("file://", "")
    let copyResult = utools.copyFile(localFilePath)
    copyResult && utools.hideMainWindow()
}

const getFileSize = (filePath) => {
    return new Promise((resolve) => {
        if (!filePath) {
            resolve(0);
            return;
        }

        fs.stat(filePath, (err, data) => {
            if (err == null) {
                resolve(data.size);
                return;
            }
            resolve(0);
        });
    });
}

// const fetchFile = (url, filePath) => {
//     return new Promise(resolve => http.get(url, res => {
//         res.pipe(fs.createWriteStream(filePath))
//             .on('close', () => resolve(filePath))
//     }))
// }

const fetchFile = (url, filePath, config) => {
    const [host, path] = url.split('.com')

    return new Promise(resolve => http.get({
        host: `${host.replace('http://', '')}.com`,
        path: path,
        method: 'get',
        headers: config['headers'] || {}
    }, res => {
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
window.downloadImage = async (url, config) => {
    // 文件名采用随机方式，避免文件冲突
    let fileName = `/${crypto.createHash('md5').update(url).digest('hex')}`

    const filePath = `${utools.getPath("temp")}${fileName}`
    if (!fs.existsSync(filePath)) {
        await fetchFile(url, filePath, config)
    }

    const fileSize = await getFileSize(filePath)

    // 不存在的文件或者小于1k的图表，删除缓存并跳过
    if (fileSize < 1024) {
        fs.unlinkSync(filePath)
        return null
    }

    return {
        imgSrc: url,
        fileSrc: `file://${filePath}`,
    }
}


