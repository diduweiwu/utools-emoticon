import {nextTick, onMounted, reactive, ref, toRefs} from "vue";
import cheerio from "cheerio";
import {fetchConfig} from "./useConfig.js";
import {downloadImages} from "./useFiles.js";
import axios from "axios";

/**
 * pk 斗图网表情包搜索
 * @param loading
 * @param pagination
 * @param keyWord
 * @param preHandle
 * @param callback
 */
const fetchPkDouTuEmoticons = (loading, pagination, keyWord, preHandle, callback) => {
    if (loading.value) {
        return Promise.resolve()
    }
    preHandle && preHandle()
    const params = {type: 'photo', page: pagination.pageNum.value, keyword: keyWord.value, more: 1};
    const config = {method: 'get', url: `https://www.pkdoutu.com/search`, params};
    return axios(config)
        .then(function (response) {
            const $ = cheerio.load(response.data)

            const imgTags = $('.random_picture img.image_dtb')
            const imgLinks = imgTags.map((_, img) => img.attribs['data-original']).get()
            downloadImages(imgLinks, {}, callback)
        })
}

/**
 * 爱斗图表情包搜索 - 发送请求搜索表情包列表
 * @param loading
 * @param keyWord
 * @param preHandle
 * @param callback
 */
const fetchSogouEmoticons = (loading, pagination, keyWord, preHandle, callback) => {
    if (loading.value) {
        return Promise.resolve()
    }

    preHandle && preHandle()

    const len = 47;
    const start = (pagination.pageNum.value - 1) * len;
    let params = {reqFrom: 'wap_result', start, query: `${keyWord.value} 表情`};
    let url = `https://pic.sogou.com/napi/wap/pic`
    let imgExtractor = (response) => {
        const {maxEnd, items} = response.data.data
        pagination.hasMore.value = maxEnd >= pagination.pageNum.value * len;
        return items.map(img => img['locImageLink'])
    }

    // 没有关键字的时候,加载热门表情包
    if (!keyWord.value) {
        url = `https://pic.sogou.com/napi/wap/emoji/moreEmo`
        params = {start, len}

        imgExtractor = response => {
            const data = response.data.data
            pagination.hasMore.value = data.length > 0
            return data.map(img => img['cover'])
        }
    }
    const config = {method: 'get', url, params};

    return axios(config)
        .then(function (response) {
            const imgLinks = imgExtractor(response)
            pagination.hasLess.value = pagination.pageNum.value > 1
            downloadImages(imgLinks, {}, callback)
        })
}

/**
 * 爱斗图表情包搜索 - 发送请求搜索表情包列表
 * @param loading
 * @param keyWord
 * @param preHandle
 * @param callback
 */
const fetchAiDouTuEmoticons = (loading, pagination, keyWord, preHandle, callback) => {
    if (loading.value) {
        return Promise.resolve()
    }
    preHandle && preHandle()

    let params = {type: 1, page: pagination.pageNum.value, keyword: keyWord.value};
    let url = `http://www.adoutu.com/search`

    // 没有关键字的时候,加载热门表情包
    if (!keyWord.value) {
        url = `http://www.adoutu.com/picture/list/${pagination.pageNum.value}`
        params = {}
    }
    const config = {method: 'get', url, params};

    return axios(config)
        .then(function (response) {
            const $ = cheerio.load(response.data)
            const imgLinks = $('.picture-list img').map((_, img) => img.attribs['src']).get()

            pagination.hasLess.value = pagination.pageNum.value > 1
            pagination.hasMore.value = $('.pagination .page-link:contains(">>")').length > 0;

            downloadImages(imgLinks, {}, callback)
        })
}

