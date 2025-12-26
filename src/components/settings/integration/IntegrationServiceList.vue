<template>
  <div class="integration-service-list">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-skeleton">
      <div v-for="n in 5" :key="n" class="skeleton-row">
        <div class="skeleton-cell service-icon"></div>
        <div class="skeleton-cell">
          <div class="skeleton-line short"></div>
          <div class="skeleton-line medium"></div>
        </div>
        <div class="skeleton-cell">
          <div class="skeleton-line medium"></div>
        </div>
        <div class="skeleton-cell">
          <div class="skeleton-chip"></div>
        </div>
        <div class="skeleton-cell">
          <div class="skeleton-line short"></div>
        </div>
        <div class="skeleton-cell actions">
          <div class="skeleton-btn"></div>
          <div class="skeleton-btn small"></div>
          <div class="skeleton-btn small"></div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else-if="services.length === 0" class="empty-state">
      <div class="empty-icon">🔗</div>
      <p>暂无集成服务</p>
      <p class="empty-desc">添加第三方服务集成以增强系统功能</p>
    </div>

    <!-- 服务列表 -->
    <div v-else class="service-grid">
      <div
        v-for="service in services"
        :key="service.id"
        class="service-card"
        :class="{ disabled: !service.enabled }"
      >
        <div class="service-header">
          <div class="service-info">
            <div class="service-icon">
              <i :class="getServiceIcon(service.type)"></i>
            </div>
            <div class="service-details">
              <div class="service-name">{{ service.name }}</div>
              <div class="service-type">{{ getServiceTypeLabel(service.type) }}</div>
            </div>
          </div>
          <div class="service-actions">
            <el-switch
              v-model="service.enabled"
              @change="handleToggleStatus(service)"
              size="small"
            />
          </div>
        </div>

        <div class="service-content">
          <div class="service-description">{{ service.description }}</div>
          <div class="service-meta">
            <div class="meta-item">
              <span class="meta-label">状态:</span>
              <span :class="['status-badge', `status-${service.status}`]">
                {{ getStatusLabel(service.status) }}
              </span>
            </div>
            <div class="meta-item">
              <span class="meta-label">最后同步:</span>
              <span class="meta-value">{{ formatLastSync(service.lastSync) }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">创建时间:</span>
              <span class="meta-value">{{ formatDate(service.createdAt) }}</span>
            </div>
          </div>
        </div>

        <div class="service-footer">
          <div class="service-url">{{ service.baseUrl }}</div>
          <div class="action-buttons">
            <el-button
              size="small"
              @click="handleTestConnection(service)"
              :loading="testingIds.has(service.id)"
            >
              测试连接
            </el-button>
            <el-button
              size="small"
              type="primary"
              @click="handleEdit(service)"
            >
              编辑
            </el-button>
            <el-dropdown @command="(cmd) => handleMoreAction(cmd, service)">
              <el-button size="small">
                更多
                <el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="view-logs">查看日志</el-dropdown-item>
                  <el-dropdown-item command="sync-data">同步数据</el-dropdown-item>
                  <el-dropdown-item command="reset-config">重置配置</el-dropdown-item>
                  <el-dropdown-item
                    command="delete"
                    divided
                    class="delete-item"
                  >
                    删除服务
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'

const props = defineProps({
  services: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['edit', 'delete', 'toggle-status', 'test-connection'])

const testingIds = ref(new Set())

// 服务类型映射
const serviceTypeMap = {
  'github': { label: 'GitHub', icon: 'el-icon-github' },
  'gitlab': { label: 'GitLab', icon: 'el-icon-gitlab' },
  'jira': { label: 'Jira', icon: 'el-icon-jira' },
  'jenkins': { label: 'Jenkins', icon: 'el-icon-jenkins' },
  'slack': { label: 'Slack', icon: 'el-icon-slack' },
  'webhook': { label: 'Webhook', icon: 'el-icon-webhook' },
  'api': { label: 'API', icon: 'el-icon-api' },
  'database': { label: '数据库', icon: 'el-icon-database' }
}

// 获取服务图标
const getServiceIcon = (type) => {
  return serviceTypeMap[type]?.icon || 'el-icon-link'
}

// 获取服务类型标签
const getServiceTypeLabel = (type) => {
  return serviceTypeMap[type]?.label || type
}

// 获取状态标签
const getStatusLabel = (status) => {
  const statusMap = {
    'active': '活跃',
    'inactive': '未激活',
    'error': '错误',
    'warning': '警告',
    'connecting': '连接中'
  }
  return statusMap[status] || status
}

// 格式化最后同步时间
const formatLastSync = (date) => {
  if (!date) return '从未同步'
  const now = new Date()
  const syncDate = new Date(date)
  const diffMs = now - syncDate
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return '刚刚'
  if (diffMins < 60) return `${diffMins}分钟前`
  if (diffHours < 24) return `${diffHours}小时前`
  if (diffDays < 7) return `${diffDays}天前`

  return syncDate.toLocaleDateString()
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString()
}

// 切换状态
const handleToggleStatus = (service) => {
  emit('toggle-status', service)
}

// 测试连接
const handleTestConnection = async (service) => {
  testingIds.value.add(service.id)
  try {
    await emit('test-connection', service)
  } finally {
    testingIds.value.delete(service.id)
  }
}

// 编辑服务
const handleEdit = (service) => {
  emit('edit', service)
}

// 更多操作
const handleMoreAction = (command, service) => {
  switch (command) {
    case 'view-logs':
      // 查看日志
      ElMessage.info('日志查看功能开发中')
      break
    case 'sync-data':
      // 同步数据
      ElMessage.info('数据同步功能开发中')
      break
    case 'reset-config':
      // 重置配置
      ElMessage.info('配置重置功能开发中')
      break
    case 'delete':
      emit('delete', service)
      break
  }
}
</script>

<style scoped>
.integration-service-list {
  width: 100%;
}

.service-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
}

.service-card {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background: white;
  overflow: hidden;
  transition: all 0.3s ease;
}

.service-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.service-card.disabled {
  opacity: 0.6;
  background: #fafafa;
}

.service-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #fafafa;
  border-bottom: 1px solid #e4e7ed;
}

