import type { HealthCheckResult } from "@/sources/health-check";

import { describe, expect, it } from "vitest";

import { HealthStatus } from "@/sources/health-check";
import { sortResultsByStatus } from "./use-source-health-check";

const makeResult = (id: string, status: HealthCheckResult["status"]): HealthCheckResult => ({
  id,
  label: id,
  host: "https://example.com",
  enabled: true,
  status,
  durationMs: 100,
  count: 1,
});

describe("composables/use-source-health-check sortResultsByStatus()", () => {
  it("按 正常 → 无结果 → 超时/失败 → 未完成 排序,同状态保持相对顺序", () => {
    const sorted = sortResultsByStatus([
      makeResult("idle-1", HealthStatus.IDLE),
      makeResult("fail-1", HealthStatus.FAIL),
      makeResult("ok-1", HealthStatus.OK),
      makeResult("ok-2", HealthStatus.OK),
      makeResult("empty-1", HealthStatus.EMPTY),
      makeResult("timeout-1", HealthStatus.TIMEOUT),
      makeResult("idle-2", HealthStatus.IDLE),
    ]);

    expect(sorted.map((row) => row.id)).toEqual([
      "ok-1",
      "ok-2",
      "empty-1",
      "fail-1",
      "timeout-1",
      "idle-1",
      "idle-2",
    ]);
  });

  it("不改变原数组", () => {
    const original = [makeResult("b", HealthStatus.OK), makeResult("a", HealthStatus.FAIL)];
    const copy = [...original];
    sortResultsByStatus(original);
    expect(original).toEqual(copy);
  });
});
