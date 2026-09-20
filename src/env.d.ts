/// <reference types="vite/client" />
/// <reference types="@ztools-center/ztools-api-types" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, never>, Record<string, never>, unknown>
  export default component
}

// preload 注入的文件能力(实现见 public/preload/services.js)
declare global {
  interface Window {
    checkOrCreateDirectory: (path: string) => string
    checkOrCreateCollectedDirectory: () => string
    tryCopy: (destFile: string) => boolean
    copyImage: (image: { imgSrc: string, fileSrc: string }, callback?: () => void) => void
    removeFile: (filePath: string) => void
    composeFilePath: (url: string, config?: Record<string, string>) => string
    composeCollectedFilePath: (url: string) => string
    downloadImage: (url: string, config?: Record<string, any>) => Promise<{ imgSrc: string, fileSrc: string } | null>
    openLink: (link: string) => void
  }
}

export {}
