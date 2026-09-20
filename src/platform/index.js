/**
 * 平台桥接层 —— 项目中所有平台 API 与 preload 注入能力的【唯一】出口。
 *
 * 设计目的:
 * 1. 平台 API 以裸全局变量的形式散落在业务代码里,出问题时无从排查;
 *    统一收口后,所有平台触碰点一目了然。
 * 2. 同一套代码同时适配 uTools 与 ztools:两个平台的 API 命名与语义基本一致,
 *    仅全局对象名不同(utools / ztools),这里统一识别;
 *    未来若个别 API 出现差异,在对应封装内按平台分流即可。
 */

/**
 * 获取平台 API 对象。
 * 用 globalThis 取而不是直接引用裸全局,避免在「平台注入晚于页面脚本」的
 * 环境(如开发模拟器)下抛 ReferenceError。
 */
const getApi = () => globalThis.ztools ?? globalThis.utools;

/**
 * 当前运行的平台标识,便于个别有差异的 API 按平台分流
 * @returns {"ztools"|"utools"|null}
 */
export const getPlatformName = () => {
    if (globalThis.ztools) return "ztools";
    if (globalThis.utools) return "utools";
    return null;
};

/**
 * 平台 API 是否已就绪。
 * 真实环境中 preload 同步注入,页面脚本执行前就已就绪;
 * 开发模拟器中注入时机会晚于页面脚本,模块加载期/组件 setup 期不可直接访问。
 */
export const isPlatformReady = () => !!getApi();

/**
 * 平台就绪后执行回调:已就绪则立即同步执行,未就绪则轮询等待。
 * 所有的初始化(读配置、注册生命周期、首屏加载)都应该经由这里触发,
 * 保证真实环境行为不变,模拟器环境不崩溃。
 *
 * @param {() => void} callback
 */
export function whenPlatformReady(callback) {
    if (isPlatformReady()) {
        callback();
        return;
    }
    const timer = setInterval(() => {
        if (isPlatformReady()) {
            clearInterval(timer);
            callback();
        }
    }, 50);
}

// ==================== 存储 ====================

/** 读取原始存储值(dbStorage 存的是 JSON 字符串) */
export const readStorage = (key) => getApi().dbStorage.getItem(key);

/** 写入原始存储值 */
export const writeStorage = (key, value) => getApi().dbStorage.setItem(key, value);

// ==================== 路径 ====================

/** 平台标准目录,如 temp / userData / downloads */
export const getPath = (key) => getApi().getPath(key);

/** 用户数据目录 */
export const userDataDirectory = () => getPath("userData");

/** 收藏目录(preload 会在不存在时自动创建) */
export const collectedDirectory = () => window.checkOrCreateCollectedDirectory();

/** 确保目录存在,不存在则创建,返回目录路径 */
export const checkOrCreateDirectory = (path) => window.checkOrCreateDirectory(path);

/** 根据图片链接计算本地缓存文件路径 */
export const composeFilePath = (url) => window.composeFilePath(url);

/** 根据图片链接计算收藏目录内的本地文件路径 */
export const composeCollectedFilePath = (url) => window.composeCollectedFilePath(url);

// ==================== 插件生命周期/输入 ====================

/** 注册插件主输入框(副输入框)变化回调 */
export const setSubInput = (onChange, placeholder) => getApi().setSubInput(onChange, placeholder);

/** 设置副输入框内容 */
export const setSubInputValue = (value) => getApi().setSubInputValue(value);

/** 注册插件进入回调 */
export const onPluginEnter = (callback) => getApi().onPluginEnter(callback);

/** 注册插件就绪回调(仅部分平台提供,不支持时静默跳过) */
export const onPluginReady = (callback) => getApi().onPluginReady?.(callback);

/** 注册插件退出/隐藏回调 */
export const onPluginOut = (callback) => getApi().onPluginOut(callback);

/** 隐藏主窗口并把文件粘贴到当前光标所在输入框 */
export const pasteFile = (filePath) => getApi().hideMainWindowPasteFile(filePath);

// ==================== 系统能力 ====================

/** 使用系统默认浏览器打开超链接 */
export const openLink = (link) => window.openLink(link);

/** 使用系统默认程序打开本地路径 */
export const openPath = (path) => getApi().shellOpenPath(path);

// ==================== preload 注入的文件能力 ====================

/** 下载远程图片到本地临时目录,返回 {imgSrc, fileSrc} */
export const downloadImage = (url, options) => window.downloadImage(url, options);

/** 复制本地图片文件到剪贴板 */
export const copyImage = (image, callback) => window.copyImage(image, callback);

/** 移除本地文件(存在才移除) */
export const removeFile = (filePath) => window.removeFile(filePath);
