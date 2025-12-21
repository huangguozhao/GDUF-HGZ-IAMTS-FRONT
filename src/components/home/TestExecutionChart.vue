<template>
  <div class="test-execution-chart">
    <div class="chart-header">
      <h3 class="chart-title">近七天测试执行情况</h3>
      <el-select 
        v-model="selectedTimeRange" 
        placeholder="最近7天" 
        size="small"
        class="time-selector"
        @change="handleTimeRangeChange"
      >
        <el-option label="最近7天" value="7days" />
        <el-option label="最近30天" value="30days" />
      </el-select>
    </div>

    <div class="chart-content">
      <div class="line-chart-section">
        <TestExecutionLineChart
          :data="lineChartData"
          :height="250"
          :loading="loading"
          :error="error"
        />
      </div>

      <div class="pie-chart-section">
        <TestResultPieChart
          :data="pieChartData"
          :height="250"
          :loading="loading"
          :error="error"
        />
      </div>
    </div>

    <div class="chart-summary">
      <p class="summary-text">{{ summaryText }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import TestExecutionLineChart from './TestExecutionLineChart.vue'
import TestResultPieChart from './TestResultPieChart.vue'

const props = defineProps({
  timeRange: {
    type: String,
    default: '7days'
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

const emit = defineEmits(['time-range-change'])

const selectedTimeRange = ref(props.timeRange)

// 生成日期标签的辅助函数
const generateDateLabels = (days, is30Days = false) => {
  const labels = []
  const today = new Date()
  
  if (is30Days) {
    // 30天模式：显示关键日期点
    const keyDates = [6, 3, 0, -3, -6, -9, -12]
    keyDates.forEach(offset => {
      const date = new Date(today)
      date.setDate(date.getDate() + offset)
      const month = date.getMonth() + 1
      const day = date.getDate()
      labels.push(`${month}-${day}`)
    })
  } else {
    // 7天模式：显示最近7天
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const month = date.getMonth() + 1
      const day = date.getDate()
      labels.push(`${month}-${day}`)
    }
  }
  
  return labels
}

// 模拟数据 - 最近7天的测试执行数据
const mockLineChartData7Days = {
  dates: generateDateLabels(7),
  passed: [42, 45, 48, 52, 50, 55, 58],
  failed: [5, 4, 6, 3, 5, 4, 3]
}

// 模拟数据 - 最近30天的测试执行数据（显示关键日期点）
const mockLineChartData30Days = {
  dates: generateDateLabels(30, true),
  passed: [38, 40, 43, 45, 50, 55, 58],
  failed: [7, 6, 5, 4, 5, 4, 3]
}

// 折线图数据
const lineChartData = computed(() => {
  if (selectedTimeRange.value === '30days') {
    return mockLineChartData30Days
  }
  return mockLineChartData7Days
})

// 饼图数据（基于最近7天的数据计算）
const pieChartData = computed(() => {
  const data = lineChartData.value
  const totalPassed = data.passed.reduce((a, b) => a + b, 0)
  const totalFailed = data.failed.reduce((a, b) => a + b, 0)
  const total = totalPassed + totalFailed
  
  // 计算百分比
  const passedPercent = total > 0 ? Math.round((totalPassed / total) * 100) : 81
  const failedPercent = total > 0 ? Math.round((totalFailed / total) * 100) : 7
  const notExecutedPercent = 100 - passedPercent - failedPercent
  
  return {
    passed: passedPercent,
    failed: failedPercent,
    notExecuted: notExecutedPercent > 0 ? notExecutedPercent : 12
  }
})

// 摘要文字
const summaryText = computed(() => {
  const passRate = pieChartData.value.passed
  const data = lineChartData.value
  const latestPassed = data.passed[data.passed.length - 1]
  const previousPassed = data.passed[data.passed.length - 2] || latestPassed
  const trend = latestPassed > previousPassed ? '提升' : latestPassed < previousPassed ? '下降' : '保持'
  const change = Math.abs(latestPassed - previousPassed)
  
  if (trend === '提升') {
    return `本周测试通过率${trend}${change}%,性能表现稳定`
  } else if (trend === '下降') {
    return `本周测试通过率${trend}${change}%,需要关注`
  } else {
    return `本周测试通过率${passRate}%,性能表现稳定`
  }
})

// 处理时间范围变化
const handleTimeRangeChange = (value) => {
  selectedTimeRange.value = value
  emit('time-range-change', value)
}
</script>

<style scoped>
.test-execution-chart {
  padding: 24px;
  background: transparent;
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

.time-selector {
  width: 120px;
}

.chart-content {
  display: grid;
  grid-template-columns: 1fr; /* 上下布局：单列，折线图在上，饼图在下 */
  gap: 20px;
  margin-bottom: 16px;
}

.line-chart-section,
.pie-chart-section {
  min-height: 250px;
}

.chart-summary {
  padding-top: 16px;
  border-top: 1px solid rgba(228, 231, 237, 0.5);
}

.summary-text {
  margin: 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  text-align: center;
}

/* 响应式 */
@media (max-width: 1024px) {
  .chart-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .test-execution-chart {
    padding: 16px;
  }
  
  .chart-title {
    font-size: 16px;
  }
  
  .chart-content {
    gap: 16px;
  }
}
</style>

