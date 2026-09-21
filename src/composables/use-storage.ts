import { isPlatformReady, readStorage, writeStorage } from "@/platform";

/**
 * 读取 JSON 存储。
 * 平台未就绪(如模拟器注入晚于页面脚本)时返回空对象,调用方拿到默认值
 */
export function loadJsonStorage<T = Record<string, unknown>>(key: string): T {
  if (!isPlatformReady()) {
    return {} as T;
  }
  const raw = readStorage(key);
  if (raw && typeof raw === "string") {
    try {
      return JSON.parse(raw) as T;
    } catch (error) {
      console.error(`存储[${key}]解析失败:`, error);
      return {} as T;
    }
  }
  return {} as T;
}

/** 写入 JSON 存储 */
export function saveJsonStorage(key: string, value: unknown): void {
  writeStorage(key, JSON.stringify(value));
}
