const fs = require('fs')
const http = require('http');
const https = require('https');
const crypto = require('crypto');

function fetchSuffix(url) {
    const urlSegments = url.split(".")
    let fileSuffix = urlSegments[urlSegments.length - 1]
    if (fileSuffix !== 'gif') {
        fileSuffix = 'jpg'
    }

    return fileSuffix
}

/**
 * 复制图片到剪贴板
 * @param filePath
 */
window.copyImage = ({imgSrc, fileSrc}) => {
    let localFilePath = fileSrc.replace("file://", "")

    // 根据原始的图片链接，创建本地图片路径
    let destFile = composeFilePath(imgSrc, fileSrc)
    if (!fs.existsSync(destFile)) {
        fs.copyFileSync(localFilePath, destFile)
    }

    // 如果是gif，则用文件函数复制
    let copyResult
    if (destFile.endsWith("gif")) {
        copyResult = utools.copyFile(destFile)
    } else {
        // 否则使用复制图片函数
        copyResult = utools.copyImage(destFile)
    }

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

const fetchFile = (url, filePath, config) => {
    const [host, path] = url.split('.com')

    const request = url.startsWith('https') ? https : http

    return new Promise(resolve => request.get({
        host: `${host.replace('https://', '').replace('http://', '')}.com`,
        path: path,
        method: 'get',
        headers: config['headers'] || {}
    }, res => {
        res.pipe(fs.createWriteStream(filePath))
            .on('close', () => resolve(filePath))
    }))
}

window.composeFilePath = (url) => {
    // 文件名采用随机方式，避免文件冲突
    let fileName = `${crypto.createHash('md5').update(url).digest('hex')}`
    let fileSuffix = fetchSuffix(url)
    // 组装文件路径,需要将文件后缀拼接上
    return `${utools.getPath("temp")}/${fileName}.${fileSuffix}`
}
/**
 * 下载图片到本地临时目录
 * @param url
 * @param config
 */
window.downloadImage = async (url, config = {}) => {
    // 默认组装Referer header头
    const [host] = url.split('.com')
    config['headers'] = {'Referer': `${host}.com`}

    // 组装文件路径,需要将文件后缀拼接上
    const filePath = composeFilePath(url)
    if (!fs.existsSync(filePath)) {
        await fetchFile(url, filePath, config)
    }

    // 二次检查，文件存在且不符合要求则删除掉
    if (fs.existsSync(filePath)) {
        const fileSize = await getFileSize(filePath)

        // 不存在的文件或者小于1k的图表，删除缓存并跳过
        if (fileSize < 1024) {
            fs.unlinkSync(filePath)
            return null
        }
    }

    return {
        imgSrc: url,
        fileSrc: `file://${filePath}`,
    }
}


