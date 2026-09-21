<script setup lang="ts">
import { ref } from "vue";

import { collectedDirectory, openPath } from "@/platform";
import useStarList from "@/composables/use-star-list";

import EmoticonList from "@/components/emoticon/EmoticonList.vue";

const isShow = ref(false);

const { starEmojiList, downloadCollectedImages } = useStarList();

const showModal = (): void => {
  isShow.value = true;
  // 打开收藏夹时重新下载缺失的本地文件
  downloadCollectedImages(starEmojiList.value.map((item) => item.imgSrc));
};

const close = (): void => {
  isShow.value = false;
};

const openCollectionPath = (): void => {
  openPath(collectedDirectory());
};

defineExpose({ close });
</script>

<template>
  <n-button title="查看收藏夹" text type="default" size="medium" :focusable="false" @click="showModal">
    🌟收藏
  </n-button>
  <n-drawer v-model:show="isShow" style="height: 90%" placement="bottom" :auto-focus="false">
    <n-drawer-content :native-scrollbar="false" closable>
      <template #header>
        <n-space justify="start">
          <div>
            <span>收藏夹</span>
            <small>
              <n-text v-if="starEmojiList.length" italic depth="3">({{ starEmojiList.length }} 张)</n-text>
            </small>
          </div>
          <n-button text :focusable="false" @click="openCollectionPath">打开</n-button>
        </n-space>
      </template>
      <EmoticonList
        :emoticons="starEmojiList"
        :width="111"
        :height="111"
        empty-hint="暂无收藏,在表情上点击鼠标右键即可加入收藏哦~"
      />
    </n-drawer-content>
  </n-drawer>
</template>
