import {load} from "cheerio";
import {get} from "../utils/http.js";
import {defineSource} from "./defineSource.js";

/**
 * 爱斗图 http://www.adoutu.com
 * - 有关键字: 关键字搜索
 * - 无关键字: 最新图片列表
 */
export default defineSource({
    id: "aidoutu",
    label: "爱斗图",
    host: "http://www.adoutu.com",

    async fetchPage({keyword, page, signal}) {
        let url = "http://www.adoutu.com/search";
        let params = {type: 1, page, keyword};
        if (!keyword) {
            url = `http://www.adoutu.com/picture/list/${page}`;
            params = {};
        }

        const $ = load(await get(url, params, {signal}));
        const links = $(".min-w-0 img").map((_, img) => img.attribs["src"]).get();
        return {
            links,
            hasMore: $('.pagination .page-link:contains(">>")').length > 0,
            hasLess: page > 1,
        };
    },
});
