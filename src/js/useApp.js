import {ref} from "vue";
import axios from "axios";
import cheerio from "cheerio";

/**
 * 爱斗图表情包搜索 - 发送请求搜索表情包列表
 * @param loading
 * @param keyWord
 * @param preHandle
 * @param callback
 */
const fetchAiDouTuEmoticons = (loading, pagination, keyWord, preHandle, callback) => {
    loading.value = true
    preHandle && preHandle()

    const params = {type: 1, page: pagination.value.pageNum, keyword: keyWord.value};

    const config = {method: 'get', url: `http://www.adoutu.com/search`, params};

    axios(config)
        .then(function (response) {
            const $ = cheerio.load(response.data)

            const imgTags = $('.picture-list img')
            const imgLinks = imgTags.map((_, img) => img.attribs['src'])
            const tempFiles = []
            // 把图片都下载到本地临时目录，跳过跨域限制
            const promiseArr = imgLinks.map((_, img) => new Promise(resolve => window.downloadImage(resolve, img, file => tempFiles.push(`file://${file}`))))

            Promise.all(promiseArr).then(() => callback(tempFiles))
                .then(() => loading.value = false)
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
            console.log(keyWord.value)
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
        pageSize: 50
    })

    // 数据加载
    const loadData = (pagination) => {
        fetchAiDouTuEmoticons(loading, pagination, keyWord, () => emoticons.value = [], items => emoticons.value = items)
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
    }
}
