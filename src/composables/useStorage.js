import {isPlatformReady, readStorage, writeStorage} from "../platform/index.js";

/**
 * 读取 JSON 存储
 * 平台未就绪(如模拟器注入晚于页面脚本)时返回空对象,调用方拿到默认值
 * @param {string} key
 * @returns {{}|any} 为空或解析失败时返回空对象
 */
export function loadJsonStorage(key) {
    if (!isPlatformReady()) {
        return {};
    }
    const raw = readStorage(key);
    if (raw && typeof raw === "string") {
        try {
            return JSON.parse(raw);
        } catch (e) {
            console.error(`存储[${key}]解析失败:`, e);
            return {};
        }
    }
    return {};
}

/**
 * 写入 JSON 存储
 * @param {string} key
 * @param {*} value
 */
export function saveJsonStorage(key, value) {
    writeStorage(key, JSON.stringify(value));
}