const fetchDouTuEmoticons = (loading, pagination, keyWord, preHandle, callback) => {
    if (loading.value) {
        return Promise.resolve()
    }
    preHandle && preHandle()

    const pageSize = 20
    let params = {type: 1, pageNum: pagination.pageNum.value, pageSize, keyword: keyWord.value};
    let url = `https://doutu.lccyy.com/doutu/items`

    // 没有关键字的时候,加载热门表情包
    if (!keyWord.value) {
        url = `https://doutu.lccyy.com/doutu/all`
        params = {ac: 'home', start: 0, limit: 30, keyword: ''}
    }
    const config = {
        method: 'get', url, params,
        headers: {
            "User-Agent": "Nice"
        }
    };

    return axios(config)
        .then(function (response) {
            let imgLinks = []
            const {items, totalSize} = response.data
            if (!!items) {
                imgLinks = items.map(item => item['url'])
            }

            pagination.hasLess.value = pagination.pageNum.value > 1
            pagination.hasMore.value = (pagination.pageNum.value * pageSize) < totalSize;
            downloadImages(imgLinks, {}, callback)
        })
}

/**
 * 斗图啦表情包搜索
 * @param loading
 * @param pagination
 * @param keyWord
 * @param preHandle
 * @param callback
 * @returns {Promise<void>|Promise<unknown>}
 */
const fetchDouTulaEmoticons = (loading, pagination, keyWord, preHandle, callback) => {
    if (loading.value) {
        return Promise.resolve()
    }
    preHandle && preHandle()

    // 没有关键字的时候,加载最新表情包
    let params = {page: pagination.pageNum.value, keyword: keyWord.value};
    let url = 'https://www.doutupk.com/search?type=photo&more=1'
    if (!keyWord.value) {
        url = 'https://www.doutupk.com/article/list'
        params = {page: pagination.pageNum.value}
    }

    const config = {method: 'get', url, params};

    return axios(config)
        .then(function (response) {
            const $ = cheerio.load(response.data)
            const imgLinks = $('.image_dtb,.image_dta').map((_, img) => `${img.attribs['data-original']}`).get()

            pagination.hasLess.value = pagination.pageNum.value > 1
            pagination.hasMore.value = $('.pagination .disabled:contains("»")').length === 0;

            downloadImages(imgLinks, {}, callback)
        })
}

/**
 * 发表情 表情包搜索 - 发送请求搜索表情包列表
 * @param loading
 * @param keyWord
 * @param preHandle
 * @param callback
 */
const fetchFaBiaoQingEmoticons = (loading, pagination, keyWord, preHandle, callback) => {
    if (loading.value) {
        return Promise.resolve()
    }
    preHandle && preHandle()
    let url = `https://fabiaoqing.com/search/bqb/keyword/${keyWord.value}/type/bq/page/${pagination.pageNum.value}.html`
    // 没有关键字,加载热门表情包
    if (!keyWord.value) {
        url = `https://fabiaoqing.com/biaoqing/lists/page/${pagination.pageNum.value}.html`
        if (pagination.pageNum.value === 1) {
            url = `https://fabiaoqing.com/biaoqing`
        }
    }

    const config = {method: 'get', url};

    return axios(config)
        .then(function (response) {
            const $ = cheerio.load(response.data)

            const imgLinks = $('#bqb a img').map((_, img) => img.attribs['data-original']).get()

            pagination.hasLess.value = pagination.pageNum.value > 1
            pagination.hasMore.value = $('.menu .item:contains("下一页")').length > 0;

            downloadImages(imgLinks, {'headers': {Referer: 'https://fabiaoqing.com/'}}, callback)
        })
}

/**
 * 斗图吧表情包搜索 - 发送请求搜索表情包列表
 * @param loading
 * @param keyWord
 * @param preHandle
 * @param callback
 */
