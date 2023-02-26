// 下载文件
export async function downloadImages(imgLinks, config = {}, callback) {
    // 把图片都下载到本地用户目录，跳过跨域限制
    if (imgLinks.length === 0) {
        callback && callback([])
        return
    }
    let promises = []
    for (let i = 0; i < imgLinks.length; i++) {
        promises.push(window.downloadImage(imgLinks[i], config))

        // 批量下载，一次3个
        if ((i === imgLinks.length - 1) || (i > 0 && i % 3 === 0)) {
            Promise.all(promises.map(p => p.catch(err => Promise.resolve(null)))).then(values => {
                callback && callback(values.filter(v => !!v))
            })

            promises = []
        }
    }
}

// 下载收藏的表情包
export async function downloadCollectedImages(imgLinks, config = {}) {
    config['downloadPath'] = window.checkOrCreateDirectory(`${utools.getPath('userData')}/collectedEmoticons`)
    downloadImages(imgLinks, config)
}
