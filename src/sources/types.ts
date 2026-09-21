/**
 * 图源统一契约(策略接口) —— 所有图源都通过 defineSource 声明自己。
 *
 * 职责边界:图源只负责「请求 + 解析」,返回图片直链列表;
 * loading 状态、超时兜底、图片下载、分页状态,全部由调度器(composables/use-emoticons)统一编排。
 */

/** 下载图片时的附加配置,透传给 preload 的 downloadImage */
export interface DownloadOptions {
  /** 自定义请求头(如站点校验 Referer/Host) */
  headers?: Record<string, string>;
  /** 指定下载目录(默认 temp) */
  downloadPath?: string;
  /** 文件后缀(默认 .gif) */
  fileSuffix?: string;
}

/** 图源拉取一页数据的入参 */
export interface SourceFetchRequest {
  /** 搜索关键字;为空表示加载热门/最新列表 */
  keyword: string;
  /** 页码,从 1 开始 */
  page: number;
  /** 每页数量 */
  pageSize: number;
  /** 中止信号,调度器在切换图源/重新加载时触发;
   *  图源应把它透传给 http 请求,让在途请求及时取消 */
  signal?: AbortSignal;
}

/** 图源拉取一页数据的返回 */
export interface SourceFetchResult {
  /** 图片直链列表 */
  links: string[];
  /** 下载图片时的附加配置(如 Referer/Host),透传给 preload 的 downloadImage */
  downloadOptions?: DownloadOptions;
  /** 是否有下一页;不返回则沿用当前值 */
  hasMore?: boolean;
  /** 是否有上一页;不返回则沿用当前值 */
  hasLess?: boolean;
}

/** 图源描述符 */
export interface ImageSource {
  /** 唯一标识(小写英文,用于配置存储,一旦上线不可再改) */
  id: string;
  /** 展示名称(切换器/检测报告里显示) */
  label: string;
  /** 图源官网首页 */
  host: string;
  /** 是否上架;false 表示下架,默认不出现在切换器,保留代码并参与一键检测(检测正常后用户可手动启用) */
  enabled?: boolean;
  /** 备注(关于页/检测报告展示,如 VIP 限制) */
  note?: string;
  /** 加载超时时间(毫秒),默认 15s */
  timeout?: number;
  /** 覆盖全局默认关键字(全局默认见 registry.DEFAULT_SEARCH_KEYWORD) */
  defaultKeyword?: string;
  /** 拉取一页图片直链 */
  fetchPage: (request: SourceFetchRequest) => Promise<SourceFetchResult>;
}
