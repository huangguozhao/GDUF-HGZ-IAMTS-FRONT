<template>
  <div class="notification-section">
    <transition name="notification-slide" appear>
      <div class="notification-card glass-card hover-lift">
        <div class="notification-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L13.09 5.26L16.5 4.27L15.51 7.68L18.74 8.91L15.51 10.14L16.5 13.55L13.09 12.56L12 15.82L10.91 12.56L7.5 13.55L8.49 10.14L5.26 8.91L8.49 7.68L7.5 4.27L10.91 5.26L12 2Z" fill="#E6A23C"/>
            <circle cx="12" cy="16" r="3" fill="#F56C6C"/>
            <path d="M12 18V20" stroke="#F56C6C" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="notification-content">
          <h3 class="notification-title">待处理事项提醒</h3>
          <div class="notification-stats">
            <div class="stat-item">
              <span class="stat-number">{{ pendingTasks }}</span>
              <span class="stat-label">待处理任务</span>
            </div>
            <div class="stat-divider">•</div>
            <div class="stat-item stat-urgent">
              <span class="stat-number">{{ urgentTasks }}</span>
              <span class="stat-label">高优先级问题</span>
            </div>
          </div>
        </div>
        <div class="notification-actions">
          <el-button type="primary" size="small" plain @click="$emit('view-tasks')">
            查看详情
          </el-button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
defineProps({
  pendingTasks: {
    type: [Number, String],
    default: 5
  },
  urgentTasks: {
    type: [Number, String],
    default: 2
  }
})

defineEmits(['view-tasks'])
</script>

<style scoped>
.notification-section {
  margin-bottom: 24px;
}

.notification-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow:
    0 40px 50px -32px rgba(0, 0, 0, 0.05),
    inset 0 0 20px rgba(255, 255, 255, 0.25);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.notification-card:hover {
  transform: translateY(-2px);
  box-shadow:
    0 8px 25px rgba(0, 0, 0, 0.1),
    inset 0 0 20px rgba(255, 255, 255, 0.3);
}

.notification-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
  letter-spacing: -0.2px;
}

.notification-stats {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.stat-number {
  font-size: 18px;
  font-weight: 700;
  color: #1890ff;
  font-variant-numeric: tabular-nums;
}

.stat-label {
  font-size: 13px;
  color: #606266;
  font-weight: 400;
}

.stat-item.stat-urgent .stat-number {
  color: #f56c6c;
}

.stat-divider {
  color: #c0c4cc;
  font-size: 14px;
  margin: 0 2px;
}

.notification-actions {
  flex-shrink: 0;
}

.notification-actions .el-button {
  border-radius: 20px;
  padding: 6px 16px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.notification-actions .el-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.2);
}

/* 移动端响应式 */
@media (max-width: 768px) {
  .notification-card {
    flex-direction: column;
    text-align: center;
    gap: 12px;
    padding: 16px 20px;
  }

  .notification-icon {
    width: 40px;
    height: 40px;
  }

  .notification-icon svg {
    width: 20px;
    height: 20px;
  }

  .notification-title {
    font-size: 15px;
  }

  .stat-number {
    font-size: 16px;
  }

  .stat-label {
    font-size: 12px;
  }

  .notification-actions .el-button {
    width: 100%;
    padding: 8px 16px;
  }
}

@media (max-width: 480px) {
  .notification-card {
    padding: 14px 16px;
  }

  .notification-stats {
    justify-content: center;
    gap: 12px;
  }

  .stat-item {
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }
}

/* 容器查询支持 */
@container (max-width: 400px) {
  .notification-card {
    padding: 12px 14px;
    gap: 10px;
  }

  .notification-icon {
    width: 36px;
    height: 36px;
  }

  .notification-title {
    font-size: 14px;
  }

  .stat-number {
    font-size: 14px;
  }
}

/* 动画 */
.notification-slide-enter-active,
.notification-slide-leave-active {
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.notification-slide-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

.notification-slide-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}
</style>
