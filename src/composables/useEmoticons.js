import {nextTick, reactive, ref, toRefs} from "vue";
import {useMessage} from "naive-ui";
import {fetchActiveSource} from "./useConfig.js";
import {downloadImages} from "./useDownload.js";
import {DEFAULT_SEARCH_KEYWORD} from "../sources/registry.js";
import {onPluginEnter, onPluginOut, onPluginReady, setSubInput, setSubInputValue, whenPlatformReady} from "../platform/index.js";

/** 未指定时的默认超时兜底(毫秒) */
const FALLBACK_TIMEOUT = 15000;

/** 主输入框占位提示 */
const SUB_INPUT_HINT = "鼠标操作:回车搜索,左击复制图片,中击查看大图,右击加入收藏～";

/**
 * 注册插件生命周期:副输入框、外部进入、回车搜索、退出清理。
 * 必须等平台 API 就绪后再执行 —— 模拟器/开发模式下注入晚于页面脚本。
 * @param {import("vue").Ref<string>} keyWord
 * @param {() => void} reload
 */
function setupPluginLifecycle(keyWord, reload) {
    /**
     * 注册副输入框(幂等,可安全重复调用)。
     * 首次加载插件时,本次调用可能早于平台的插件进入流程而被忽略,
     * 因此 onPluginEnter / onPluginReady 触发时还会各补挂一次。
     */
    const attachSubInput = () => setSubInput(({text}) => {
        keyWord.value = text;
    }, SUB_INPUT_HINT);

    attachSubInput();

    onPluginEnter(({type, payload}) => {
        // 补挂输入框,覆盖「首次加载时注册早于进入流程」的场景
        attachSubInput();
        // 从外部选中文本进入插件时,直接用选中文本搜索
        if (type === "over") {
            setSubInputValue(payload);
            keyWord.value = payload;
            reload();
        }
    });

    // 插件初始化完成信号(平台支持时),再补挂一次输入框
    onPluginReady(attachSubInput);

    // 退出或隐藏插件时,清空搜索关键字
    onPluginOut(() => {
        keyWord.value = "";
    });

    // 回车触发搜索
    addEventListener("keydown", (event) => {
        if (event.code === "Enter") {
            reload();
        }
    });

    // 首次进入加载热门表情包
    reload();
}

/**
 * 表情包列表状态机(策略模式中的上下文角色)。
 * 只负责状态管理、图源调度、下载编排与分页,不感知任何具体图源的请求细节;
 * 图源的增减全部发生在 sources/registry.js,这里零改动(开闭原则)。
 *
 * @param {() => void} [reloadCallback] 每次重新加载前的回调(如关闭收藏夹抽屉)
 */
