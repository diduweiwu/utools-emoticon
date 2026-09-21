<script setup lang="ts">
import type { ImageSource } from "@/sources/types";

import { ref, watch } from "vue";
import { useMessage } from "naive-ui";

import { effectiveSources, fetchConfig, switchSource } from "@/composables/use-config";
import { openLink, whenPlatformReady } from "@/platform";

const props = defineProps<{
  /** 重新加载当前页(切换图源后由父组件触发) */
  reload: () => void;
  loading?: boolean;
}>();

const message = useMessage();
const config = ref(fetchConfig());

const isActive = (source: ImageSource): boolean => config.value.sourceId === source.id;

/** 切换图源并重新加载 */
const handleSwitch = (source: ImageSource): void => {
  // 图源没变,不做任何处理
  if (isActive(source)) {
    return;
  }
  switchSource(source.id);
  config.value = fetchConfig();
  message.success(`切换到图源-${source.label}`);
  props.reload();
};

/** 当前图源已不可用时,自动切到第一个生效图源 */
const ensureActiveSourceAvailable = (): void => {
  config.value = fetchConfig();
  const list = effectiveSources.value;
  if (!list.some(isActive) && list.length) {
    handleSwitch(list[0]!);
  }
};

// 平台 API 就绪后重新读取配置(模拟器/开发模式下注入较晚,首屏可能拿到的是默认值),
// 并兜底处理:当前图源已被下架/关闭时,自动切到第一个生效图源
whenPlatformReady(ensureActiveSourceAvailable);

// 「更多-图源」页的开关实时生效:当前图源被关闭则自动切换
watch(effectiveSources, ensureActiveSourceAvailable);
</script>

<template>
  <n-space justify="start" align="center" :size="[3, 10]">
    <n-tag
      v-for="source in effectiveSources"
      :key="source.id"
      round
      checkable
      size="medium"
      :checked="isActive(source)"
      @click="handleSwitch(source)"
      @click.middle="openLink(source.host)"
    >
      {{ source.label }}
    </n-tag>
  </n-space>
</template>
