import {load} from "cheerio";
import {get} from "../../utils/http.js";
import {defineSource} from "../defineSource.js";

/**
 * 斗图王 https://www.doutuwang.com
 * 站长服务器套餐到期无法访问,已下架;检测可观测其死活
 */
export default defineSource({
    id: "doutuwang",
    label: "斗图王",
    host: "https://www.doutuwang.com",
    enabled: false,

    async fetchPage({keyword, page, signal}) {
        const url = keyword
            ? `https://www.doutuwang.com/page/${page}?s=${keyword}`
            : `https://www.doutuwang.com/category/dashijian/page/${page}`;

        const $ = load(await get(url));
        const links = $(".post img").map((_, img) => img.attribs["src"]).get();
        return {links, hasMore: $(".pagination .next").length > 0, hasLess: page > 1};
    },
});
