<template>
  <n-dropdown trigger="hover" :options="imageSources" @select="switchImageSource" placement="bottom-start">
    <n-button title="切换图源" type="default" size="large" :focusable="false" :disabled="loading">
      {{ config['imageSource'] }}
      <template #icon>
        <svg t="1675949888128" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
             p-id="3618" width="32" height="32">
          <path d="M0 0h1024v1024H0V0z" fill="#202425" opacity=".01" p-id="3619"></path>
          <path
              d="M604.398933 58.2656c-21.504-21.504-58.2656-6.280533-58.2656 24.132267V238.933333a34.133333 34.133333 0 0 1-34.133333 34.133334H307.2a68.266667 68.266667 0 0 0-68.266667 68.266666v68.266667a68.266667 68.266667 0 0 0 68.266667 68.266667h634.402133c30.378667 0 45.636267-36.7616 24.132267-58.2656L604.398933 58.2656z"
              fill="#FF7744" p-id="3620"></path>
          <path
              d="M429.636267 965.7344c21.504 21.504 58.2656 6.280533 58.2656-24.132267V785.066667a34.133333 34.133333 0 0 1 34.133333-34.133334h204.8a68.266667 68.266667 0 0 0 68.266667-68.266666v-68.266667a68.266667 68.266667 0 0 0-68.266667-68.266667H92.433067c-30.378667 0-45.636267 36.7616-24.132267 58.2656l361.335467 361.335467z"
              fill="#FFAA44" p-id="3621"></path>
        </svg>
      </template>
    </n-button>
  </n-dropdown>
</template>

<script>
import {fetchConfig, updateConfig} from "../js/useConfig.js";
import {useMessage} from "naive-ui";
import {computed, onMounted, ref} from "vue";

export default {
  name: "ImageSourceSwitcher",
  props: {
    reload: {type: Function},
    loading: {type: Boolean, default: false}
  },
  setup(props) {
    const {reload} = props
    const config = ref({})
    onMounted(() => config.value = fetchConfig())

    const imageSources = computed(
        () => [
          {
            label: '爱斗图',
            key: '爱斗图',
            disabled: config.value['imageSource'] === '爱斗图'
          },
          {
            label: '斗图吧',
            key: '斗图吧',
            disabled: config.value['imageSource'] === '斗图吧'
          },
          {
            label: '斗图王',
            key: '斗图王',
            disabled: config.value['imageSource'] === '斗图王'
          },
          {
            label: '去斗图',
            key: '去斗图',
            disabled: config.value['imageSource'] === '去斗图'
          },
          {
            label: '表情233',
            key: '表情233',
            disabled: config.value['imageSource'] === '表情233'
          },
        ]
    )
    const message = useMessage()

    // 切换图源
    const switchImageSource = (value) => {
      config.value['imageSource'] = value
      updateConfig(config.value)
      message.success(`切换到图源-${value}`)
      reload()
    }

    return {
      config,
      imageSources,
      switchImageSource,
    }
  }
}
</script>

<style scoped>

</style>
