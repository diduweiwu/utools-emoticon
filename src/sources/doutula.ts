import { load } from "cheerio/slim";
import { defineSource } from "./defineSource";
import { get } from "@/utils/http";

/**
 * 斗图啦 https://www.doutupk.com
 * - 有关键字: 关键字搜索
 * - 无关键字: 最新表情包列表
 */
export default defineSource({
  id: "doutula",
  label: "斗图啦",
  host: "https://www.doutupk.com",

  async fetchPage({ keyword, page, signal }) {
    const [url, params] = keyword
      ? ["https://www.doutupk.com/search?type=photo&more=1", { page, keyword }]
      : ["https://www.doutupk.com/article/list", { page }];

    const $ = load(await get<string>(url, params, { signal }));
    // 站点改版后,真实图片地址放在 data-backup 属性上
    const links = $(".image_dtb,.image_dta")
      .map((_, img) => img.attribs["data-backup"])
      .get();
    return {
      links,
      hasMore: $('.pagination .disabled:contains("»")').length === 0,
      hasLess: page > 1,
    };
  },
});
