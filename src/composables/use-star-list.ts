import { computed, ref } from "vue";
import { useMessage } from "naive-ui";

import type { Emoticon } from "@/types/emoticon";

import { composeCollectedFilePath, removeFile, whenPlatformReady } from "@/platform";

import { downloadCollectedImages } from "./use-download";
import { loadJsonStorage, saveJsonStorage } from "./use-storage";

const STAR_LIST_KEY = "imageStarList";

/**
 * 官方限制:单个存储文档内容不超过 1M。
 * 收藏映射是单个 key 全量序列化存储,收藏前先按字节数预估,超限则拒绝并提示。
 */
const MAX_STAR_LIST_BYTES = 1024 * 1024;

const textEncoder = new TextEncoder();

/** UTF-8 字节数(与平台入库后的真实体积对齐,比字符串长度更保守) */
const byteLength = (str: string): number => textEncoder.encode(str).length;

/** 收藏映射:图片直链 → 1(值仅占位,展示路径按链接实时计算) */
type StarMap = Record<string, number>;

/** 读取收藏映射,历史脏数据(数组等)一律按空处理 */
function loadStarMap(): StarMap {
  const stored = loadJsonStorage<StarMap>(STAR_LIST_KEY);
  return stored && !Array.isArray(stored) ? stored : {};
}

// 模块级单例:收藏夹抽屉与表情包列表共享同一份收藏状态。
// 不能在模块加载期直接读存储 —— 平台 API(模拟器下尤其)注入晚于页面脚本,
// 统一等平台就绪后再加载
const starMap = ref<StarMap>({});
whenPlatformReady(() => {
  starMap.value = loadStarMap();
});

/** 收藏列表(最新收藏排在前面) */
const starEmojiList = computed<Emoticon[]>(() =>
  Object.keys(starMap.value)
    .map((imgSrc) => ({
      imgSrc,
      fileSrc: `file://${composeCollectedFilePath(imgSrc)}`,
    }))
    .reverse(),
);

/**
 * 收藏夹
 */
export default function useStarList() {
  const { success, warning } = useMessage();

  /** 是否已收藏 */
  const checkIfCollected = (imgSrc: string): boolean => !!starMap.value[imgSrc];

  /** 切换收藏状态(已收藏则删除本地文件并移除记录) */
  const switchCollectedStatus = (imgObj: Emoticon): void => {
    const { imgSrc } = imgObj;
    if (checkIfCollected(imgSrc)) {
      removeFile(composeCollectedFilePath(imgSrc));
      delete starMap.value[imgSrc];
      success("已取消收藏");
    } else {
      // 收藏映射是单个存储文档全量序列化,先预估加入后的体积,
      // 超过官方 1M 上限就拒绝收藏,避免写库失败
      const projectedJson = JSON.stringify({ ...starMap.value, [imgSrc]: 1 });
      if (byteLength(projectedJson) > MAX_STAR_LIST_BYTES) {
        warning("收藏空间已满(达到平台 1M 存储上限),无法继续收藏,请先清理部分收藏~");
        return;
      }
      // 值仅占位(展示路径是按链接实时计算的),精简存储体积
      starMap.value[imgSrc] = 1;
      downloadCollectedImages([imgSrc]);
      success("已加入收藏");
    }
    saveJsonStorage(STAR_LIST_KEY, starMap.value);
  };

  return {
    checkIfCollected,
    switchCollectedStatus,
    starEmojiList,
    downloadCollectedImages,
  };
}
