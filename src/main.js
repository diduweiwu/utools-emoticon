import {createApp} from 'vue'
import './style.css'
import App from './App.vue'
import {
    // create naive ui
    create,
    // component
    NSpin,
    NGrid,
    NButton,
    NSpace,
    NGi,
} from 'naive-ui'

const naive = create({
    components: [
        NSpin,
        NGrid,
        NButton,
        NSpace,
        NGi,
    ]
})
createApp(App).use(naive).mount('#app')
