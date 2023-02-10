import {ref} from "vue";
import cheerio from "cheerio";
import UseConfig from "./useConfig.js";
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
        return
    }
    loading.value = true
    preHandle && preHandle()
    const params = {type: 'photo', page: pagination.value.pageNum, keyword: keyWord.value, more: 1};
    const config = {method: 'get', url: `https://www.pkdoutu.com/search`, params};
    axios(config)
        .then(function (response) {
            const $ = cheerio.load(response.data)

            const imgTags = $('.random_picture img.image_dtb')
            const imgLinks = imgTags.map((_, img) => img.attribs['data-original'])
            downloadImages(imgLinks, {}, callback)
            loading.value = false
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
        return
    }
    loading.value = true
    preHandle && preHandle()

    const params = {type: 1, page: pagination.value.pageNum, keyword: keyWord.value};

    const config = {method: 'get', url: `http://www.adoutu.com/search`, params};

    axios(config)
        .then(function (response) {
            const $ = cheerio.load(response.data)
            const imgLinks = $('.picture-list img').map((_, img) => img.attribs['src'])
            downloadImages(imgLinks, {}, callback)
            loading.value = false
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
    if (loading.value || !keyWord.value) {
        return
    }
    loading.value = true
    preHandle && preHandle()

    const params = {curPage: pagination.value.pageNum, pageSize: 20, keyword: keyWord.value};

    const config = {method: 'get', url: `https://api.doutub.com/api/bq/search`, params};

    axios(config)
        .then(function (response) {
            const {rows} = response.data.data
            const imgLinks = rows.map(row => row['path'].replace('https', 'http'))

            downloadImages(imgLinks, {headers: {'Referer': 'http://www.doutub.com'}}, callback)
            loading.value = false
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
        return
    }
    loading.value = true
    preHandle && preHandle()

    const config = {
        method: 'get',
        url: `https://www.doutuwang.com/page/${pagination.value.pageNum}?s=${keyWord.value}`
    };

    axios(config)
        .then(function (response) {
            const $ = cheerio.load(response.data)
            const imgLinks = $('.post img').map((_, img) => img.attribs['src'])

            downloadImages(imgLinks, {}, callback)
            loading.value = false
        })
}

/**
 * 初始化插件
 */
function init(keyWord, reload) {
    utools.onPluginEnter(({type, payload}) => {
        utools.setSubInput(({text}) => keyWord.value = text, "回车搜索表情包,点击图片复制～");
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
    // // 初始化进入就加载随机表情包
    reload()
}

export default function () {
    const emoticons = ref([])
    const keyWord = ref("")
    const loading = ref(false)

    const pagination = ref({
        pageNum: 1,
        pageSize: 20
    })
    const {fetchConfig} = UseConfig()

    // 数据加载
    const loadData = (pagination) => {
        const {imageSource} = fetchConfig()

        if ("爱斗图" === imageSource) {
            return fetchAiDouTuEmoticons(loading, pagination, keyWord, () => emoticons.value = [], items => emoticons.value.push(...items))
        }
        if ("PK斗图" === imageSource) {
            return fetchPkDouTuEmoticons(loading, pagination, keyWord, () => emoticons.value = [], items => emoticons.value.push(...items))
        }
        if ('斗图吧' === imageSource) {
            return fetchDouTuBaEmoticons(loading, pagination, keyWord, () => emoticons.value = [], items => emoticons.value.push(...items))
        }

        if ('斗图王' === imageSource) {
            return fetchDouTuWangEmoticons(loading, pagination, keyWord, () => emoticons.value = [], items => emoticons.value.push(...items))
        }
    }

    // 重置为加载第一页
    const reload = () => {
        pagination.value.pageNum = 1
        loadData(pagination)
    }

    init(keyWord, reload)

    // 翻页到上一页
    const nextPage = () => {
        pagination.value.pageNum++
        loadData(pagination)
    }

    // 翻页到下一页
    const previousPage = () => {
        pagination.value.pageNum--
        loadData(pagination)
    }

    return {
        emoticons,
        loading,
        pagination,
        keyWord,
        previousPage,
        nextPage,
        reload,
        downloadImages, downloadImage,
    }
}
