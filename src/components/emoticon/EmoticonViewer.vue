<script setup lang="ts">
import type { CarouselInst } from "naive-ui";
import type { Emoticon } from "@/types/emoticon";

import { onBeforeUnmount, ref, watch } from "vue";
import { useMessage } from "naive-ui";

import { loadSettings } from "@/composables/use-settings";
import useStarList from "@/composables/use-star-list";

import EmoticonItem from "./EmoticonItem.vue";

const isShow = ref(false);
const images = ref<Emoticon[]>([]);
const currentIndex = ref(0);
const carousel = ref<CarouselInst | null>(null);
const { checkIfCollected } = useStarList();
const message = useMessage();

/** 轮播打开期间,键盘左右方向键切换上/下一张 */
const onKeydown = (event: KeyboardEvent): void => {
  if (event.key === "ArrowLeft") {
    carousel.value?.prev();
  } else if (event.key === "ArrowRight") {
    carousel.value?.next();
  }
};

// 监听器只在轮播打开期间挂载,避免影响页面其它快捷键
watch(isShow, (show) => {
  if (show) {
    document.addEventListener("keydown", onKeydown);
  } else {
    document.removeEventListener("keydown", onKeydown);
  }
});

onBeforeUnmount(() => {
  document.removeEventListener("keydown", onKeydown);
});

/** 打开大图预览,从指定图片开始 */
const show = (event: MouseEvent, previewImages: Emoticon[], previewIndex = 0): void => {
  // 按住中键的时候是否需要shift
  const { middleWithShift } = loadSettings();
  if (middleWithShift && !event.shiftKey) {
    message.info("记得按住shift噢");
    return;
  }

  images.value = previewImages;
  currentIndex.value = previewIndex;
  isShow.value = true;
};

defineExpose({ show });
</script>

<template>
  <n-drawer v-model:show="isShow" style="height: 92%" placement="bottom">
    <n-drawer-content>
      <!-- 受控的 current-index:每次打开都定位到中键点击的那张图片(default-index 只在首次挂载生效) -->
      <n-carousel
        ref="carousel"
        v-model:current-index="currentIndex"
        :show-dots="false"
        dot-placement="top"
        keyboard
        mousewheel
        centered-slides
        effect="card"
        draggable
        show-arrow
      >
        <template v-for="(image, index) in images" :key="index">
          <n-carousel-item style="width: 80%">
            <EmoticonItem
              class="emoticon-img"
              :em="image"
              style="background-color: white"
              :style="{
                borderColor: checkIfCollected(image.imgSrc) ? 'orange' : 'white',
                borderStyle: 'solid',
                borderWidth: '2px',
              }"
            />
          </n-carousel-item>
        </template>
      </n-carousel>
    </n-drawer-content>
  </n-drawer>
</template>

<style>
/* 加大左右切换按钮,更醒目也更容易点到 */
.n-carousel .n-carousel__arrow {
  height: 44px !important;
  width: 44px !important;
  font-size: 26px !important;
  border-radius: 10px !important;
  background-color: rgba(123, 123, 123, 0.8) !important;
}

/* 左右切换按钮分别贴到轮播左右两侧垂直居中(naive 默认并排在角落);
   group 横贯整个轮播但不拦截点击,只有按钮本身可点,图片上的单击/双击操作不受影响 */
.n-carousel .n-carousel__arrow-group {
  left: 0 !important;
  right: 0 !important;
  top: 50% !important;
  bottom: auto !important;
  transform: translateY(-50%);
  justify-content: space-between;
  padding: 0 12px;
  box-sizing: border-box;
  pointer-events: none;
}

.n-carousel .n-carousel__arrow {
  pointer-events: auto;
}
</style>
