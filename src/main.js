import {createApp} from 'vue'
import './style.css'
import App from './App.vue'
import {
    create,
    NButton,
    NButtonGroup,
    NConfigProvider,
    NDrawer,
    NDrawerContent,
    NDropdown,
    NGi,
    NGrid,
    NIcon,
    NLayout,
    NLayoutHeader,
    NLayoutSider,
    NNotificationProvider,NEmpty,
    NSpace,
    NSpin,
} from 'naive-ui'

const naive = create({
    components: [
        NSpin, NIcon, NDropdown, NButtonGroup, NLayout, NLayoutSider, NLayoutHeader,
        NGrid,
        NButton,
        NSpace, NDrawer, NDrawerContent,
        NGi,
        NNotificationProvider,NEmpty, NConfigProvider,
    ]
})
createApp(App).use(naive).mount('#app')
