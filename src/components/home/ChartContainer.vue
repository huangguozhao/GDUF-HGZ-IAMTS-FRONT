<template>
  <div class="chart-container glass-card rounded-xl">
    <div class="chart-header" v-if="title || $slots.header">
      <h3 class="chart-title" v-if="title">{{ title }}</h3>
      <slot name="header"></slot>
    </div>
    <div class="chart-content" :style="{ height: height + 'px' }">
      <div ref="chartRef" class="chart-wrapper"></div>
      <div v-if="loading" class="chart-loading">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>加载中...</span>
      </div>
      <div v-if="error" class="chart-error">
        <el-icon><WarningFilled /></el-icon>
        <span>{{ error }}</span>
      </div>
    </div>
    <div class="chart-footer" v-if="$slots.footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import { Loading, WarningFilled } from '@element-plus/icons-vue'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  height: {
    type: Number,
    default: 300
  },
  options: {
    type: Object,
    default: () => ({})
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  }
})

const chartRef = ref(null)
let chartInstance = null

// 初始化图表
const initChart = async () => {
  if (!chartRef.value) {
    // 如果 ref 还没有准备好，延迟重试
    setTimeout(initChart, 100)
    return
  }
  
  await nextTick()
  
  if (!chartInstance) {
    try {
      chartInstance = echarts.init(chartRef.value)
      
      // 监听窗口大小变化
      window.addEventListener('resize', handleResize)
    } catch (error) {
      console.error('ECharts 初始化失败:', error)
      return
    }
  }
  
  // 设置图表选项
  if (props.options && Object.keys(props.options).length > 0) {
    try {
      chartInstance.setOption(props.options, true)
    } catch (error) {
      console.error('ECharts 设置选项失败:', error)
    }
  }
}

// 处理窗口大小变化
const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

// 监听 options 变化
watch(
  () => props.options,
  (newOptions) => {
    if (!chartInstance) {
      // 如果实例还没初始化，先初始化
      initChart()
      return
    }
    
    if (newOptions && Object.keys(newOptions).length > 0) {
      try {
        chartInstance.setOption(newOptions, true)
      } catch (error) {
        console.error('ECharts 更新选项失败:', error)
      }
    }
  },
  { deep: true, immediate: false }
)

// 监听 loading 状态
watch(
  () => props.loading,
  (isLoading) => {
    if (chartInstance) {
      if (isLoading) {
        chartInstance.showLoading()
      } else {
        chartInstance.hideLoading()
      }
    }
  }
)

onMounted(() => {
  // 延迟初始化，确保 DOM 完全渲染
  setTimeout(() => {
    initChart()
  }, 100)
})

onBeforeUnmount(() => {
  if (chartInstance) {
    window.removeEventListener('resize', handleResize)
    chartInstance.dispose()
    chartInstance = null
  }
})

// 暴露方法供父组件调用
defineExpose({
  getInstance: () => chartInstance,
  resize: handleResize
})
</script>

<style scoped>
.chart-container {
  padding: 24px;
  display: flex;
  flex-direction: column;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.chart-content {
  position: relative;
  width: 100%;
  flex: 1;
}

.chart-wrapper {
  width: 100%;
  height: 100%;
  min-height: 200px;
}

.chart-loading,
.chart-error {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #909399;
  font-size: 14px;
}

.chart-loading .el-icon {
  font-size: 24px;
  color: #1890ff;
}

.chart-error .el-icon {
  font-size: 24px;
  color: #f56c6c;
}

.chart-footer {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(228, 231, 237, 0.5);
}

/* 响应式 */
@media (max-width: 768px) {
  .chart-container {
    padding: 16px;
  }
  
  .chart-title {
    font-size: 16px;
  }
}
</style>

