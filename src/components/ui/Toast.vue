<template>
  <teleport to="body">
    <transition-group
      name="toast"
      tag="div"
      class="toast-container"
      :class="{ 'toast-container--stacked': !isExpanded && toasts.length > 1 }"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
    >
      <!-- 堆叠计数指示器 -->
      <div
        v-if="!isExpanded && toasts.length > 4"
        class="toast-stack-counter"
        @mouseenter="handleMouseEnter"
      >
        <span class="counter-text">+{{ toasts.length - 4 }}</span>
      </div>
      <div
        v-for="(toast, index) in toasts"
        :key="toast.id"
        class="toast-item"
        :class="[
          `toast-item--${toast.type}`,
          {
            'toast-item--stacked': !isExpanded && toasts.length > 1 && index > 0 && index < 4
          }
        ]"
        :style="{
          transform: getToastTransform(index),
          opacity: getToastOpacity(index),
          zIndex: getToastZIndex(index)
        }"
        @mouseenter="handleToastMouseEnter(toast.id)"
        @mouseleave="handleToastMouseLeave(toast.id)"
      >
        <div class="toast-content">
          <!-- 图标 -->
          <div class="toast-icon">
            <svg
              v-if="toast.type === 'success'"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <svg
              v-else-if="toast.type === 'error'"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
              <path d="M15 9L9 15M15 15L9 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
            <svg
              v-else-if="toast.type === 'warning'"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 9V11M12 15H12.01M10.29 3.86002L1.82002 18.0001C1.64539 18.3025 1.55299 18.6454 1.55201 18.9946C1.55103 19.3439 1.64151 19.6873 1.81445 19.9906C1.98739 20.2939 2.23675 20.5455 2.54009 20.7185C2.84344 20.8915 3.18691 20.982 3.53622 20.983C3.88553 20.984 4.22901 20.8916 4.53142 20.717L19.6714 12.29C19.9739 12.1154 20.2255 11.866 20.3985 11.5627C20.5715 11.2594 20.662 10.916 20.663 10.5667C20.664 10.2174 20.5716 9.87393 20.397 9.57147L12.14 1.10002C12.0466 0.982726 11.9384 0.883061 11.8208 0.805419C11.7031 0.727777 11.5779 0.673359 11.4518 0.644763C11.3257 0.616167 11.2012 0.613894 11.0743 0.637066C10.9474 0.660238 10.8205 0.708495 10.701 0.779649C10.5815 0.850803 10.4717 0.943696 10.3775 1.05359C10.2833 1.16348 10.2063 1.28844 10.1505 1.42248C10.0947 1.55652 10.0611 1.69743 10.0514 1.84047C10.0417 1.98351 10.0561 2.12658 10.094 2.26565L12 9Z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <svg
              v-else-if="toast.type === 'info'"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
              <path d="M12 16V12M12 8H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
          </div>

          <!-- 文本内容 -->
          <div class="toast-text">
            <div class="toast-title" v-if="toast.title">{{ toast.title }}</div>
            <div class="toast-message">{{ toast.message }}</div>
          </div>

          <!-- 关闭按钮 -->
          <button
            class="toast-close"
            @click="removeToast(toast.id)"
            v-if="toast.showClose"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
          </button>
        </div>

        <!-- 进度条 -->
        <div
          class="toast-progress"
          v-if="toast.showProgress"
          :style="{ width: progressWidth(toast) }"
        ></div>
      </div>
    </transition-group>
  </teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// Toast配置接口（使用JSDoc注释）
/**
 * @typedef {Object} ToastOptions
 * @property {string} [id] - Toast唯一标识
 * @property {'success'|'error'|'warning'|'info'} [type] - Toast类型
 * @property {string} [title] - Toast标题
 * @property {string} message - Toast消息内容
 * @property {number} [duration] - 显示时长（毫秒）
 * @property {boolean} [showClose] - 是否显示关闭按钮
 * @property {boolean} [showProgress] - 是否显示进度条
 * @property {'top-right'|'top-left'|'bottom-right'|'bottom-left'|'top-center'} [position] - 位置
 */

const toasts = ref([])
const isExpanded = ref(false)
const isHovered = ref(false)
let toastCounter = 0

