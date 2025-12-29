<template>
  <div class="loading-spinner" :class="spinnerClass">
    <div class="spinner-overlay" v-if="overlay">
      <div class="spinner-content">
        <svg
          class="spinner-icon"
          :width="size"
          :height="size"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            class="spinner-circle"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="3"
            fill="none"
          />
        </svg>
        <div class="spinner-text" v-if="text">{{ text }}</div>
      </div>
    </div>
    <div v-else class="spinner-inline">
      <svg
        class="spinner-icon"
        :width="size"
        :height="size"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          class="spinner-circle"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="3"
          fill="none"
        />
      </svg>
      <span class="spinner-text" v-if="text">{{ text }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: {
    type: [Number, String],
    default: 24
  },
  color: {
    type: String,
    default: '#1890ff'
  },
  text: {
    type: String,
    default: ''
  },
  overlay: {
    type: Boolean,
    default: false
  },
  inline: {
    type: Boolean,
    default: false
  }
})

const spinnerClass = computed(() => {
  return {
    'loading-spinner--overlay': props.overlay,
    'loading-spinner--inline': props.inline
  }
})
</script>

<style scoped>
.loading-spinner {
  display: inline-block;
}

.loading-spinner--overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.spinner-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.spinner-inline {
  display: flex;
  align-items: center;
  gap: 8px;
}

.spinner-icon {
  animation: spin 1s linear infinite;
}

.spinner-circle {
  stroke-dasharray: 62.8;
  stroke-dashoffset: 62.8;
  animation: dash 1.5s ease-in-out infinite;
}

.spinner-text {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dashoffset: 62.8;
  }
  50% {
    stroke-dashoffset: 31.4;
  }
  100% {
    stroke-dashoffset: 62.8;
  }
}

/* 响应式 */
@media (max-width: 768px) {
  .spinner-content {
    padding: 20px;
    gap: 10px;
  }

  .spinner-text {
    font-size: 13px;
  }
}
</style>
