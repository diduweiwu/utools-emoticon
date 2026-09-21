import type { ImageSource } from "./types";

/**
 * 定义一个图源。当前只是原样返回,价值在于:
 * 1. 给所有图源一个统一的标准写法,新增图源时照抄一个文件即可;
 * 2. 提供完整的类型约束,写错字段名/漏实现方法编辑器能直接发现。
 *
 * 搜索关键字:调度器会在搜索框为空时统一回填全局默认关键字(registry.DEFAULT_SEARCH_KEYWORD),
 * 图源无需自行处理空关键字,除非要覆盖全局默认(defaultKeyword)。
 */
export function defineSource(source: ImageSource): ImageSource {
  return source;
}
