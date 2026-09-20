import {get} from "../utils/http.js";
import {defineSource} from "./defineSource.js";

/**
 * 百度图片搜索 https://image.baidu.com
 */
export default defineSource({
    id: "baidu",
    label: "百度",
    host: "https://image.baidu.com",

    async fetchPage({keyword, page, pageSize, signal}) {
        const body = await get("https://image.baidu.com/search/acjson", {
            tn: "resultjson_com",
            word: keyword,
            pn: page * pageSize,
            rn: pageSize,
        }, {signal});

        // 接口返回的 data 里混有缺 middleURL 的占位条目,必须过滤
        const links = (body?.data ?? []).map(item => item["middleURL"]).filter(Boolean);
        return {links, hasMore: links.length >= pageSize, hasLess: page > 1};
    },
});
