import {onMounted, reactive, ref, toRefs} from "vue";
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
            const imgLinks = imgTags.map((_, img) => img.attribs['data-original'])
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
    if (loading.value || !keyWord.value) {
        return Promise.resolve()
    }
    preHandle && preHandle()

    const params = {type: 1, page: pagination.pageNum.value, keyword: keyWord.value};

    const config = {method: 'get', url: `http://www.adoutu.com/search`, params};

    return axios(config)
        .then(function (response) {
            const $ = cheerio.load(response.data)
            const imgLinks = $('.picture-list img').map((_, img) => img.attribs['src'])

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
    let url = 'https://dou.yuanmazg.com/so'
    if (!keyWord.value) {
        url = 'https://dou.yuanmazg.com/doutu'
    }

    const config = {method: 'get', url, params};

    return axios(config)
        .then(function (response) {
            const $ = cheerio.load(response.data)
            const imgLinks = $('.page-content img').map((_, img) => `https://dou.yuanmazg.com/${img.attribs['data-original']}`)

            pagination.hasLess.value = $('.pagination .disabled:contains("«")').length === 0;
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
    }

    const config = {method: 'get', url};

    return axios(config)
        .then(function (response) {
            const $ = cheerio.load(response.data)

            const imgLinks = $('#bqb a img').map((_, img) => img.attribs['data-original'])

            pagination.hasLess.value = $('.menu .item:contains("上一页")').length > 0;
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

            pagination.hasLess.value = pagination.pageNum.value > 1;
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
            const imgLinks = $('.post img').map((_, img) => img.attribs['src'])

            pagination.hasLess.value = $('.pagination .prev').length > 0;
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
        url = `http://www.godoutu.com/face/hot/page/${pagination.pageNum.value}.html`
        img_matcher = '.tagbqppdiv img'
    }

    const config = {method: 'get', url};

    return axios(config)
        .then(function (response) {
            const $ = cheerio.load(response.data)
            const imgLinks = $(img_matcher).map((_, img) => img.attribs['data-original'])

            pagination.hasLess.value = $('.menu .item:contains("上一页")').length > 0;
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
 * 初始化插件
 */
function init(keyWord, reload) {
    utools.onPluginEnter(({type, payload}) => {
        utools.setSubInput(({text}) => keyWord.value = text, "回车搜索表情包,鼠标左击复制图片,鼠标中击查看大图,鼠标右击加入收藏～");
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

    // 数据加载
    const loadData = (pagination) => {
        emoticons.value = []

        // 数据返回后，不断追加表情包数据
        const callback = items => {
            loading.value = false
            emoticons.value.push(...items)
        }

        // 加载之前，统一清空图片列表
        const preHandle = () => loading.value = true

        try {
            const {imageSource} = fetchConfig()
            // 最长8秒后，强制结束加载请求，避免页面卡死
            setTimeout(() => callback([]), 8000)

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

            if ('去斗图' === imageSource) {
                return fetchQuDouTuEmoticons(loading, pagination, keyWord, preHandle, callback)
            }

            if ('表情233' === imageSource) {
                return fetchBiaoQing2333Emoticons(loading, pagination, keyWord, preHandle, callback)
            }

            if ("PK斗图" === imageSource) {
                return fetchPkDouTuEmoticons(loading, pagination, keyWord, preHandle, callback)
            }
        } catch (e) {
            callback([])
            alert('加载出错，错误信息: ' + e)
        }
    }

    // 重置为加载第一页
    const reload = () => {
        pagination.pageNum.value = 1
        loading.value = false
        reloadCallback && reloadCallback()
        loadData(pagination)
    }

    onMounted(() => init(keyWord, reload))

    // 翻页到上一页
    const nextPage = () => {
        pagination.pageNum.value++
        loadData(pagination)
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

    return {
        emoticons,
        loading,
        pagination,
        keyWord,
        previousPage,
        nextPage,
        reload,
    }
}
