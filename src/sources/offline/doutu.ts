import { defineSource } from "../defineSource";
import { get } from "@/utils/http";

/** 斗图在线接口返回结构(只声明用到的字段) */
interface DoutuApiResponse {
  items?: { url?: string }[];
  totalSize: number;
}

/**
 * 斗图在线 https://doutu.lccyy.com
 * 官方接口对用户有限制(封禁),已下架;检测可观测其死活
 */
export default defineSource({
  id: "doutu",
  label: "斗图在线",
  host: "https://doutu.lccyy.com/",
  enabled: false,
  note: "官方接口对用户有限制",

  async fetchPage({ keyword, page, signal }) {
    let url = "https://doutu.lccyy.com/doutu/items";
    let params: Record<string, unknown> = { type: 1, pageNum: page, pageSize: 20, keyword };
    if (!keyword) {
      url = "https://doutu.lccyy.com/doutu/all";
      params = { ac: "home", start: 0, limit: 30, keyword: "" };
    }

    // 该接口曾要求特定 User-Agent,但渲染进程(浏览器环境)禁止伪造 UA 头;
    // 若站点复活且仍校验 UA,需要把请求下沉到 preload 的 node 环境实现
    const body = await get<DoutuApiResponse>(url, params, { signal });
    const links = (body.items ?? []).map((item) => item["url"]).filter((link): link is string => !!link);
    return { links, hasMore: page * 20 < body.totalSize, hasLess: page > 1 };
  },
});
