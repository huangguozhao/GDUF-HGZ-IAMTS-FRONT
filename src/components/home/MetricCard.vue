<template>
  <div class="metric-card enhanced modern-card hover-lift">
    <!-- 卡片头部区域 -->
    <div class="metric-header">
      <div class="metric-title-section">
        <h3 class="metric-title">{{ title }}</h3>
        <div class="metric-trend" :class="changeClass" v-if="change !== null && change !== undefined">
          <span class="trend-icon">{{ getTrendIcon() }}</span>
          <span class="trend-value">{{ change >= 0 ? '+' : '' }}{{ change }}{{ changeUnit }}</span>
        </div>
      </div>
      <div class="metric-icon" v-if="icon">
        <component :is="icon" />
      </div>
    </div>

    <!-- 主要数值区域 -->
    <div class="metric-value-section">
      <div class="metric-value primary">{{ value }}</div>
      <div class="metric-subtitle" v-if="subtitle">{{ subtitle }}</div>
    </div>

    <!-- 图表区域 -->
    <div class="metric-chart" v-if="showChart">
      <slot name="chart"></slot>
    </div>

    <!-- 装饰元素 -->
    <div class="metric-decoration">
      <div class="decoration-line"></div>
      <div class="decoration-dot"></div>
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
  subtitle: {
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

const getTrendIcon = () => {
  if (props.change === null || props.change === undefined) {
    return '→'
  }
  const numChange = typeof props.change === 'string'
    ? parseFloat(props.change.replace(/[^0-9.-]/g, ''))
    : props.change
  return numChange > 0 ? '↗' : numChange < 0 ? '↘' : '→'
}
</script>

<style scoped>
.metric-card {
  padding: 24px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  min-height: 160px;
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 卡片头部 */
.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.metric-title-section {
  flex: 1;
}

.metric-title {
  font-size: 14px;
  color: #909399;
  margin: 0 0 8px 0;
  font-weight: 500;
  letter-spacing: 0.2px;
}

.metric-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.metric-trend.positive {
  color: #67c23a;
  background: rgba(103, 194, 58, 0.1);
}

.metric-trend.negative {
  color: #f56c6c;
  background: rgba(245, 108, 108, 0.1);
}

.metric-trend.neutral {
  color: #909399;
  background: rgba(144, 147, 153, 0.1);
}

.trend-icon {
  font-size: 14px;
  transition: transform 0.2s ease;
}

.metric-trend:hover .trend-icon {
  transform: scale(1.2);
}

.trend-value {
  font-variant-numeric: tabular-nums;
}

/* 图标区域 */
.metric-icon {
  width: 48px;
  height: 48px;
  opacity: 0.08;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.metric-card:hover .metric-icon {
  opacity: 0.15;
  transform: scale(1.05);
}

/* 数值区域 */
.metric-value-section {
  margin-bottom: 16px;
}

.metric-value {
  font-size: 36px;
  font-weight: 700;
  color: #303133;
  line-height: 1.1;
  letter-spacing: -0.5px;
  margin-bottom: 4px;
}

.metric-value.primary {
  background: linear-gradient(135deg, #303133 0%, #606266 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.metric-subtitle {
  font-size: 13px;
  color: #909399;
  font-weight: 400;
  opacity: 0.8;
}

/* 图表区域 */
.metric-chart {
  margin-top: auto;
  height: 40px;
  display: flex;
  align-items: flex-end;
  opacity: 0.8;
}

/* 装饰元素 */
.metric-decoration {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 24px;
}

.decoration-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(24, 144, 255, 0.2) 50%, transparent 100%);
}

.decoration-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(24, 144, 255, 0.3);
  animation: decorationPulse 2s ease-in-out infinite;
}

@keyframes decorationPulse {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.2);
  }
}

/* 悬停效果 */
.metric-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.metric-card:hover .metric-decoration .decoration-line {
  background: linear-gradient(90deg, transparent 0%, rgba(24, 144, 255, 0.4) 50%, transparent 100%);
}

.metric-card:hover .decoration-dot {
  background: rgba(24, 144, 255, 0.5);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .metric-card {
    padding: 20px;
    min-height: 140px;
  }

  .metric-header {
    margin-bottom: 16px;
  }

  .metric-value {
    font-size: 28px;
  }

  .metric-icon {
    width: 40px;
    height: 40px;
  }

  .metric-decoration {
    padding: 0 20px;
  }
}

@media (max-width: 480px) {
  .metric-card {
    padding: 16px;
    min-height: 120px;
  }

  .metric-value {
    font-size: 24px;
  }

  .metric-title {
    font-size: 13px;
  }

  .metric-subtitle {
    font-size: 12px;
  }
}
</style>

