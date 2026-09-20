import {load} from "cheerio";
import {get} from "../../utils/http.js";
import {defineSource} from "../defineSource.js";

/**
 * 去斗图 http://www.godoutu.com
 * 站点接口失效,已下架;检测可观测其死活
 */
export default defineSource({
    id: "qudoutu",
    label: "去斗图",
    host: "http://www.godoutu.com",
    enabled: false,

    async fetchPage({keyword, page, signal}) {
        let url = `http://www.godoutu.com/search/type/face/keyword/${keyword}/page/${page}.html`;
        let matcher = ".bqppsearch";
        if (!keyword) {
            url = "http://www.godoutu.com";
            matcher = ".bqppdiv img";
        }

        const $ = load(await get(url));
        const links = $(matcher).map((_, img) => img.attribs["data-original"]).get();
        return {links, hasMore: $('.menu .item:contains("下一页")').length > 0, hasLess: page > 1};
    },
});
