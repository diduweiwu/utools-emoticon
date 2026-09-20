<script>
import {ref} from "vue";
import {NSwitch, useMessage} from "naive-ui";
import {loadSettings, saveSettings} from "../../composables/useSettings.js";

export default {
  name: "Settings",
  components: {NSwitch},
  setup() {
    const message = useMessage()

    // ==================== 通用设置 ====================
    const settingsData = ref(loadSettings())
    const onSettingChange = () => {
      saveSettings(settingsData.value)
      message.info("设置已保存")
    }

    return {
      settingsData,
      onSettingChange,
    }
  }
}
</script>

<template>
  <div class="settings-panel">
    <div class="setting-item">
      <div class="setting-info">
        <div class="setting-title">中键查看大图需搭配 Shift</div>
        <div class="setting-desc">
          开启后,需要按住 Shift 并点击鼠标中键才会打开大图,避免与平台的超级面板快捷手势冲突
        </div>
      </div>
      <n-switch v-model:value="settingsData.middleWithShift" size="small" @update:value="onSettingChange"/>
    </div>
  </div>
</template>

<style scoped>
/* 设置项撑满内容区宽度 */
.settings-panel {
  width: 100%;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  padding: 14px 16px;
  border: 1px solid rgba(128, 128, 128, 0.25);
  border-radius: 8px;
}

.setting-item + .setting-item {
  margin-top: 12px;
}

.setting-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.setting-desc {
  font-size: 12px;
  opacity: 0.6;
  line-height: 1.6;
}
</style>
