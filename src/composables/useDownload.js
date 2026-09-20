import {collectedDirectory, downloadImage} from "../platform/index.js";

/** 每批并发下载数量 */
const BATCH_SIZE = 5;

/** 合法图片直链:必须是 http(s) 绝对地址,顺带过滤图源解析产生的 undefined/"undefined"/空串 */
const isValidLink = (link) => typeof link === "string" && /^https?:\/\//i.test(link);

/**
 * 批量下载图片到本地。
 * 图片统一由 preload 的 node 能力下载,绕过渲染进程的跨域限制;
 * 分批回调实现「边下边展示」,下载完成顺序随机,回调前按图片链接排序,
 * 保证多次加载时展示顺序一致。
 *
 * @param {string[]} imgLinks 图片直链列表
 * @param {Object} [options] 下载附加配置(Referer/Host/downloadPath 等),透传给 preload
 * @param {(items: {imgSrc: string, fileSrc: string}[]) => void} [callback] 每批下载完成的回调
 */
export async function downloadImages(imgLinks, options = {}, callback) {
    const links = (imgLinks ?? []).filter(isValidLink);
    if (links.length === 0) {
        callback && callback([]);
        return;
    }

    let batch = [];
    for (let i = 0; i < links.length; i++) {
        batch.push(downloadImage(links[i], options));

        const isLast = i === links.length - 1;
        if (isLast || batch.length === BATCH_SIZE) {
            Promise.all(batch.map(p => p.catch(error => {
                console.error("图片下载失败:", error);
                return null;
            }))).then(values => {
                callback && callback(values.filter(Boolean).sort((a, b) => a.imgSrc.localeCompare(b.imgSrc)));
            });
            batch = [];
        }
    }
}

/**
 * 下载图片到收藏目录。
 * 目录必须取自 preload 的 checkOrCreateCollectedDirectory(平台相关:
 * uTools 为 collectedEmoticons,ztools 为 ztoolsCollectedEmoticons),
 * 且必须与收藏夹展示路径(composeCollectedFilePath)使用同一个目录,
 * 否则会出现「下载成功但收藏夹找不到文件」。
 *
 * @param {string[]} imgLinks 图片直链列表
 * @param {Object} [options] 下载附加配置
 */
export function downloadCollectedImages(imgLinks, options = {}) {
    // 空列表直接短路,避免无意中触发平台目录创建
    if (!imgLinks || imgLinks.length === 0) {
        return Promise.resolve();
    }
    options["downloadPath"] = collectedDirectory();
    return downloadImages(imgLinks, options);
}
