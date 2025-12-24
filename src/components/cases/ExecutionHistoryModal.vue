<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="$emit('update:visible', $event)"
    title="执行历史"
    width="95%"
    :close-on-click-modal="false"
    :close-on-press-escape="true"
    class="execution-history-modal"
    :show-close="true"
    :modal="true"
    :append-to-body="true"
    @close="handleClose"
  >
    <div class="modal-content">
      <!-- 页面头部 -->
      <div class="modal-header" ref="headerRef">
        <div class="header-content">
          <div class="header-title">
            <h2>{{ testCaseName }} - 执行历史</h2>
            <p class="header-subtitle">查看该测试用例的所有执行记录</p>
          </div>
          <div class="header-actions">
            <el-button 
              type="primary" 
              :icon="Refresh"
              @click="refreshHistory"
              :loading="loading"
              size="default"
            >
              刷新
            </el-button>
          </div>
        </div>
      </div>

      <!-- 筛选工具栏 -->
      <div class="filter-toolbar" role="region" aria-label="筛选工具栏" ref="toolbarRef">
        <div class="toolbar-content">
          <div class="filter-group">
            <el-select 
              v-model="filters.period" 
              placeholder="时间范围" 
              size="default" 
              class="filter-select"
              @change="handleFilterChange"
            >
              <el-option label="全部" value="all" />
              <el-option label="最近7天" value="7days" />
              <el-option label="最近30天" value="30days" />
              <el-option label="最近90天" value="90days" />
            </el-select>
            
            <el-select 
              v-model="filters.status" 
              placeholder="执行状态" 
              size="default" 
              class="filter-select"
              clearable
              @change="handleFilterChange"
            >
              <el-option label="全部状态" value="" />
              <el-option label="已完成" value="completed" />
              <el-option label="失败" value="failed" />
              <el-option label="运行中" value="running" />
              <el-option label="已取消" value="cancelled" />
            </el-select>
            
            <el-select 
              v-model="filters.executionType" 
              placeholder="执行类型" 
              size="default" 
              class="filter-select"
              clearable
              @change="handleFilterChange"
            >
              <el-option label="全部类型" value="" />
              <el-option label="手动执行" value="manual" />
              <el-option label="定时任务" value="scheduled" />
              <el-option label="触发执行" value="triggered" />
            </el-select>
          </div>
          
          <div class="search-group">
            <el-input 
              v-model="searchKeyword" 
              placeholder="搜索执行记录..." 
              size="default" 
              class="search-input"
              clearable
              @input="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            
            <el-button 
              :icon="Download" 
              @click="exportHistory"
              size="default"
              class="export-btn"
            >
              导出
            </el-button>
          </div>
        </div>
      </div>

      <!-- 统计信息卡片 -->
      <div class="stats-cards">
        <div class="stat-card total">
          <div class="stat-icon">
            <el-icon size="24"><Clock /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ statistics?.totalExecutions || 0 }}</div>
            <div class="stat-label">总执行次数</div>
          </div>
        </div>
        <div class="stat-card success">
          <div class="stat-icon">
            <el-icon size="24" color="#67c23a"><CircleCheckFilled /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ statistics?.completedExecutions || 0 }}</div>
            <div class="stat-label">成功次数</div>
          </div>
        </div>
        <div class="stat-card failed">
          <div class="stat-icon">
            <el-icon size="24" color="#f56c6c"><CircleCloseFilled /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ statistics?.failedExecutions || 0 }}</div>
            <div class="stat-label">失败次数</div>
          </div>
        </div>
        <div class="stat-card rate">
          <div class="stat-icon">
            <el-icon size="24" color="#409eff"><TrendCharts /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ (statistics?.avgSuccessRate || 0).toFixed(1) }}%</div>
            <div class="stat-label">成功率</div>
            <div class="sparkline-wrap" aria-hidden="true">
              <svg :width="120" :height="30" viewBox="0 0 120 30" class="sparkline-svg" role="img" aria-label="成功率趋势">
                <path :d="getSparklinePath(getSuccessSeries(12), 120, 28)" fill="none" stroke="#409eff" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- 详细统计信息 -->
      <div class="detailed-stats" v-if="statistics">
        <div class="stats-row">
          <div class="stats-item">
            <span class="stats-label">运行中:</span>
            <span class="stats-value running">{{ statistics.runningExecutions || 0 }}</span>
          </div>
          <div class="stats-item">
            <span class="stats-label">已取消:</span>
            <span class="stats-value cancelled">{{ statistics.cancelledExecutions || 0 }}</span>
          </div>
          <div class="stats-item">
            <span class="stats-label">平均耗时:</span>
            <span class="stats-value">{{ formatDuration(statistics.avgDurationSeconds) }}</span>
          </div>
          <div class="stats-item">
            <span class="stats-label">最长耗时:</span>
            <span class="stats-value">{{ formatDuration(statistics.maxDurationSeconds) }}</span>
          </div>
        </div>
        <div class="stats-row">
          <div class="stats-item">
            <span class="stats-label">总用例数:</span>
            <span class="stats-value">{{ statistics.totalCases || 0 }}</span>
          </div>
          <div class="stats-item">
            <span class="stats-label">通过用例:</span>
            <span class="stats-value success">{{ statistics.totalPassedCases || 0 }}</span>
          </div>
          <div class="stats-item">
            <span class="stats-label">失败用例:</span>
            <span class="stats-value failed">{{ statistics.totalFailedCases || 0 }}</span>
          </div>
          <div class="stats-item">
            <span class="stats-label">跳过用例:</span>
            <span class="stats-value warning">{{ statistics.totalSkippedCases || 0 }}</span>
          </div>
        </div>
      </div>

      <!-- 执行历史表格 -->
      <div class="table-container">
        <el-table 
          :data="executionHistory" 
          v-loading="loading"
          element-loading-text="加载中..."
          stripe
          @row-click="handleRowClick"
          class="history-table"
          height="400"
          :row-class-name="getRowClassName"
        >
          <el-table-column label="执行时间" width="180" sortable="custom" sort-by="start_time">
            <template #default="{ row }">
              <div class="time-cell">
                <div class="time-main">{{ formatTime(row.startTime) }}</div>
                <div class="time-duration" v-if="row.durationSeconds">
                  耗时: {{ formatDuration(row.durationSeconds) }}
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="执行人" width="180">
            <template #default="{ row }">
              <div class="executor-cell">
                <el-avatar :size="32" :src="row.executorAvatar" class="executor-avatar">
                  {{ row.executor.charAt(0) }}
                </el-avatar>
                <div class="executor-info">
                  <div class="executor-name">{{ row.executor }}</div>
                  <div class="executor-meta">
                    <span class="executor-dept" v-if="row.executorInfo?.departmentName">
                      {{ row.executorInfo.departmentName }}
                    </span>
                    <span class="executor-type">{{ getExecutionTypeText(row.executionType) }}</span>
                  </div>
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="执行状态" width="120" align="center">
            <template #default="{ row }">
              <el-tag 
                :type="getStatusTagType(row.status)" 
                size="default"
              >
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="执行环境" width="120" align="center">
            <template #default="{ row }">
              <span class="environment-tag">{{ row.environment || '-' }}</span>
            </template>
          </el-table-column>

          <el-table-column label="执行统计" width="220">
            <template #default="{ row }">
              <div class="stats-cell" v-if="row.totalCases > 0">
                <div class="stats-row">
                  <span class="stats-item success">通过: {{ row.passedCases }}</span>
                  <span class="stats-item failed">失败: {{ row.failedCases }}</span>
                </div>
                <div class="stats-row">
                  <span class="stats-item">执行: {{ row.executedCases || row.totalCases }}</span>
                  <span class="stats-item" v-if="row.skippedCases > 0">跳过: {{ row.skippedCases }}</span>
                </div>
                <div class="stats-row">
                  <span class="stats-item">总计: {{ row.totalCases }}</span>
                  <span class="stats-item" :class="getSuccessRateClass(row.successRate)">
                    {{ row.successRate.toFixed(1) }}%
                  </span>
                </div>
              </div>
              <div v-else class="simple-result">
                {{ getSimpleResultText(row.status) }}
              </div>
            </template>
          </el-table-column>

          <el-table-column label="错误信息" min-width="200">
            <template #default="{ row }">
              <div v-if="row.errorMessage" class="error-cell">
                <el-tooltip :content="row.errorMessage" placement="top">
                  <span class="error-text">{{ truncateText(row.errorMessage, 50) }}</span>
                </el-tooltip>
                <el-button type="text" size="small" @click.stop="openErrorDetail(row)" class="view-full-btn">查看全部</el-button>
              </div>
              <span v-else class="no-error">-</span>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="200" align="center" fixed="right">
            <template #default="{ row }">
              <el-button 
                size="small" 
                type="primary" 
                text
                :icon="View"
                @click.stop="handleViewDetail(row)"
              >
                查看详情
              </el-button>
              <el-button 
                size="small" 
                type="success" 
                text
                :icon="Refresh"
                @click.stop="handleRetest(row)"
              >
                重新测试
              </el-button>
              <el-button 
                size="small" 
                type="danger" 
                text
                :icon="Delete"
                @click.stop="handleDelete(row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 空状态 -->
        <div v-if="!loading && executionHistory.length === 0" class="empty-state">
          <el-empty 
            :image-size="100"
            description="暂无执行记录"
          >
            <template #description>
              <p>该测试用例还没有执行记录</p>
              <p style="color: #909399; font-size: 14px;">执行测试后将显示历史记录</p>
            </template>
          </el-empty>
        </div>
      </div>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 执行详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="执行记录详情"
      width="900px"
      :close-on-click-modal="false"
      append-to-body
    >
      <ExecutionDetailDialog 
        v-if="currentDetail"
        :execution-data="currentDetail"
        @close="detailDialogVisible = false"
        @retest="handleRetestFromDetail"
      />
    </el-dialog>
  
    <!-- 错误详情侧边栏 -->
    <el-drawer
      v-model="errorDrawerVisible"
      title="错误详情"
      direction="rtl"
      :with-header="true"
      size="40%"
      :before-close="() => { errorDrawerVisible = false }"
    >
      <div class="error-detail-content">
        <pre class="error-full-text">{{ currentErrorText }}</pre>
      </div>
    </el-drawer>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Refresh,
  Search,
  Download,
  View,
  Delete,
  Clock,
  CircleCheckFilled,
  CircleCloseFilled,
  TrendCharts
} from '@element-plus/icons-vue'
import { 
  getExecutionRecords,
  getExecutionStatistics,
  deleteExecutionRecord
} from '@/api/testCase'
import ExecutionDetailDialog from '@/components/cases/ExecutionDetailDialog.vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  testCase: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:visible', 'close'])

