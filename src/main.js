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
    NEmpty,
    NTag,
    NDivider,
    NResult,
    NCarousel,
    NCarouselItem,
    NList,
    NListItem,
    NLayout,
    NLayoutHeader,
    NMessageProvider,
    NSpace,
    NSpin,
    NText,
} from 'naive-ui'

const naive = create({
    components: [
        NBackTop,
        NButton,
        NButtonGroup,
        NConfigProvider,
        NDrawer,
        NDrawerContent,
        NEmpty,
        NTag,
        NDivider,
        NResult,
        NCarousel,
        NCarouselItem,
        NList,
        NListItem,
        NLayout,
        NLayoutHeader,
        NMessageProvider,
        NText,
        NSpace,
        NSpin,
    ]
})
createApp(App).use(naive).mount('#app')
