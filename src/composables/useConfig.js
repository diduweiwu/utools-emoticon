import {computed, ref} from "vue";
import {loadJsonStorage, saveJsonStorage} from "./useStorage.js";
import {DEFAULT_SOURCE_ID, getSourceById, getSourceByLabel, imageSources} from "../sources/registry.js";
import {whenPlatformReady} from "../platform/index.js";

const CONFIG_KEY = "config";

// ==================== 图源开关 ====================

const SOURCE_SETTINGS_KEY = "sourceSettings";

// 图源开关(模块级单例,设置页与切换器共享同一份状态,改动实时互通)
const sourceSettings = ref(loadJsonStorage(SOURCE_SETTINGS_KEY));
whenPlatformReady(() => {
    sourceSettings.value = loadJsonStorage(SOURCE_SETTINGS_KEY);
});

/**
 * 用户对图源的开关配置: id → false 表示手动关闭,缺省为开启
 */
export function fetchSourceSettings() {
    return sourceSettings.value;
}

/**
 * 保存图源开关(写入存储并同步到所有订阅方)
 * @param {Record<string, boolean>} map
 */
export function saveSourceSettings(map) {
    sourceSettings.value = {...map};
    saveJsonStorage(SOURCE_SETTINGS_KEY, map);
}

/**
 * 单个图源是否生效。
 * 已上架图源默认开启(用户可手动关闭);已下架图源默认关闭,检测正常(站点复活)后用户可手动开启。
 * @param {import("../sources/defineSource.js").ImageSource} source
 * @param {Record<string, boolean>} [settings] 缺省读当前开关配置
 * @returns {boolean}
 */
export function isSourceEffective(source, settings = sourceSettings.value) {
    const flag = settings[source.id];
    return source.enabled !== false ? flag !== false : flag === true;
}

/**
 * 生效图源 = 未被用户关闭的已上架图源 + 被用户手动开启的已下架图源
 */
export const effectiveSources = computed(() => imageSources.filter(source => isSourceEffective(source)));

// ==================== 插件配置 ====================

/**
 * 读取插件配置。
 * 兼容处理:老版本用中文展示名记录图源(imageSource: "搜狗"),
 * 统一在读取时迁移为 sourceId,老用户无需任何手动处理。
 *
 * @returns {Object & {sourceId: string}}
 */
export function fetchConfig() {
    const config = {...loadJsonStorage(CONFIG_KEY)};
    if (!config.sourceId) {
        config.sourceId = getSourceByLabel(config.imageSource)?.id ?? DEFAULT_SOURCE_ID;
    }
    return config;
}

/**
 * 更新插件配置
 * @param {Object} config
 */
export function updateConfig(config) {
    saveJsonStorage(CONFIG_KEY, config);
}

/**
 * 当前生效的图源描述符
 * @returns {import("../sources/defineSource.js").ImageSource}
 */
export function fetchActiveSource() {
    const {sourceId} = fetchConfig();
    return getSourceById(sourceId) ?? getSourceById(DEFAULT_SOURCE_ID);
}

/**
 * 切换图源
 * @param {string} sourceId
 */
export function switchSource(sourceId) {
    updateConfig({...fetchConfig(), sourceId});
}
