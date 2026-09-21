import type { ImageSource } from "./types";

import { describe, expect, it } from "vitest";

import { checkAllSources, checkSource, HealthStatus } from "./health-check";

/** 构造一个行为可定制的测试图源 */
const makeSource = (overrides: Partial<ImageSource> = {}): ImageSource => ({
  id: "test",
  label: "测试图源",
  host: "https://example.com",
  fetchPage: async () => ({ links: ["https://example.com/a.gif", "https://example.com/b.gif"] }),
  ...overrides,
});

describe("sources/health-check", () => {
  it("取到图片直链时状态为 ok", async () => {
    const result = await checkSource(makeSource());
    expect(result.status).toBe(HealthStatus.OK);
    expect(result.count).toBe(2);
    expect(result.enabled).toBe(true);
  });

  it("请求成功但无结果时状态为 empty(通常是选择器失效)", async () => {
    const result = await checkSource(makeSource({ fetchPage: async () => ({ links: [] }) }));
    expect(result.status).toBe(HealthStatus.EMPTY);
    expect(result.count).toBe(0);
  });

  it("请求或解析抛错时状态为 fail,并携带失败原因", async () => {
    const result = await checkSource(
      makeSource({
        fetchPage: async () => {
          throw new Error("站点挂了");
        },
      }),
    );
    expect(result.status).toBe(HealthStatus.FAIL);
    expect(result.error).toContain("站点挂了");
  });

  it("超过图源 timeout 未响应时状态为 timeout", async () => {
    const result = await checkSource(
      makeSource({
        timeout: 30,
        fetchPage: () => new Promise(() => {}),
      }),
    );
    expect(result.status).toBe(HealthStatus.TIMEOUT);
  }, 3000);

  it("checkAllSources 按注册顺序回填结果,并逐个触发回调", async () => {
    const slow = makeSource({
      id: "slow",
      label: "慢图源",
      fetchPage: async () => ({ links: ["https://s/1"] }),
    });
    const fast = makeSource({
      id: "fast",
      label: "快图源",
      fetchPage: async () => ({ links: ["https://f/1"] }),
    });

    const seen: string[] = [];
    const { results, settled } = checkAllSources([slow, fast], (result) => seen.push(result.id));
    expect(results.map((row) => row.status)).toEqual([HealthStatus.PENDING, HealthStatus.PENDING]);

    await settled;
    expect(results.map((row) => row.status)).toEqual([HealthStatus.OK, HealthStatus.OK]);
    expect(seen).toEqual(["slow", "fast"]);
  });
});