const fetchDouTuBaEmoticons = (loading, pagination, keyWord, preHandle, callback) => {
    if (loading.value) {
        return Promise.resolve()
    }
    preHandle && preHandle()

    let params = {curPage: pagination.pageNum.value, pageSize: 20, keyword: keyWord.value};
    let url = 'https://api.doutub.com/api/bq/search'

    // 没有关键字,加载热门表情包
    if (!keyWord.value) {
        url = 'https://api.doutub.com/api/bq/queryNewBq'
        params = {curPage: pagination.pageNum.value, typeId: 1, isShowIndex: false, pageSize: 50};
    }

    const config = {method: 'get', url, params};

    return axios(config)
        .then(function (response) {
            const {rows, count} = response.data.data
            const imgLinks = rows.map(row => row['path'].replace('https', 'http'))

            pagination.hasLess.value = pagination.pageNum.value > 1
            pagination.hasMore.value = pagination.pageNum.value * pagination.pageSize.value < count;

            downloadImages(imgLinks, {headers: {'Referer': 'http://www.doutub.com'}}, callback)
        })
}

/**
 * 斗图王表情包搜索 - 发送请求搜索表情包列表
 * @param loading
 * @param keyWord
 * @param preHandle
 * @param callback
 */
const fetchDouTuWangEmoticons = (loading, pagination, keyWord, preHandle, callback) => {
    if (loading.value) {
        return Promise.resolve()
    }
    preHandle && preHandle()

    let url = `https://www.doutuwang.com/page/${pagination.pageNum.value}?s=${keyWord.value}`
    if (!keyWord.value) {
        url = `https://www.doutuwang.com/category/dashijian/page/${pagination.pageNum.value}`
    }
    const config = {method: 'get', url};

    return axios(config)
        .then(function (response) {
            const $ = cheerio.load(response.data)
            const imgLinks = $('.post img').map((_, img) => img.attribs['src']).get()

            pagination.hasLess.value = pagination.pageNum.value > 1
            pagination.hasMore.value = $('.pagination .next').length > 0;

            downloadImages(imgLinks, {}, callback)
        })
}

/**
 * 去斗图表情包搜索 - 发送请求搜索表情包列表
 * @param loading
 * @param pagination
 * @param keyWord
 * @param preHandle
 * @param callback
 */
const fetchQuDouTuEmoticons = (loading, pagination, keyWord, preHandle, callback) => {
    // http://www.godoutu.com/search/type/face/keyword/%E5%93%88%E5%93%88/page/1.html
    if (loading.value) {
        return Promise.resolve()
    }
    preHandle && preHandle()

    let url = `http://www.godoutu.com/search/type/face/keyword/${keyWord.value}/page/${pagination.pageNum.value}.html`
    let img_matcher = '.bqppsearch'
    if (!keyWord.value) {
        url = `http://www.godoutu.com`
        img_matcher = '.bqppdiv img'
    }

    const config = {method: 'get', url};

    return axios(config)
        .then(function (response) {
            const $ = cheerio.load(response.data)
            const imgLinks = $(img_matcher).map((_, img) => img.attribs['data-original']).get()

            pagination.hasLess.value = pagination.pageNum.value > 1
            pagination.hasMore.value = $('.menu .item:contains("下一页")').length > 0;

            downloadImages(imgLinks, {}, callback)
        })
}
/**
 * 表情2333网 表情包搜索 - 发送请求搜索表情包列表
 * @param loading
 * @param pagination
 * @param keyWord
 * @param preHandle
 * @param callback
 */
const fetchBiaoQing2333Emoticons = (loading, pagination, keyWord, preHandle, callback) => {
    // https://biaoqing233.com/app/search/%E5%8E%89%E5%AE%B3?page=2&limit=30
    if (loading.value || !keyWord.value) {
        return Promise.resolve()
    }
    preHandle && preHandle()

    const config = {
        method: 'get',
        url: `https://biaoqing233.com/app/search/${keyWord.value}?page=${pagination.pageNum.value}&limit=50`
    };

    return axios(config)
        .then(function (response) {
            const imgLinks = response.data.docs.map(d => `https://lz.sinaimg.cn/large/${d.key}`)
            downloadImages(imgLinks, {}, callback)
        })
}

/**
 * 逗比表情包 搜索 - 发送请求搜索表情包列表
 * @param loading
 * @param pagination
 * @param keyWord
 * @param preHandle
 * @param callback
 * @returns {Promise<void>|Promise<unknown>}
 */
