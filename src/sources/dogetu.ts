import { load } from "cheerio";
import { defineSource } from "./defineSource";
import { get } from "@/utils/http";

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

  async fetchPage({ keyword, page, signal }) {
    const [url, params] = keyword
      ? ["https://www.dogetu.com/search.html", { page, keyword }]
      : ["https://www.dogetu.com/biaoqing.html", { page }];

    const $ = load(await get<string>(url, params, { signal }));
    const links = $(".item-pic>a>img")
      .map((_, img) => `${img.attribs["src"]}`)
      .get();
    return {
      links,
      hasMore: $('.pagination .disabled:contains("»")').length === 0,
      hasLess: page > 1,
    };
  },
});
