<template>
  <div v-if="emoticons&&emoticons.length">
    <n-grid :cols="cols" :y-gap="yGap" :x-gap="xGap">
      <n-gi v-for="em in emoticons">
        <img class="emoji-pic" @click="()=>copy(em.fileSrc)"
             @click.right="switchStar(em)"
             :style="checkIfStarred(em.imgSrc)?{borderWidth:'2px',borderStyle:'solid',borderColor:'orange'}:{borderWidth:'2px',borderStyle:'solid',borderColor:'lightgray'}"
             style="cursor:pointer;" :src="em.fileSrc" :width="width" :height="height"/>
      </n-gi>
    </n-grid>
  </div>
  <div v-else>
    <span v-if="!loading">{{ emptyHint }}</span>
  </div>
</template>

<script>
import useImageStarList from "../js/useImageStarList.js";
import {toRefs} from "vue";

export default {
  name: "ImageList",
  props: {
    emptyHint: {type: String, default: '没有表情包,切换关键字搜索下试试~'},
    width: {type: Number, default: 170},
    height: {type: Number, default: 170},
    xGap: {type: Number, default: 15},
    yGap: {type: Number, default: 5},
    cols: {type: Number, default: 4},
    loading: {type: Boolean, default: false},
    emoticons: {type: Array, default: []}
  },
  setup(props) {
    const {emoticons} = toRefs(props)
    const {
      switchStar,
      checkIfStarred,
    } = useImageStarList()

    return {
      emoticons,
      switchStar,
      checkIfStarred,
      copy: (url) => window.copyImage(url),
    }
  }
}
</script>

<style scoped>
.emoji-pic {
  transition: all .3s;
}

.emoji-pic:hover {
  box-shadow: 0 0 5px rgba(27, 39, 206, 0.7);
}

.pointer {
  cursor: pointer;
}
</style>
