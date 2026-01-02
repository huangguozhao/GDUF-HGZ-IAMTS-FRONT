<template>
  <div class="metrics-skeleton">
    <div class="metrics-grid">
      <div
        v-for="i in count"
        :key="`metric-${i}`"
        class="metric-skeleton-card"
        :class="{ 'metric-skeleton-card--featured': featured }"
      >
        <!-- 卡片内容 -->
        <div class="metric-skeleton-content">
          <!-- 图标区域 -->
          <div class="metric-skeleton-icon">
            <SkeletonLoader variant="avatar" :width="iconSize" :height="iconSize" circle />
          </div>

          <!-- 文字内容区域 -->
          <div class="metric-skeleton-text">
            <div class="metric-skeleton-title">
              <SkeletonLoader variant="text" :width="titleWidth" />
            </div>
            <div class="metric-skeleton-value">
              <SkeletonLoader variant="text" :width="valueWidth" height="28" />
            </div>
            <div class="metric-skeleton-subtitle">
              <SkeletonLoader variant="text" :width="subtitleWidth" />
            </div>
          </div>
        </div>

        <!-- 图表区域（如果显示） -->
        <div v-if="showChart" class="metric-skeleton-chart">
          <SkeletonLoader variant="chart" />
        </div>

        <!-- 变化趋势区域 -->
        <div class="metric-skeleton-change">
          <SkeletonLoader variant="text" :width="changeWidth" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import SkeletonLoader from '../SkeletonLoader.vue'

const props = defineProps({
  // 指标卡片数量
  count: {
    type: Number,
    default: 4
  },
  // 是否为特色卡片（更大的尺寸）
  featured: {
    type: Boolean,
    default: false
  },
  // 是否显示图表
  showChart: {
    type: Boolean,
    default: false
  },
  // 图标尺寸
  iconSize: {
    type: Number,
    default: 40
  },
  // 标题宽度
  titleWidth: {
    type: Number,
    default: 100
  },
  // 数值宽度
  valueWidth: {
    type: Number,
    default: 80
  },
  // 副标题宽度
  subtitleWidth: {
    type: Number,
    default: 120
  },
  // 变化趋势宽度
  changeWidth: {
    type: Number,
    default: 60
  }
})
</script>

<style scoped>
.metrics-skeleton {
  width: 100%;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  width: 100%;
}

.metric-skeleton-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: all 0.3s ease;
}

.metric-skeleton-card--featured {
  grid-column: span 2;
  padding: 32px;
}

/* 卡片内容 */
.metric-skeleton-content {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.metric-skeleton-icon {
  flex-shrink: 0;
}

.metric-skeleton-text {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.metric-skeleton-title {
  opacity: 0.8;
}

.metric-skeleton-value {
  font-weight: 600;
}

.metric-skeleton-subtitle {
  opacity: 0.7;
  font-size: 14px;
}

/* 图表区域 */
.metric-skeleton-chart {
  margin-top: 8px;
}

.metric-skeleton-chart :deep(.skeleton-item) {
  border-radius: 8px;
}

/* 变化趋势区域 */
.metric-skeleton-change {
  margin-top: 8px;
  opacity: 0.8;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 18px;
  }

  .metric-skeleton-card--featured {
    grid-column: span 1;
    padding: 24px;
  }
}

@media (max-width: 768px) {
  .metrics-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .metric-skeleton-card {
    padding: 20px;
  }

  .metric-skeleton-card--featured {
    padding: 20px;
  }

  .metric-skeleton-content {
    gap: 12px;
  }

  .metric-skeleton-icon {
    display: none; /* 在小屏幕上隐藏图标节省空间 */
  }
}

@media (max-width: 480px) {
  .metrics-grid {
    gap: 12px;
  }

  .metric-skeleton-card {
    padding: 16px;
    border-radius: 8px;
  }

  .metric-skeleton-content {
    gap: 10px;
  }

  .metric-skeleton-text {
    gap: 6px;
  }

  .metric-skeleton-value {
    font-size: 20px;
  }

  .metric-skeleton-subtitle {
    font-size: 13px;
  }
}

/* 动画效果 */
.metric-skeleton-card {
  animation: cardFadeIn 0.6s ease-out both;
}

.metric-skeleton-card:nth-child(1) { animation-delay: 0.1s; }
.metric-skeleton-card:nth-child(2) { animation-delay: 0.2s; }
.metric-skeleton-card:nth-child(3) { animation-delay: 0.3s; }
.metric-skeleton-card:nth-child(4) { animation-delay: 0.4s; }

@keyframes cardFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
