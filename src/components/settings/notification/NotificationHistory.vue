<template>
  <div class="notification-history">
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-button type="primary" :icon="Download" @click="handleExport">
          导出记录
        </el-button>
      </div>
      <div class="toolbar-right">
        <div class="filter-group">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="handleDateFilter"
          />
          <el-select
            v-model="filterChannel"
            placeholder="通知渠道"
            clearable
            @change="handleChannelFilter"
          >
            <el-option label="邮件" value="email" />
            <el-option label="短信" value="sms" />
            <el-option label="系统" value="system" />
            <el-option label="Webhook" value="webhook" />
          </el-select>
          <el-select
            v-model="filterStatus"
            placeholder="发送状态"
            clearable
            @change="handleStatusFilter"
          >
            <el-option label="成功" value="success" />
            <el-option label="失败" value="failed" />
            <el-option label="发送中" value="sending" />
          </el-select>
        </div>
        <div class="search-input-wrapper">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索接收人或内容..."
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <el-button :icon="Refresh" @click="handleRefresh" :loading="loading">
          刷新
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon success">
          <el-icon><Check /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.success }}</div>
          <div class="stat-label">发送成功</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon error">
          <el-icon><Close /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.failed }}</div>
          <div class="stat-label">发送失败</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon warning">
          <el-icon><Clock /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.sending }}</div>
          <div class="stat-label">发送中</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon info">
          <el-icon><Document /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.total }}</div>
          <div class="stat-label">总计</div>
        </div>
      </div>
    </div>

    <!-- 历史记录列表 -->
    <div class="history-table">
      <el-table
        :data="filteredHistory"
        :loading="loading"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="createdAt" label="发送时间" min-width="160">
          <template #default="{ row }">
            <div class="send-time">
              <div class="date">{{ formatDate(row.createdAt) }}</div>
              <div class="time">{{ formatTime(row.createdAt) }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="channel" label="通知渠道" width="100">
          <template #default="{ row }">
            <el-tag :type="getChannelTagType(row.channel)">
              {{ getChannelLabel(row.channel) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="recipient" label="接收人" min-width="150">
          <template #default="{ row }">
            <div class="recipient">
              <span>{{ row.recipient }}</span>
              <span v-if="row.recipientType" class="recipient-type">
                ({{ row.recipientType }})
              </span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="subject" label="主题/内容" min-width="200">
          <template #default="{ row }">
            <div class="content-preview">
              <span class="subject">{{ row.subject || row.content?.substring(0, 50) }}</span>
              <span v-if="row.content && row.content.length > 50">...</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="发送状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="ruleName" label="触发规则" min-width="120">
          <template #default="{ row }">
            <span>{{ row.ruleName || '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="errorMessage" label="错误信息" min-width="150">
          <template #default="{ row }">
            <span v-if="row.errorMessage" class="error-message">
              {{ row.errorMessage }}
            </span>
            <span v-else class="no-error">-</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button
                type="primary"
                size="small"
                @click="handleViewDetail(row)"
              >
                详情
              </el-button>
              <el-button
                v-if="row.status === 'failed'"
                type="warning"
                size="small"
                @click="handleRetry(row)"
              >
                重试
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

    <!-- 详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="通知详情"
      width="600px"
    >
      <div v-if="selectedHistory" class="notification-detail">
        <div class="detail-row">
          <label>发送时间:</label>
          <span>{{ formatDateTime(selectedHistory.createdAt) }}</span>
        </div>
        <div class="detail-row">
          <label>通知渠道:</label>
          <el-tag :type="getChannelTagType(selectedHistory.channel)">
            {{ getChannelLabel(selectedHistory.channel) }}
          </el-tag>
        </div>
        <div class="detail-row">
          <label>接收人:</label>
          <span>{{ selectedHistory.recipient }}</span>
        </div>
        <div class="detail-row">
          <label>主题:</label>
          <span>{{ selectedHistory.subject || '-' }}</span>
        </div>
        <div class="detail-row">
          <label>内容:</label>
          <div class="content-full">{{ selectedHistory.content }}</div>
        </div>
        <div class="detail-row">
          <label>发送状态:</label>
          <el-tag :type="getStatusTagType(selectedHistory.status)">
            {{ getStatusLabel(selectedHistory.status) }}
          </el-tag>
        </div>
        <div v-if="selectedHistory.errorMessage" class="detail-row">
          <label>错误信息:</label>
          <span class="error-text">{{ selectedHistory.errorMessage }}</span>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Refresh, Download, Check, Close, Clock, Document } from '@element-plus/icons-vue'

const props = defineProps({
  history: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  pagination: {
    type: Object,
    default: () => ({
      currentPage: 1,
      pageSize: 10,
      total: 0
    })
  }
})

const emit = defineEmits(['refresh', 'page-change', 'search'])

const searchKeyword = ref('')
const dateRange = ref([])
const filterChannel = ref('')
const filterStatus = ref('')
const detailDialogVisible = ref(false)
const selectedHistory = ref(null)

// 统计数据
const stats = computed(() => {
  const total = props.history.length
  const success = props.history.filter(item => item.status === 'success').length
  const failed = props.history.filter(item => item.status === 'failed').length
  const sending = props.history.filter(item => item.status === 'sending').length

  return { total, success, failed, sending }
})

// 过滤后的历史记录
const filteredHistory = computed(() => {
  let filtered = props.history

  // 日期范围过滤
  if (dateRange.value && dateRange.value.length === 2) {
    const [startDate, endDate] = dateRange.value
    filtered = filtered.filter(item => {
      const itemDate = new Date(item.createdAt).toISOString().split('T')[0]
      return itemDate >= startDate && itemDate <= endDate
    })
  }

  // 渠道过滤
  if (filterChannel.value) {
    filtered = filtered.filter(item => item.channel === filterChannel.value)
  }

  // 状态过滤
  if (filterStatus.value) {
    filtered = filtered.filter(item => item.status === filterStatus.value)
  }

  // 关键词搜索
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(item =>
      item.recipient?.toLowerCase().includes(keyword) ||
      item.subject?.toLowerCase().includes(keyword) ||
      item.content?.toLowerCase().includes(keyword)
    )
  }

  return filtered
})

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

// 获取状态标签样式
const getStatusTagType = (status) => {
  const statusMap = {
    success: 'success',
    failed: 'danger',
    sending: 'warning'
  }
  return statusMap[status] || 'info'
}

// 获取状态标签文本
const getStatusLabel = (status) => {
  const statusMap = {
    success: '成功',
    failed: '失败',
    sending: '发送中'
  }
  return statusMap[status] || status
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

// 格式化时间
const formatTime = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleTimeString('zh-CN', { hour12: false })
}

// 格式化日期时间
const formatDateTime = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

// 事件处理
const handleRefresh = () => {
  emit('refresh')
}

const handleSearch = () => {
  emit('search', {
    keyword: searchKeyword.value,
    dateRange: dateRange.value,
    channel: filterChannel.value,
    status: filterStatus.value
  })
}

const handleDateFilter = () => {
  handleSearch()
}

const handleChannelFilter = () => {
  handleSearch()
}

const handleStatusFilter = () => {
  handleSearch()
}

const handleSizeChange = (size) => {
  emit('page-change', { pageSize: size, currentPage: 1 })
}

const handleCurrentChange = (page) => {
  emit('page-change', { currentPage: page })
}

const handleViewDetail = (history) => {
  selectedHistory.value = history
  detailDialogVisible.value = true
}

const handleRetry = (history) => {
  ElMessage.info('重试功能开发中...')
  // TODO: 实现重试逻辑
}

const handleExport = () => {
  ElMessage.info('导出功能开发中...')
  // TODO: 实现导出逻辑
}
</script>

<style scoped>
.notification-history {
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

.filter-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-input-wrapper {
  width: 250px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.stat-icon.success {
  background: #f0f9ff;
  color: #52c41a;
}

.stat-icon.error {
  background: #fff2f0;
  color: #ff4d4f;
}

.stat-icon.warning {
  background: #fffbe6;
  color: #faad14;
}

.stat-icon.info {
  background: #f6ffed;
  color: #1890ff;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.history-table {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.send-time {
  display: flex;
  flex-direction: column;
}

.send-time .date {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.send-time .time {
  font-size: 12px;
  color: #909399;
}

.recipient {
  display: flex;
  flex-direction: column;
}

.recipient-type {
  font-size: 12px;
  color: #909399;
}

.content-preview {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.subject {
  font-weight: 500;
}

.error-message {
  color: #ff4d4f;
  font-size: 12px;
}

.no-error {
  color: #909399;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.notification-detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row label {
  font-weight: 500;
  color: #606266;
  min-width: 80px;
}

.content-full {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 4px;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 200px;
  overflow-y: auto;
}

.error-text {
  color: #ff4d4f;
}

:deep(.el-table th) {
  background: #f8fafc;
  color: #374151;
  font-weight: 600;
}

:deep(.el-table td) {
  padding: 16px 0;
}

:deep(.el-dialog__body) {
  padding: 20px 24px;
}
</style>
