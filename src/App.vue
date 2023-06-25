<script>
import useApp from "./js/useApp.js";
import ImageSourceSwitcher from "./components/ImageSourceSwitcher.vue";
import ImageList from "./components/ImageList.vue";
import ImageStarList from "./components/ImageStarList.vue";
import {darkTheme, useOsTheme} from "naive-ui";
import {computed, ref} from "vue";
import About from "./components/about/About.vue";

export default {
  components: {About, ImageStarList, ImageList, ImageSourceSwitcher},
  setup() {
    const osThemeRef = useOsTheme();
    const imageStarList = ref()
    return {
      imageStarList,
      ...useApp(() => imageStarList.value?.close()),
      ImageList,
      theme: computed(() => osThemeRef.value === "dark" ? darkTheme : null),
    }
  }
}
</script>

<template>
  <n-config-provider :theme="theme">
    <n-message-provider placement="top" container-style="margin-top:40px" :duration="1500">
      <n-layout position="absolute">
        <n-layout-header style="height: 45px;" bordered>
          <n-space justify="space-between" align="center" style="height:100%;padding:0 10px">
            <n-space align="center">
              <ImageSourceSwitcher :reload="reload" :loading="loading"/>
              <ImageStarList ref="imageStarList"/>
              <n-button @click.stop="()=>$refs.about.show()" :focusable="false" text>
                <img src="/src/assets/info.png" style="width: 18px" alt="关于"/>
              </n-button>
            </n-space>
            <n-space align="center">
              <n-button :focusable="false" size="small" :disabled="loading||!pagination.hasLess.value" type="default"
                        @click="previousPage">上一页
              </n-button>
              <span>第{{ pagination.pageNum.value }}页</span>
              <n-button :focusable="false" size="small" :disabled="loading||!pagination.hasMore.value"
                        type="default"
                        @click="nextPage">下一页
              </n-button>
            </n-space>
          </n-space>
        </n-layout-header>
        <n-layout has-sider position="absolute" style="top: 50px">
          <n-layout content-style="padding: 5px 10px;" :native-scrollbar="false">
            <n-spin :show="loading" style="min-height: 300px" description="努力加载中~">
              <ImageList :loading="loading" :emoticons="emoticons"/>
              <n-back-top :right="40"/>
            </n-spin>
            <About ref="about"/>
          </n-layout>
        </n-layout>
      </n-layout>
    </n-message-provider>
  </n-config-provider>
</template>
