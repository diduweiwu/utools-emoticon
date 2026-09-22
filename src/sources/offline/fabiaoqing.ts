import { load } from "cheerio/slim";
import { defineSource } from "../defineSource";
import { get } from "@/utils/http";

/**
 * 发表情 https://fabiaoqing.com
 * 2026-09 检测发现站点无法访问,已下架;检测可观测其死活,复活后把 enabled 改回 true
 * - 有关键字: 关键字搜索
 * - 无关键字: 首页/最新表情包列表
 */
export default defineSource({
  id: "fabiaoqing",
  label: "发表情",
  host: "https://fabiaoqing.com",
  enabled: false,

  async fetchPage({ keyword, page }) {
    let url;
    if (keyword) {
      url = `https://fabiaoqing.com/search/bqb/keyword/${keyword}/type/bq/page/${page}.html`;
    } else {
      url =
        page === 1
          ? "https://fabiaoqing.com/biaoqing"
          : `https://fabiaoqing.com/biaoqing/lists/page/${page}.html`;
    }

    const $ = load(await get<string>(url));
    const links = $("#bqb a img")
      .map((_, img) => img.attribs["data-original"])
      .get();
    return {
      links,
      // 站点校验 Referer,下载图片时必须带上
      downloadOptions: { headers: { Referer: "https://fabiaoqing.com/" } },
      hasMore: $('.menu .item:contains("下一页")').length > 0,
      hasLess: page > 1,
    };
  },
});
