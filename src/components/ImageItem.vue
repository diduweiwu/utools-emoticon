<template>
  <img class="carousel-img" :src="em['fileSrc']"
       @click.exact="()=>copy(em)"
       @click.alt.exact="()=>openLocal(em)"
       @click.shift.exact="()=>openRemote(em)"
       @click.right.exact="()=>saveOrRemove(em)">
</template>

<script>
import useImageStarList from "../js/useImageStarList.js";
import {useMessage} from "naive-ui";

export default {
  name: "ImageItem",
  props: {
    em: {
      type: Object,
      default: {}
    },
    emoticons: {
      type: Array,
      default: []
    }
  },
  setup() {
    const {switchCollectedStatus, starEmojiList} = useImageStarList()

    //  检查表情包是否已存在
    const checkIfExist = (checkImgSrc) => {
      for (let icon of starEmojiList.value) {
        if (checkImgSrc === icon.imgSrc) {
          return true
        }
      }
      return false
    }

    const {success, warning, info} = useMessage()
    // 删除任务的映射关系
    const removeTaskMap = {}
    const saveOrRemove = (em) => {
      // 表情包不存在，直接添加
      if (!checkIfExist(em.imgSrc)) {
        switchCollectedStatus(em)
        return
      }

      // 表情包存在,进行取消
      const removeTask = removeTaskMap[em.imgSrc]
      if (!!removeTask) {
        clearTimeout(removeTask)
        info("已取消删除任务")
        return
      }

      warning("即将删除，10s内右键可以取消删除哦~", {duration: 3000})
      removeTaskMap[em.imgSrc] = setTimeout(() => switchCollectedStatus(em), 10000)
    }

    return {
      saveOrRemove,
      copy: (em) => window.copyImage(em, () => success('复制成功~')),
      openLocal: (em) => window.openLink(em.fileSrc),
      openRemote: (em) => window.openLink(em.imgSrc),
    }
  }
}
</script>

<style scoped>
.carousel-img {
  margin: 0 auto;
  width: 99%;
  height: 99%;
  object-fit: fill;
  cursor: pointer;
  border-radius: 5px;
}
</style>
