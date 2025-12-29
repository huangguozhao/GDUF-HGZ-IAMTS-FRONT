<template>
  <div class="message-welcome">
    <div class="welcome-content">
      <!-- 主要欢迎区域 -->
      <div class="welcome-main">
        <div class="welcome-icon">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <circle cx="9" cy="9" r="1" fill="currentColor" />
            <circle cx="12" cy="9" r="1" fill="currentColor" />
            <circle cx="15" cy="9" r="1" fill="currentColor" />
          </svg>
        </div>

        <div class="welcome-text">
          <h1 class="welcome-title">消息中心</h1>
          <p class="welcome-subtitle">
            查看和管理您的系统通知、测试报告和重要提醒
          </p>
        </div>
      </div>

      <!-- 统计信息 -->
      <div class="welcome-stats">
        <div class="stat-item">
          <div class="stat-number">{{ unreadCount }}</div>
          <div class="stat-label">未读消息</div>
        </div>
        <div class="stat-divider">•</div>
        <div class="stat-item">
          <div class="stat-number">{{ totalMessages }}</div>
          <div class="stat-label">总消息数</div>
        </div>
        <div class="stat-divider">•</div>
        <div class="stat-item">
          <div class="stat-number">{{ systemAlerts }}</div>
          <div class="stat-label">系统告警</div>
        </div>
      </div>

      <!-- 快捷操作 -->
      <div class="welcome-actions">
        <el-button
          type="primary"
          size="large"
          icon="Bell"
          @click="markAllRead"
          :loading="markingAll"
        >
          全部标记已读
        </el-button>
        <el-button
          type="default"
          size="large"
          icon="Refresh"
          @click="refreshMessages"
          :loading="refreshing"
        >
          刷新消息
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { Bell, Refresh } from '@element-plus/icons-vue'

const props = defineProps({
  messages: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['mark-all-read', 'refresh'])

const markingAll = ref(false)
const refreshing = ref(false)

const unreadCount = computed(() => {
  return props.messages.filter(msg => !msg.read).length
})

const totalMessages = computed(() => {
  return props.messages.length
})

const systemAlerts = computed(() => {
  return props.messages.filter(msg => msg.type === 'alerts').length
})

const markAllRead = async () => {
  markingAll.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    emit('mark-all-read')
  } finally {
    markingAll.value = false
  }
}

const refreshMessages = async () => {
  refreshing.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1500))
    emit('refresh')
  } finally {
    refreshing.value = false
  }
}
</script>

<style scoped>
.message-welcome {
  background: linear-gradient(135deg,
    rgba(24, 144, 255, 0.05) 0%,
    rgba(67, 192, 58, 0.03) 100%);
  border-radius: 16px;
  padding: 40px;
  margin-bottom: 32px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
}

.message-welcome::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg,
    #1890ff 0%,
    #43c23a 50%,
    #e6a23c 100%);
  border-radius: 16px 16px 0 0;
}

.welcome-content {
  position: relative;
  z-index: 1;
  text-align: center;
}

.welcome-main {
  margin-bottom: 32px;
}

.welcome-icon {
  margin-bottom: 20px;
  color: #1890ff;
  opacity: 0.8;
}

.welcome-text {
  margin-bottom: 16px;
}

.welcome-title {
  font-size: 32px;
  font-weight: 700;
  color: #303133;
  margin: 0 0 12px 0;
  background: linear-gradient(135deg, #1890ff, #43c23a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-subtitle {
  font-size: 16px;
  color: #606266;
  margin: 0;
  line-height: 1.6;
  opacity: 0.8;
}

.welcome-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  color: #1890ff;
  line-height: 1;
}

.stat-label {
  font-size: 13px;
  color: #909399;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-divider {
  color: #c0c4cc;
  font-size: 18px;
  font-weight: 300;
}

.welcome-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

.welcome-actions .el-button {
  min-width: 140px;
  border-radius: 8px;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .message-welcome {
    padding: 24px 20px;
    margin-bottom: 24px;
  }

  .welcome-title {
    font-size: 24px;
  }

  .welcome-subtitle {
    font-size: 14px;
  }

  .welcome-stats {
    gap: 16px;
    margin-bottom: 24px;
  }

  .stat-number {
    font-size: 24px;
  }

  .stat-label {
    font-size: 12px;
  }

  .welcome-actions {
    flex-direction: column;
    gap: 12px;
  }

  .welcome-actions .el-button {
    width: 100%;
    min-width: auto;
  }
}

@media (max-width: 480px) {
  .message-welcome {
    padding: 20px 16px;
  }

  .welcome-main {
    margin-bottom: 24px;
  }

  .welcome-stats {
    gap: 12px;
  }

  .welcome-stats {
    flex-direction: column;
    gap: 12px;
  }

  .stat-item {
    flex-direction: row;
    justify-content: center;
    gap: 8px;
  }
}

/* 动画效果 */
@keyframes welcomeSlideIn {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.message-welcome {
  animation: welcomeSlideIn 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
</style>
