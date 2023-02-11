import {createApp} from 'vue'
import './style.css'
import App from './App.vue'
import {
    create,
    NBackTop,
    NButton,
    NButtonGroup,
    NConfigProvider,
    NDrawer,
    NDrawerContent,
    NDropdown,
    NEmpty,
    NLayout,
    NLayoutHeader,
    NMessageProvider,
    NText,
    NSpace,
    NSpin,
} from 'naive-ui'

const naive = create({
    components: [
        NBackTop,
        NButton,
        NButtonGroup,
        NConfigProvider,
        NDrawer,
        NDrawerContent,
        NDropdown,
        NEmpty,
        NLayout,
        NLayoutHeader,
        NMessageProvider,
        NText,
        NSpace,
        NSpin,
    ]
})
createApp(App).use(naive).mount('#app')
