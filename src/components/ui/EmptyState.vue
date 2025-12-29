<template>
  <div class="empty-state" :class="emptyClass">
    <div class="empty-content">
      <!-- 自定义图标插槽 -->
      <div class="empty-icon" v-if="$slots.icon">
        <slot name="icon" />
      </div>

      <!-- 默认图标 -->
      <div class="empty-icon" v-else>
        <svg
          :width="iconSize"
          :height="iconSize"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            v-if="type === 'success'"
          />
          <path
            d="M12 8V12L16 14M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            v-else-if="type === 'time'"
          />
          <path
            d="M14.5 17C14.5 18.3807 13.3807 19.5 12 19.5C10.6193 19.5 9.5 18.3807 9.5 17C9.5 15.6193 10.6193 14.5 12 14.5C13.3807 14.5 14.5 15.6193 14.5 17ZM14.5 17V20.5M14.5 20.5H9.5M14.5 20.5H16.5M9.5 20.5H7.5"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            v-else-if="type === 'upload'"
          />
          <rect
            x="3"
            y="3"
            width="18"
            height="18"
            rx="2"
            stroke="currentColor"
            stroke-width="1.5"
            fill="none"
            v-else-if="type === 'image'"
          />
          <circle
            cx="9"
            cy="9"
            r="2"
            stroke="currentColor"
            stroke-width="1.5"
            v-if="type === 'image'"
          />
          <path
            d="M3 15L7 11L9 13L15 7L21 13"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            v-if="type === 'image'"
          />
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="1.5"
            fill="none"
            v-else-if="type === 'search'"
          />
          <path
            d="M15 15L19 19"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            v-if="type === 'search'"
          />
          <circle
            cx="10.5"
            cy="10.5"
            r="1.5"
            fill="currentColor"
            v-if="type === 'search'"
          />
          <!-- 默认空状态图标 -->
          <path
            d="M20 13V7C20 5.89543 19.1046 5 18 5H6C4.89543 5 4 5.89543 4 7V13M20 13L22 15V17C22 17.5523 21.5523 18 21 18H3C2.44772 18 2 17.5523 2 17V15L4 13M20 13H4"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            v-else
          />
        </svg>
      </div>

      <div class="empty-text">
        <h3 class="empty-title">{{ title }}</h3>
        <p class="empty-description">{{ description }}</p>
      </div>

      <!-- 操作按钮 -->
      <div class="empty-actions" v-if="$slots.actions || actionText">
        <slot name="actions">
          <el-button
            v-if="actionText"
            :type="actionType"
            :size="actionSize"
            @click="$emit('action')"
          >
            {{ actionText }}
          </el-button>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // 空状态类型
  type: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'search', 'image', 'upload', 'time', 'success', 'error'].includes(value)
  },
  // 标题
  title: {
    type: String,
    default: '暂无数据'
  },
  // 描述
  description: {
    type: String,
    default: '这里暂时没有任何内容'
  },
  // 图标大小
  iconSize: {
    type: [Number, String],
    default: 64
  },
  // 操作按钮文本
  actionText: {
    type: String,
    default: ''
  },
  // 操作按钮类型
  actionType: {
    type: String,
    default: 'primary'
  },
  // 操作按钮大小
  actionSize: {
    type: String,
    default: 'default'
  },
  // 是否紧凑模式
  compact: {
    type: Boolean,
    default: false
  },
  // 是否全屏显示
  fullScreen: {
    type: Boolean,
    default: false
  }
})

const emptyClass = computed(() => {
  return {
    'empty-state--compact': props.compact,
    'empty-state--fullscreen': props.fullScreen
  }
})

defineEmits(['action'])
</script>

<style scoped>
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: 24px;
}

.empty-state--fullscreen {
  min-height: 60vh;
}

.empty-state--compact {
  min-height: 120px;
  padding: 16px;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 400px;
}

.empty-icon {
  margin-bottom: 16px;
  color: #c0c4cc;
  opacity: 0.6;
}

.empty-text {
  margin-bottom: 16px;
}

.empty-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.empty-description {
  margin: 0;
  font-size: 14px;
  color: #909399;
  line-height: 1.5;
}

.empty-actions {
  margin-top: 8px;
}

/* 不同类型的颜色主题 */
.empty-state[data-type="success"] .empty-icon {
  color: #67c23a;
}

.empty-state[data-type="error"] .empty-icon {
  color: #f56c6c;
}

.empty-state[data-type="warning"] .empty-icon {
  color: #e6a23c;
}

/* 响应式 */
@media (max-width: 768px) {
  .empty-state {
    padding: 20px 16px;
    min-height: 160px;
  }

  .empty-state--fullscreen {
    min-height: 50vh;
  }

  .empty-state--compact {
    min-height: 100px;
    padding: 12px;
  }

  .empty-icon {
    margin-bottom: 12px;
  }

  .empty-title {
    font-size: 15px;
  }

  .empty-description {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .empty-state {
    padding: 16px 12px;
  }

  .empty-title {
    font-size: 14px;
  }
}
</style>
