<script>
import useApp from "./js/useApp.js";
import ImageSourceSwitcher from "./components/ImageSourceSwitcher.vue";
import ImageList from "./components/ImageList.vue";
import ImageStarList from "./components/ImageStarList.vue";
import {darkTheme, useOsTheme} from "naive-ui";
import {computed} from "vue";


export default {
  components: {ImageStarList, ImageList, ImageSourceSwitcher},
  setup() {

    const osThemeRef = useOsTheme();

    return {
      ...useApp(),
      ImageList,
      theme: computed(() => osThemeRef.value === "dark" ? darkTheme : null),
    }
  }
}
</script>

<template>
  <n-config-provider :theme="theme">
    <n-message-provider placement="top" container-style="margin-top:50px" :duration="1500" closable>
      <n-layout position="absolute">
        <n-layout-header style="height: 50px;" bordered>
          <n-space justify="space-between" align="center" style="height: 50px;padding:0 10px">
            <n-space>
              <n-button :focusable="false" :disabled="pagination.pageNum==1" type="default" size="large"
                        @click="previousPage">上一页
              </n-button>
              <n-button :focusable="false" :disabled="!(emoticons&&emoticons.length)" type="default" size="large"
                        @click="nextPage">下一页
              </n-button>
            </n-space>
            <n-space>
              <ImageSourceSwitcher :reload="reload"/>
              <ImageStarList ref="imageStarList"/>
            </n-space>
          </n-space>
        </n-layout-header>
        <n-layout has-sider position="absolute" style="top: 60px">
          <n-layout content-style="padding: 5px 10px;" :native-scrollbar="false">
            <n-spin :show="loading" style="min-height: 300px" description="努力加载中~">
              <ImageList :loading="loading" :emoticons="emoticons"/>
              <n-back-top :right="40"/>
            </n-spin>
          </n-layout>
        </n-layout>
      </n-layout>
    </n-message-provider>
  </n-config-provider>

</template>

<style scoped>

.header {
  position: absolute;
  top: 0;
  width: 100%;
  background-color: rgba(36, 36, 36, 0.9);
}
</style>

<style>
.pointer {
  cursor: pointer;
}
</style>
