<template>
  <n-dropdown trigger="hover" :options="imageSources" @select="switchImageSource">
    <n-button circle text title="切换图源" type="default">
      <n-icon :component="SwapVerticalCircleOutlined" size="30"/>
    </n-button>
  </n-dropdown>
</template>

<script>
import {SwapVerticalCircleOutlined} from "@vicons/material";
import UseConfig from "../js/useConfig.js";
import {useNotification} from "naive-ui";

export default {
  name: "ImageSourceSwitcher",
  props: {
    reload: {type: Function}
  },
  setup(props) {
    const {reload} = props
    const {config, updateConfig} = UseConfig()

    const imageSources = [
      {
        label: '爱斗图',
        key: '爱斗图'
      },
      // {
      //   label: 'PK斗图',
      //   key: 'PK斗图'
      // },
    ]
    const notification = useNotification()

    const switchImageSource = (value) => {
      updateConfig(() => config.value['imageSource'] = value)
      notification.info({content: `切换到图源-${value}`, duration: 2000})
      reload()
    }

    return {
      imageSources,
      SwapVerticalCircleOutlined,
      switchImageSource,
    }
  }
}
</script>

<style scoped>

</style>
