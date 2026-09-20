<template>
  <n-result status="404" title="这里只是一个兴趣使然的开发者" description="生活总归需要点乐趣">
    <template #footer>
      <n-list show-divider clickable hoverable>
        <n-list-item>
          <div>声明:</div>
          <div>
            本插件所有功能<strong style="color: red">永久</strong> 免费,利用加完班的业余时间开发,欢迎大家使用和反馈,觉得好用欢迎点赞或赞助~
          </div>
          <div>
            所有数据来自互联网，本插件不存储任何原始数据；
          </div>
          <div>
            请遵守法律法规，请勿用于任何违法行为，用户的一切行为与作者无关。
          </div>
        </n-list-item>
        <n-list-item>
          <strong>新增快捷键操作: 按住shift单击打开远程图片,按住Alt/Option打开本地图片</strong>
        </n-list-item>
        <n-list-item>
          <n-space justify="space-around">
            <img width="200" height="300" src="/src/assets/alipay.jpg" alt="支付宝">
            <img width="200" height="300" src="/src/assets/wechat.jpg" alt="微信">
          </n-space>
        </n-list-item>
        <n-list-item>源码地址: <a :href="sourceLink" @click="()=>openLink(sourceLink)">{{ sourceLink }}</a>
        </n-list-item>
        <n-list-item>真心感谢以下表情包数据源,该插件开源免费,无任何商业属性,若有侵权请联系作者删除～</n-list-item>
      </n-list>
      <n-space justify="center">
        <!-- 图源清单直接从注册表生成,新增/下架图源自动同步 -->
        <a v-for="source in imageSources" :key="source.id" :href="source.host"
           @click="()=>openLink(source.host)">
          {{ source.label }}{{ source.enabled === false ? "(已下架)" : "" }}
        </a>
      </n-space>
    </template>
  </n-result>
</template>

<script>
import {imageSources} from "../../sources/registry.js";
import {openLink} from "../../platform/index.js";

export default {
  name: "About",
  setup() {
    const sourceLink = "https://github.com/diduweiwu/utools-emoticon"

    return {
      imageSources,
      sourceLink,
      openLink,
    }
  }
}
</script>

<style scoped>

</style>
