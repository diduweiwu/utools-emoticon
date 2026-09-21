import { loadJsonStorage, saveJsonStorage } from "./use-storage";

/** 插件设置项 */
export interface AppSettings {
  /** 鼠标中键查看大图时是否必须搭配 shift(避免和平台超级面板冲突) */
  middleWithShift: boolean;
}

const SETTINGS_KEY = "settings";

/** 设置默认值 */
const DEFAULT_SETTINGS: AppSettings = {
  middleWithShift: false,
};

/**
 * 读取设置(与默认值合并,保证新增设置项有兜底)
 */
export function loadSettings(): AppSettings {
  return Object.assign({ ...DEFAULT_SETTINGS }, loadJsonStorage<Partial<AppSettings>>(SETTINGS_KEY) ?? {});
}

/**
 * 保存设置
 */
export function saveSettings(settings: AppSettings): void {
  saveJsonStorage(SETTINGS_KEY, settings);
}
