import axios from "axios";

/**
 * 图源请求默认超时时间(毫秒)。
 * 个别响应较慢的图源,在图源描述符里用 timeout 字段放宽即可,
 * 调度器和检测模块都会读取该字段。
 */
export const DEFAULT_SOURCE_TIMEOUT = 15000;

/**
 * 统一的 axios 实例。
 * 插件渲染进程关闭了跨域限制,可以直接请求各图源站点;
 * 统一收口便于以后加拦截器(如统一 UA、代理、日志)。
 */
export const http = axios.create({
    timeout: DEFAULT_SOURCE_TIMEOUT,
});

/**
 * 发起 GET 请求,直接返回响应体。
 * @param {string} url 请求地址
 * @param {Object} [params] 查询参数
 * @param {Object} [config] 其余 axios 配置(headers / timeout / signal 等;
 *                          图源把调度器下发的 AbortSignal 透传进来即可支持请求取消)
 * @returns {Promise<any>} JSON 接口返回对象,HTML 页面返回字符串
 */
export function get(url, params = {}, config = {}) {
    return http.get(url, {...config, params}).then(response => response.data);
}
