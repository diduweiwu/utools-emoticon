<template>
  <img class="carousel-img" :src="em['fileSrc']" @click="()=>copy(em)" @click.right="()=>switchCollectedStatus(em)">
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
  },
  setup() {
    const {switchCollectedStatus,} = useImageStarList()
    const {success} = useMessage()

    return {
      switchCollectedStatus,
      copy: (em) => window.copyImage(em, () => success('复制成功~')),
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
