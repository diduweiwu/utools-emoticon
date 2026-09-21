import type { AddressInfo } from "node:net";
import type { Server } from "node:http";

import { createServer } from "node:http";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { DEFAULT_SOURCE_TIMEOUT, get } from "./http";

/**
 * http 封装的集成测试:起一个本地 http 服务,验证参数拼接、
 * JSON/文本响应解析与异常路径,不依赖任何外部站点。
 */
describe("utils/http get()", () => {
  let server: Server;
  let baseUrl: string;

  beforeAll(async () => {
    server = createServer((req, res) => {
      const url = new URL(req.url ?? "/", "http://localhost");
      if (url.pathname === "/json") {
        res.setHeader("content-type", "application/json");
        res.end(JSON.stringify({ query: Object.fromEntries(url.searchParams) }));
      } else if (url.pathname === "/html") {
        res.setHeader("content-type", "text/html");
        res.end("<div>hello</div>");
      } else if (url.pathname === "/error") {
        res.statusCode = 500;
        res.end("boom");
      } else {
        res.statusCode = 404;
        res.end();
      }
    });
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it("JSON 响应返回解析后的对象,并携带查询参数", async () => {
    const body = await get<{ query: Record<string, string> }>(`${baseUrl}/json`, {
      keyword: "表情",
      page: 2,
    });
    expect(body.query).toEqual({ keyword: "表情", page: "2" });
  });

  it("HTML 响应返回原始字符串", async () => {
    const body = await get<string>(`${baseUrl}/html`);
    expect(body).toBe("<div>hello</div>");
  });

  it("非 2xx 响应抛出异常", async () => {
    await expect(get(`${baseUrl}/error`)).rejects.toThrow();
  });

  it("外部传入的 AbortSignal 可以取消请求", async () => {
    const controller = new AbortController();
    const pending = get(`${baseUrl}/json`, {}, { signal: controller.signal });
    controller.abort();
    await expect(pending).rejects.toThrow();
  });

  it("默认超时时间为 15s", () => {
    expect(DEFAULT_SOURCE_TIMEOUT).toBe(15000);
  });
});
