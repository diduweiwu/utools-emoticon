const downloadImages = async (imgLinks, config = {}, callback) => {
    // 把图片都下载到本地临时目录，跳过跨域限制
    for (let i = 0; i < imgLinks.length; i++) {
        let a = await window.downloadImage(imgLinks[i], config)
        if (!!a) {
            callback && callback([a])
        }
    }
}


export {
    downloadImages,
}
