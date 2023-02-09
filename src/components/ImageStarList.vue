<template>
  <n-button circle text title="查看收藏夹" type="default" @click="()=>showModal()">
    <n-icon :component="StarBorderFilled" size="35"/>
  </n-button>
  <n-modal v-model:show="isShow" preset="dialog" :title="`表情收藏夹`" style="width: 90%;">
    <ImageList :emoticons="starIcons()" :width="90" :height="90" :y-gap="5" :x-gap="5" :cols="6"
               style="min-height:200px;max-height: 420px;overflow-x:hidden;overflow-y: auto" empty-hint="暂无收藏."/>
  </n-modal>
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
