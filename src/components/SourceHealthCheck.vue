<template>
  <div class="health-check-panel">
    <n-space justify="start" align="center" size="large">
      <n-button size="small" type="primary" :loading="checking" @click="runCheck">
        {{ checking ? "检测中..." : "图源检测" }}
      </n-button>
      <n-text depth="3" style="font-size: 12px">
        真实请求各图源第一页并解析(不下载图片),已下架图源也会检测,可用于判断站点死活
      </n-text>
    </n-space>

    <n-data-table size="small" :columns="columns" :data="results" :row-key="(row) => row.id"/>
  </div>
</template>

<script>
import {h, onMounted, ref} from "vue";
import {NButton, NSwitch, NSpin, NTag, NText, useMessage} from "naive-ui";
import useSourceHealthCheck from "../composables/useSourceHealthCheck.js";
import {HealthStatus} from "../sources/healthCheck.js";
import {imageSources} from "../sources/registry.js";
import {fetchSourceSettings, isSourceEffective, saveSourceSettings} from "../composables/useConfig.js";
import {openLink} from "../platform/index.js";

/** 检测状态 → 展示文案/颜色 */
const STATUS_META = {
  [HealthStatus.IDLE]: {label: "待检测", type: "default"},
  [HealthStatus.PENDING]: {label: "检测中", type: "default"},
  [HealthStatus.OK]: {label: "正常", type: "success"},
  [HealthStatus.EMPTY]: {label: "无结果", type: "warning"},
  [HealthStatus.TIMEOUT]: {label: "超时", type: "error"},
  [HealthStatus.FAIL]: {label: "失败", type: "error"},
};

export default {
  name: "SourceHealthCheck",
  setup() {
    const message = useMessage()
    const {checking, results, initResults, checkAll} = useSourceHealthCheck()

    /** 图源开关是否打开(已上架默认开启,已下架默认关闭) */
    const isEnabled = (row) => isSourceEffective(row, fetchSourceSettings());

    /** 切换某个图源开关(至少保留一个生效图源) */
    const toggleSource = (row, on) => {
      const next = {...fetchSourceSettings(), [row.id]: on};
      if (!on && imageSources.filter(s => isSourceEffective(s, next)).length === 0) {
        message.warning("至少保留一个图源");
        return;
      }
      saveSourceSettings(next);
    };

    const columns = [
      {
        title: "图源",
        key: "label",
        width: 150,
        render(row) {
          return h("span", [
            // 图源名称可点击,跳转官方主页
            h(NButton, {
              text: true, size: "tiny", focusable: false, title: "打开官网",
              onClick: () => openLink(row.host),
            }, {default: () => row.label}),
            // 下架的图源单独标记;检测正常(站点复活)后不再标记
            (!row.enabled && row.status !== HealthStatus.OK) ? h(NTag, {size: "tiny", type: "info", round: true, style: "margin-left: 6px"}, {default: () => "已下架"}) : null,
            // 补充说明(如 VIP 限制)
            h(NText, {depth: 3, style: "margin-left: 6px; font-size: 12px"}, {default: () => row.note ?? ""}),
          ])
        }
      },
      {
        title: "状态",
        key: "status",
        width: 70,
        render(row) {
          // 检测中的行:仅显示转圈占位
          if (row.status === HealthStatus.PENDING) {
            return h(NSpin, {size: "small"});
          }
          const meta = STATUS_META[row.status] ?? STATUS_META[HealthStatus.IDLE]
          return h(NTag, {size: "small", type: meta.type}, {default: () => meta.label})
        }
      },
      {
        title: "耗时",
        key: "durationMs",
        width: 60,
        render: (row) => row.durationMs != null ? `${(row.durationMs / 1000).toFixed(1)}s` : "-"
      },
      {
        title: "说明",
        key: "detail",
        width: 190,
        render(row) {
          if (row.error) {
            return h(NText, {type: "error", style: "font-size: 12px; word-break: break-all"}, {default: () => row.error})
          }
          // 官网链接过长时省略号截断(完整地址见 title 提示),保证表格能收缩进窄窗口
          return h("div", {style: "overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"}, [
            h(NButton, {
              text: true, size: "tiny", focusable: false, title: row.host,
              onClick: () => openLink(row.host),
            }, {default: () => row.host})
          ])
        }
      },
      {
        title: "开关",
        key: "switch",
        width: 55,
        render(row) {
          // 开关交给用户决定:已上架、检测正常,或当前已启用的图源都显示;
          // 只有「已下架 + 当前未启用 + 检测非正常」的行不显示(死站没有开启的理由)
          if (!row.enabled && row.status !== HealthStatus.OK && !isSourceEffective(row)) {
            return null;
          }
          return h(NSwitch, {
            size: "small",
            value: isEnabled(row),
            onUpdateValue: (v) => toggleSource(row, v),
          });
        }
      },
    ]

    const runCheck = async () => {
      await checkAll()
      const okCount = results.value.filter(row => row.status === HealthStatus.OK).length
      const badCount = results.value.length - okCount
      message.success(`检测完成: ${okCount} 正常, ${badCount} 异常`)
    }

    // 进入页面恢复上次持久化的检测结果并保持排序,不自动发请求,需要时手动点「图源检测」
    onMounted(() => {
      initResults()
    })

    return {
      checking,
      results,
      columns,
      runCheck,
    }
  }
}
</script>

<style scoped>
.health-check-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