const fetchDbbqbEmoticons = (loading, pagination, keyWord, preHandle, callback) => {
    if (loading.value) {
        return Promise.resolve()
    }
    preHandle && preHandle()
    let params = {
        start: (pagination.pageNum.value - 1) * pagination.pageSize.value,
        w: keyWord.value
    }
    if (!keyWord.value) {
        params = {size: pagination.pageSize.value}
    }

    const config = {
        method: 'get',
        headers: {"Web-Agent": "web"},
        url: `https://www.dbbqb.com/api/search/json`,
        params
    };

    return axios(config)
        .then(function (response) {
            const imgLinks = response.data.map(img => `https://image.dbbqb.com/${img.path}`)
            pagination.hasLess.value = pagination.pageNum.value > 1
            pagination.hasMore.value = response.data.length >= pagination.pageSize.value;

            downloadImages(imgLinks, {}, callback)
        })

}

/**
 * 百度表情包 搜索
 * @param loading
 * @param pagination
 * @param keyWord
 * @param preHandle
 * @param callback
 * @returns {Promise<void>}
 */
const fetchBaiduEmoticons = (loading, pagination, keyWord, preHandle, callback) => {
    if (loading.value) {
        return Promise.resolve()
    }
    if (!keyWord.value) {
        keyWord.value = '表情包'
    }

    preHandle && preHandle()

    const config = {
        method: 'get',
        url: `https://image.baidu.com/search/acjson`,
        params: {
            tn: "resultjson_com",
            word: keyWord.value,
            pn: pagination.pageNum.value * pagination.pageSize.value,
            rn: pagination.pageSize.value
        }
    };

    return axios(config)
        .then(function (response) {
            const data = response.data.data
            const imgLinks = data.map(d => d['middleURL'])

            pagination.hasLess.value = pagination.pageNum.value > 1
            pagination.hasMore.value = data.length >= pagination.pageSize.value;

            downloadImages(imgLinks, {}, callback)
        })
}

/**
 * 斗了个图 搜索
 * @param loading
 * @param pagination
 * @param keyWord
 * @param preHandle
 * @param callback
 * @returns {Promise<void>}
 */
const fetchDouLeGeTuEmoticons = (loading, pagination, keyWord, preHandle, callback) => {
    if (loading.value) {
        return Promise.resolve()
    }
    preHandle && preHandle()

    // 没有关键字的时候,加载最新表情包
    let params = {page: pagination.pageNum.value, keyword: keyWord.value};
    let url = 'https://www.dogetu.com/search.html'

    if (!keyWord.value) {
        url = 'https://www.dogetu.com/biaoqing.html'
        params = {page: pagination.pageNum.value}
    }

    const config = {method: 'get', url, params};

    return axios(config)
        .then(function (response) {
            const $ = cheerio.load(response.data)
            const imgLinks = $('.item-pic>a>img').map((_, img) => `${img.attribs['src']}`).get()

            pagination.hasLess.value = pagination.pageNum.value > 1
            pagination.hasMore.value = $('.pagination .disabled:contains("»")').length === 0;

            downloadImages(imgLinks, {}, callback)
        })
}

/**
 * 初始化插件
 */
function init(keyWord, reload) {
    utools.onPluginEnter(({type, payload}) => {
        utools.setSubInput(({text}) => keyWord.value = text, "鼠标操作:回车搜索,左击复制图片,中击查看大图,右击加入收藏～");
        if (type === 'over') {
            utools.setSubInputValue(payload)
            keyWord.value = payload
            reload()
        }
    })

    addEventListener('keydown', (event) => {
        // 回车的时候，进行搜索
        if (event.code === 'Enter') {
            reload()
        }
    });
    // 初始化进入就加载随机表情包
    reload()
}

