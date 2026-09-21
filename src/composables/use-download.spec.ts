import type { Emoticon } from "@/types/emoticon";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { downloadCollectedImages, downloadImages } from "./use-download";

/** 等待微任务与定时器队列清空 */
const flush = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

const LINKS = Array.from({ length: 7 }, (_, i) => `https://example.com/${i + 1}.gif`);

describe("composables/use-download", () => {
  const downloadImageMock = vi.fn<(url: string) => Promise<Emoticon | null>>();

  beforeEach(() => {
    vi.stubGlobal("window", {
      downloadImage: downloadImageMock,
      checkOrCreateCollectedDirectory: () => "/tmp/collected",
    });
    downloadImageMock.mockReset();
    downloadImageMock.mockImplementation((url) => Promise.resolve({ imgSrc: url, fileSrc: `file://${url}` }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("过滤非法链接:非 http(s) 的相对地址/空串不触发下载", async () => {
    const batches: Emoticon[][] = [];
    await downloadImages(["https://ok/a.gif", "abc", "", "ftp://x/b.gif"], {}, (items) =>
      batches.push(items),
    );
    await flush();

    expect(downloadImageMock).toHaveBeenCalledTimes(1);
    expect(downloadImageMock).toHaveBeenCalledWith("https://ok/a.gif", {});
    expect(batches.at(-1)).toEqual([{ imgSrc: "https://ok/a.gif", fileSrc: "file://https://ok/a.gif" }]);
  });

  it("每批最多并发 5 个,分批回调且批内按链接排序", async () => {
    // 手动控制每张图片的下载完成时机,验证回调前的排序逻辑
    const resolvers: ((item: Emoticon) => void)[] = [];
    downloadImageMock.mockImplementation(() => new Promise<Emoticon>((resolve) => resolvers.push(resolve)));

    const batches: Emoticon[][] = [];
    downloadImages(LINKS, {}, (items) => batches.push(items));

    // 第一批 5 张,故意乱序完成
    for (const i of [3, 0, 4, 1, 2]) {
      resolvers[i]!({ imgSrc: LINKS[i]!, fileSrc: `file://${LINKS[i]}` });
    }
    await flush();

    expect(batches.length).toBe(1);
    expect(batches[0]!.map((item) => item.imgSrc)).toEqual([...LINKS.slice(0, 5)].sort());

    // 第二批剩余 2 张
    for (const i of [5, 6]) {
      resolvers[i]!({ imgSrc: LINKS[i]!, fileSrc: `file://${LINKS[i]}` });
    }
    await flush();

    expect(batches.length).toBe(2);
    expect(batches[1]!.map((item) => item.imgSrc)).toEqual(LINKS.slice(5));
  });

  it("下载失败的单张图片被丢弃,不影响其余图片回调", async () => {
    downloadImageMock.mockImplementation((url) =>
      url.endsWith("2.gif")
        ? Promise.reject(new Error("网络错误"))
        : Promise.resolve({ imgSrc: url, fileSrc: `file://${url}` }),
    );

    const batches: Emoticon[][] = [];
    await downloadImages(["https://a/1.gif", "https://a/2.gif", "https://a/3.gif"], {}, (items) =>
      batches.push(items),
    );
    await flush();

    expect(batches.at(-1)!.map((item) => item.imgSrc)).toEqual(["https://a/1.gif", "https://a/3.gif"]);
  });

  it("downloadCollectedImages 把下载目录指向收藏目录", async () => {
    await downloadCollectedImages(["https://ok/a.gif"]);
    expect(downloadImageMock).toHaveBeenCalledWith("https://ok/a.gif", { downloadPath: "/tmp/collected" });
  });

  it("空列表直接短路,不触发平台目录创建", async () => {
    await downloadCollectedImages([]);
    expect(downloadImageMock).not.toHaveBeenCalled();
  });
});
