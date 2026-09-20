const fs = require('fs')
const path = require('path')
const http = require('http')
const https = require('https')
const crypto = require('crypto')
const urlParser = require('url')

// 同一套 preload 同时服务 uTools 与 ztools,运行时识别平台全局对象
const getApi = () => globalThis.ztools ?? globalThis.utools

// 收藏目录名沿用各平台的历史命名,避免老用户已下载的收藏文件失效
const collectedDirName = () => globalThis.utools ? 'collectedEmoticons' : 'ztoolsCollectedEmoticons'

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
window.checkOrCreateCollectedDirectory = () => window.checkOrCreateDirectory(`${getApi().getPath('userData')}/${collectedDirName()}`)

/**
 * 二次复制策略,gif直接使用copyFile,其他格式先使用copyImage,失败则使用copyFile重试复制
 * @param destFile
 * @returns {*}
 */
window.tryCopy = (destFile) => {
  // 如果是gif，则用文件函数复制,copyFile方法一般不会失败
  if (destFile.endsWith("gif")) {
    return getApi().copyFile(destFile)
  }

  // 其他格式尝试使用copyImage方法,但是可能失败,则使用copyFile重试
  let copyResult = getApi().copyImage(destFile)
  if (!copyResult) {
    copyResult = getApi().copyFile(destFile)
  }

  return copyResult
}

/**
 * 复制图片到剪贴板
 * @param filePath
 */
window.copyImage = ({imgSrc, fileSrc}, callback) => {
  let localFilePath = fileSrc.replace("file://", "")

  // 根据原始的图片链接，创建本地图片路径
  let destFile = composeFilePath(imgSrc)
  if (!fs.existsSync(destFile)) {
    fs.copyFileSync(localFilePath, destFile)
  }

  const copyResult = window.tryCopy(destFile)

  if (!copyResult) {
    getApi().showNotification("复制失败,麻烦告知作者操作流程进行问题排查,感谢~")
    return
  }
  callback && callback()
  getApi().hideMainWindow()
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
  // 所有静态和动态类型图片，都统一使用gif格式,避免发出去的表情包不动
  let fileSuffix = config['fileSuffix'] || '.gif'
  // 组装文件路径,需要将文件后缀拼接上/未指定下载目录，使用temp目录
  return `${config['downloadPath'] || getApi().getPath("temp")}/${fileName}${fileSuffix}`
}

/**
 * 下载远程文件到本地
 * @param url
 * @param filePath
 * @param config
 * @returns {Promise<string>} 下载完成后 resolve 文件路径;网络失败时 reject
 */
const downloadRemoteFile = (url, filePath, config) => {
  const parsed = urlParser.parse(url)
  const request = url.startsWith('https') ? https : http

  return new Promise((resolve, reject) => {
    const req = request.get({
      host: parsed.host,
      path: parsed.path,
      method: 'get',
      headers: config['headers'] || {}
    }, res => {
      // 非 2xx 响应(404/403 等)同样落盘,由调用方的体积校验(<1KB)兜底清理
      res.pipe(fs.createWriteStream(filePath))
          .on('close', () => resolve(filePath))
          .on('error', reject)
    })
    // 网络错误(DNS 失败/连接中断等)必须走 reject,
    // 否则调用方的 Promise.all 永远挂起,且会以 Uncaught Error 形式崩溃
    req.on('error', reject)
    req.setTimeout(30000, () => req.destroy(new Error(`下载超时: ${url}`)))
  })
}

const fetchHostMap = (host) => {
  if (host === 'img.soutula.com') {
    return 'https://fabiaoqing.com/'
  }

  if (host === 'img.adoutu.com') {
    return 'https://www.adoutu.com/'
  }
  return host
}

/**
 * 下载图片到本地临时目录/收藏目录
 * @param url
 * @param config
 */
const doDownloadImage = async (url, config = {}, filePath) => {
  // 默认组装Referer header头
  const {host} = urlParser.parse(url)
  config = Object.assign({'headers': {'Referer': fetchHostMap(host)}, ...config})

  // 旧表情包
  const checkFilePath = composeFilePath(url, Object.assign({}, config, {fileSuffix: '.jpg'}))

  if (!fs.existsSync(filePath) && fs.existsSync(checkFilePath)) {
    // 历史表情包存在,直接复制成新的路径
    fs.cpSync(checkFilePath, filePath)
    return {
      imgSrc: url, fileSrc: `file://${checkFilePath}`,
    }
  }


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
    imgSrc: url, fileSrc: `file://${filePath}`,
  }
}

// 同一目标文件的并发下载合并为同一个 Promise:
// 收藏时会同时触发「单张下载」和「收藏夹全量补下载」,不合并的话
// 两个请求会交叉写入同一个文件
const downloadTasks = new Map()

window.downloadImage = (url, config = {}) => {
  // 平台边界兜底:过滤无效链接(undefined/"undefined"/非 http 协议等)
  if (!url || !/^https?:\/\//i.test(url)) {
    return Promise.resolve(null)
  }
  const filePath = composeFilePath(url, config)
  if (downloadTasks.has(filePath)) {
    return downloadTasks.get(filePath)
  }
  const task = doDownloadImage(url, config, filePath)
      .finally(() => downloadTasks.delete(filePath))
  downloadTasks.set(filePath, task)
  return task
}

/**
 * 使用浏览器打开超链接
 * @param link
 * @returns {*}
 */
window.openLink = (link) => getApi().shellOpenExternal(link)
