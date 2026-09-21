import { ref } from "vue";

import type { HealthCheckResult } from "@/sources/health-check";
import { checkAllSources, HealthStatus } from "@/sources/health-check";
import { imageSources } from "@/sources/registry";

import { loadJsonStorage, saveJsonStorage } from "./use-storage";

/** 检测结果持久化键 */
const RESULTS_STORAGE_KEY = "sourceHealthResults";

/** 状态展示排序:正常 → 无结果 → 超时/失败 → 未完成(待检测/检测中) */
const STATUS_RANK: Partial<Record<HealthStatus, number>> = {
  [HealthStatus.OK]: 0,
  [HealthStatus.EMPTY]: 1,
  [HealthStatus.TIMEOUT]: 2,
  [HealthStatus.FAIL]: 2,
  [HealthStatus.IDLE]: 9,
  [HealthStatus.PENDING]: 9,
};

/** 按状态排序(同状态内保持原有相对顺序) */
export function sortResultsByStatus(results: HealthCheckResult[]): HealthCheckResult[] {
  return [...results].sort((a, b) => (STATUS_RANK[a.status] ?? 9) - (STATUS_RANK[b.status] ?? 9));
}

/** 持久化的检测记录(只保留状态数据,基础信息始终以注册表为准) */
interface StoredHealthResults {
  savedAt?: string;
  results?: Partial<HealthCheckResult>[];
}

/**
 * 图源检测(响应式封装)。
 * 纯逻辑在 sources/health-check.ts,与 CLI 脚本(scripts/check-sources.ts)共用同一套实现。
 */
export default function useSourceHealthCheck() {
  /** 是否检测中 */
  const checking = ref(false);
  /** 检测结果,单项完成即实时更新 */
  const results = ref<HealthCheckResult[]>([]);
  /** 上次完成检测的时间 */
  const lastCheckedAt = ref<Date | null>(null);

  /** 恢复上次持久化的检测结果(不发起请求);没有记录的图源回退为「待检测」占位 */
  const initResults = (): void => {
    if (results.value.length || checking.value) {
      return;
    }
    const saved = loadJsonStorage<StoredHealthResults>(RESULTS_STORAGE_KEY);
    const savedById = new Map((saved.results ?? []).filter((row) => row.id).map((row) => [row.id, row]));
    results.value = sortResultsByStatus(
      imageSources.map((source) => {
        const base: HealthCheckResult = {
          id: source.id,
          label: source.label,
          host: source.host,
          enabled: source.enabled !== false,
          note: source.note,
          status: HealthStatus.IDLE,
          durationMs: 0,
          count: 0,
        };
        const old = savedById.get(source.id);
        return old
          ? {
              ...base,
              status: old.status ?? HealthStatus.IDLE,
              durationMs: old.durationMs ?? 0,
              count: old.count ?? 0,
              error: old.error,
            }
          : base;
      }),
    );
    if (saved.savedAt) {
      lastCheckedAt.value = new Date(saved.savedAt);
    }
  };

  /** 并发检测全部图源(含已下架的) */
  const checkAll = async (): Promise<void> => {
    if (checking.value) {
      return;
    }
    checking.value = true;
    // 每个图源出结果就整体替换一次数组,确保表格等依赖方一定重新渲染
    // (数组下标的就地修改在部分组件内部不会触发重绘)
    const apply = (): void => {
      results.value = [...run.results];
    };
    const run = checkAllSources(imageSources, () => apply());
    apply();
    await run.settled;
    // 检测完成:按状态重排并存储,下次重新检测前这份结果保持不变
    results.value = sortResultsByStatus(run.results);
    saveJsonStorage(RESULTS_STORAGE_KEY, {
      savedAt: new Date().toISOString(),
      results: results.value,
    });
    lastCheckedAt.value = new Date();
    checking.value = false;
  };

  return { checking, results, lastCheckedAt, initResults, checkAll };
}
