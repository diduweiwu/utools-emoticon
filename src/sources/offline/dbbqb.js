import {get} from "../../utils/http.js";
import {defineSource} from "../defineSource.js";

/**
 * 逗比表情包 https://www.dbbqb.com
 * 站点长期无法访问,已下架;检测可观测其死活
 */
export default defineSource({
    id: "dbbqb",
    label: "逗比表情包",
    host: "https://www.dbbqb.com",
    enabled: false,
    note: "非VIP有数量限制",
    // 接口响应较慢,放宽超时
    timeout: 20000,

    async fetchPage({keyword, page, pageSize, signal}) {
        const params = keyword
            ? {start: (page - 1) * pageSize, w: keyword}
            : {size: pageSize};

        const body = await get("https://www.dbbqb.com/api/search/json", params, {headers: {"Web-Agent": "web"}, signal});
        const links = body.map(img => `https://image.dbbqb.com/${img.path}`);
        return {links, hasMore: body.length >= pageSize, hasLess: page > 1};
    },
});
