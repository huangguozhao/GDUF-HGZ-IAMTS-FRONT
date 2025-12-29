<template>
  <div class="skeleton-loader" :class="loaderClass">
    <div
      v-for="item in items"
      :key="item"
      class="skeleton-item"
      :class="`skeleton-item--${variant}`"
      :style="skeletonStyle"
    >
      <div class="skeleton-shimmer"></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // 骨架屏类型: card, text, avatar, button, chart
  variant: {
    type: String,
    default: 'card',
    validator: (value) => ['card', 'text', 'avatar', 'button', 'chart', 'metric'].includes(value)
  },
  // 项目数量
  count: {
    type: Number,
    default: 1
  },
  // 自定义宽度
  width: {
    type: [String, Number],
    default: null
  },
  // 自定义高度
  height: {
    type: [String, Number],
    default: null
  },
  // 是否为圆形
  circle: {
    type: Boolean,
    default: false
  },
  // 动画类型: pulse, wave, none
  animation: {
    type: String,
    default: 'pulse',
    validator: (value) => ['pulse', 'wave', 'none'].includes(value)
  }
})

const items = computed(() => Array.from({ length: props.count }, (_, i) => i))

const loaderClass = computed(() => {
  return {
    [`skeleton-loader--${props.variant}`]: true,
    [`skeleton-loader--${props.animation}`]: props.animation !== 'none'
  }
})

const skeletonStyle = computed(() => {
  const style = {}

  if (props.width) {
    style.width = typeof props.width === 'number' ? `${props.width}px` : props.width
  }

  if (props.height) {
    style.height = typeof props.height === 'number' ? `${props.height}px` : props.height
  }

  if (props.circle) {
    style.borderRadius = '50%'
  }

  return style
})
</script>

<style scoped>
.skeleton-loader {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.skeleton-item {
  position: relative;
  overflow: hidden;
  background: #f5f5f5;
  border-radius: 4px;
}

/* 不同类型骨架屏的默认样式 */
.skeleton-item--card {
  height: 120px;
  border-radius: 8px;
}

.skeleton-item--text {
  height: 16px;
  margin-bottom: 8px;
}

.skeleton-item--text:nth-child(1) {
  width: 100%;
}

.skeleton-item--text:nth-child(2) {
  width: 80%;
}

.skeleton-item--text:nth-child(3) {
  width: 60%;
}

.skeleton-item--avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.skeleton-item--button {
  height: 36px;
  border-radius: 6px;
}

.skeleton-item--chart {
  height: 200px;
  border-radius: 8px;
}

.skeleton-item--metric {
  height: 80px;
  border-radius: 8px;
}

/* 骨架屏动画 */
.skeleton-shimmer {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.6),
    transparent
  );
}

/* Pulse动画 */
.skeleton-loader--pulse .skeleton-item {
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

@keyframes skeleton-pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}

/* Wave动画 */
.skeleton-loader--wave .skeleton-shimmer {
  animation: skeleton-wave 1.5s ease-in-out infinite;
}

@keyframes skeleton-wave {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .skeleton-loader {
    gap: 12px;
  }

  .skeleton-item--card {
    height: 100px;
  }

  .skeleton-item--chart {
    height: 150px;
  }
}
</style>
