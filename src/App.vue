<script>
import useApp from "./js/useApp.js";
import ImageSourceSwitcher from "./components/ImageSourceSwitcher.vue";
import ImageList from "./components/ImageList.vue";
import ImageStarList from "./components/ImageStarList.vue";

export default {
  components: {ImageStarList, ImageList, ImageSourceSwitcher},
  setup() {
    return {
      ...useApp(),
      ImageList,
    }
  }
}
</script>

<template>
  <n-notification-provider>
    <n-spin :show="loading">
      <ImageList :loading="loading" :emoticons="emoticons"/>

      <n-space align="center" vertical style="position:fixed;bottom: 70px;left: 0;z-index: 1024">
<!--        <ImageSourceSwitcher :reload="reload"/>-->
        <ImageStarList ref="imageStarList"/>
      </n-space>
      <n-space justify="center" class="footer">
        <n-button :disabled="pagination.pageNum==1" type="primary" size="small" @click="previousPage">上一页
        </n-button>
        <n-button :disabled="!(emoticons&&emoticons.length)" type="primary" size="small" @click="nextPage">下一页
        </n-button>

      </n-space>
    </n-spin>
  </n-notification-provider>
</template>

<style scoped>

.footer {
  position: fixed;
  bottom: 0;
  padding: 10px 10px;
  left: 0;
  width: 100%;
  background-color: rgba(36, 36, 36, 0.9);
}
</style>
