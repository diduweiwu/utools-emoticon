<script setup lang="ts">
import { ref } from "vue";

import alipayImg from "@/assets/alipay.jpg";
import wechatImg from "@/assets/wechat.jpg";

// 赞助入口:展示作者收款码
const isShow = ref(false);

const showModal = (): void => {
  isShow.value = true;
};
</script>

<template>
  <n-button
    title="觉得好用请请作者喝杯咖啡~"
    text
    type="default"
    size="medium"
    :focusable="false"
    @click="showModal"
  >
    💰 赞助
  </n-button>
  <n-drawer v-model:show="isShow" style="height: 80%" placement="bottom" :auto-focus="false">
    <n-drawer-content closable title="觉得好用,请作者喝杯咖啡~">
      <n-space justify="center" size="large">
        <img class="donate-img" :src="wechatImg" alt="微信" />
        <img class="donate-img" :src="alipayImg" alt="支付宝" />
      </n-space>
    </n-drawer-content>
  </n-drawer>
</template>

<style scoped>
.donate-img {
  width: 200px;
  height: 300px;
  object-fit: contain;
  border-radius: 8px;
}
</style>
