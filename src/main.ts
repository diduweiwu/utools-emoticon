import { createApp } from "vue";

import App from "./App.vue";
import "./styles/main.css";

// naive-ui 组件由 unplugin-vue-components 按需自动注册,无需手动安装
createApp(App).mount("#app");
