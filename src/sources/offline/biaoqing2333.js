import {get} from "../../utils/http.js";
import {defineSource} from "../defineSource.js";

/**
 * 表情2333 https://biaoqing233.com
 * 实现可用但从未上架;必须有关键字才能搜索
 */
export default defineSource({
    id: "biaoqing2333",
    label: "表情2333",
    host: "https://biaoqing233.com",
    enabled: false,

    async fetchPage({keyword, page, signal}) {
        const body = await get(`https://biaoqing233.com/app/search/${keyword}?page=${page}&limit=50`, {}, {signal});
        const links = body.docs.map(d => `https://lz.sinaimg.cn/large/${d.key}`);
        return {links};
    },
});
