<template>
  <n-button title="查看收藏夹" @click="()=>showModal()" class="pointer" size="large" type="default">
    <svg t="1675949663912" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
         p-id="3529" width="32" height="32">
      <path
          d="M937 486.087v373.908C937 897.553 906.56 928 869 928H155c-37.556 0-68-30.44-68-68.005V486.087h236.348l-32.776 191.767c-5.99 35.04 14.597 50.634 46.092 35.224l0.958-0.477L512 624.417l174.378 88.184c31.716 16.039 52.676 0.95 47.223-33.692l-0.173-1.055-32.778-191.767H937z"
          fill="#FFB005" p-id="3530"></path>
      <path
          d="M512 600.562l-179.747 94.48c-16.62 8.735-27.519 0.815-24.345-17.685l34.328-200.112-145.418-141.72c-13.445-13.103-9.29-25.913 9.3-28.614l200.962-29.196 89.874-182.067c8.31-16.834 21.784-16.832 30.092 0l89.874 182.067 200.962 29.196c18.582 2.7 22.743 15.513 9.3 28.615l-145.418 141.72 34.328 200.11c3.174 18.504-7.718 26.425-24.345 17.686L512 600.562z"
          fill="#FFD249" p-id="3531"></path>
    </svg>
  </n-button>
  <n-drawer v-model:show="isShow" title="`表情收藏夹`" style="width: 90%;" placement="left">
    <n-drawer-content title="收藏夹">
      <ImageList :emoticons="starIcons()" :width="90" :height="90" :y-gap="5" :x-gap="5" :cols="6"
                 style="min-height:200px;max-height: 420px;overflow-x:hidden;overflow-y: auto" empty-hint="暂无收藏,在表情上点击鼠标右键即可加入收藏哦~"/>
    </n-drawer-content>
  </n-drawer>
</template>

<script>
import {ref} from "vue";
import useImageStarList from "../js/useImageStarList.js";
import ImageList from "./ImageList.vue";
import {StarBorderFilled} from "@vicons/material";

export default {
  name: "ImageStarList",
  components: {ImageList, StarBorderFilled},
  setup() {
    const isShow = ref(false)

    const {fetchImageStarDisplayList} = useImageStarList()

    return {
      isShow,
      showModal: () => isShow.value = true,
      starIcons: () => fetchImageStarDisplayList(),
      ImageList,
      StarBorderFilled,
    }
  }
}
</script>

<style scoped>

</style>
