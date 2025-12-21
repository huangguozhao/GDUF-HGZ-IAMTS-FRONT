<template>
  <div class="metric-card modern-card hover-lift">
    <div class="metric-icon" v-if="icon">
      <component :is="icon" />
    </div>
    <div class="metric-content">
      <div class="metric-title">{{ title }}</div>
      <div class="metric-value">{{ value }}</div>
      <div class="metric-change" :class="changeClass">
        <span v-if="change !== null && change !== undefined">
          {{ change >= 0 ? '+' : '' }}{{ change }}{{ changeUnit }}
        </span>
        <span v-else class="no-change">--</span>
      </div>
    </div>
    <div class="metric-chart" v-if="showChart">
      <slot name="chart"></slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  change: {
    type: [String, Number],
    default: null
  },
  changeUnit: {
    type: String,
    default: ''
  },
  icon: {
    type: Object,
    default: null
  },
  showChart: {
    type: Boolean,
    default: false
  }
})

const changeClass = computed(() => {
  if (props.change === null || props.change === undefined) {
    return 'neutral'
  }
  const numChange = typeof props.change === 'string' 
    ? parseFloat(props.change.replace(/[^0-9.-]/g, '')) 
    : props.change
  return numChange > 0 ? 'positive' : numChange < 0 ? 'negative' : 'neutral'
})
</script>

<style scoped>
.metric-card {
  padding: 24px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  min-height: 140px;
}

.metric-icon {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 48px;
  height: 48px;
  opacity: 0.1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.metric-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.metric-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 12px;
  font-weight: 500;
}

.metric-value {
  font-size: 32px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 8px;
  line-height: 1.2;
}

.metric-change {
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}

.metric-change.positive {
  color: #67c23a;
}

.metric-change.negative {
  color: #f56c6c;
}

.metric-change.neutral {
  color: #909399;
}

.metric-change .no-change {
  color: #c0c4cc;
}

.metric-chart {
  margin-top: 12px;
  height: 40px;
  display: flex;
  align-items: flex-end;
}

/* 响应式 */
@media (max-width: 768px) {
  .metric-card {
    padding: 20px;
    min-height: 120px;
  }
  
  .metric-value {
    font-size: 26px;
  }
  
  .metric-icon {
    width: 40px;
    height: 40px;
    top: 16px;
    right: 16px;
  }
}
</style>

