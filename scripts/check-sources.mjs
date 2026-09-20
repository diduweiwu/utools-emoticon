#!/usr/bin/env node
/**
 * 图源一键检测脚本 —— 不用打开插件,在本地终端直接验证所有图源死活。
 *
 * 用法:
 *   npm run check:sources             # 用各图源默认的检测关键字
 *   npm run check:sources -- 猫猫     # 用指定关键字检测(对支持搜索的图源生效)
 *   node scripts/check-sources.mjs    # 等价
 *
 * 原理:图源层(sources/*.js 的 fetchPage)是纯「请求+解析」,不依赖插件环境,
 * 因此可以直接在 node 里复用与插件运行时完全相同的代码路径,检测结果与插件内一致。
 * 插件内入口:顶栏「更多」→「图源」Tab 的「图源检测」按钮。
 */
import {imageSources} from "../src/sources/registry.js";
import {checkSource, HealthStatus} from "../src/sources/healthCheck.js";

const keywordOverride = process.argv[2];

const STATUS_MARK = {
    [HealthStatus.OK]: "✅",
    [HealthStatus.EMPTY]: "⚠️ ",
    [HealthStatus.TIMEOUT]: "⏱️ ",
    [HealthStatus.FAIL]: "❌",
    [HealthStatus.PENDING]: "⏳",
};

console.log(`开始检测 ${imageSources.length} 个图源${keywordOverride ? `(关键字: ${keywordOverride})` : ""}...\n`);

const results = await Promise.all(imageSources.map(async source => {
    const result = await checkSource(source, keywordOverride ? {keyword: keywordOverride} : {});
    const tag = result.enabled ? "" : "(已下架)";
    const detail = result.error ? ` - ${result.error}` : "";
    console.log(`${STATUS_MARK[result.status]} ${result.label}${tag}: ${result.count} 张, 耗时 ${(result.durationMs / 1000).toFixed(1)}s${detail}`);
    return result;
}));

const order = {[HealthStatus.OK]: 0, [HealthStatus.EMPTY]: 1, [HealthStatus.TIMEOUT]: 2, [HealthStatus.FAIL]: 3};
results.sort((a, b) => (b.enabled - a.enabled) || ((order[a.status] ?? 9) - (order[b.status] ?? 9)));

console.log("\n—— 检测报告 ——");
console.table(results.map(({label, enabled, status, count, durationMs, error}) => ({
    图源: label,
    上架: enabled ? "✓" : "下架",
    状态: STATUS_MARK[status] + status,
    图片数: count,
    "耗时(s)": (durationMs / 1000).toFixed(1),
    说明: error ?? "",
})));

const enabledFailed = results.filter(result => result.enabled && result.status !== HealthStatus.OK);
if (enabledFailed.length > 0) {
    console.log(`⚠️  ${enabledFailed.length} 个已上架图源异常: ${enabledFailed.map(result => result.label).join("、")}`);
    process.exitCode = 1;
} else {
    console.log("✅ 所有已上架图源均正常");
}
