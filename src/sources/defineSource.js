/**
 * 图源统一契约(策略接口) —— 所有图源都通过 defineSource 声明自己。
 *
 * 职责边界:图源只负责「请求 + 解析」,返回图片直链列表;
 * loading 状态、超时兜底、图片下载、分页状态,全部由调度器(composables/useEmoticons)统一编排。
 *
 * @typedef {Object} SourceFetchRequest
 * @property {string} keyword 搜索关键字;为空表示加载热门/最新列表
 * @property {number} page 页码,从 1 开始
 * @property {number} pageSize 每页数量
 * @property {AbortSignal} [signal] 中止信号,调度器在切换图源/重新加载时触发;
 *                                   图源应把它透传给 http 请求,让在途请求及时取消
 *
 * @typedef {Object} SourceFetchResult
 * @property {string[]} links 图片直链列表
 * @property {Object} [downloadOptions] 下载图片时的附加配置(如 Referer/Host),透传给 preload 的 downloadImage
 * @property {boolean} [hasMore] 是否有下一页;不返回则沿用当前值
 * @property {boolean} [hasLess] 是否有上一页;不返回则沿用当前值
 *
 * @typedef {Object} ImageSource
 * @property {string} id 唯一标识(小写英文,用于配置存储,一旦上线不可再改)
 * @property {string} label 展示名称(切换器/检测报告里显示)
 * @property {string} host 图源官网首页
 * @property {boolean} [enabled=true] 是否上架;false 表示下架,默认不出现在切换器,保留代码并参与一键检测(检测正常后用户可手动启用)
 * @property {string} [note] 备注(关于页/检测报告展示,如 VIP 限制)
 * @property {number} [timeout] 加载超时时间(毫秒),默认 15s
 * @property {string} [defaultKeyword] 覆盖全局默认关键字(全局默认见 registry.DEFAULT_SEARCH_KEYWORD)
 * @property {(request: SourceFetchRequest) => Promise<SourceFetchResult>} fetchPage 拉取一页图片直链
 */

/**
 * 定义一个图源。当前只是原样返回,价值在于:
 * 1. 给所有图源一个统一的标准写法,新增图源时照抄一个文件即可;
 * 2. 配合 JSDoc 提供字段补全,写错字段名/漏实现方法编辑器能直接发现。
 *
 * 搜索关键字:调度器会在搜索框为空时统一回填全局默认关键字(registry.DEFAULT_SEARCH_KEYWORD),
 * 图源无需自行处理空关键字,除非要覆盖全局默认(defaultKeyword)。
 *
 * @param {ImageSource} source
 * @returns {ImageSource}
 */
export function defineSource(source) {
    return source;
}
