<script>
import useApp from "./js/useApp.js";
import ImageSourceSwitcher from "./components/ImageSourceSwitcher.vue";
import ImageList from "./components/ImageList.vue";
import ImageStarList from "./components/ImageStarList.vue";
import {darkTheme, useOsTheme} from "naive-ui";
import {computed, ref} from "vue";
import About from "./components/about/About.vue";


export default {
    components: {About, ImageStarList, ImageList, ImageSourceSwitcher},
    setup() {
        const osThemeRef = useOsTheme();
        const imageStarList = ref()
        return {
            imageStarList,
            ...useApp(() => imageStarList.value?.close()),
            ImageList,
            theme: computed(() => osThemeRef.value === "dark" ? darkTheme : null),
        }
    }
}
</script>

<template>
    <n-config-provider :theme="theme">
        <n-message-provider placement="top" container-style="margin-top:50px" :duration="1500">
            <n-layout position="absolute">
                <n-layout-header style="height: 50px;" bordered>
                    <n-space justify="space-between" align="center" style="height: 50px;padding:0 10px">
                        <n-space align="center">
                            <ImageSourceSwitcher :reload="reload" :loading="loading"/>
                            <n-divider vertical/>
                            <ImageStarList ref="imageStarList"/>
                            <n-divider vertical/>
                            <n-button @click.stop="()=>$refs.about.show()" :focusable="false" text>关于</n-button>
                        </n-space>

                        <n-space>
                            <n-button :focusable="false" :disabled="loading||pagination.pageNum===1" type="default"
                                      @click="previousPage">上一页
                            </n-button>
                            <n-button :focusable="false" :disabled="loading||!(emoticons&&emoticons.length)"
                                      type="default"
                                      @click="nextPage">下一页
                            </n-button>
                        </n-space>
                    </n-space>
                </n-layout-header>
                <n-layout has-sider position="absolute" style="top: 60px">
                    <n-layout content-style="padding: 5px 10px;" :native-scrollbar="false">
                        <n-spin :show="loading" style="min-height: 300px" description="努力加载中~">
                            <ImageList :loading="loading" :emoticons="emoticons"/>
                            <n-back-top :right="40"/>
                        </n-spin>
                        <About ref="about"/>
                    </n-layout>
                </n-layout>
            </n-layout>
        </n-message-provider>
    </n-config-provider>

</template>

<style scoped>

</style>

<style>

</style>
