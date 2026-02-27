<template>
  <div class="activity-item-component">
    <!-- 图标 -->
    <div class="activity-icon" :class="iconClass">
      <span v-html="iconSvg"></span>
    </div>

    <div class="activity-content">
      <div class="activity-header">
        <div class="activity-title">{{ title }}</div>
        <div class="activity-time">{{ formattedTime }}</div>
      </div>
      <div class="activity-desc">{{ desc }}</div>
      <div class="activity-meta">
        <span class="activity-type" :class="typeClass">{{ typeLabel }}</span>
        <span v-if="status" class="activity-status" :class="statusClass">
          {{ status }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  time: { type: String, default: '' },
  title: { type: String, default: '' },
  desc: { type: String, default: '' },
  origin: { type: String, default: '' }
})

// 操作类型到图标的映射
const operationIcons = {
  // 登录相关
  'login': { icon: '🔑', color: '#409eff', label: '登录' },
  'logout': { icon: '🚪', color: '#909399', label: '登出' },

  // 项目相关
  'create_project': { icon: '📁', color: '#67c23a', label: '创建项目' },
  'update_project': { icon: '✏️', color: '#e6a23c', label: '编辑项目' },
  'delete_project': { icon: '🗑️', color: '#f56c6c', label: '删除项目' },

  // 测试执行
  'execute_test': { icon: '▶️', color: '#409eff', label: '执行测试' },

  // 用例相关
  'create_case': { icon: '📝', color: '#67c23a', label: '创建用例' },
  'update_case': { icon: '✏️', color: '#e6a23c', label: '编辑用例' },
  'delete_case': { icon: '🗑️', color: '#f56c6c', label: '删除用例' },

  // 任务相关
  'create_task': { icon: '📋', color: '#67c23a', label: '创建任务' },
  'update_task': { icon: '📝', color: '#e6a23c', label: '更新任务' },

  // 报告相关
  'generate_report': { icon: '📊', color: '#409eff', label: '生成报告' },

  // 分享
  'share_project': { icon: '🔗', color: '#909399', label: '分享项目' },

  // 默认
  'default': { icon: '📌', color: '#909399', label: '其他' }
}

// 获取图标信息
const iconInfo = computed(() => {
  return operationIcons[props.origin] || operationIcons['default']
})

const iconSvg = computed(() => {
  return iconInfo.value.icon
})

const iconClass = computed(() => {
  return `icon-${props.origin}`
})

// 类型标签
const typeLabel = computed(() => {
  return iconInfo.value.label
})

const typeClass = computed(() => {
  return `type-${props.origin}`
})

// 状态（成功/失败）
const status = computed(() => {
  return null // 可以从details中获取
})

const statusClass = computed(() => {
  return ''
})

// 格式化时间
const formattedTime = computed(() => {
  if (!props.time) return ''

  try {
    const date = new Date(props.time)
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    if (days < 7) return `${days}天前`

    // 超过7天显示具体日期
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${month}月${day}日`
  } catch (e) {
    return props.time
  }
})
</script>

<style scoped>
.activity-item-component {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: #fff;
  border-radius: 8px;
  align-items: flex-start;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.activity-item-component:hover {
  background: #f8fbff;
  border-color: #e4e7ed;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.activity-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
  background: #f0f2f5;
}

.activity-content {
  flex: 1;
  min-width: 0;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.activity-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.activity-time {
  font-size: 12px;
  color: #909399;
  flex-shrink: 0;
}

.activity-desc {
  font-size: 13px;
  color: #606266;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.activity-meta {
  display: flex;
  gap: 8px;
  align-items: center;
}

.activity-type {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  background: #f0f2f5;
  color: #606266;
}

.activity-status {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
}

.activity-status.success {
  background: #f0f9ff;
  color: #67c23a;
}

.activity-status.failed {
  background: #fef0f0;
  color: #f56c6c;
}

/* 图标颜色 */
.icon-login { background: #ecf5ff; }
.icon-logout { background: #f4f4f5; }
.icon-create_project { background: #f0f9ff; }
.icon-update_project { background: #fdf6ec; }
.icon-delete_project { background: #fef0f0; }
.icon-execute_test { background: #ecf5ff; }
.icon-create_case { background: #f0f9ff; }
.icon-update_case { background: #fdf6ec; }
.icon-delete_case { background: #fef0f0; }
.icon-create_task { background: #f0f9ff; }
.icon-update_task { background: #fdf6ec; }
.icon-generate_report { background: #ecf5ff; }
.icon-share_project { background: #f4f4f5; }
</style>
