<template>
  <n-space justify="start" align="center" :size="[3,10]">
    <n-tag v-for="source in effectiveSources" :key="source.id" round checkable size="medium"
           :checked="isActive(source)"
           @click="() => handleSwitch(source)"
           @click.middle="() => openLink(source.host)">
      {{ source.label }}
    </n-tag>
  </n-space>
</template>

<script>
import {ref, watch} from "vue";
import {useMessage} from "naive-ui";
import {effectiveSources, fetchConfig, switchSource} from "../composables/useConfig.js";
import {openLink, whenPlatformReady} from "../platform/index.js";

/** 当前图源已不可用时,自动切到第一个生效图源 */
const ensureActiveSourceAvailable = (config, isActive, handleSwitch) => {
  config.value = fetchConfig();
  const list = effectiveSources.value;
  if (!list.some(isActive) && list.length) {
    handleSwitch(list[0]);
  }
};

export default {
  name: "ImageSourceSwitcher",
  props: {
    reload: {type: Function},
    loading: {type: Boolean, default: false}
  },
  setup(props) {
    const {reload} = props;
    const message = useMessage();
    const config = ref(fetchConfig());

    const isActive = (source) => config.value.sourceId === source.id;

    /** 切换图源并重新加载 */
    const handleSwitch = (source) => {
      // 图源没变,不做任何处理
      if (isActive(source)) {
        return;
      }
      switchSource(source.id);
      config.value = fetchConfig();
      message.success(`切换到图源-${source.label}`);
      reload();
    };

    // 平台 API 就绪后重新读取配置(模拟器/开发模式下注入较晚,首屏可能拿到的是默认值),
    // 并兜底处理:当前图源已被下架/关闭时,自动切到第一个生效图源
    whenPlatformReady(() => ensureActiveSourceAvailable(config, isActive, handleSwitch));

    // 「更多-图源」页的开关实时生效:当前图源被关闭则自动切换
    watch(effectiveSources, () => ensureActiveSourceAvailable(config, isActive, handleSwitch));

    return {
      effectiveSources,
      isActive,
      handleSwitch,
      openLink,
    };
  }
}
</script>

<style scoped>

</style>
