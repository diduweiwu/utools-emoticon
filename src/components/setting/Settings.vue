<script>
import {ref} from "vue";
import {loadSettings, saveSettings} from "./useSettings";
import {useMessage} from "naive-ui";

export default {
  name: "Settings",
  setup() {
    const settingsData = ref(loadSettings())
    const message = useMessage()

    const onFormDataChange = () => {
      saveSettings(settingsData.value)
      message.info("保存成功")
    }

    return {
      formRef: ref(null),
      settingsData,
      onFormDataChange,
    }
  }
}
</script>

<template>
  <h2>常用设置<small>(工作好累，懒得单独加管理页面了🤦)</small></h2>
  <div>
    <n-form
        size="small"
        inline
        :model="settingsData"
        :ref="formRef"
    >
      <n-form-item :key="settingsData.middleWithShift">
        <n-checkbox
            v-model:checked="settingsData.middleWithShift"
            label="鼠标中键需要搭配shift(避免和utools的超级面板冲突)" @update-checked="onFormDataChange"/>
      </n-form-item>
    </n-form>
  </div>
</template>
