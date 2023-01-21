import {ref} from "vue";
import qs from "qs";
import axios from "axios";


/**
 * 发送请求搜索表情包列表
 * @param loading
 * @param keyWord
 * @param preHandle
 * @param callback
 */
const fetchEmoticons = (loading, keyWord, preHandle, callback) => {
    if (!keyWord.value) {
        return
    }
    loading.value = true
    preHandle && preHandle()
    const data = qs.stringify({
        start: '0',
        xml_len: 100,
        'keyword': keyWord.value
    });
    const config = {
        method: 'post',
        url: 'https://pic.sogou.com/napi/wap/searchlist',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        data: data
    };

    axios(config)
        .then(function (response) {
            const data = response.data
            callback(data.data.picResult.items)
        })
        .finally(() => {
            loading.value = false
        });
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
}

export default function () {
    const emoticons = ref([])
    const keyWord = ref("")
    const loading = ref(false)

    const reload = () => fetchEmoticons(loading, keyWord, () => emoticons.value = [], items => emoticons.value = items)

    init(keyWord, reload)

    return {
        emoticons,
        loading,
    }
}
