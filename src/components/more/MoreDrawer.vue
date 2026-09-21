<script setup lang="ts">
import { ref } from "vue";

import AboutPanel from "./AboutPanel.vue";
import SettingsPanel from "./SettingsPanel.vue";
import SourceHealthCheck from "@/components/source/SourceHealthCheck.vue";

// 「更多」聚合入口:设置 / 图源 / 关于,左侧垂直 Tab
const isShow = ref(false);

const showModal = (): void => {
  isShow.value = true;
};
</script>

<template>
  <n-button
    title="图源 / 设置 / 关于"
    text
    type="default"
    size="medium"
    :focusable="false"
    @click="showModal"
  >
    更多
  </n-button>
  <n-drawer v-model:show="isShow" style="height: 80%" placement="bottom" :auto-focus="false">
    <!-- body 不滚动,由右侧内容区自行滚动,保证左侧 Tab 固定 -->
    <n-drawer-content title="更多" closable body-content-style="padding: 0 15px 15px; overflow: hidden">
      <n-tabs type="line" placement="left" default-value="settings" class="more-tabs">
        <!-- display-directive=show:切走 Tab 不卸载面板,保留检测结果等状态 -->
        <n-tab-pane name="settings" tab="设置" display-directive="show">
          <n-layout class="pane-scroll" :native-scrollbar="false">
            <SettingsPanel />
          </n-layout>
        </n-tab-pane>
        <n-tab-pane name="health-check" tab="图源" display-directive="show">
          <n-layout class="pane-scroll" :native-scrollbar="false">
            <SourceHealthCheck />
          </n-layout>
        </n-tab-pane>
        <n-tab-pane name="about" tab="关于" display-directive="show">
          <n-layout class="pane-scroll" :native-scrollbar="false">
            <AboutPanel />
          </n-layout>
        </n-tab-pane>
      </n-tabs>
    </n-drawer-content>
  </n-drawer>
</template>

<style scoped>
/* Tab 容器撑满抽屉,滚动交给每个 Tab 内容区的 n-layout 原生滚动容器 */
.more-tabs {
  height: 100%;
}

/* 左侧 Tab 加宽(padding + 最小宽度),避免过于局促 */
.more-tabs :deep(.n-tabs-tab) {
  padding: 12px 20px;
  min-width: 96px;
  justify-content: center;
}

/* 右侧内容与顶部留出间隔 */
.more-tabs :deep(.n-tab-pane) {
  padding-top: 14px;
}

/* 关键:让内容链条(n-tabs-content → pane → layout → panel)允许收缩,
   否则宽表格/长文字会把面板撑出抽屉右侧,内容被裁剪 */
.more-tabs :deep(.n-tabs-content),
.more-tabs :deep(.n-tabs-pane-wrapper),
.more-tabs :deep(.n-tab-pane),
.more-tabs :deep(.pane-scroll),
.more-tabs :deep(.n-layout-content),
.more-tabs :deep(.n-layout-scroll-container) {
  min-width: 0;
  overflow-x: hidden;
}

.pane-scroll {
  height: 100%;
}
</style>
