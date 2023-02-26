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
