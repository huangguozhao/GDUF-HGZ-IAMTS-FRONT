<template>
  <teleport to="body">
    <transition-group name="toast" tag="div" class="toast-container">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast-item"
        :class="`toast-item--${toast.type}`"
        @mouseenter="pauseTimer(toast.id)"
        @mouseleave="resumeTimer(toast.id)"
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

// Toast配置接口
export interface ToastOptions {
  id?: string
  type?: 'success' | 'error' | 'warning' | 'info'
  title?: string
  message: string
  duration?: number
  showClose?: boolean
  showProgress?: boolean
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center'
}

const toasts = ref<Array<ToastOptions & { id: string; startTime: number }>>([])
let toastCounter = 0

const addToast = (options: ToastOptions) => {
  const id = options.id || `toast-${++toastCounter}`
  const toast = {
    id,
    type: 'info' as const,
    duration: 3000,
    showClose: true,
    showProgress: true,
    position: 'top-right' as const,
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

const removeToast = (id: string) => {
  const index = toasts.value.findIndex(toast => toast.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}

const pauseTimer = (id: string) => {
  // 可以在这里暂停计时器
}

const resumeTimer = (id: string) => {
  // 可以在这里恢复计时器
}

const progressWidth = (toast: any) => {
  if (!toast.showProgress || toast.duration <= 0) return '0%'

  const elapsed = Date.now() - toast.startTime
  const remaining = Math.max(0, toast.duration - elapsed)
  const percentage = (remaining / toast.duration) * 100

  return `${percentage}%`
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
  success: (message: string, options?: Partial<ToastOptions>) =>
    addToast({ ...options, type: 'success', message }),
  error: (message: string, options?: Partial<ToastOptions>) =>
    addToast({ ...options, type: 'error', message }),
  warning: (message: string, options?: Partial<ToastOptions>) =>
    addToast({ ...options, type: 'warning', message }),
  info: (message: string, options?: Partial<ToastOptions>) =>
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
}

.toast-item {
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  min-width: 300px;
  max-width: 500px;
  margin-bottom: 12px;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  transform: translateX(100%);
  animation: slideIn 0.3s ease-out forwards;
}

.toast-item--success {
  background: rgba(67, 192, 58, 0.95);
  color: white;
}

.toast-item--error {
  background: rgba(245, 108, 108, 0.95);
  color: white;
}

.toast-item--warning {
  background: rgba(230, 162, 60, 0.95);
  color: white;
}

.toast-item--info {
  background: rgba(24, 144, 255, 0.95);
  color: white;
}

.toast-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
}

.toast-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.toast-text {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
}

.toast-message {
  font-size: 14px;
  line-height: 1.4;
  word-wrap: break-word;
}

.toast-close {
  flex-shrink: 0;
  background: none;
  border: none;
  color: currentColor;
  cursor: pointer;
  padding: 2px;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.toast-close:hover {
  opacity: 1;
}

.toast-progress {
  height: 3px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 0 0 8px 8px;
  transition: width 0.1s linear;
}

/* 动画 */
@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.toast-enter-active {
  animation: slideIn 0.3s ease-out;
}

.toast-leave-active {
  animation: slideOut 0.3s ease-in;
}

@keyframes slideOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

/* 响应式 */
@media (max-width: 768px) {
  .toast-container {
    top: 16px;
    right: 16px;
    left: 16px;
    width: auto;
  }

  .toast-item {
    min-width: auto;
    max-width: none;
    margin-bottom: 8px;
  }

  .toast-content {
    padding: 12px;
    gap: 10px;
  }

  .toast-title {
    font-size: 13px;
  }

  .toast-message {
    font-size: 13px;
  }
}
</style>
