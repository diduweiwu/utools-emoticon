<script setup lang="ts">
import { computed } from "vue";
import { darkTheme, useOsTheme } from "naive-ui";

import HomeView from "@/views/HomeView.vue";

/**
 * 应用外壳:只负责主题与全局消息容器。
 * naive-ui 的 useMessage 只能在 <n-message-provider> 的【后代】组件的 setup 里调用,
 * 所以页面内容拆分到 HomeView.vue,避免在 provider 之上使用消息 API。
 */
const osTheme = useOsTheme();

/** 跟随系统明暗主题 */
const theme = computed(() => (osTheme.value === "dark" ? darkTheme : null));
</script>

<template>
  <n-config-provider :theme="theme">
    <n-message-provider placement="top" container-style="margin-top: 40px" :duration="1500">
      <HomeView />
    </n-message-provider>
  </n-config-provider>
</template>