// 响应式数据
const loading = ref(false)
const testCaseName = ref('')
const executionHistory = ref([])
const statistics = ref(null)
const searchKeyword = ref('')

// 筛选条件
const filters = reactive({
  period: 'all',
  status: '',
  executionType: ''
})

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

// 详情对话框
const detailDialogVisible = ref(false)
const currentDetail = ref(null)
const headerRef = ref(null)
const toolbarRef = ref(null)

// 错误详情侧边栏
const errorDrawerVisible = ref(false)
const currentErrorText = ref('')

// 获取用例ID
const caseId = computed(() => {
  return props.testCase?.caseId || props.testCase?.case_id || props.testCase?.id
})

// 获取时间范围
const getTimeRange = () => {
  if (!filters.period || filters.period === 'all') {
    return { start: null, end: null }
  }
  
  const now = new Date()
  const end = now.toISOString()
  let start = null
  
  switch (filters.period) {
    case '7days':
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
      break
    case '30days':
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
      break
    case '90days':
      start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString()
      break
  }
  
  return { start, end }
}

// 加载执行历史
const loadExecutionHistory = async () => {
  try {
    loading.value = true
    
    const timeRange = getTimeRange()
    const params = {
      execution_scope: 'test_case',
      ref_id: caseId.value,
      status: filters.status || undefined,
      execution_type: filters.executionType || undefined,
      search_keyword: searchKeyword.value || undefined,
      page: pagination.currentPage,
      page_size: pagination.pageSize,
      sort_by: 'start_time',
      sort_order: 'desc'
    }
    
    // 只有在不是"全部"时才添加时间范围参数
    if (timeRange.start && timeRange.end) {
      params.start_time_begin = timeRange.start
      params.start_time_end = timeRange.end
    }
    
    const response = await getExecutionRecords(params)
    
    if (response.code === 1 && response.data) {
      const { items, total } = response.data
      
      if (items && Array.isArray(items)) {
        executionHistory.value = items.map(item => ({
          id: item.record_id || item.recordId,
          recordId: item.record_id || item.recordId,
          startTime: item.start_time || item.startTime,
          endTime: item.end_time || item.endTime,
          executor: item.executor_info?.name || item.executorInfo?.name || '未知',
          executorInfo: item.executor_info || item.executorInfo,
          executorAvatar: item.executor_info?.avatar_url || item.executorInfo?.avatarUrl || '',
          status: item.status,
          executionType: item.execution_type || item.executionType,
          environment: item.environment,
          durationSeconds: item.duration_seconds || item.durationSeconds,
          totalCases: item.total_cases || item.totalCases,
          executedCases: item.executed_cases || item.executedCases,
          passedCases: item.passed_cases || item.passedCases,
          failedCases: item.failed_cases || item.failedCases,
          skippedCases: item.skipped_cases || item.skippedCases,
          successRate: item.success_rate || item.successRate,
          errorMessage: item.error_message || item.errorMessage,
          reportUrl: item.report_url || item.reportUrl
        }))
        
        pagination.total = total || 0
      } else {
        executionHistory.value = []
        pagination.total = 0
      }
    } else {
      ElMessage.error(response.msg || '加载执行历史失败')
      executionHistory.value = []
      pagination.total = 0
    }
  } catch (error) {
    console.error('加载执行历史失败:', error)
    ElMessage.error('加载执行历史失败: ' + (error.message || '未知错误'))
    executionHistory.value = []
    pagination.total = 0
  } finally {
    loading.value = false
  }
}

