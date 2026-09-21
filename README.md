# 基于 Vue 3 + TypeScript + Vite 开发的 ztools 表情包搜索插件

```text
API接口为自己搜索的，如果大家有推荐的表情包接口，欢迎推荐
其他没啥了，就是一些函数踩坑和学习的过程，在此感谢 斗图 插件的作者，
参考和学习了插件的一些用法:)
鸣谢logo作者：https://www.iconfinder.com/icons/7188639/happy_face_emoji_emotion_smile_smiley_emoticons_icon
```

## 开发

要求 Node.js `^20.19.0 || >=22.12.0`。

```bash
npm install        # 安装依赖
npm run dev        # 本地开发(vite dev server,配合 ztools/uTools 开发模式)
npm run build      # 类型检查 + 打包到 dist/
npm run lint       # ESLint 检查
npm run format     # Prettier 格式化
npm run test       # Vitest 单元测试
npm run check:sources  # 本地一键图源检测(详见下文)
npm run release minor  # 版本号 +1(详见下文「发版」)
```

### 发版

版本号出现在 `package.json` 和插件清单 `public/plugin.json` 两处,用脚本一次性同步更新,
并在 `CHANGELOG.md` 顶部插入对应版本的小节(发布内容自己补):

```bash
npm run release            # 默认 patch:1.0.0 -> 1.0.1
npm run release minor      # 1.0.0 -> 1.1.0
npm run release major      # 1.0.0 -> 2.0.0
npm run release -- 1.2.3   # 直接指定版本号
bash nier/shell/bump-version.sh patch --commit   # 更新后自动 git commit + 打 vX.Y.Z 标签
bash nier/shell/bump-version.sh --dry-run        # 只预览,不改文件
```

工程约定:

- **全量 TypeScript strict 模式**,业务代码与组件均为 `.ts` / `<script setup lang="ts">`;
- **ESLint(flat config) + Prettier** 负责代码质量与格式,提交前跑 `npm run lint`;
- `vue` API(`ref`/`computed` 等)由 `unplugin-auto-import` 自动导入,
  naive-ui 组件由 `unplugin-vue-components` 按需自动注册,无需手动 import/安装;
- 路径别名 `@` 指向 `src/`;
- 单元测试文件与被测模块同目录,命名为 `*.spec.ts`;
- 推送/PR 时 GitHub Actions 自动执行 lint → 类型检查 → 测试 → 构建。

## 目录结构

```text
src/
├── main.ts                     # 应用入口(naive-ui 组件自动按需注册)
├── App.vue                     # 应用外壳:主题 + 全局消息容器(useMessage 只能在其后代使用)
├── styles/main.css             # 全局样式
├── types/                      # 共享类型 + 自动生成声明(auto-imports.d.ts / components.d.ts)
│   └── emoticon.ts             # Emoticon 业务类型
├── platform/                   # 平台桥接层
│   ├── index.ts                # 全项目唯一触碰平台 API 的地方,同一套代码适配 uTools/ztools
│   └── window.d.ts             # preload 注入到 window 的能力声明
├── utils/
│   └── http.ts                 # 统一 axios 实例(默认超时/拦截器收口)
├── sources/                    # 图源层(策略模式 + 注册表)
│   ├── types.ts                # 图源契约(ImageSource / SourceFetch*)
│   ├── defineSource.ts         # 图源工厂函数(统一标准写法)
│   ├── registry.ts             # 图源注册表:调度/切换/检测的数据源,新增图源只改这里
│   ├── health-check.ts         # 图源检测纯逻辑(插件内与 CLI 共用)
│   ├── sogou.ts 等             # 已上架图源,一个文件一个图源
│   └── offline/                # 已下架/未上架图源(enabled:false,参与检测,复活可一键上架)
├── composables/                # Vue 组合式函数(响应式层)
│   ├── use-emoticons.ts        # 核心调度器:状态机 + 图源调度 + 下载编排 + 分页
│   ├── use-config.ts           # 配置读写(自动迁移老版本中文 label 配置)
│   ├── use-download.ts         # 图片批量下载(分批回调/顺序一致性)
│   ├── use-star-list.ts        # 收藏夹
│   ├── use-settings.ts         # 常用设置
│   ├── use-storage.ts          # dbStorage JSON 封装
│   └── use-source-health-check.ts # 图源检测的响应式封装
├── views/
│   └── HomeView.vue            # 主页面:顶栏 + 表情包列表(渲染在消息容器内)
└── components/                 # UI 组件(按领域分目录)
    ├── emoticon/               # 表情展示:EmoticonList 网格 / EmoticonItem 单项 / EmoticonViewer 大图预览
    ├── source/                 # 图源:SourceSwitcher 切换 / SourceHealthCheck 检测面板
    ├── star/                   # 收藏夹抽屉
    ├── more/                   # 「更多」聚合入口:MoreDrawer / SettingsPanel / AboutPanel
    └── donate/                 # 赞助抽屉

scripts/check-sources.ts        # 本地 CLI 一键图源检测(经 tsx 运行,与插件共享同一套源码)
public/                         # 插件清单 plugin.json / preload / logo
```