const addToast = (options) => {
  const id = options.id || `toast-${++toastCounter}`
  const toast = {
    id,
    type: 'info',
    duration: 3000,
    showClose: true,
    showProgress: true,
    position: 'top-right',
    startTime: Date.now(),
    ...options
  }

  toasts.value.push(toast)

  // 自动移除
  if (toast.duration > 0) {
    setTimeout(() => {
      removeToast(id)
    }, toast.duration)
  }

  return id
}

const removeToast = (id) => {
  const index = toasts.value.findIndex(toast => toast.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}

const pauseTimer = (id) => {
  // 可以在这里暂停计时器
}

const resumeTimer = (id) => {
  // 可以在这里恢复计时器
}

const progressWidth = (toast) => {
  if (!toast.showProgress || toast.duration <= 0) return '0%'

  const elapsed = Date.now() - toast.startTime
  const remaining = Math.max(0, toast.duration - elapsed)
  const percentage = (remaining / toast.duration) * 100

  return `${percentage}%`
}

const handleMouseEnter = () => {
  if (toasts.value.length > 1) {
    isExpanded.value = true
    isHovered.value = true
  }
}

const handleMouseLeave = () => {
  isHovered.value = false
  // 延迟收起，让用户有时间移动到其他Toast上
  setTimeout(() => {
    if (!isHovered.value) {
      isExpanded.value = false
    }
  }, 300)
}

const handleToastMouseEnter = (toastId) => {
  pauseTimer(toastId)
  isHovered.value = true
  if (toasts.value.length > 1) {
    isExpanded.value = true
  }
}

const handleToastMouseLeave = (toastId) => {
  resumeTimer(toastId)
}

const getToastTransform = (index) => {
  if (isExpanded.value) {
    // 展开状态：垂直排列，每个Toast间隔68px
    return `translateY(${index * 68}px)`
  } else if (toasts.value.length > 1) {
    // 堆叠状态：像扑克牌一样堆叠
    if (index === 0) {
      // 第一个Toast（最上面的）
      return 'translateY(0) rotate(0deg)'
    } else if (index < 4) {
      // 前4个Toast创建堆叠效果
      const offsetY = (index - 1) * 6 // 垂直偏移
      const offsetX = (index - 1) * 4 // 水平偏移，创建层次感
      const rotation = (index - 1) * 2 // 轻微旋转
      return `translate(${offsetX}px, ${offsetY}px) rotate(${rotation}deg)`
    } else {
      // 隐藏超过4个的Toast，但显示在堆叠中
      return `translate(12px, 18px) rotate(6deg) scale(0.9)`
    }
  }
  return 'translateY(0)'
}

const getToastOpacity = (index) => {
  if (isExpanded.value) {
    return 1
  } else if (toasts.value.length > 1) {
    // 在堆叠状态下，只有前4个Toast可见
    return index < 4 ? 1 : 0
  }
  return 1
}

const getToastZIndex = (index) => {
  return toasts.value.length - index
}


// 清理函数
const clearAll = () => {
  toasts.value = []
}

// 导出方法供外部使用
defineExpose({
  add: addToast,
  remove: removeToast,
  clear: clearAll,
  success: (message, options = {}) =>
    addToast({ ...options, type: 'success', message }),
  error: (message, options = {}) =>
    addToast({ ...options, type: 'error', message }),
  warning: (message, options = {}) =>
    addToast({ ...options, type: 'warning', message }),
  info: (message, options = {}) =>
    addToast({ ...options, type: 'info', message })
})
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  pointer-events: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-container--stacked {
  /* 堆叠状态的样式 */
}

.toast-item {
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  min-width: 300px;
  max-width: 500px;
  margin-bottom: 12px;
  border-radius: 12px;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.08),
    0 2px 8px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  overflow: hidden;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: top right;
}

.toast-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
}

.toast-item {
  transform: translateX(100%);
  animation: slideIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  transition: all 0.2s ease;
  position: relative;
}

.toast-item:hover {
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.12),
    0 4px 16px rgba(0, 0, 0, 0.06),
    0 0 0 2px rgba(255, 255, 255, 0.15);
  transform: scale(1.02) !important;
}

/* 堆叠状态的特殊样式 */
.toast-item--stacked {
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.1),
    0 1px 3px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.toast-item--stacked:hover {
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.15),
    0 2px 8px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.1);
}

