/**
 * 图源请求默认超时时间(毫秒)。
 * 个别响应较慢的图源,在图源描述符里用 timeout 字段放宽即可,
 * 调度器和检测模块都会读取该字段。
 */
export const DEFAULT_SOURCE_TIMEOUT = 15000;

/** get() 支持的请求配置:请求头、外部取消信号、超时时间。 */
export interface HttpConfig {
  headers?: Record<string, string>;
  /** 调度器下发的取消信号,透传即可支持请求取消 */
  signal?: AbortSignal;
  /** 单次请求超时(毫秒),默认取 DEFAULT_SOURCE_TIMEOUT */
  timeout?: number;
}

/**
 * 发起 GET 请求,直接返回响应体。
 * 基于原生 fetch:插件渲染进程关闭了跨域限制,可以直接请求各图源站点;
 * 非 2xx 抛错,JSON 响应(content-type 含 json)自动解析,其余返回文本。
 * @param url 请求地址
 * @param params 查询参数
 * @param config 请求配置(headers / signal / timeout)
 * @returns JSON 接口返回对象,HTML 页面返回字符串
 */
export async function get<T = unknown>(
  url: string,
  params: Record<string, unknown> = {},
  config: HttpConfig = {},
): Promise<T> {
  const { headers, signal, timeout = DEFAULT_SOURCE_TIMEOUT } = config;

  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) query.set(key, String(value));
  }
  const qs = query.toString();
  const requestUrl = qs ? `${url}${url.includes("?") ? "&" : "?"}${qs}` : url;

  // 外部 signal 与超时共用一个 controller:任一触发都中止请求
  const controller = new AbortController();
  const onExternalAbort = () => controller.abort(signal?.reason);
  if (signal?.aborted) {
    controller.abort(signal.reason);
  } else {
    signal?.addEventListener("abort", onExternalAbort, { once: true });
  }
  const timer = setTimeout(() => controller.abort(new Error(`请求超时(${timeout}ms): ${url}`)), timeout);

  try {
    const response = await fetch(requestUrl, { headers, signal: controller.signal });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${url}`);
    }
    const contentType = response.headers.get("content-type") ?? "";
    return (contentType.includes("json") ? await response.json() : await response.text()) as T;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", onExternalAbort);
  }
}
