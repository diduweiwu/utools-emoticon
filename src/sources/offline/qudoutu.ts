import { load } from "cheerio/slim";
import { defineSource } from "../defineSource";
import { get } from "@/utils/http";

/**
 * 去斗图 http://www.godoutu.com
 * 站点接口失效,已下架;检测可观测其死活
 */
export default defineSource({
  id: "qudoutu",
  label: "去斗图",
  host: "http://www.godoutu.com",
  enabled: false,

  async fetchPage({ keyword, page }) {
    let url = `http://www.godoutu.com/search/type/face/keyword/${keyword}/page/${page}.html`;
    let matcher = ".bqppsearch";
    if (!keyword) {
      url = "http://www.godoutu.com";
      matcher = ".bqppdiv img";
    }

    const $ = load(await get<string>(url));
    const links = $(matcher)
      .map((_, el) => $(el).attr("data-original"))
      .get()
      .filter((link): link is string => !!link);
    return { links, hasMore: $('.menu .item:contains("下一页")').length > 0, hasLess: page > 1 };
  },
});
