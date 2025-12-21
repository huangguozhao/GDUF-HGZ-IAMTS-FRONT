<template>
  <div class="project-card modern-card hover-lift">
    <div class="project-header">
      <div class="project-title-wrapper">
        <h4 class="project-title">{{ project.name }}</h4>
        <div class="project-actions" v-if="showActions">
          <el-dropdown trigger="click" @command="handleAction">
            <el-icon class="action-icon">
              <MoreFilled />
            </el-icon>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="edit">编辑</el-dropdown-item>
                <el-dropdown-item command="view">查看详情</el-dropdown-item>
                <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      <p class="project-desc">{{ project.description }}</p>
    </div>

    <div class="project-meta">
      <div class="project-date">
        <el-icon><Clock /></el-icon>
        <span>{{ formatDate(project.updateTime) }}</span>
      </div>
      <div class="project-avatar" v-if="project.owner">
        <el-avatar :size="24" :src="project.owner.avatar">
          <el-icon><User /></el-icon>
        </el-avatar>
      </div>
    </div>

    <div class="project-progress">
      <div class="progress-header">
        <span class="progress-label">测试覆盖率</span>
        <span class="progress-value">{{ project.coverage }}%</span>
      </div>
      <el-progress 
        :percentage="project.coverage" 
        :color="getProgressColor(project.coverage)"
        :stroke-width="8"
        :show-text="false"
      />
    </div>

    <div class="project-tags" v-if="project.tags && project.tags.length > 0">
      <el-tag 
        v-for="(tag, index) in project.tags" 
        :key="index"
        size="small"
        :type="getTagType(tag)"
        class="project-tag"
      >
        {{ tag }}
      </el-tag>
    </div>
  </div>
</template>

<script setup>
import { Clock, User, MoreFilled } from '@element-plus/icons-vue'

const props = defineProps({
  project: {
    type: Object,
    required: true,
    default: () => ({
      name: '',
      description: '',
      updateTime: '',
      coverage: 0,
      tags: [],
      owner: null
    })
  },
  showActions: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['action'])

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '--'
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

// 获取进度条颜色
const getProgressColor = (percentage) => {
  if (percentage >= 80) return '#67c23a'
  if (percentage >= 60) return '#409eff'
  if (percentage >= 40) return '#e6a23c'
  return '#f56c6c'
}

// 获取标签类型
const getTagType = (tag) => {
  const tagTypes = {
    '支付': 'success',
    '电商': 'info',
    '用户': 'primary',
    '权限': 'warning',
    '物流': 'warning',
    '订单': 'info'
  }
  return tagTypes[tag] || 'info'
}

// 处理操作
const handleAction = (command) => {
  emit('action', { command, project: props.project })
}
</script>

<style scoped>
.project-card {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: all 0.2s ease;
}

.project-header {
  flex: 1;
}

.project-title-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.project-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  flex: 1;
  line-height: 1.4;
}

.project-actions {
  flex-shrink: 0;
  margin-left: 12px;
}

.action-icon {
  font-size: 18px;
  color: #909399;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.action-icon:hover {
  color: #606266;
  background: rgba(0, 0, 0, 0.05);
}

.project-desc {
  font-size: 14px;
  color: #606266;
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.project-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid rgba(228, 231, 237, 0.5);
}

.project-date {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #909399;
}

.project-date .el-icon {
  font-size: 14px;
}

.project-avatar {
  flex-shrink: 0;
}

.project-progress {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-label {
  font-size: 13px;
  color: #606266;
  font-weight: 500;
}

.progress-value {
  font-size: 13px;
  color: #303133;
  font-weight: 600;
}

.project-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 8px;
}

.project-tag {
  margin: 0;
}

/* 响应式 */
@media (max-width: 768px) {
  .project-card {
    padding: 16px;
    gap: 12px;
  }
  
  .project-title {
    font-size: 15px;
  }
  
  .project-desc {
    font-size: 13px;
  }
}
</style>