.service-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.service-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #409eff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.service-details {
  flex: 1;
}

.service-name {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.service-type {
  font-size: 12px;
  color: #909399;
}

.service-actions {
  display: flex;
  align-items: center;
}

.service-content {
  padding: 16px;
}

.service-description {
  font-size: 14px;
  color: #606266;
  margin-bottom: 12px;
  line-height: 1.5;
}

.service-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 8px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.meta-label {
  font-size: 12px;
  color: #909399;
  font-weight: 500;
}

.meta-value {
  font-size: 12px;
  color: #606266;
}

.status-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.status-active {
  background-color: #f6ffed;
  color: #52c41a;
}

.status-inactive {
  background-color: #f5f5f5;
  color: #8c8c8c;
}

.status-error {
  background-color: #fff1f0;
  color: #ff4d4f;
}

.status-warning {
  background-color: #fffbe6;
  color: #faad14;
}

.status-connecting {
  background-color: #e6f7ff;
  color: #1890ff;
}

.service-footer {
  padding: 16px;
  background: #fafafa;
  border-top: 1px solid #e4e7ed;
}

.service-url {
  font-size: 12px;
  color: #909399;
  margin-bottom: 12px;
  word-break: break-all;
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #8c8c8c;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-desc {
  font-size: 14px;
  margin-top: 8px;
}

/* 骨架屏 */
.loading-skeleton {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.skeleton-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-radius: 8px;
  background: white;
  border: 1px solid #e4e7ed;
}

.skeleton-cell {
  flex: 1;
  min-width: 0;
}

.skeleton-cell.service-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: linear-gradient(90deg, #f0f0f0, #e0e0e0);
  animation: shimmer 1.5s infinite;
}

.skeleton-cell.actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.skeleton-line {
  height: 12px;
  border-radius: 6px;
  background: linear-gradient(90deg, #f0f0f0, #e0e0e0);
  animation: shimmer 1.5s infinite;
}

.skeleton-line.short {
  width: 60%;
}

.skeleton-line.medium {
  width: 80%;
}

.skeleton-chip {
  width: 60px;
  height: 20px;
  border-radius: 10px;
  background: linear-gradient(90deg, #f0f0f0, #e0e0e0);
  animation: shimmer 1.5s infinite;
}

.skeleton-btn {
  width: 60px;
  height: 28px;
  border-radius: 4px;
  background: linear-gradient(90deg, #f0f0f0, #e0e0e0);
  animation: shimmer 1.5s infinite;
}

.skeleton-btn.small {
  width: 40px;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* 删除项样式 */
:deep(.delete-item) {
  color: #f56c6c;
}

:deep(.delete-item:hover) {
  background-color: #fef0f0;
  color: #f56c6c;
}
</style>
