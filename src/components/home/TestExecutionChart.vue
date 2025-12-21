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

// 折线图数据（示例数据，后续可以从API获取）
const lineChartData = computed(() => {
  // 生成最近7天的日期
  const dates = []
  const passed = []
  const failed = []
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const month = date.getMonth() + 1
    const day = date.getDate()
    dates.push(`${month}-${day}`)
    
    // 模拟数据
    passed.push(Math.floor(Math.random() * 50) + 30)
    failed.push(Math.floor(Math.random() * 10) + 2)
  }
  
  return { dates, passed, failed }
})

// 饼图数据（示例数据，后续可以从API获取）
const pieChartData = computed(() => {
  const totalPassed = lineChartData.value.passed.reduce((a, b) => a + b, 0)
  const totalFailed = lineChartData.value.failed.reduce((a, b) => a + b, 0)
  const total = totalPassed + totalFailed
  
  return {
    passed: total > 0 ? Math.round((totalPassed / total) * 100) : 81,
    failed: total > 0 ? Math.round((totalFailed / total) * 100) : 7,
    notExecuted: 12
  }
})

// 摘要文字
const summaryText = computed(() => {
  const passRate = pieChartData.value.passed
  return `本周测试通过率${passRate >= 80 ? '提升' : '为'}${passRate}%,性能表现稳定`
})

// 处理时间范围变化
const handleTimeRangeChange = (value) => {
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
  grid-template-columns: 1.5fr 1fr;
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