## 平台支持

同一套代码同时适配 **uTools** 与 **ztools**：

- 平台 API 在 `src/platform/index.ts` 统一识别(`utools` / `ztools` 全局),preload 同样做了双平台兼容;
- `public/plugin.json` 同时包含两个平台的清单字段(pluginName / name、title 等),关键字两边通用;
- 收藏目录沿用各自平台的历史命名(uTools: `collectedEmoticons`,ztools: `ztoolsCollectedEmoticons`),老用户收藏不受影响。

## 图源检测

不用再逐个切换图源人工确认，两个入口都可以一键检测所有图源(含已下架的)是否还能取到图：

```bash
# 方式一:本地终端直接跑(不依赖插件环境)
npm run check:sources            # 带指定关键字: npm run check:sources -- 猫猫

# 方式二:插件顶栏「更多」→「图源」Tab,手动点击「图源检测」按钮触发
```

进入图源页不会自动发请求,会恢复上次持久化的检测结果(首次为「待检测」占位);检测完成后按状态排序(正常 → 无结果 → 失败)并存储,重新检测前保持不变。
检测会真实请求每个图源的第一页并解析(不下载图片)，报告 状态(正常/无结果/超时/失败)、耗时、图片数。
`无结果` 通常说明站点改版、解析选择器失效;`超时/失败` 说明站点可能挂了。

列表里的开关控制图源是否在顶部展示(至少保留一个,实时生效):已上架、检测正常、或当前已开启的图源都提供开关,由用户决定;已下架且关闭的图源不显示。

## 如何新增一个图源

1. 在 `src/sources/` 下新建 `<id>.ts`，照抄任意现有图源，用 `defineSource({...})` 声明:
   - 必填: `id`(英文唯一标识)、`label`(展示名)、`host`(官网)、`fetchPage({keyword, page, pageSize})`
   - `fetchPage` 只负责「请求 + 解析」，返回 `{links, downloadOptions?, hasMore?, hasLess?}`，不要下载图片
   - 选填: `timeout`(慢图源放宽)、`defaultKeyword`(空关键字兜底)、`note`(备注)
2. 在 `src/sources/registry.ts` 的数组里注册一行

切换器、关于页、一键检测会自动感知新图源，其他代码零改动(开闭原则)。
某图源站点复活时，把 `offline/` 里对应图源的 `enabled: false` 删掉即可重新上架。

## 更新日志

- 2026-09-21

