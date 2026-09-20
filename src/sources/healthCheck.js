import {DEFAULT_SEARCH_KEYWORD, imageSources} from "./registry.js";
import {DEFAULT_SOURCE_TIMEOUT} from "../utils/http.js";

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
};

/** 检测时的采样页大小 */
const PROBE_PAGE_SIZE = 20;

/** 超时错误标记(用于区分「超时」和「失败」两种异常状态) */
class TimeoutError extends Error {
}

/** 给请求加上硬超时,避免个别站点把检测卡住 */
function withTimeout(promise, timeout) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(
            () => reject(new TimeoutError(`请求超过 ${Math.round(timeout / 1000)}s 未响应`)),
            timeout,
        );
        promise.then(
            value => {
                clearTimeout(timer);
                resolve(value);
            },
            error => {
                clearTimeout(timer);
                reject(error);
            },
        );
    });
}

/**
 * @typedef {Object} HealthCheckResult
 * @property {string} id 图源 id
 * @property {string} label 图源展示名
 * @property {string} host 图源站点
 * @property {boolean} enabled 是否上架
 * @property {string} [note] 图源备注(如 VIP 限制)
 * @property {string} status HealthStatus 之一
 * @property {number} durationMs 耗时(毫秒)
 * @property {number} count 解析到的图片数量
 * @property {string} [error] 失败/超时原因
 */

/**
 * 检测单个图源:真实请求第一页并解析,校验能否取回图片直链。
 * 只做「请求 + 解析」,不下载图片、不触碰插件状态,因此可以安全地在
 * 插件运行时(渲染进程)和本地 node 脚本(scripts/check-sources.mjs)两个环境复用。
 *
 * @param {import("./defineSource.js").ImageSource} source
 * @param {{page?: number, pageSize?: number, keyword?: string}} [options] keyword 传入时覆盖图源默认检测关键字
 * @returns {Promise<HealthCheckResult>}
 */
export async function checkSource(source, options = {}) {
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
        const count = (result?.links ?? []).filter(link => !!link).length;
        return {...base, durationMs: Date.now() - startedAt, count, status: count > 0 ? HealthStatus.OK : HealthStatus.EMPTY};
    } catch (error) {
        return {
            ...base,
            durationMs: Date.now() - startedAt,
            count: 0,
            status: error instanceof TimeoutError ? HealthStatus.TIMEOUT : HealthStatus.FAIL,
            error: String(error?.message ?? error),
        };
    }
}

/**
 * 并发检测一批图源(默认全部注册图源,含已下架的)。
 *
 * @param {import("./defineSource.js").ImageSource[]} [sources]
 * @param {(result: HealthCheckResult, index: number) => void} [onResult] 单个图源出结果时的回调(UI 可实时刷新)
 * @returns {{results: HealthCheckResult[], settled: Promise<unknown>}} results 数组会被就地更新,调用方注意保持响应式
 */
export function checkAllSources(sources = imageSources, onResult = () => {}) {
    const results = sources.map(source => ({
        id: source.id,
        label: source.label,
        host: source.host,
        enabled: source.enabled !== false,
        note: source.note,
        status: HealthStatus.PENDING,
    }));
    const settled = Promise.all(sources.map((source, index) =>
        checkSource(source).then(result => {
            results[index] = result;
            onResult(result, index);
        }),
    ));
    return {results, settled};
}
