<script setup lang="ts">
import { ref } from "vue";

import DonateDrawer from "@/components/donate/DonateDrawer.vue";
import EmoticonList from "@/components/emoticon/EmoticonList.vue";
import MoreDrawer from "@/components/more/MoreDrawer.vue";
import StarDrawer from "@/components/star/StarDrawer.vue";
import SourceSwitcher from "@/components/source/SourceSwitcher.vue";
import useEmoticons from "@/composables/use-emoticons";

/**
 * 主页面:顶栏(图源切换/收藏/更多/赞助/分页) + 表情包列表。
 * 必须渲染在 App.vue 的 <n-message-provider> 内部,才能使用消息提示。
 */
const starDrawerRef = ref<InstanceType<typeof StarDrawer>>();

const { emoticons, loading, pagination, previousPage, nextPage, reload, loadMore } = useEmoticons(() =>
  starDrawerRef.value?.close(),
);
</script>

<template>
  <n-layout position="absolute">
    <n-layout-header style="height: 45px" bordered>
      <n-space justify="space-between" align="center" size="small" style="height: 100%; padding: 0 5px">
        <SourceSwitcher :reload="reload" :loading="loading" />

        <n-space align="center" size="small">
          <StarDrawer ref="starDrawerRef" />
          <DonateDrawer />
          <MoreDrawer />
          <!-- 圆形图标分页按钮 -->
          <n-button
            title="上一页"
            circle
            size="small"
            :focusable="false"
            :disabled="loading || !pagination.hasLess.value"
            @click="previousPage"
          >
            <svg
              class="page-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </n-button>
          <n-tag round size="small" type="primary" class="page-tag">{{ pagination.pageNum.value }}</n-tag>
          <n-button
            title="下一页"
            circle
            size="small"
            :focusable="false"
            :disabled="loading || !pagination.hasMore.value"
            @click="nextPage()"
          >
            <svg
              class="page-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </n-button>
        </n-space>
      </n-space>
    </n-layout-header>
    <n-layout has-sider position="absolute" style="top: 50px">
      <n-layout content-style="padding: 5px 10px;" :native-scrollbar="false" @scroll="loadMore">
        <n-spin :show="loading" style="min-height: 300px" description="努力加载中~">
          <EmoticonList :loading="loading" :emoticons="emoticons" />
          <!-- 内容高度不足一屏时无法滚动触发瀑布加载,这里提供手动加载入口 -->
          <div v-if="emoticons.length && pagination.hasMore.value" class="load-more">
            <n-button
              size="large"
              dashed
              :loading="loading"
              :focusable="false"
              class="load-more-btn"
              @click="nextPage({ isAppend: true })"
            >
              加载更多
            </n-button>
          </div>
          <n-back-top :right="40" />
        </n-spin>
      </n-layout>
    </n-layout>
  </n-layout>
</template>

<style scoped>
.page-icon {
  display: block;
  width: 14px;
  height: 14px;
}

/* n-tag 是 inline-flex,配 min-width 后需要主轴居中,数字才能停留在圆形中心 */
.page-tag {
  min-width: 26px;
  justify-content: center;
}

.load-more {
  display: flex;
  justify-content: center;
  padding: 10px 0 18px;
}

/* 大号虚线胶囊按钮;悬停时橙色高亮 + 光晕,与图片悬停光效呼应 */
.load-more-btn {
  width: 260px;
  transition: box-shadow 0.3s;
}

.load-more-btn,
.load-more-btn :deep(.n-button__border) {
  border-radius: 999px;
}

.load-more-btn:hover {
  --n-border-color: rgb(255, 154, 2);
  color: rgb(255, 154, 2);
  box-shadow: 0 0 12px rgba(255, 154, 2, 0.35);
}
</style>