.toast-item--success {
  background: linear-gradient(135deg, rgba(67, 192, 58, 0.85), rgba(67, 192, 58, 0.75));
  color: white;
  border-left: 4px solid rgba(67, 192, 58, 0.95);
}

.toast-item--error {
  background: linear-gradient(135deg, rgba(245, 108, 108, 0.85), rgba(245, 108, 108, 0.75));
  color: white;
  border-left: 4px solid rgba(245, 108, 108, 0.95);
}

.toast-item--warning {
  background: linear-gradient(135deg, rgba(230, 162, 60, 0.85), rgba(230, 162, 60, 0.75));
  color: white;
  border-left: 4px solid rgba(230, 162, 60, 0.95);
}

.toast-item--info {
  background: linear-gradient(135deg, rgba(24, 144, 255, 0.85), rgba(24, 144, 255, 0.75));
  color: white;
  border-left: 4px solid rgba(24, 144, 255, 0.95);
}

.toast-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 20px;
  position: relative;
}

.toast-icon {
  flex-shrink: 0;
  margin-top: 1px;
  opacity: 0.9;
}

.toast-text {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
  letter-spacing: -0.01em;
  opacity: 0.95;
}

.toast-message {
  font-size: 14px;
  line-height: 1.4;
  word-wrap: break-word;
  opacity: 0.9;
  font-weight: 400;
}

.toast-close {
  flex-shrink: 0;
  background: none;
  border: none;
  color: currentColor;
  cursor: pointer;
  padding: 4px;
  opacity: 0.6;
  transition: all 0.2s ease;
  border-radius: 4px;
  margin: -4px;
}

.toast-close:hover {
  opacity: 0.9;
  background: rgba(255, 255, 255, 0.1);
}

.toast-progress {
  height: 3px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 0 0 12px 12px;
  transition: width 0.1s linear;
  position: relative;
  overflow: hidden;
}

.toast-progress::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: progressShimmer 2s ease-in-out infinite;
}

@keyframes progressShimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* 动画 */
@keyframes slideIn {
  from {
    transform: translateX(100%) scale(0.95);
    opacity: 0;
  }
  to {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
}

.toast-enter-active {
  animation: slideIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.toast-leave-active {
  animation: slideOut 0.3s cubic-bezier(0.55, 0.06, 0.68, 0.19);
}

@keyframes slideOut {
  from {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
  to {
    transform: translateX(100%) scale(0.95);
    opacity: 0;
  }
}

/* 堆叠计数器 */
.toast-stack-counter {
  position: absolute;
  top: 48px;
  right: 16px;
  width: 60px;
  height: 32px;
  background: rgba(24, 144, 255, 0.9);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 16px 16px 16px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
  z-index: 10001;
  transform: translateY(0);
}

.toast-stack-counter:hover {
  background: rgba(24, 144, 255, 1);
  transform: translateY(6px) scale(1.05);
  box-shadow: 0 6px 16px rgba(24, 144, 255, 0.4);
}

.counter-text {
  color: white;
  font-size: 12px;
  font-weight: 700;
  opacity: 1;
}

/* 响应式 */
@media (max-width: 768px) {
  .toast-container {
    top: 20px;
    right: 16px;
    left: 16px;
    width: auto;
  }

  .toast-item {
    min-width: auto;
    max-width: none;
    margin-bottom: 10px;
    border-radius: 10px;
  }

  .toast-item:hover {
    transform: translateX(0) scale(1.01);
  }

  .toast-content {
    padding: 14px 16px;
    gap: 10px;
  }

  .toast-title {
    font-size: 13px;
    font-weight: 500;
  }

  .toast-message {
    font-size: 13px;
    line-height: 1.5;
  }

  .toast-close {
    padding: 3px;
    margin: -3px;
  }
}

@media (max-width: 480px) {
  .toast-container {
    top: 16px;
    right: 12px;
    left: 12px;
  }

  .toast-item {
    margin-bottom: 8px;
    border-radius: 8px;
  }

  .toast-content {
    padding: 12px 14px;
    gap: 8px;
  }

  .toast-title {
    font-size: 12px;
    margin-bottom: 3px;
  }

  .toast-message {
    font-size: 12px;
  }
}
</style>
