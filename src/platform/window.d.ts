import type { DownloadOptions } from "@/sources/types";

/**
 * preload 注入到 window 上的文件/系统能力。
 * 实现见 public/preload/services.js,渲染进程只允许通过 src/platform 封装访问。
 */
declare global {
  interface Window {
    /** 检查目录是否存在,不存在则新建,返回目录路径 */
    checkOrCreateDirectory(path: string): string;
    /** 检查收藏目录是否存在,不存在则新建,返回目录路径 */
    checkOrCreateCollectedDirectory(): string;
    /** 二次复制策略:gif 走 copyFile,其他格式先 copyImage 失败再 copyFile 兜底 */
    tryCopy(destFile: string): boolean;
    /** 复制图片到剪贴板 */
    copyImage(image: { imgSrc: string; fileSrc: string }, callback?: () => void): void;
    /** 移除本地文件(存在才移除) */
    removeFile(filePath: string): void;
    /** 根据图片链接计算本地缓存文件路径 */
    composeFilePath(url: string, config?: { downloadPath?: string; fileSuffix?: string }): string;
    /** 根据图片链接计算收藏目录内的本地文件路径 */
    composeCollectedFilePath(url: string): string;
    /** 下载远程图片到本地,完成后 resolve {imgSrc, fileSrc},无效链接或体积过小 resolve null */
    downloadImage(url: string, config?: DownloadOptions): Promise<{ imgSrc: string; fileSrc: string } | null>;
    /** 使用系统默认浏览器打开超链接 */
    openLink(link: string): void;
  }
}

export {};
