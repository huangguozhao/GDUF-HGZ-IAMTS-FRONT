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
          :loading="chartLoading || loading"
          :error="chartError || error"
        />
      </div>

      <div class="pie-chart-section">
        <TestResultPieChart
          :data="pieChartData"
          :height="250"
          :loading="chartLoading || loading"
          :error="chartError || error"
        />
      </div>
    </div>

    <div class="chart-summary">
      <p class="summary-text">{{ summaryText }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import TestExecutionLineChart from './TestExecutionLineChart.vue'
import TestResultPieChart from './TestResultPieChart.vue'
import { getTestStatistics } from '@/api/home'

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
const chartLoading = ref(false)
const chartError = ref('')
const statisticsData = ref(null)

// 时间范围映射
const timeRangeMap = {
  '7days': '7d',
  '30days': '30d'
}

// 获取图表数据
const fetchChartData = async () => {
  chartLoading.value = true
  chartError.value = ''
  try {
    const response = await getTestStatistics({
      timeRange: timeRangeMap[selectedTimeRange.value] || '7d',
      groupBy: 'day',
      includeTrend: true,
      includeComparison: true
    })

    console.log('TestExecutionChart - API Response:', response)
    console.log('TestExecutionChart - Response data:', response.data)
    
    // 后端返回格式: { code: 1, msg: "success", data: { trend_data: [...] } }
    // 需要从 response.data 中获取实际的统计数据
    const statsData = response.data?.data || response.data
    console.log('TestExecutionChart - Stats data:', statsData)
    console.log('TestExecutionChart - Trend data:', statsData?.trend_data)

    if (statsData && statsData.trend_data) {
      statisticsData.value = statsData
    }
  } catch (error) {
    console.error('获取测试统计失败:', error)
    chartError.value = '加载数据失败'
  } finally {
    chartLoading.value = false
  }
}

// 监听时间范围变化
watch(() => props.timeRange, (newVal) => {
  selectedTimeRange.value = newVal
})

// 监听时间范围变化，重新获取数据
watch(selectedTimeRange, (newVal) => {
  fetchChartData()
  emit('time-range-change', newVal)
})

// 组件挂载时获取数据
onMounted(() => {
  fetchChartData()
})

// 生成日期标签的辅助函数
const generateDateLabels = (days) => {
  const labels = []
  const today = new Date()

  // 无论7天还是30天，都显示完整的天数
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const month = date.getMonth() + 1
    const day = date.getDate()
    labels.push(`${month}-${day}`)
  }

  return labels
}

// 补齐缺失的日期数据
const fillMissingData = (trendData, days) => {
  // 生成完整的日期标签
  const fullLabels = generateDateLabels(days)

  // 创建日期到数据的映射
  const dataMap = new Map()
  trendData.forEach(item => {
    const label = item.label || item.timePeriod

    // 处理后端返回的日期格式（可能是 02-27 或 2026-02-27）
    let datePart = label
    if (label.includes('-')) {
      const parts = label.split('-')
      if (parts.length === 2) {
        // 格式为 mm-dd 或 mm-dd
        datePart = `${parseInt(parts[0])}-${parseInt(parts[1])}`
      } else if (parts.length === 3) {
        // 格式为 yyyy-mm-dd
        datePart = `${parseInt(parts[1])}-${parseInt(parts[2])}`
      }
    }

    dataMap.set(datePart, {
      passed: Number(item.passed) || 0,
      failed: (Number(item.failed) || 0) + (Number(item.broken) || 0)
    })
  })

  console.log('TestExecutionChart - Full labels:', fullLabels)
  console.log('TestExecutionChart - Data map:', dataMap)

  // 补齐数据
  const filledPassed = []
  const filledFailed = []

  fullLabels.forEach(label => {
    const data = dataMap.get(label)
    if (data) {
      filledPassed.push(data.passed)
      filledFailed.push(data.failed)
    } else {
      // 没有数据的日期用0填充
      filledPassed.push(0)
      filledFailed.push(0)
    }
  })

  console.log('TestExecutionChart - Filled passed:', filledPassed)
  console.log('TestExecutionChart - Filled failed:', filledFailed)

  return {
    dates: fullLabels,
    passed: filledPassed,
    failed: filledFailed
  }
}

// 模拟数据 - 最近7天的测试执行数据
const mockLineChartData7Days = {
  dates: generateDateLabels(7),
  passed: [42, 45, 48, 52, 50, 55, 58],
  failed: [5, 4, 6, 3, 5, 4, 3]
}

// 模拟数据 - 最近30天的测试执行数据（显示所有30天）
const generateMock30DaysData = () => {
  const labels = generateDateLabels(30)
  const passed = []
  const failed = []

  for (let i = 0; i < 30; i++) {
    // 模拟一些随机数据，有些天可能为0
    passed.push(Math.floor(Math.random() * 30) + 20)
    failed.push(Math.floor(Math.random() * 5))
  }

  return {
    dates: labels,
    passed,
    failed
  }
}

const mockLineChartData30Days = generateMock30DaysData()

// 折线图数据 - 使用真实API数据
const lineChartData = computed(() => {
  console.log('TestExecutionChart - Computing lineChartData, statisticsData:', statisticsData.value)

  // 根据时间范围确定天数
  const days = selectedTimeRange.value === '30days' ? 30 : 7

  // 如果有真实数据，使用真实数据并进行补齐
  if (statisticsData.value?.trend_data && statisticsData.value.trend_data.length > 0) {
    const trendData = statisticsData.value.trend_data
    console.log('TestExecutionChart - Using real trend data:', trendData)

    // 补齐缺失的日期数据
    return fillMissingData(trendData, days)
  }

  // 否则使用模拟数据
  console.log('TestExecutionChart - Using mock data')
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
    return `本周测试通过率${trend}了${change}%,需要关注`
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

