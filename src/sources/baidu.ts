import { defineSource } from "./defineSource";
import { get } from "@/utils/http";

/** 百度图片 acjson 接口返回结构(只声明用到的字段) */
interface BaiduApiResponse {
  data?: { middleURL?: string }[];
}

/**
 * 百度图片搜索 https://image.baidu.com
 */
export default defineSource({
  id: "baidu",
  label: "百度",
  host: "https://image.baidu.com",

  async fetchPage({ keyword, page, pageSize, signal }) {
    const body = await get<BaiduApiResponse>(
      "https://image.baidu.com/search/acjson",
      {
        tn: "resultjson_com",
        word: keyword,
        pn: page * pageSize,
        rn: pageSize,
      },
      { signal },
    );

    // 接口返回的 data 里混有缺 middleURL 的占位条目,必须过滤
    const links = (body.data ?? []).map((item) => item["middleURL"]).filter((link): link is string => !!link);
    return { links, hasMore: links.length >= pageSize, hasLess: page > 1 };
  },
});
