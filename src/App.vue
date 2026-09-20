<script>
import {darkTheme, useOsTheme} from "naive-ui";
import {computed} from "vue";
import Home from "./components/Home.vue";

/**
 * 应用外壳:只负责主题与全局消息容器。
 * naive-ui 的 useMessage 只能在 <n-message-provider> 的【后代】组件的 setup 里调用,
 * 所以页面内容拆分到 Home.vue,避免在 provider 之上使用消息 API。
 */
export default {
  components: {Home},
  setup() {
    const osThemeRef = useOsTheme();

    /**
     * js 文件下使用这个做类型提示
     * @type import('naive-ui').GlobalThemeOverrides
     */
    const themeOverrides = {}

    return {
      theme: computed(() => osThemeRef.value === "dark" ? darkTheme : null),
      themeOverrides,
    }
  }
}
</script>

<template>
  <n-config-provider :theme="theme" :theme-overrides="themeOverrides">
    <n-message-provider placement="top" container-style="margin-top:40px" :duration="1500">
      <Home/>
    </n-message-provider>
  </n-config-provider>
</template>
