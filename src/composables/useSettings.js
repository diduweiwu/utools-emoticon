import {loadJsonStorage, saveJsonStorage} from "./useStorage.js";

const SETTINGS_KEY = "settings";

/** 设置默认值 */
const DEFAULT_SETTINGS = {
    // 鼠标中键查看大图时是否必须搭配 shift(避免和平台超级面板冲突)
    middleWithShift: false,
};

/**
 * 读取设置(与默认值合并,保证新增设置项有兜底)
 */
export function loadSettings() {
    return Object.assign({...DEFAULT_SETTINGS}, loadJsonStorage(SETTINGS_KEY) ?? {});
}

/**
 * 保存设置
 * @param {Object} settings
 */
export function saveSettings(settings) {
    if (!settings) {
        return;
    }
    saveJsonStorage(SETTINGS_KEY, settings);
}
