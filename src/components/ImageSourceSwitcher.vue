<template>
  <n-space justify="space-between" align="center">
    <template v-for="source in imageSources">
      <n-tag checkable round :checked="config['imageSource']===source['key']"
             @click="()=>switchImageSource(source['key'])">
        {{ source['label'] }}
      </n-tag>
    </template>
  </n-space>
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
            label: '发表情',
            key: '发表情',
            disabled: config.value['imageSource'] === '发表情'
          },
          {
            label: '斗图啦',
            key: '斗图啦',
            disabled: config.value['imageSource'] === '斗图啦'
          },
          // {
          //   label: '爱斗图',
          //   key: '爱斗图',
          //   disabled: config.value['imageSource'] === '爱斗图'
          // },
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
      // 图源没变，不做任何处理
      if (config.value['imageSource'] === value) {
        return;
      }
      config.value['imageSource'] = value
      updateConfig(config.value)
      message.success(`切换到图源-${value}`)
      reload()
    }

    const currentSource = imageSources.value.filter(s => s === config.value['imageSource'])
    // 当前表情包源不可用，切换到第一个表情包源
    if (!currentSource.length) {
      switchImageSource(imageSources.value[0]['key'])
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
