<template>
  <n-button title="查看收藏夹" @click="()=>showModal()" text type="default" size="tiny" :focusable="false">
    🌟收藏
  </n-button>
  <n-drawer v-model:show="isShow" style="height: 90%" placement="bottom" :auto-focus="false">
    <n-drawer-content :native-scrollbar="false" closable>
      <template #header>
        <n-space justify="start">
          <div>
            <span>收藏夹</span>
            <small>
              <n-text italic depth="3" v-if="starEmojiList&&starEmojiList.length">({{ starEmojiList.length }} 张)
              </n-text>
            </small>
          </div>
          <n-button text :focusable="false" @click="openCollectionPath">打开</n-button>
        </n-space>
      </template>
      <ImageList :emoticons="starEmojiList" :width="111" :height="111"
                 empty-hint="暂无收藏,在表情上点击鼠标右键即可加入收藏哦~"/>
    </n-drawer-content>
  </n-drawer>
</template>

<script>
import {ref} from "vue";
import useImageStarList from "../js/useImageStarList.js";
import ImageList from "./ImageList.vue";

export default {
  name: "ImageStarList",
  components: {ImageList},
  setup() {
    const isShow = ref(false)

    const {starEmojiList} = useImageStarList()

    return {
      isShow,
      starEmojiList,
      showModal: () => isShow.value = true,
      close: () => isShow.value = false,
      ImageList,
      openCollectionPath: () => utools.shellOpenPath(checkOrCreateCollectedDirectory())
    }
  }
}
</script>

<style scoped>

</style>
