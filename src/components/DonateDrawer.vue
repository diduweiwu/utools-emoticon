<template>
  <n-button title="觉得好用请请作者喝杯咖啡~" @click="showModal" text type="default" size="medium" :focusable="false">
    💰 赞助
  </n-button>
  <n-drawer v-model:show="isShow" style="height: 80%" placement="bottom" :auto-focus="false">
    <n-drawer-content closable title="觉得好用,请作者喝杯咖啡~">
      <n-space justify="center" size="large">
        <img class="donate-img" :src="wechatImg" alt="微信">
        <img class="donate-img" :src="alipayImg" alt="支付宝">
      </n-space>
    </n-drawer-content>
  </n-drawer>
</template>

<script>
import {ref} from "vue";
import wechatImg from "../assets/wechat.jpg";
import alipayImg from "../assets/alipay.jpg";

/**
 * 赞助入口:展示作者收款码
 */
export default {
  name: "DonateDrawer",
  setup() {
    const isShow = ref(false)

    return {
      isShow,
      wechatImg,
      alipayImg,
      showModal: () => isShow.value = true,
    }
  }
}
</script>

<style scoped>
.donate-img {
  width: 200px;
  height: 300px;
  object-fit: contain;
  border-radius: 8px;
}
</style>
