import { defineSource } from "./defineSource";
import { get } from "@/utils/http";

// 搜狗接口单页固定 47 条
const PAGE_SIZE = 47;

/** 搜狗图片搜索接口返回结构(只声明用到的字段) */
interface SogouApiResponse {
  data?: {
    items?: { locImageLink?: string }[];
    maxEnd?: number;
  };
}

/**
 * 搜狗表情包 https://pic.sogou.com/pic/emo/index.jsp
 * 走图片搜索接口(原热门表情接口 moreEmo 已失效,现统一由调度器用默认关键字兜底)
 */
export default defineSource({
  id: "sogou",
  label: "搜狗",
  host: "https://pic.sogou.com/pic/emo/index.jsp",
  // 接口响应较慢,放宽超时
  timeout: 20000,

  async fetchPage({ keyword, page, signal }) {
    const start = (page - 1) * PAGE_SIZE;
    const body = await get<SogouApiResponse>(
      "https://pic.sogou.com/napi/wap/pic",
      {
        reqFrom: "wap_result",
        start,
        query: `${keyword} 表情`,
      },
      { signal },
    );

    const links = (body.data?.items ?? [])
      .map((img) => img["locImageLink"])
      .filter((link): link is string => !!link);
    return {
      links,
      hasMore: (body.data?.maxEnd ?? 0) >= page * PAGE_SIZE,
      hasLess: page > 1,
    };
  },
});