export default function useEmoticons(reloadCallback) {
    const {warning} = useMessage();
    const emoticons = ref([]);
    const keyWord = ref("");
    const loading = ref(false);
    const pagination = toRefs(reactive({
        pageNum: 1,
        pageSize: 20,
        hasMore: false,
        hasLess: false,
    }));

    /** 下载完成后追加并渲染,渲染完成后再取消 loading,避免闪烁 */
    const appendEmoticons = (items) => {
        nextTick(() => emoticons.value.push(...items))
            .then(() => setTimeout(() => loading.value = false, 100));
    };

    /** 当前加载的中止控制器:新一轮加载开始时,用于中止上一轮的在途请求 */
    let loadController = null;
    /** 加载序号:被新一轮加载取代的迟到响应/下载批次,据此整体丢弃 */
    let loadSeq = 0;

    /**
     * 加载当前图源的一页数据(调度核心)。
     * 开始新一轮加载前会先中止上一轮的在途请求(切换图源/搜索/翻页都走这里),
     * 被取代一方的迟到响应与下载批次按序号丢弃:不渲染、不误报失败、不干扰 loading 状态。
     * @param {{pageNum: number, pageSize: number, hasMore: boolean, hasLess: boolean}} pagination
     * @param {{isAppend?: boolean}} [options] isAppend=true 时追加而不是清空(滚动加载)
     */
    const loadData = (pagination, options = {}) => {
        const {isAppend} = options;
        const source = fetchActiveSource();
        if (!source) {
            return;
        }

        // 中止上一轮在途请求,并为本轮发号(旧响应据此识别自己已过期)
        loadController?.abort();
        const controller = new AbortController();
        loadController = controller;
        const seq = ++loadSeq;

        // 搜索框为空时,统一回填默认搜索关键字(图源可用 defaultKeyword 覆盖),并同步到搜索框
        let keyword = keyWord.value || source.defaultKeyword || DEFAULT_SEARCH_KEYWORD;
        if (keyword !== keyWord.value) {
            keyWord.value = keyword;
        }

        if (!isAppend) {
            emoticons.value = [];
        }
        loading.value = true;

        // 超时兜底:超时强制结束 loading,避免页面卡死;
        // 不中断真实请求,迟到的数据仍会照常渲染
        let requestSettled = false;
        const timeoutId = setTimeout(() => {
            if (seq === loadSeq && !requestSettled) {
                requestSettled = true;
                loading.value = false;
            }
        }, source.timeout ?? FALLBACK_TIMEOUT);

        source.fetchPage({
            keyword,
            page: pagination.pageNum.value,
            pageSize: pagination.pageSize.value,
            signal: controller.signal,
        }).then(result => {
            if (seq !== loadSeq) {
                return undefined; // 已被新一轮加载取代,迟到结果整体丢弃
            }
            if (result?.hasMore !== undefined) {
                pagination.hasMore.value = result.hasMore;
            }
            if (result?.hasLess !== undefined) {
                pagination.hasLess.value = result.hasLess;
            }
            // 图源只负责拿到直链,下载统一走 preload 的文件能力;迟到的下载批次同样按序号丢弃
            return downloadImages(result?.links ?? [], result?.downloadOptions ?? {}, (items) => {
                if (seq === loadSeq) {
                    appendEmoticons(items);
                }
            });
        }).catch(error => {
            // 请求被中止(切换图源/重新加载)时序号已过期:静默收场,不误报加载失败
            if (seq !== loadSeq) {
                return;
            }
            console.error(`图源[${source.label}]加载失败:`, error);
            appendEmoticons([]);
            warning(`图源[${source.label}]加载失败,可尝试「图源检测」确认状态`);
        }).finally(() => {
            if (seq !== loadSeq) {
                return;
            }
            requestSettled = true;
            clearTimeout(timeoutId);
        });
    };

    /** 回到第一页重新加载(加载中也会执行:中止上一轮在途请求并及时启动新加载) */
    const reload = () => {
        pagination.pageNum.value = 1;
        reloadCallback && reloadCallback();
        loadData(pagination);
    };

    /** 翻到下一页 */
    const nextPage = (options) => {
        pagination.pageNum.value += 1;
        loadData(pagination, options);
    };

    /** 翻到上一页 */
    const previousPage = () => {
        pagination.pageNum.value -= 1;
        loadData(pagination);
    };

    /** 滚动到底部时,追加加载下一页 */
    const loadMore = (event) => {
        if (!(event.target instanceof HTMLDivElement)) {
            return;
        }
        const {scrollTop, clientHeight, scrollHeight} = event.target;
        if (Math.round(scrollTop) + clientHeight >= scrollHeight && !loading.value && pagination.hasMore.value) {
            nextPage({isAppend: true});
        }
    };

    // 平台 API 就绪后立即注册生命周期并首屏加载。
    // 在 setup 阶段(而非 onMounted)执行,尽可能早地挂上输入框;
    // 真实环境注入早于页面脚本,此时同步执行,行为与旧版一致;
    // 模拟器/开发模式下注入较晚,由 whenPlatformReady 轮询等待
    whenPlatformReady(() => setupPluginLifecycle(keyWord, reload));

    return {
        emoticons,
        loading,
        pagination,
        keyWord,
        previousPage,
        nextPage,
        reload,
        loadMore,
    };
}
