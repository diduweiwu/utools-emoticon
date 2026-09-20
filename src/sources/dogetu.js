import {load} from "cheerio";
import {get} from "../utils/http.js";
import {defineSource} from "./defineSource.js";

/**
 * 斗了个图 https://www.dogetu.com
 * - 有关键字: 关键字搜索
 * - 无关键字: 最新表情包列表
 */
export default defineSource({
    id: "dogetu",
    label: "斗了个图",
    host: "https://www.dogetu.com",
    // 接口响应较慢,放宽超时
    timeout: 20000,

    async fetchPage({keyword, page, signal}) {
        let url = "https://www.dogetu.com/search.html";
        let params = {page, keyword};
        if (!keyword) {
            url = "https://www.dogetu.com/biaoqing.html";
            params = {page};
        }

        const $ = load(await get(url, params, {signal}));
        const links = $(".item-pic>a>img").map((_, img) => `${img.attribs["src"]}`).get();
        return {
            links,
            hasMore: $('.pagination .disabled:contains("»")').length === 0,
            hasLess: page > 1,
        };
    },
});
