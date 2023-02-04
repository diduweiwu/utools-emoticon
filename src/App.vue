<script>
import useApp from "./js/useApp.js";

export default {
  setup() {
    const {
      emoticons,
      loading,
      pagination,
      keyWord,
      previousPage,
      nextPage,
    } = useApp()

    return {
      emoticons,
      loading,
      pagination,
      keyWord,
      previousPage,
      nextPage,
      copy: (url) => window.copyImage(url),
    }
  }
}
</script>

<template>
  <n-spin :show="loading">
    <div v-if="emoticons&&emoticons.length" style="margin-bottom: 20px">
      <n-grid :cols="4" y-gap="15" x-gap="15">
        <n-gi v-for="em in emoticons">
          <img class="emoji-pic" @click="()=>copy(em)" style="cursor:pointer;" :src="em"
               width="170" height="170" :alt="em.title"/>
        </n-gi>
      </n-grid>
    </div>
  </n-spin>

  <n-space justify="center" class="pagination">
    <n-button :disabled="pagination.pageNum==1" type="primary" size="small" @click="previousPage">上一页</n-button>
    <n-button :disabled="!(emoticons&&emoticons.length)" type="primary" size="small" @click="nextPage">下一页
    </n-button>
  </n-space>
</template>

<style scoped>
.emoji-pic {
  transition: all .3s;
}

.emoji-pic:hover {
  box-shadow: 0 0 10px rgba(28, 41, 217, 0.7);
}

.pagination {
  position: fixed;
  bottom: 0;
  padding: 10px 10px;
  left: 0;
  width: 100%;
  background-color: rgba(36, 36, 36, 0.9);
}
</style>
