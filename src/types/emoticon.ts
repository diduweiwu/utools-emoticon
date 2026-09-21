/**
 * 表情包条目。
 * imgSrc 为图源解析出的远程直链,作为业务主键使用(收藏/缓存/去重);
 * fileSrc 为 preload 下载后的本地缓存路径(file:// 协议),用于渲染展示。
 */
export interface Emoticon {
  imgSrc: string;
  fileSrc: string;
}
