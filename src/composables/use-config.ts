import { computed, ref } from "vue";

import { whenPlatformReady } from "@/platform";
import type { ImageSource } from "@/sources/types";
import { DEFAULT_SOURCE_ID, getSourceById, getSourceByLabel, imageSources } from "@/sources/registry";

import { loadJsonStorage, saveJsonStorage } from "./use-storage";

const CONFIG_KEY = "config";

// ==================== 图源开关 ====================

const SOURCE_SETTINGS_KEY = "sourceSettings";

/** 用户对图源的开关配置: id → false 表示手动关闭,缺省为开启 */
export type SourceSettings = Record<string, boolean>;

/** 插件配置 */
export interface PluginConfig {
  /** 当前图源 id */
  sourceId?: string;
  /** 兼容老版本:以中文展示名记录的图源(imageSource: "搜狗") */
  imageSource?: string;
}

// 图源开关(模块级单例,设置页与切换器共享同一份状态,改动实时互通)
const sourceSettings = ref<SourceSettings>(loadJsonStorage<SourceSettings>(SOURCE_SETTINGS_KEY));
whenPlatformReady(() => {
  sourceSettings.value = loadJsonStorage<SourceSettings>(SOURCE_SETTINGS_KEY);
});

/** 用户对图源的开关配置 */
export function fetchSourceSettings(): SourceSettings {
  return sourceSettings.value;
}

/**
 * 保存图源开关(写入存储并同步到所有订阅方)
 */
export function saveSourceSettings(map: SourceSettings): void {
  sourceSettings.value = { ...map };
  saveJsonStorage(SOURCE_SETTINGS_KEY, map);
}

/**
 * 单个图源是否生效。
 * 已上架图源默认开启(用户可手动关闭);已下架图源默认关闭,检测正常(站点复活)后用户可手动开启。
 * 入参用最小结构:注册表里的图源和检测报告里的行都满足该形状。
 */
export function isSourceEffective(
  source: Pick<ImageSource, "id" | "enabled">,
  settings: SourceSettings = sourceSettings.value,
): boolean {
  const flag = settings[source.id];
  return source.enabled !== false ? flag !== false : flag === true;
}

/**
 * 生效图源 = 未被用户关闭的已上架图源 + 被用户手动开启的已下架图源
 */
export const effectiveSources = computed<ImageSource[]>(() =>
  imageSources.filter((source) => isSourceEffective(source)),
);

// ==================== 插件配置 ====================

/**
 * 读取插件配置。
 * 兼容处理:老版本用中文展示名记录图源(imageSource: "搜狗"),
 * 统一在读取时迁移为 sourceId,老用户无需任何手动处理。
 */
export function fetchConfig(): PluginConfig & { sourceId: string } {
  const config = { ...loadJsonStorage<PluginConfig>(CONFIG_KEY) };
  if (!config.sourceId) {
    config.sourceId = getSourceByLabel(config.imageSource ?? "")?.id ?? DEFAULT_SOURCE_ID;
  }
  return config as PluginConfig & { sourceId: string };
}

/**
 * 更新插件配置
 */
export function updateConfig(config: PluginConfig): void {
  saveJsonStorage(CONFIG_KEY, config);
}

/** 当前生效的图源描述符 */
export function fetchActiveSource(): ImageSource {
  const { sourceId } = fetchConfig();
  return getSourceById(sourceId) ?? getSourceById(DEFAULT_SOURCE_ID)!;
}

/**
 * 切换图源
 */
export function switchSource(sourceId: string): void {
  updateConfig({ ...fetchConfig(), sourceId });
}
