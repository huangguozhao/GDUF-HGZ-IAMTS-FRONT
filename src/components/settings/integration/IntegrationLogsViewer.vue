<template>
  <div class="integration-logs-viewer">
    <!-- 日志筛选器 -->
    <div class="logs-filter">
      <div class="filter-row">
        <div class="filter-item">
          <label class="filter-label">服务:</label>
          <el-select
            v-model="filters.serviceId"
            placeholder="选择服务"
            clearable
            @change="handleFilterChange"
            style="width: 150px"
          >
            <el-option
              v-for="service in serviceOptions"
              :key="service.id"
              :label="service.name"
              :value="service.id"
            />
          </el-select>
        </div>

        <div class="filter-item">
          <label class="filter-label">日志级别:</label>
          <el-select
            v-model="filters.level"
            placeholder="选择级别"
            clearable
            @change="handleFilterChange"
            style="width: 120px"
          >
            <el-option label="全部" value="" />
            <el-option label="ERROR" value="error" />
            <el-option label="WARN" value="warn" />
            <el-option label="INFO" value="info" />
            <el-option label="DEBUG" value="debug" />
          </el-select>
        </div>

        <div class="filter-item">
          <label class="filter-label">时间范围:</label>
          <el-date-picker
            v-model="filters.timeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm"
            @change="handleFilterChange"
            style="width: 300px"
          />
        </div>

        <div class="filter-item">
          <el-input
            v-model="filters.keyword"
            placeholder="搜索日志内容"
            clearable
            @input="handleKeywordSearch"
            style="width: 200px"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>

        <div class="filter-actions">
          <el-button
            size="small"
            @click="refreshLogs"
            :loading="loading"
          >
            刷新
          </el-button>
          <el-button
            size="small"
            type="primary"
            @click="exportLogs"
            :loading="exporting"
          >
            导出日志
          </el-button>
          <el-button
            size="small"
            @click="clearFilters"
          >
            清空筛选
          </el-button>
        </div>
      </div>
    </div>

    <!-- 日志列表 -->
    <div class="logs-container">
      <!-- 加载状态 -->
      <div v-if="loading" class="logs-loading">
        <div v-for="n in 5" :key="n" class="log-skeleton">
          <div class="skeleton-line time"></div>
          <div class="skeleton-line level"></div>
          <div class="skeleton-line service"></div>
          <div class="skeleton-line message short"></div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else-if="logs.length === 0" class="logs-empty">
        <div class="empty-icon">📝</div>
        <p>暂无日志记录</p>
        <p class="empty-desc">在筛选的时间范围内没有找到相关日志</p>
      </div>

      <!-- 日志内容 -->
      <div v-else class="logs-content">
        <div
          v-for="log in logs"
          :key="log.id"
          class="log-entry"
          :class="`log-${log.level?.toLowerCase()}`"
        >
          <div class="log-header">
            <div class="log-meta">
              <span class="log-time">{{ formatTime(log.timestamp) }}</span>
              <span class="log-level" :class="`level-${log.level?.toLowerCase()}`">
                {{ log.level?.toUpperCase() }}
              </span>
              <span class="log-service">{{ getServiceName(log.serviceId) }}</span>
            </div>
            <div class="log-actions">
              <el-button
                size="mini"
                type="text"
                @click="toggleLogExpansion(log)"
              >
                {{ log.expanded ? '收起' : '展开' }}
              </el-button>
            </div>
          </div>

          <div class="log-message" :class="{ expanded: log.expanded }">
            <div class="log-summary">{{ truncateMessage(log.message, 100) }}</div>
            <div v-if="log.expanded" class="log-details">
              <pre class="log-full-message">{{ log.message }}</pre>
              <div v-if="log.details" class="log-extra-details">
                <div class="detail-item">
                  <strong>请求ID:</strong> {{ log.details.requestId || 'N/A' }}
                </div>
                <div class="detail-item">
                  <strong>耗时:</strong> {{ log.details.duration ? log.details.duration + 'ms' : 'N/A' }}
                </div>
                <div class="detail-item">
                  <strong>用户:</strong> {{ log.details.user || '系统' }}
                </div>
                <div v-if="log.details.error" class="detail-item">
                  <strong>错误详情:</strong>
                  <pre class="error-details">{{ log.details.error }}</pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="logs.length > 0" class="logs-pagination">
      <el-pagination
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[20, 50, 100, 200]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 日志详情模态框 -->
    <el-dialog
      v-model="showDetailModal"
      title="日志详情"
      width="800px"
      :close-on-click-modal="false"
    >
      <div v-if="selectedLog" class="log-detail-modal">
        <div class="detail-section">
          <h6>基本信息</h6>
          <div class="detail-grid">
            <div class="detail-row">
              <span class="detail-label">时间:</span>
              <span class="detail-value">{{ formatTime(selectedLog.timestamp, true) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">级别:</span>
              <span :class="['detail-value', `level-${selectedLog.level?.toLowerCase()}`]">
                {{ selectedLog.level?.toUpperCase() }}
              </span>
            </div>
            <div class="detail-row">
              <span class="detail-label">服务:</span>
              <span class="detail-value">{{ getServiceName(selectedLog.serviceId) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">操作:</span>
              <span class="detail-value">{{ selectedLog.operation || 'N/A' }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h6>日志消息</h6>
          <pre class="log-message-content">{{ selectedLog.message }}</pre>
        </div>

        <div v-if="selectedLog.details" class="detail-section">
          <h6>详细信息</h6>
          <div class="details-json">
            <pre>{{ JSON.stringify(selectedLog.details, null, 2) }}</pre>
          </div>
        </div>

        <div v-if="selectedLog.stackTrace" class="detail-section">
          <h6>堆栈跟踪</h6>
          <pre class="stack-trace">{{ selectedLog.stackTrace }}</pre>
        </div>
      </div>

      <template #footer>
        <div class="modal-footer">
          <el-button @click="showDetailModal = false">关闭</el-button>
          <el-button
            type="primary"
            @click="copyLogDetails"
          >
            复制详情
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { formatTimeFull, truncateMessage } from '@/utils/formatters'

const props = defineProps({
  logs: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['refresh'])

// 响应式数据
const filters = ref({
  serviceId: '',
  level: '',
  timeRange: [],
  keyword: ''
})

const pagination = ref({
  currentPage: 1,
  pageSize: 50,
  total: 0
})

const loading = ref(false)
const exporting = ref(false)
const showDetailModal = ref(false)
const selectedLog = ref(null)
const expandedLogs = ref(new Set())

// 服务选项（应该从父组件传入或通过API获取）
const serviceOptions = ref([
  { id: 'github-1', name: 'GitHub 集成' },
  { id: 'jira-1', name: 'Jira 集成' },
  { id: 'jenkins-1', name: 'Jenkins 集成' },
  { id: 'slack-1', name: 'Slack 通知' }
])

// 过滤后的日志
const filteredLogs = computed(() => {
  let filtered = [...props.logs]

  // 服务筛选
  if (filters.value.serviceId) {
    filtered = filtered.filter(log => log.serviceId === filters.value.serviceId)
  }

  // 级别筛选
  if (filters.value.level) {
    filtered = filtered.filter(log => log.level?.toLowerCase() === filters.value.level.toLowerCase())
  }

  // 时间范围筛选
  if (filters.value.timeRange && filters.value.timeRange.length === 2) {
    const [startTime, endTime] = filters.value.timeRange
    filtered = filtered.filter(log => {
      const logTime = new Date(log.timestamp)
      return logTime >= new Date(startTime) && logTime <= new Date(endTime)
    })
  }

  // 关键词搜索
  if (filters.value.keyword) {
    const keyword = filters.value.keyword.toLowerCase()
    filtered = filtered.filter(log =>
      log.message?.toLowerCase().includes(keyword) ||
      log.operation?.toLowerCase().includes(keyword) ||
      getServiceName(log.serviceId).toLowerCase().includes(keyword)
    )
  }

  return filtered
})

// 分页后的日志
const paginatedLogs = computed(() => {
  const start = (pagination.value.currentPage - 1) * pagination.value.pageSize
  const end = start + pagination.value.pageSize
  return filteredLogs.value.slice(start, end)
})

// 获取服务名称
const getServiceName = (serviceId) => {
  const service = serviceOptions.value.find(s => s.id === serviceId)
  return service?.name || serviceId || '未知服务'
}


// 切换日志展开状态
const toggleLogExpansion = (log) => {
  if (expandedLogs.value.has(log.id)) {
    expandedLogs.value.delete(log.id)
  } else {
    expandedLogs.value.add(log.id)
  }
  log.expanded = expandedLogs.value.has(log.id)
}

// 处理筛选变化
const handleFilterChange = () => {
  pagination.value.currentPage = 1
  updatePaginationTotal()
}

// 处理关键词搜索
const handleKeywordSearch = () => {
  // 防抖处理
  clearTimeout(window.searchTimer)
  window.searchTimer = setTimeout(() => {
    pagination.value.currentPage = 1
    updatePaginationTotal()
  }, 300)
}

// 更新分页总数
const updatePaginationTotal = () => {
  pagination.value.total = filteredLogs.value.length
}

// 清空筛选
const clearFilters = () => {
  filters.value = {
    serviceId: '',
    level: '',
    timeRange: [],
    keyword: ''
  }
  pagination.value.currentPage = 1
  updatePaginationTotal()
}

// 刷新日志
const refreshLogs = () => {
  emit('refresh')
}

// 导出日志
const exportLogs = async () => {
  exporting.value = true
  try {
    const exportData = filteredLogs.value.map(log => ({
      时间: formatTime(log.timestamp, true),
      级别: log.level?.toUpperCase(),
      服务: getServiceName(log.serviceId),
      操作: log.operation || 'N/A',
      消息: log.message,
      详情: log.details ? JSON.stringify(log.details) : ''
    }))

    // 创建CSV内容
    const headers = Object.keys(exportData[0] || {}).join(',')
    const rows = exportData.map(row =>
      Object.values(row).map(value => `"${value}"`).join(',')
    )
    const csvContent = [headers, ...rows].join('\n')

    // 下载文件
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `integration_logs_${new Date().toISOString().split('T')[0]}.csv`
    link.click()

    ElMessage.success('日志导出成功')
  } catch (error) {
    console.error('导出日志失败:', error)
    ElMessage.error('导出日志失败')
  } finally {
    exporting.value = false
  }
}

// 处理分页大小变化
const handleSizeChange = (size) => {
  pagination.value.pageSize = size
  pagination.value.currentPage = 1
}

// 处理页码变化
const handleCurrentChange = (page) => {
  pagination.value.currentPage = page
}

// 复制日志详情
const copyLogDetails = async () => {
  if (!selectedLog.value) return

  const details = {
    时间: formatTime(selectedLog.value.timestamp, true),
    级别: selectedLog.value.level?.toUpperCase(),
    服务: getServiceName(selectedLog.value.serviceId),
    操作: selectedLog.value.operation || 'N/A',
    消息: selectedLog.value.message,
    详情: selectedLog.value.details || {}
  }

  try {
    await navigator.clipboard.writeText(JSON.stringify(details, null, 2))
    ElMessage.success('日志详情已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

// 监听日志变化，更新分页
watch(() => props.logs, () => {
  updatePaginationTotal()
}, { immediate: true })

// 初始化
onMounted(() => {
  updatePaginationTotal()
})
</script>

<style scoped>
.integration-logs-viewer {
  max-width: 100%;
}

.logs-filter {
  background: white;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  padding: 16px;
  margin-bottom: 16px;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-label {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  white-space: nowrap;
}

.filter-actions {
  display: flex;
  gap: 8px;
  margin-left: auto;
}

.logs-container {
  background: white;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  min-height: 400px;
  max-height: 600px;
  overflow: hidden;
}

.logs-loading {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.log-skeleton {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px;
  border-radius: 6px;
  background: #fafafa;
}

.skeleton-line {
  height: 12px;
  background: linear-gradient(90deg, #f0f0f0, #e0e0e0);
  border-radius: 6px;
  animation: shimmer 1.5s infinite;
}

.skeleton-line.time {
  width: 120px;
}

.skeleton-line.level {
  width: 60px;
}

.skeleton-line.service {
  width: 100px;
}

.skeleton-line.short {
  width: 200px;
}

.logs-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
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

.logs-content {
  max-height: 600px;
  overflow-y: auto;
}

.log-entry {
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;
}

.log-entry:hover {
  background: #fafafa;
}

.log-error {
  border-left: 4px solid #ff4d4f;
}

.log-warn {
  border-left: 4px solid #faad14;
}

.log-info {
  border-left: 4px solid #409eff;
}

.log-debug {
  border-left: 4px solid #909399;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
}

.log-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.log-time {
  font-size: 12px;
  color: #909399;
  font-family: 'Monaco', 'Menlo', monospace;
}

.log-level {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  text-align: center;
  min-width: 50px;
}

.level-error {
  background: #fff1f0;
  color: #ff4d4f;
}

.level-warn {
  background: #fffbe6;
  color: #faad14;
}

.level-info {
  background: #e6f7ff;
  color: #1890ff;
}

.level-debug {
  background: #f5f5f5;
  color: #8c8c8c;
}

.log-service {
  font-size: 13px;
  color: #303133;
  font-weight: 500;
}

.log-actions {
  opacity: 0;
  transition: opacity 0.2s;
}

.log-entry:hover .log-actions {
  opacity: 1;
}

.log-message {
  padding: 0 16px 12px 16px;
}

.log-summary {
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
}

.log-details {
  margin-top: 8px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.log-full-message {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 13px;
  color: #303133;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
}

.log-extra-details {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e9ecef;
}

.detail-item {
  margin-bottom: 8px;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.detail-item strong {
  color: #303133;
}

.error-details {
  background: #fff1f0;
  border: 1px solid #ffccc7;
  border-radius: 4px;
  padding: 8px;
  margin-top: 4px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 12px;
  color: #cf1322;
  max-height: 150px;
  overflow-y: auto;
}

.logs-pagination {
  margin-top: 16px;
  text-align: center;
}

.log-detail-modal {
  max-height: 500px;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 20px;
}

.detail-section h6 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.detail-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #fafafa;
  border-radius: 4px;
}

.detail-label {
  font-size: 13px;
  color: #909399;
  font-weight: 500;
}

.detail-value {
  font-size: 13px;
  color: #303133;
}

.log-message-content {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 12px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 13px;
  color: #303133;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 200px;
  overflow-y: auto;
}

.details-json {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  padding: 12px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 12px;
  color: #303133;
  max-height: 200px;
  overflow-y: auto;
}

.stack-trace {
  background: #fff1f0;
  border: 1px solid #ffccc7;
  border-radius: 6px;
  padding: 12px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 12px;
  color: #cf1322;
  max-height: 200px;
  overflow-y: auto;
  white-space: pre-wrap;
}

.modal-footer {
  text-align: right;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

@media (max-width: 768px) {
  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-item {
    flex-direction: column;
    align-items: stretch;
    gap: 4px;
  }

  .filter-label {
    align-self: flex-start;
  }

  .filter-actions {
    margin-left: 0;
    margin-top: 16px;
    justify-content: center;
  }

  .log-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .log-meta {
    flex-wrap: wrap;
    gap: 8px;
  }

  .log-actions {
    opacity: 1;
    align-self: flex-end;
  }
}
</style>
