<template>
  <div class="notification-rules">
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <button class="btn btn-primary" @click="handleAddRule">
          <el-icon><Plus /></el-icon>
          新建规则
        </button>
      </div>
      <div class="toolbar-right">
        <div class="search-input-wrapper">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索规则..."
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <el-select
          v-model="filterStatus"
          placeholder="规则状态"
          clearable
          @change="handleFilter"
        >
          <el-option label="启用" value="enabled" />
          <el-option label="禁用" value="disabled" />
        </el-select>
        <el-button :icon="Refresh" @click="handleRefresh" :loading="loading">
          刷新
        </el-button>
      </div>
    </div>

    <!-- 规则列表 -->
    <div class="rules-table">
      <el-table
        :data="filteredRules"
        :loading="loading"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="name" label="规则名称" min-width="150">
          <template #default="{ row }">
            <div class="rule-name">
              <span class="name">{{ row.name }}</span>
              <el-tag
                :type="row.enabled ? 'success' : 'danger'"
                size="small"
                class="status-tag"
              >
                {{ row.enabled ? '启用' : '禁用' }}
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="triggerType" label="触发类型" min-width="120">
          <template #default="{ row }">
            <el-tag :type="getTriggerTypeTagType(row.triggerType)">
              {{ getTriggerTypeLabel(row.triggerType) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="notificationChannels" label="通知渠道" min-width="150">
          <template #default="{ row }">
            <div class="channels">
              <el-tag
                v-for="channel in row.notificationChannels"
                :key="channel"
                size="small"
                :type="getChannelTagType(channel)"
              >
                {{ getChannelLabel(channel) }}
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="recipients" label="接收人" min-width="200">
          <template #default="{ row }">
            <div class="recipients">
              <span v-if="row.recipients.length <= 2">
                {{ row.recipients.join(', ') }}
              </span>
              <el-tooltip
                v-else
                :content="row.recipients.join(', ')"
                placement="top"
              >
                <span>{{ row.recipients.slice(0, 2).join(', ') }} 等{{ row.recipients.length }}人</span>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="conditions" label="触发条件" min-width="200">
          <template #default="{ row }">
            <div class="conditions">
              <span v-for="(condition, index) in row.conditions.slice(0, 2)" :key="index">
                {{ getConditionText(condition) }}
                <span v-if="index < row.conditions.length - 1 && index < 1">, </span>
              </span>
              <span v-if="row.conditions.length > 2">...</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="createdAt" label="创建时间" min-width="150">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-switch
                v-model="row.enabled"
                active-text="启用"
                inactive-text="禁用"
                @change="handleToggleStatus(row)"
                size="small"
              />
              <el-button
                type="primary"
                size="small"
                @click="handleEditRule(row)"
              >
                编辑
              </el-button>
              <el-button
                type="danger"
                size="small"
                @click="handleDeleteRule(row)"
              >
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 空状态 -->
    <div v-if="!loading && filteredRules.length === 0" class="empty-state">
      <el-empty description="暂无通知规则">
        <el-button type="primary" @click="handleAddRule">
          创建第一个规则
        </el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Search, Refresh } from '@element-plus/icons-vue'

const props = defineProps({
  rules: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['refresh', 'edit', 'delete', 'toggle-status'])

const searchKeyword = ref('')
const filterStatus = ref('')
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 过滤后的规则列表
const filteredRules = computed(() => {
  let filtered = props.rules

  // 状态过滤
  if (filterStatus.value) {
    const enabled = filterStatus.value === 'enabled'
    filtered = filtered.filter(rule => rule.enabled === enabled)
  }

  // 关键词搜索
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(rule =>
      rule.name.toLowerCase().includes(keyword) ||
      rule.description?.toLowerCase().includes(keyword)
    )
  }

  // 分页
  const start = (pagination.value.currentPage - 1) * pagination.value.pageSize
  const end = start + pagination.value.pageSize
  pagination.value.total = filtered.length

  return filtered.slice(start, end)
})

// 获取触发类型标签样式
const getTriggerTypeTagType = (type) => {
  const typeMap = {
    manual: 'info',
    automatic: 'success',
    scheduled: 'warning'
  }
  return typeMap[type] || 'info'
}

// 获取触发类型标签文本
const getTriggerTypeLabel = (type) => {
  const typeMap = {
    manual: '手动',
    automatic: '自动',
    scheduled: '定时'
  }
  return typeMap[type] || type
}

// 获取渠道标签样式
const getChannelTagType = (channel) => {
  const channelMap = {
    email: 'success',
    sms: 'warning',
    system: 'info',
    webhook: 'danger'
  }
  return channelMap[channel] || 'info'
}

// 获取渠道标签文本
const getChannelLabel = (channel) => {
  const channelMap = {
    email: '邮件',
    sms: '短信',
    system: '系统',
    webhook: 'Webhook'
  }
  return channelMap[channel] || channel
}

// 获取条件文本
const getConditionText = (condition) => {
  // 这里可以根据条件类型格式化显示文本
  // 简化实现，实际项目中可能需要更复杂的逻辑
  return `${condition.field} ${condition.operator} ${condition.value}`
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 事件处理
const handleAddRule = () => {
  emit('edit', null)
}

const handleEditRule = (rule) => {
  emit('edit', rule)
}

const handleDeleteRule = (rule) => {
  emit('delete', rule)
}

const handleToggleStatus = (rule) => {
  emit('toggle-status', rule)
}

const handleSearch = () => {
  pagination.value.currentPage = 1
}

const handleFilter = () => {
  pagination.value.currentPage = 1
}

const handleRefresh = () => {
  emit('refresh')
}

const handleSizeChange = (size) => {
  pagination.value.pageSize = size
  pagination.value.currentPage = 1
}

const handleCurrentChange = (page) => {
  pagination.value.currentPage = page
}

// 监听搜索关键词变化
watch(searchKeyword, () => {
  pagination.value.currentPage = 1
})

// 监听过滤状态变化
watch(filterStatus, () => {
  pagination.value.currentPage = 1
})

// 初始化时更新总数
watch(() => props.rules, () => {
  pagination.value.total = props.rules.length
}, { immediate: true })
</script>

<style scoped>
.notification-rules {
  padding: 20px 0;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 16px;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn {
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(90deg, #1890ff 0%, #40a9ff 100%);
  color: #fff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

.search-input-wrapper {
  width: 250px;
}

.rules-table {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.rule-name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.name {
  font-weight: 500;
}

.status-tag {
  font-size: 11px;
}

.channels {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.recipients {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.conditions {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

:deep(.el-table th) {
  background: #f8fafc;
  color: #374151;
  font-weight: 600;
}

:deep(.el-table td) {
  padding: 16px 0;
}

:deep(.el-empty__description p) {
  color: #6b7280;
}

:deep(.el-switch) {
  margin-right: 8px;
}
</style>
