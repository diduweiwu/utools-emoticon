<script>
import useApp from "./js/useApp.js";

export default {
  setup() {
    const {emoticons, loading} = useApp()

    return {
      emoticons,
      loading,
      copy: (url) => window.copyImage(url),
    }
  }
}
</script>

<template>
  <n-spin :show="loading">
    <n-grid :cols="4" y-gap="15" x-gap="15">
      <n-gi v-for="em in emoticons">
        <img class="emoji-pic" @click="()=>copy(em.locImageLink)" style="cursor:pointer;" :src="em.locImageLink"
             width="170" height="170" :alt="em.title"/>
      </n-gi>
    </n-grid>
  </n-spin>
</template>

<style scoped>
.emoji-pic {
  transition: all .3s;
}

.emoji-pic:hover {
  box-shadow: 0 0 10px rgba(28, 41, 217, 0.7);
}
</style>
