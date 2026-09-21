import type { ImageSource } from "./types";

import aidoutu from "./aidoutu";
import baidu from "./baidu";
import dogetu from "./dogetu";
import doutula from "./doutula";
import sogou from "./sogou";
import biaoqing2333 from "./offline/biaoqing2333";
import dbbqb from "./offline/dbbqb";
import doutu from "./offline/doutu";
import doutuba from "./offline/doutuba";
import doutuwang from "./offline/doutuwang";
import fabiaoqing from "./offline/fabiaoqing";
import pkdoutu from "./offline/pkdoutu";
import qudoutu from "./offline/qudoutu";

/**
 * 图源注册表 —— 整个插件的开闭原则枢纽。
 *
 * 新增一个图源只需要两步,任何调度/切换/检测逻辑都不用改:
 * 1. 在 sources/ 下新建 <id>.ts,`export default defineSource({...})`;
 * 2. 在下方数组中注册一行(位置决定切换器里的展示顺序)。
 *
 * 已下架的图源保留在 offline/ 目录,enabled=false:
 * 默认不出现在切换器,但参与一键检测;检测正常(站点复活)后用户可在图源页手动开启。
 */
export const imageSources: ImageSource[] = [
  // ===== 已上架 =====
  sogou,
  doutula,
  aidoutu,
  baidu,
  dogetu,
  // ===== 已下架/未上架(仅参与检测) =====
  fabiaoqing,
  doutuba,
  doutuwang,
  doutu,
  qudoutu,
  dbbqb,
  pkdoutu,
  biaoqing2333,
];

/** 按唯一标识查找图源 */
export const getSourceById = (id: string): ImageSource | undefined =>
  imageSources.find((source) => source.id === id);

/** 按展示名查找图源(兼容老版本按中文 label 存储的配置) */
export const getSourceByLabel = (label: string): ImageSource | undefined =>
  imageSources.find((source) => source.label === label);

/** 默认图源(发表情下架后切换为搜狗) */
export const DEFAULT_SOURCE_ID = "sogou";

/** 全局默认搜索关键字:搜索框为空时,所有图源统一用它兜底 */
export const DEFAULT_SEARCH_KEYWORD = "表情";
