<template>
  <Teleport to="body">
    <transition name="loading-overlay" appear>
      <div v-if="visible" class="loading-overlay" :class="{ 'loading-overlay--full': fullScreen }">
        <!-- 毛玻璃背景层 -->
        <div class="loading-backdrop"></div>

        <!-- 内容层 -->
        <div class="loading-content glass-card">
          <!-- 图标区域 -->
          <div class="loading-icon-section">
            <div class="loading-icon">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle
                  cx="32"
                  cy="32"
                  r="24"
                  stroke="url(#iconGradient)"
                  stroke-width="3"
                  fill="none"
                  class="loading-circle"
                />
                <path
                  d="M20 28 L30 38 L44 20"
                  stroke="url(#checkGradient)"
                  stroke-width="2.5"
                  fill="none"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="loading-check"
                />
                <defs>
                  <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#1890ff" />
                    <stop offset="100%" stop-color="#40a9ff" />
                  </linearGradient>
                  <linearGradient id="checkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#67c23a" />
                    <stop offset="100%" stop-color="#95d475" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          <!-- 文字内容 -->
          <div class="loading-text-section">
            <h2 class="loading-title">{{ title }}</h2>
            <p class="loading-subtitle">{{ subtitle }}</p>

            <!-- 进度条 -->
            <div class="loading-progress">
              <div class="progress-container">
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    :style="{ width: progress + '%' }"
                  ></div>
                </div>
                <div class="progress-percentage">{{ Math.round(progress) }}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '欢迎回来'
  },
  subtitle: {
    type: String,
    default: '正在为您准备系统...'
  },
  fullScreen: {
    type: Boolean,
    default: true
  },
  autoProgress: {
    type: Boolean,
    default: true
  },
  duration: {
    type: Number,
    default: 3000 // 3秒
  }
})

const emit = defineEmits(['complete', 'progress-update'])

const progress = ref(0)
let progressInterval = null
let startTime = null

const startProgress = () => {
  if (!props.autoProgress) return

  startTime = Date.now()
  progress.value = 0

  progressInterval = setInterval(() => {
    const elapsed = Date.now() - startTime
    const percentage = (elapsed / props.duration) * 100

    if (percentage >= 100) {
      progress.value = 100
      clearInterval(progressInterval)
      setTimeout(() => {
        emit('complete')
      }, 300)
    } else {
      // 使用缓动函数使进度更自然
      const easedProgress = easeInOutCubic(percentage / 100) * 100
      progress.value = Math.min(easedProgress, 95) // 预留5%给完成动画
    }

    emit('progress-update', progress.value)
  }, 50)
}

const easeInOutCubic = (t) => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

const stopProgress = () => {
  if (progressInterval) {
    clearInterval(progressInterval)
    progressInterval = null
  }
}

const completeProgress = () => {
  progress.value = 100
  stopProgress()
  setTimeout(() => {
    emit('complete')
  }, 300)
}

// 监听visible变化
watch(() => props.visible, (newVisible) => {
  if (newVisible) {
    startProgress()
  } else {
    stopProgress()
  }
})

onMounted(() => {
  if (props.visible && props.autoProgress) {
    startProgress()
  }
})

onUnmounted(() => {
  stopProgress()
})

// 暴露方法给父组件
defineExpose({
  completeProgress,
  setProgress: (value) => {
    progress.value = Math.min(Math.max(value, 0), 100)
  }
})
</script>

<style scoped>
/* 覆盖层基础样式 - 统一项目毛玻璃风格 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.loading-overlay--full {
  /* 保持一致的毛玻璃背景 */
}

/* 进入/离开动画 */
.loading-overlay-enter-active,
.loading-overlay-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.loading-overlay-enter-from {
  opacity: 0;
  backdrop-filter: blur(0px);
  -webkit-backdrop-filter: blur(0px);
}

.loading-overlay-leave-to {
  opacity: 0;
  backdrop-filter: blur(0px);
  -webkit-backdrop-filter: blur(0px);
}

