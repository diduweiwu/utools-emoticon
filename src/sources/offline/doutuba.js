import {get} from "../../utils/http.js";
import {defineSource} from "../defineSource.js";

/**
 * 斗图吧 https://doutub.com
 * 站点长期无法访问,已下架;一键检测可观测其死活,复活后把 enabled 改回 true 即可重新上架
 */
export default defineSource({
    id: "doutuba",
    label: "斗图吧",
    host: "https://doutub.com",
    enabled: false,

    async fetchPage({keyword, page, signal}) {
        let url = "https://api.doutub.com/api/bq/search";
        let params = {curPage: page, pageSize: 20, keyword};
        if (!keyword) {
            url = "https://api.doutub.com/api/bq/queryNewBq";
            params = {curPage: page, typeId: 1, isShowIndex: false, pageSize: 50};
        }

        const body = await get(url, params, {signal});
        const links = body.data.rows.map(row => row["path"].replace("https", "http"));
        return {
            links,
            downloadOptions: {headers: {Host: "api.doutub.com"}},
            hasMore: page * 20 < body.data.count,
            hasLess: page > 1,
        };
    },
});
