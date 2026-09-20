<template>
  <img class="carousel-img" :src="em['fileSrc']"
       v-on:click.exact="()=>handleCopy(em)"
       v-on:dblclick.exact="()=>handlePaste(em)"
       @click.alt.exact="()=>openLocal(em)"
       @click.shift.exact="()=>openRemote(em)"
       @click.right.exact="()=>saveOrRemove(em)">
</template>

<script>
import useImageStarList from "../composables/useImageStarList.js";
import {useMessage} from "naive-ui";
import {copyImage, openLink, pasteFile} from "../platform/index.js";

/** 区分单击/双击的判定间隔(毫秒),间隔内再次点击视为双击 */
const CLICK_INTERVAL = 400;

/** 右键删除的反悔窗口(毫秒),窗口内再次右键可取消删除 */
const REMOVE_REVOKE_INTERVAL = 10000;

export default {
  name: "ImageItem",
  props: {
    em: {
      type: Object,
      default: () => ({})
    },
    emoticons: {
      type: Array,
      default: () => []
    }
  },
  setup() {
    const {switchCollectedStatus, starEmojiList} = useImageStarList()

    /** 检查表情包是否已收藏 */
    const checkIfExist = (checkImgSrc) => {
      return starEmojiList.value.some(icon => checkImgSrc === icon.imgSrc)
    }

    const {success, warning, info} = useMessage()
    // 待执行的删除任务(支持反悔)
    const removeTaskMap = {}

    /**
     * 右键收藏/取消收藏。
     * 取消收藏有反悔窗口:窗口内再次右键可撤销删除。
     */
    const saveOrRemove = (em) => {
      // 未收藏,直接添加
      if (!checkIfExist(em.imgSrc)) {
        switchCollectedStatus(em)
        return
      }

      // 已收藏且处于删除等待期,再次右键取消删除
      const removeTask = removeTaskMap[em.imgSrc]
      if (!!removeTask) {
        clearTimeout(removeTask)
        info("已取消删除")
        delete removeTaskMap[em.imgSrc]
        return
      }

      warning(`即将删除，${REMOVE_REVOKE_INTERVAL / 1000}s内右键可以取消删除哦~`, {duration: 3000})
      removeTaskMap[em.imgSrc] = setTimeout(() => switchCollectedStatus(em), REMOVE_REVOKE_INTERVAL)
    }

    let clickTimer = null

    /** 单击复制图片到剪贴板(延时判定,与双击粘贴区分开) */
    const handleCopy = (em) => {
      if (clickTimer) {
        clearTimeout(clickTimer)
      }
      clickTimer = setTimeout(() => {
        copyImage(em, () => success('复制成功~'))
      }, CLICK_INTERVAL)
    }

    /** 双击直接粘贴到当前光标所在输入框(平台会先复制再粘贴,无法拆分) */
    const handlePaste = (em) => {
      if (clickTimer) {
        clearTimeout(clickTimer)
      }
      pasteFile(em['fileSrc'].replace("file://", ""))
    }

    return {
      saveOrRemove,
      openLocal: (em) => openLink(em.fileSrc),
      openRemote: (em) => openLink(em.imgSrc),
      handleCopy,
      handlePaste,
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
