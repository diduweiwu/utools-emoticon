import skipFormatting from "@vue/eslint-config-prettier/skip-formatting";
import { defineConfigWithVueTs, vueTsConfigs } from "@vue/eslint-config-typescript";
import pluginVue from "eslint-plugin-vue";

export default defineConfigWithVueTs(
  {
    files: ["**/*.{js,mjs,ts,vue}"],
  },
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "public/**",
      "src/types/auto-imports.d.ts",
      "src/types/components.d.ts",
    ],
  },

  pluginVue.configs["flat/recommended"],
  vueTsConfigs.recommended,
  // 格式交给 Prettier,关闭与它冲突的规则
  skipFormatting,

  {
    rules: {
      // 允许单个单词的组件名(如 HomeView.vue 之外的 About/Settings 面板)
      "vue/multi-word-component-names": "off",
    },
  },
);