export default function (reloadCallback) {
    const emoticons = ref([])
    const keyWord = ref("")
    const loading = ref(false)

    const pagination = toRefs(reactive({
        pageNum: 1,
        pageSize: 20,
        hasMore: false,
        hasLess: false,
    }))

    // 数据返回后，不断追加表情包数据
    const callback = items => {
        // 异步取消loading状态，等待表情包渲染完成后再进行取消loading
        nextTick(() => emoticons.value.push(...items))
            .then(() => setTimeout(() => loading.value = false, 100))
    }

    // 数据加载
    const loadData = (pagination, loadCConfig = {}) => {
        const {isAppend} = loadCConfig
        // 不是追加模式的话,则清空图片列表
        if (!isAppend) {
            emoticons.value = []
        }

        // 为每个图源设置不同的接口响应延迟
        const callbackTimeoutMap = {
            '搜狗': 20000,
            '逗比表情包': 20000,
            '斗了个图': 20000,
        }
        // 加载之前，统一清空图片列表
        const preHandle = () => loading.value = true

        try {
            const {imageSource} = fetchConfig()
            let callbackTimeout = callbackTimeoutMap[imageSource] || 15000

            // 最长8秒后，强制结束加载请求，避免页面卡死
            setTimeout(() => callback([]), callbackTimeout)

            if ("搜狗" === imageSource) {
                return fetchSogouEmoticons(loading, pagination, keyWord, preHandle, callback)
            }

            if ("爱斗图" === imageSource) {
                return fetchAiDouTuEmoticons(loading, pagination, keyWord, preHandle, callback)
            }

            if ("斗图啦" === imageSource) {
                return fetchDouTulaEmoticons(loading, pagination, keyWord, preHandle, callback)
            }
            if ("发表情" === imageSource) {
                return fetchFaBiaoQingEmoticons(loading, pagination, keyWord, preHandle, callback)
            }

            if ('斗图吧' === imageSource) {
                return fetchDouTuBaEmoticons(loading, pagination, keyWord, preHandle, callback)
            }

            if ('斗图王' === imageSource) {
                return fetchDouTuWangEmoticons(loading, pagination, keyWord, preHandle, callback)
            }

            if ("斗图" === imageSource) {
                return fetchDouTuEmoticons(loading, pagination, keyWord, preHandle, callback)
            }

            if ('去斗图' === imageSource) {
                return fetchQuDouTuEmoticons(loading, pagination, keyWord, preHandle, callback)
            }

            if ('逗比表情包' === imageSource) {
                return fetchDbbqbEmoticons(loading, pagination, keyWord, preHandle, callback)
            }

            if ('百度' === imageSource) {
                return fetchBaiduEmoticons(loading, pagination, keyWord, preHandle, callback)
            }

            if ('斗了个图' === imageSource) {
                return fetchDouLeGeTuEmoticons(loading, pagination, keyWord, preHandle, callback)
            }
        } catch (e) {
            callback([])
            alert('加载出错，错误信息: ' + e)
        }
    }

    // 重置为加载第一页
    const reload = () => {
        // 正在加载中,不再进行新的数据加载
        if (!!loading.value) {
            return
        }
        pagination.pageNum.value = 1
        loading.value = false
        reloadCallback && reloadCallback()
        loadData(pagination)
    }

    onMounted(() => init(keyWord, reload))

    // 翻页到上一页
    const nextPage = (loadCConfig) => {
        pagination.pageNum.value++
        loadData(pagination, loadCConfig)
    }

    // 翻页到下一页
    const previousPage = () => {
        pagination.pageNum.value--
        loadData(pagination)
    }

    // 退出或者隐藏时，清空关键字
    utools.onPluginOut(() => {
        keyWord.value = ''
    })


    // 滚动到底部的时候,加载更多数据
    const loadMore = (e) => {
        if (e.target instanceof HTMLDivElement) {
            if (Math.round(e.target.scrollTop) + e.target.clientHeight >= e.target.scrollHeight) {
                if (!loading.value && pagination.hasMore.value) {
                    nextPage && nextPage({isAppend: true})
                }
            }
        }
    }

    return {
        emoticons,
        loading,
        pagination,
        keyWord,
        previousPage,
        nextPage,
        reload,
        config: fetchConfig(),
        loadMore,
    }
}
