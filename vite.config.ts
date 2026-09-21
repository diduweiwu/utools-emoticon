import { fileURLToPath, URL } from "node:url";

import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { NaiveUiResolver } from "unplugin-vue-components/resolvers";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // vue API 自动按需导入(ref/computed/watch 等),类型声明生成到 src/types/auto-imports.d.ts
    AutoImport({
      imports: ["vue"],
      dts: "src/types/auto-imports.d.ts",
    }),
    // 模板里直接使用 naive-ui 组件,按需自动注册并生成 src/types/components.d.ts
    Components({
      resolvers: [NaiveUiResolver()],
      dts: "src/types/components.d.ts",
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  // uTools/ztools 以 file:// 协议加载打包产物,必须使用相对路径
  base: "./",
});