// 加载统计信息
const loadStatistics = async () => {
  try {
    const timeRange = getTimeRange()
    const params = {
      execution_scope: 'test_case',
      ref_id: caseId.value,
      status: filters.status || undefined,
      execution_type: filters.executionType || undefined
    }
    
    // 只有在不是"全部"时才添加时间范围参数
    if (timeRange.start && timeRange.end) {
      params.start_time_begin = timeRange.start
      params.start_time_end = timeRange.end
    }
    
    const response = await getExecutionStatistics(params)
    
    if (response.code === 1 && response.data) {
      statistics.value = response.data
    }
  } catch (error) {
    console.error('加载统计信息失败:', error)
  }
}

// 生成用于 sparkline 的成功率序列（最近 N 次）
const getSuccessSeries = (n = 12) => {
  const items = executionHistory.value || []
  if (!items.length) return Array(n).fill(0)
  const series = items.slice(0, n).map(i => Number(i.successRate || 0)).reverse()
  // pad to length n
  if (series.length < n) {
    const pad = Array(n - series.length).fill(series[0] ?? 0)
    return pad.concat(series)
  }
  return series
}

// 根据值数组生成 SVG 路径
const getSparklinePath = (values = [], w = 120, h = 30) => {
  if (!values || values.length === 0) return ''
  const max = Math.max(...values)
  const min = Math.min(...values)
  const len = values.length
  const step = w / (len - 1 || 1)
  const scale = (v) => {
    if (max === min) return h / 2
    return h - ((v - min) / (max - min)) * h
  }
  let d = ''
  values.forEach((v, i) => {
    const x = Math.round(i * step)
    const y = Math.round(scale(v))
    d += (i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`)
  })
  return d
}

// 筛选条件变化
const handleFilterChange = () => {
  pagination.currentPage = 1
  loadExecutionHistory()
  loadStatistics()
}

// 搜索
const handleSearch = () => {
  pagination.currentPage = 1
  loadExecutionHistory()
}

// 分页变化
const handleSizeChange = (size) => {
  pagination.pageSize = size
  pagination.currentPage = 1
  loadExecutionHistory()
}

const handlePageChange = (page) => {
  pagination.currentPage = page
  loadExecutionHistory()
}

// 刷新
const refreshHistory = () => {
  loadExecutionHistory()
  loadStatistics()
}

// 关闭弹窗
const handleClose = () => {
  emit('update:visible', false)
  emit('close')
}

// 查看详情
const handleViewDetail = (row) => {
  currentDetail.value = row
  detailDialogVisible.value = true
}

// 重新测试
const handleRetest = (row) => {
  ElMessage.info('重新测试功能开发中...')
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除这条执行记录吗？删除后将无法恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )
    
    const response = await deleteExecutionRecord(row.recordId)
    if (response.code === 1) {
      ElMessage.success('删除成功')
      loadExecutionHistory()
      loadStatistics()
    } else {
      ElMessage.error(response.msg || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除执行记录失败:', error)
      ElMessage.error('删除失败: ' + (error.message || '未知错误'))
    }
  }
}

// 从详情对话框重新测试
const handleRetestFromDetail = () => {
  detailDialogVisible.value = false
  ElMessage.info('重新测试功能开发中...')
}

// 导出
const exportHistory = () => {
  ElMessage.info('导出功能开发中...')
}

// 行点击
const handleRowClick = (row) => {
  handleViewDetail(row)
}

// 获取行样式类名
const getRowClassName = ({ row, rowIndex }) => {
  if (row.status === 'failed') {
    return 'failed-row'
  } else if (row.status === 'completed') {
    return 'success-row'
  }
  return ''
}

// 打开错误详情侧边栏
const openErrorDetail = (row) => {
  currentErrorText.value = row.errorMessage || row.error || '无错误信息'
  errorDrawerVisible.value = true
}

// 计算并设置 sticky toolbar top 值
const updateStickyTop = () => {
  const headerEl = headerRef.value && headerRef.value.$el ? headerRef.value.$el : headerRef.value
  const toolbarEl = toolbarRef.value && toolbarRef.value.$el ? toolbarRef.value.$el : toolbarRef.value
  if (headerEl && toolbarEl) {
    const rect = headerEl.getBoundingClientRect()
    const top = rect.height + rect.top
    toolbarEl.style.top = `${top}px`
  }
}

onMounted(() => {
  window.addEventListener('resize', updateStickyTop)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateStickyTop)
})

// 工具函数
const formatTime = (time) => {
  if (!time) return '-'
  return new Date(time).toLocaleString('zh-CN')
}

const formatDuration = (seconds) => {
  if (!seconds) return '-'
  if (seconds < 1) return `${Math.round(seconds * 1000)}ms`
  if (seconds < 60) return `${seconds.toFixed(1)}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}分${remainingSeconds}秒`
}

const getStatusTagType = (status) => {
  const typeMap = {
    'completed': 'success',
    'failed': 'danger',
    'running': 'warning',
    'cancelled': 'info'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status) => {
  const textMap = {
    'completed': '已完成',
    'failed': '失败',
    'running': '运行中',
    'cancelled': '已取消'
  }
  return textMap[status] || status
}

const getExecutionTypeText = (type) => {
  const typeMap = {
    'manual': '手动执行',
    'scheduled': '定时任务',
    'triggered': '触发执行'
  }
  return typeMap[type] || '手动执行'
}

const getSuccessRateClass = (rate) => {
  if (rate >= 90) return 'success'
  if (rate >= 70) return 'warning'
  return 'failed'
}

const getSimpleResultText = (status) => {
  const textMap = {
    'completed': '执行成功',
    'failed': '执行失败',
    'running': '执行中...',
    'cancelled': '已取消'
  }
  return textMap[status] || '未知'
}

const truncateText = (text, maxLength) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// 监听弹窗显示状态
watch(() => props.visible, (newVisible) => {
  if (newVisible) {
    testCaseName.value = props.testCase?.name || '测试用例'
    loadExecutionHistory()
    loadStatistics()
  }
})
</script>

<style scoped>
.execution-history-modal {
  --el-dialog-border-radius: 12px;
}

.modal-content {
  max-height: 75vh;
  overflow-y: auto;
  padding: 0;
}

/* 页面头部 */
.modal-header {
  margin-bottom: 20px;
  padding: 0;
  border-bottom: none;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid #e4e7ed;
}

.header-title h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
}

.header-subtitle {
  margin: 6px 0 0 0;
  font-size: 14px;
  color: #909399;
  line-height: 1.4;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 筛选工具栏 */
.filter-toolbar {
  margin-bottom: 20px;
  padding: 0;
}

.toolbar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.filter-group {
  display: flex;
  gap: 12px;
  align-items: center;
}

.filter-select {
  width: 140px;
}

.search-group {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-input {
  width: 250px;
}

.export-btn {
  border: 1px solid #dcdfe6;
  background: white;
  color: #606266;
}

.export-btn:hover {
  border-color: #409eff;
  color: #409eff;
}

/* 统计卡片 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;
}

.stat-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.stat-card.total {
  border-left: 4px solid #409eff;
}

.stat-card.success {
  border-left: 4px solid #67c23a;
}

.stat-card.failed {
  border-left: 4px solid #f56c6c;
}

.stat-card.rate {
  border-left: 4px solid #e6a23c;
}

.stat-icon {
  margin-right: 16px;
  padding: 12px;
  border-radius: 8px;
  background: #f8f9fa;
}

.stat-card.total .stat-icon {
  background: #f0f9ff;
  color: #409eff;
}

.stat-card.success .stat-icon {
  background: #f0f9ff;
}

.stat-card.failed .stat-icon {
  background: #fef0f0;
}

.stat-card.rate .stat-icon {
  background: #fdf6ec;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 4px;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  font-weight: 500;
}

/* 详细统计信息 */
.detailed-stats {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
}

.detailed-stats .stats-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 16px;
}

.detailed-stats .stats-row:last-child {
  margin-bottom: 0;
}

.detailed-stats .stats-item {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
}

.detailed-stats .stats-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.detailed-stats .stats-value {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.detailed-stats .stats-value.success {
  color: #67c23a;
}

.detailed-stats .stats-value.failed {
  color: #f56c6c;
}

.detailed-stats .stats-value.warning {
  color: #e6a23c;
}

.detailed-stats .stats-value.running {
  color: #409eff;
}

.detailed-stats .stats-value.cancelled {
  color: #909399;
}

/* 表格容器 */
.table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  margin-bottom: 20px;
  border: 1px solid #f0f0f0;
}

.history-table {
  width: 100%;
}

.history-table :deep(.el-table__header) {
  background: #fafafa;
}

.history-table :deep(.el-table__header th) {
  background: #fafafa;
  color: #606266;
  font-weight: 600;
  border-bottom: 1px solid #e4e7ed;
}

.history-table :deep(.el-table__row) {
  transition: all 0.2s ease;
}

.history-table :deep(.el-table__row:hover) {
  background: #f5f7fa;
}

.history-table :deep(.success-row) {
  background: #f0f9ff;
}

.history-table :deep(.success-row:hover) {
  background: #e1f5fe;
}

.history-table :deep(.failed-row) {
  background: #fef0f0;
}

.history-table :deep(.failed-row:hover) {
  background: #fde2e2;
}

/* 表格单元格样式 */
.time-cell {
  line-height: 1.4;
}

.time-main {
  font-weight: 600;
  color: #303133;
  font-size: 14px;
}

.time-duration {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  font-weight: 400;
}

.executor-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.executor-avatar {
  flex-shrink: 0;
}

.executor-info {
  flex: 1;
  min-width: 0;
}

.executor-name {
  font-weight: 600;
  color: #303133;
  font-size: 14px;
  margin-bottom: 4px;
}

.executor-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.executor-dept {
  font-size: 11px;
  color: #606266;
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}

.executor-type {
  font-size: 11px;
  color: #409eff;
  background: #f0f9ff;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}

.environment-tag {
  padding: 4px 8px;
  background: #f0f2f5;
  border-radius: 6px;
  font-size: 12px;
  color: #606266;
  font-weight: 500;
  border: 1px solid #e4e7ed;
}

.stats-cell {
  line-height: 1.4;
}

.stats-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  align-items: center;
}

.stats-item {
  font-size: 12px;
  color: #606266;
  font-weight: 500;
}

.stats-item.success {
  color: #67c23a;
  font-weight: 600;
}

.stats-item.failed {
  color: #f56c6c;
  font-weight: 600;
}

.stats-item.warning {
  color: #e6a23c;
  font-weight: 600;
}

.simple-result {
  font-size: 13px;
  color: #606266;
  font-weight: 500;
  text-align: center;
  padding: 4px 8px;
  background: #f5f7fa;
  border-radius: 4px;
}

.error-cell {
  max-width: 200px;
}

.error-text {
  font-size: 12px;
  color: #f56c6c;
  line-height: 1.4;
  font-weight: 500;
}

.no-error {
  color: #c0c4cc;
  font-size: 12px;
  font-style: italic;
}

/* 空状态 */
.empty-state {
  padding: 40px;
  text-align: center;
}

/* 分页 */
.pagination-container {
  display: flex;
  justify-content: center;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
}

/* 提升模态框整体视觉 */
.execution-history-modal {
  --dialog-shadow: 0 30px 80px rgba(16,24,40,0.12);
}
.execution-history-modal :deep(.el-dialog) {
  box-shadow: var(--dialog-shadow);
  border-radius: 14px;
  overflow: hidden;
  animation: dialogFadeIn .18s ease;
}
.modal-header {
  background: linear-gradient(90deg,#f7fbff 0%, #ffffff 100%);
  padding: 18px 24px;
  border-bottom: 1px solid #eaf3ff;
}
.header-title h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #102a43;
}
.header-subtitle {
  margin: 6px 0 0 0;
  font-size: 13px;
  color: #61748a;
}

@keyframes dialogFadeIn {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 让筛选工具栏在滚动时悬浮可见 */
.filter-toolbar {
  position: sticky;
  top: 92px;
  z-index: 6;
  margin-bottom: 12px;
  padding: 0 24px;
}
.toolbar-content {
  padding: 12px 16px;
  background: rgba(255,255,255,0.9);
  backdrop-filter: blur(6px);
  border-radius: 10px;
  box-shadow: 0 8px 20px rgba(16,24,40,0.04);
}

/* 统计卡片微调 */
.stat-card {
  padding: 18px;
  background: linear-gradient(180deg,#ffffff 0%, #fbfdff 100%);
  box-shadow: 0 6px 28px rgba(16,24,40,0.06);
  border: 1px solid rgba(234,243,255,0.8);
  transition: transform .22s cubic-bezier(.2,.8,.2,1), box-shadow .22s ease;
}
.stat-card:hover {
  transform: translateY(-6px) scale(1.01);
  box-shadow: 0 18px 56px rgba(16,24,40,0.08);
}
.stat-number {
  color: #102a43;
  animation: popIn .36s cubic-bezier(.2,.8,.2,1);
}
@keyframes popIn {
  0% { transform: scale(.85); opacity: 0; }
  60% { transform: scale(1.06); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}

/* 表格行 hover 动效 */
.history-table :deep(.el-table__row:hover) {
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(16,24,40,0.04);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .toolbar-content {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .filter-group,
  .search-group {
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .toolbar-content {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .filter-group,
  .search-group {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .filter-select,
  .search-input {
    width: 100%;
    max-width: 200px;
  }
  
  .stats-cards {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    padding: 16px;
  }
  
  .stat-number {
    font-size: 24px;
  }
  
  .detailed-stats .stats-row {
    flex-direction: column;
    gap: 12px;
  }
  
  .detailed-stats .stats-item {
    justify-content: space-between;
    min-width: auto;
  }
}
</style>
