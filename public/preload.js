const fs = require('fs')
const http = require('http');
const https = require('https');
const crypto = require('crypto');
const urlParser = require('url');
const path = require('path');

/**
 * 检查目录是否存在，不存在则新建
 * @param directoryPath
 */
window.checkOrCreateDirectory = (directoryPath) => {
    if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath)
    }
    return directoryPath
}

/**
 * 检查收藏目录是否存在，不存在则新建
 */
window.checkOrCreateCollectedDirectory = () => window.checkOrCreateDirectory(`${utools.getPath('userData')}/collectedEmoticons`)

/**
 * 复制图片到剪贴板
 * @param filePath
 */
window.copyImage = ({imgSrc, fileSrc}) => {
    let localFilePath = fileSrc.replace("file://", "")

    // 根据原始的图片链接，创建本地图片路径
    let destFile = composeFilePath(imgSrc)
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

// 移除本地文件
window.removeFile = (filePath) => fs.existsSync(filePath) && fs.unlinkSync(filePath)

/**
 * 根据url地址，组装收藏表情包本地随机文件路径
 * @param url
 * @returns {`${string}/${string}.${string}`}
 */
window.composeCollectedFilePath = (url) => window.composeFilePath(url, {downloadPath: window.checkOrCreateCollectedDirectory()})

/**
 * 根据url超链接，组装本地随机文件路径
 * @param url
 * @param config
 * @returns {`${string}/${string}.${string}`}
 */
window.composeFilePath = (url, config = {}) => {
    // 文件名采用随机方式，避免文件冲突
    let fileName = `${crypto.createHash('md5').update(url).digest('hex')}`
    // 非gif类型，统一处理为jpg格式
    let fileSuffix = (path.extname(url) === '.gif') ? '.gif' : '.jpg'
    // 组装文件路径,需要将文件后缀拼接上/未指定下载目录，使用temp目录
    return `${config['downloadPath'] || utools.getPath("temp")}/${fileName}.${fileSuffix}`
}

/**
 * 下载远程文件到本地
 * @param url
 * @param filePath
 * @param config
 * @returns {Promise<unknown>}
 */
const downloadRemoteFile = (url, filePath, config) => {
    const {host, path} = urlParser.parse(url)
    const request = url.startsWith('https') ? https : http

    return new Promise(resolve => request.get({
        host: `${host.replace('https://', '').replace('http://', '')}`,
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
 * @param url
 * @param config
 */
window.downloadImage = async (url, config = {}) => {
    // 默认组装Referer header头
    const {host} = urlParser.parse(url)
    config = Object.assign({'headers': {'Referer': host}, ...config})

    // 组装文件路径,需要将文件后缀拼接上
    const filePath = composeFilePath(url, config)
    if (!fs.existsSync(filePath)) {
        await downloadRemoteFile(url, filePath, config)
    }

    // 二次检查，文件存在且不符合要求则删除掉
    if (fs.existsSync(filePath)) {
        const {size: fileSize} = fs.statSync(filePath)

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
