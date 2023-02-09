import {createApp} from 'vue'
import './style.css'
import App from './App.vue'
import {create, NButton, NDropdown, NGi, NGrid, NIcon, NModal, NNotificationProvider, NSpace, NSpin,} from 'naive-ui'

const naive = create({
    components: [
        NSpin, NIcon, NDropdown,
        NGrid,
        NButton,
        NSpace, NModal,
        NGi,
        NNotificationProvider,
    ]
})
createApp(App).use(naive).mount('#app')