/* 毛玻璃背景层 */
.loading-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 30% 20%, rgba(24, 144, 255, 0.03) 0%, transparent 50%),
              radial-gradient(circle at 70% 80%, rgba(24, 144, 255, 0.02) 0%, transparent 50%);
  animation: backdropPulse 4s ease-in-out infinite;
}

@keyframes backdropPulse {
  0%, 100% {
    opacity: 0.8;
  }
  50% {
    opacity: 1;
  }
}

/* 内容层 - 使用项目统一的毛玻璃卡片样式 */
.loading-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 420px;
  padding: 48px;
  border-radius: 40px;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow:
    0 40px 50px -32px rgba(0, 0, 0, 0.05),
    inset 0 0 20px rgba(255, 255, 255, 0.25);
  animation: contentSlideIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) both;
}

@keyframes contentSlideIn {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 图标区域 */
.loading-icon-section {
  margin-bottom: 32px;
}

.loading-icon {
  position: relative;
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow:
    0 8px 24px rgba(24, 144, 255, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  animation: iconBounce 2.5s ease-in-out infinite;
}

@keyframes iconBounce {
  0%, 100% {
    transform: translateY(0px) scale(1);
  }
  50% {
    transform: translateY(-6px) scale(1.05);
  }
}

.loading-circle {
  stroke-dasharray: 150.8;
  stroke-dashoffset: 150.8;
  animation: circleDraw 2s ease-in-out forwards;
  animation-delay: 0.3s;
}

@keyframes circleDraw {
  to {
    stroke-dashoffset: 0;
  }
}

.loading-check {
  stroke-dasharray: 40;
  stroke-dashoffset: 40;
  animation: checkDraw 0.6s ease-in-out forwards;
  animation-delay: 2s;
}

@keyframes checkDraw {
  to {
    stroke-dashoffset: 0;
  }
}

/* 文字内容区域 */
.loading-text-section {
  margin-bottom: 32px;
}

.loading-title {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
  animation: titleFadeIn 0.5s ease-out 0.4s both;
}

@keyframes titleFadeIn {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.loading-subtitle {
  font-size: 16px;
  color: #606266;
  margin: 0;
  font-weight: 400;
  animation: subtitleFadeIn 0.5s ease-out 0.6s both;
}

@keyframes subtitleFadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 进度条区域 */
.loading-progress {
  width: 100%;
  animation: progressFadeIn 0.5s ease-out 0.8s both;
}

@keyframes progressFadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.progress-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(228, 231, 237, 0.5);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #1890ff 0%, #40a9ff 50%, #66b1ff 100%);
  border-radius: 4px;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  box-shadow: 0 0 10px rgba(24, 144, 255, 0.3);
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%);
  animation: progressShine 2s ease-in-out infinite;
}

@keyframes progressShine {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.progress-percentage {
  font-size: 14px;
  color: #909399;
  font-weight: 500;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

/* 悬停效果 */
.loading-content:hover .loading-icon {
  transform: translateY(-2px);
  box-shadow:
    0 12px 32px rgba(24, 144, 255, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.7);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .loading-content {
    max-width: 360px;
    padding: 40px 32px;
  }

  .loading-icon {
    width: 80px;
    height: 80px;
  }

  .loading-icon svg {
    width: 48px;
    height: 48px;
  }

  .loading-title {
    font-size: 24px;
  }

  .loading-subtitle {
    font-size: 15px;
  }

  .loading-icon-section {
    margin-bottom: 28px;
  }

  .loading-text-section {
    margin-bottom: 28px;
  }
}

@media (max-width: 480px) {
  .loading-content {
    max-width: 320px;
    padding: 32px 24px;
    border-radius: 32px;
  }

  .loading-icon {
    width: 72px;
    height: 72px;
  }

  .loading-icon svg {
    width: 40px;
    height: 40px;
  }

  .loading-title {
    font-size: 20px;
  }

  .loading-subtitle {
    font-size: 14px;
  }

  .loading-icon-section {
    margin-bottom: 24px;
  }

  .loading-text-section {
    margin-bottom: 24px;
  }

  .progress-bar {
    height: 6px;
  }
}
</style>