```text
1.工程现代化:升级 Vite 8 / TypeScript 5.9 / vue-tsc 3 / ESLint 10,开启 TS strict 全量检查
2.逻辑层(composables/sources/platform/utils)由 .js + JSDoc 全面迁移为 .ts,图源接口响应补充类型
3.所有组件迁移为 <script setup lang="ts">;naive-ui 组件改由 unplugin-vue-components 按需自动注册
4.vue API 由 unplugin-auto-import 自动导入;新增 @ 路径别名
5.新增 ESLint(flat config) + Prettier + EditorConfig + Vitest 单元测试 + GitHub Actions CI
6.目录按领域重组:页面拆到 views/,组件按 emoticon/source/star/more/donate 分目录并更名
7.修复关于页收款码图片使用 /src 绝对路径导致打包后 404 的问题
8.check:sources 脚本迁移为 TypeScript(经 tsx 运行),与插件共享同一套类型化源码
9.收藏列表 computed 移除副作用,缺失文件补下载统一收敛到收藏夹打开/收藏动作
```

- 2026-09-19

```text
1.架构重构:图源改造为「策略模式+注册表」，新增图源只需加一个文件注册一行
2.拆分职责:图源只负责请求+解析，下载/超时/分页由调度器统一编排
3.新增 一键图源体检(插件内顶栏按钮 + 本地 npm run check:sources 命令)
4.新增 platform 平台桥接层，平台 API 统一收口
5.老配置(中文图源名)自动迁移，无需手动处理
6.修复开发模拟器下平台注入晚于页面脚本导致的启动报错(平台就绪等待机制)
7.修复 useMessage 在消息容器外调用导致的启动报错(App 拆分为外壳+Home)
8.恢复 uTools 平台支持:平台全局双识别(ztools/utools),清单与 preload 双平台兼容
9.修复体检列表状态不刷新的问题
10.修复首次加载时输入框(副输入框)挂载失败:进入/就绪信号时幂等补挂
11.顶栏新增「更多」聚合入口:图源体检/设置/关于 以左侧 Tab 整合，设置独立成页;体检面板检测中全行显示占位状态
12.顶栏改版:新增「打赏」入口,分页改为圆形图标按钮+圆形页码
13.修复收藏图片下载到错误目录导致收藏夹显示破损的问题;preload 下载增加错误处理/超时/并发去重;轮播预览修复首次打开定位到第一张的问题
14.收藏增加平台 1M 存储上限保护:超限拒绝收藏并提示;收藏项存储去掉无消费的冗余字段,容量翻倍
15.默认搜索关键字统一为「表情」(搜索框为空时自动回填);修复图源返回无效链接导致的下载报错
16.「图源体检」Tab 更名「图源」:图源开关移入图源列表(至少保留一个,实时生效);进入不再自动检测,手动触发按钮改为「图源检测」
17.检测正常的图源(含已下架)在图源列表统一显示开关,已下架图源检测正常后可手动启用
18.检测结果持久化:进入图源页恢复上次结果,完成后按状态排序(正常→无结果→失败)并存储,重新检测前不变;已失效但处于开启状态的图源同样显示开关,由用户决定去留;检测正常的图源不再显示「已下架」标记
19.图片列表改纯 CSS 响应式网格:伸缩宽度时多余空间均匀分配到图片间隔与列表左右留白(space-evenly),宽度足够时自动增加每行数量
20.图源列表的图源名称可点击,跳转对应官方主页
21.加载中切换图源/搜索/翻页时,立即中止上一轮在途的 axios 请求(AbortController 信号经 fetchPage 契约透传),迟到的响应与下载批次按序号丢弃,不渲染也不误报失败
22.「打赏」文案全部改为「赞助」;顶栏收藏/更多/赞助按钮字号加大,与图源名称一致
23.顶栏「赞助」与「更多」互换位置,赞助文案前加 💰 图标;轮播左右按钮加大,打开轮播后支持键盘左右方向键切换图片
```

- 2026-04-26

```text
1.第一次发布，从utools移植过来
2.期待ztools能持续更新和升级
```

## 欢迎捐赠

<img src="src/assets/wechat.jpg" width="200" height="300" alt="微信">
<img src="src/assets/alipay.jpg" width="200" height="300" alt="支付宝">
