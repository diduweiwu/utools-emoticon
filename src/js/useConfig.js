import {ref} from "vue";

export function fetchConfig() {
    let config = utools.dbStorage.getItem('config')

    if (config && typeof config === 'string') {
        return JSON.parse(config)
    }

    return {
        imageSource: '爱斗图',
    }
}

/**
 * 更新配置信息
 * @param config
 */
export function updateConfig(config) {
    utools.dbStorage.setItem('config', JSON.stringify(config));
}

export default function () {
    const config = ref(fetchConfig())

    const _updateConfig = (updateAction) => {
        updateAction()
        updateConfig(config.value)
    }

    return {
        config,
        updateConfig: _updateConfig,
        fetchConfig,
    }
}
