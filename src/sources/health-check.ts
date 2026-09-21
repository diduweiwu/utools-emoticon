import type { ImageSource } from "./types";

import { DEFAULT_SEARCH_KEYWORD, imageSources } from "./registry";
import { DEFAULT_SOURCE_TIMEOUT } from "@/utils/http";

/**
 * 图源检测状态
 */
export const HealthStatus = {
  /** 未检测(仅插件内列表初始占位用,CLI 不会产生该状态) */
  IDLE: "idle",
  /** 等待检测 */
  PENDING: "pending",
  /** 正常:取到了图片直链 */
  OK: "ok",
  /** 无结果:请求成功但一条图片都没解析到,通常是站点改版导致选择器失效 */
  EMPTY: "empty",
  /** 超时 */
  TIMEOUT: "timeout",
  /** 失败:请求或解析抛错 */
  FAIL: "fail",
} as const;

export type HealthStatus = (typeof HealthStatus)[keyof typeof HealthStatus];

/** 单个图源的检测结果 */
export interface HealthCheckResult {
  /** 图源 id */
  id: string;
  /** 图源展示名 */
  label: string;
  /** 图源站点 */
  host: string;
  /** 是否上架 */
  enabled: boolean;
  /** 图源备注(如 VIP 限制) */
  note?: string;
  /** HealthStatus 之一 */
  status: HealthStatus;
  /** 耗时(毫秒) */
  durationMs: number;
  /** 解析到的图片数量 */
  count: number;
  /** 失败/超时原因 */
  error?: string;
}

/** 检测时的采样页大小 */
const PROBE_PAGE_SIZE = 20;

/** 超时错误标记(用于区分「超时」和「失败」两种异常状态) */
class TimeoutError extends Error {}

/** 给请求加上硬超时,避免个别站点把检测卡住 */
function withTimeout<T>(promise: Promise<T>, timeout: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new TimeoutError(`请求超过 ${Math.round(timeout / 1000)}s 未响应`)),
      timeout,
    );
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

/**
 * 检测单个图源:真实请求第一页并解析,校验能否取回图片直链。
 * 只做「请求 + 解析」,不下载图片、不触碰插件状态,因此可以安全地在
 * 插件运行时(渲染进程)和本地 node 脚本(scripts/check-sources.ts)两个环境复用。
 */
export async function checkSource(
  source: ImageSource,
  options: { page?: number; pageSize?: number; keyword?: string } = {},
): Promise<HealthCheckResult> {
  const base = {
    id: source.id,
    label: source.label,
    host: source.host,
    enabled: source.enabled !== false,
    note: source.note,
  };
  const startedAt = Date.now();
  try {
    const request = {
      keyword: options.keyword ?? source.defaultKeyword ?? DEFAULT_SEARCH_KEYWORD,
      page: options.page ?? 1,
      pageSize: options.pageSize ?? PROBE_PAGE_SIZE,
    };
    const result = await withTimeout(
      Promise.resolve(source.fetchPage(request)),
      source.timeout ?? DEFAULT_SOURCE_TIMEOUT,
    );
    const count = (result?.links ?? []).filter((link) => !!link).length;
    return {
      ...base,
      durationMs: Date.now() - startedAt,
      count,
      status: count > 0 ? HealthStatus.OK : HealthStatus.EMPTY,
    };
  } catch (error) {
    return {
      ...base,
      durationMs: Date.now() - startedAt,
      count: 0,
      status: error instanceof TimeoutError ? HealthStatus.TIMEOUT : HealthStatus.FAIL,
      error: String((error as Error)?.message ?? error),
    };
  }
}

/**
 * 并发检测一批图源(默认全部注册图源,含已下架的)。
 *
 * @param sources 待检测的图源列表
 * @param onResult 单个图源出结果时的回调(UI 可实时刷新)
 * @returns results 数组会被就地更新,调用方注意保持响应式
 */
export function checkAllSources(
  sources: readonly ImageSource[] = imageSources,
  onResult: (result: HealthCheckResult, index: number) => void = () => {},
): { results: HealthCheckResult[]; settled: Promise<unknown> } {
  const results: HealthCheckResult[] = sources.map((source) => ({
    id: source.id,
    label: source.label,
    host: source.host,
    enabled: source.enabled !== false,
    note: source.note,
    status: HealthStatus.PENDING,
    durationMs: 0,
    count: 0,
  }));
  const settled = Promise.all(
    sources.map((source, index) =>
      checkSource(source).then((result) => {
        results[index] = result;
        onResult(result, index);
      }),
    ),
  );
  return { results, settled };
}
