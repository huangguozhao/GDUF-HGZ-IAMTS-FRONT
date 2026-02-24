<template>
  <div class="task-detail-page">
    <PageEnterTransition>
      <div v-if="loading" class="loading-container">
        <LoadingSpinner />
      </div>
      <div v-else-if="task" class="page-content">
        <!-- 页面头部 -->
        <div class="page-header">
          <div class="breadcrumb">
            <span class="breadcrumb-item" @click="$router.push('/tasks')">任务安排</span>
            <span class="breadcrumb-separator">›</span>
            <span class="breadcrumb-item active">{{ task.name }}</span>
          </div>
          <div class="header-actions">
            <el-button @click="$router.go(-1)">返回列表</el-button>
            <el-button
              :type="task.status === 'enabled' ? 'warning' : 'success'"
              @click="handleToggleStatus"
            >
              <el-icon><VideoPause v-if="task.status === 'enabled'" /><VideoPlay v-else /></el-icon>
              {{ task.status === 'enabled' ? '禁用' : '启用' }}
            </el-button>
            <el-button type="primary" @click="handleExecute">
              <el-icon><RefreshRight /></el-icon>
              立即执行
            </el-button>
            <el-button type="primary" @click="handleEdit">
              <el-icon><Edit /></el-icon>
              编辑任务
            </el-button>
            <el-button type="danger" @click="handleDelete">
              <el-icon><Delete /></el-icon>
              删除任务
            </el-button>
          </div>
        </div>

        <!-- 任务详情内容 -->
        <div class="task-detail-content">
          <!-- 任务摘要 -->
          <div class="task-summary">
            <h2>{{ task.name }}</h2>
            <p class="summary-desc">{{ task.description || '暂无描述' }}</p>
            <p class="summary-execution">{{ getFrequencyText(task.frequency) }} {{ task.executionTime }} 自动执行</p>
            <div class="task-status-row">
              <el-tag
                :type="task.status === 'enabled' ? 'success' : 'info'"
                size="large"
              >
                {{ task.status === 'enabled' ? '启用' : '禁用' }}
              </el-tag>
              <el-tag
                v-if="task.lastExecutionStatus"
                :type="task.lastExecutionStatus === 'success' ? 'success' : (task.lastExecutionStatus === 'failed' ? 'danger' : 'warning')"
                size="large"
              >
                {{ task.lastExecutionStatus === 'success' ? '上次执行成功' : (task.lastExecutionStatus === 'failed' ? '上次执行失败' : '运行中') }}
              </el-tag>
            </div>
          </div>

          <!-- 基本信息 -->
          <div class="info-section">
            <h3 class="section-title">基本信息</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">任务类型</span>
                <span class="info-value">{{ getTaskTypeText(task.taskType) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">目标名称</span>
                <span class="info-value">{{ task.targetName || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">执行环境</span>
                <span class="info-value">{{ task.executionEnvironment || 'test' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">创建时间</span>
                <span class="info-value">{{ task.createTime }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">最后执行</span>
                <span class="info-value">{{ task.lastExecution }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">下次执行</span>
                <span class="info-value">{{ task.nextExecution }}</span>
              </div>
            </div>
          </div>

          <!-- 执行统计 -->
          <div class="info-section">
            <h3 class="section-title">执行统计</h3>
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-value">{{ task.totalExecutions }}</div>
                <div class="stat-label">总执行次数</div>
              </div>
              <div class="stat-card success">
                <div class="stat-value">{{ task.successfulExecutions }}</div>
                <div class="stat-label">成功次数</div>
              </div>
              <div class="stat-card danger">
                <div class="stat-value">{{ task.failedExecutions }}</div>
                <div class="stat-label">失败次数</div>
              </div>
              <div class="stat-card info">
                <div class="stat-value">{{ task.successRate ? task.successRate.toFixed(1) + '%' : '0%' }}</div>
                <div class="stat-label">成功率</div>
              </div>
            </div>
          </div>

          <!-- 执行计划 -->
          <div class="info-section">
            <h3 class="section-title">执行计划</h3>
            <div class="plan-info">
              <div class="plan-item">
                <span class="plan-label">执行频率</span>
                <span class="plan-value">{{ getFrequencyText(task.frequency) }}</span>
              </div>
              <div class="plan-item">
                <span class="plan-label">执行时间</span>
                <span class="plan-value">{{ task.executionTime }}</span>
              </div>
              <div class="plan-item">
                <span class="plan-label">超时设置</span>
                <span class="plan-value">{{ task.timeout }}分钟</span>
              </div>
              <div class="plan-item">
                <span class="plan-label">重试设置</span>
                <span class="plan-value">{{ task.retryEnabled ? `启用 (最多${task.maxRetryAttempts}次)` : '禁用' }}</span>
              </div>
              <div class="plan-item">
                <span class="plan-label">通知设置</span>
                <span class="plan-value">
                  {{ task.notifyOnSuccess ? '成功通知 ' : '' }}
                  {{ task.notifyOnFailure ? '失败通知' : '' }}
                  {{ !task.notifyOnSuccess && !task.notifyOnFailure ? '无' : '' }}
                </span>
              </div>
            </div>
          </div>

          <!-- 最近执行记录 -->
          <div class="info-section">
            <h3 class="section-title">最近执行记录</h3>
            <div class="execution-results" v-if="executionHistory.length > 0">
              <div class="execution-item" v-for="result in executionHistory" :key="result.id">
                <div class="execution-header">
                  <el-icon :class="['execution-status', result.status === 'success' ? 'success' : (result.status === 'failed' ? 'failed' : 'warning')]">
                    <SuccessFilled v-if="result.status === 'success'" />
                    <CircleCloseFilled v-else-if="result.status === 'failed'" />
                  </el-icon>
                  <span class="execution-time">{{ result.time }}</span>
                  <span class="execution-duration">耗时: {{ result.duration }}</span>
                </div>
                <div class="execution-stats">
                  <span class="stat-item success">{{ result.passed }} 通过</span>
                  <span class="stat-item failed">{{ result.failed }} 失败</span>
                  <span class="stat-item total">总计: {{ result.total }}</span>
                </div>
              </div>
              <el-button link type="primary" class="history-btn">查看完整历史记录</el-button>
            </div>
            <div v-else class="empty-results">
              暂无执行记录
            </div>
          </div>
        </div>
      </div>
      <div v-else class="error-container">
        <div class="error-icon">❌</div>
        <div class="error-title">任务不存在</div>
        <div class="error-message">找不到ID为 {{ taskId }} 的任务</div>
        <el-button @click="$router.push('/tasks')">返回任务列表</el-button>
      </div>
    </PageEnterTransition>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Delete, SuccessFilled, CircleCloseFilled, VideoPlay, VideoPause, RefreshRight } from '@element-plus/icons-vue'
import PageEnterTransition from '../components/ui/PageEnterTransition.vue'
import LoadingSpinner from '../components/ui/LoadingSpinner.vue'
import { getTaskDetail, deleteTask, enableTask, disableTask, executeTask, getTaskExecutionHistory } from '../api/task'

const route = useRoute()
const router = useRouter()

const taskId = ref(route.params.taskId)
const loading = ref(true)
const task = ref(null)
const executionHistory = ref([])
const historyLoading = ref(false)

// 获取频率文本
const getFrequencyText = (frequency) => {
  const frequencyMap = {
    'daily': '每日执行',
    'weekly': '每周执行',
    'monthly': '每月执行',
    'cron': 'Cron表达式',
    'simple': '简单重复'
  }
  return frequencyMap[frequency] || frequency || '-'
}

// 获取任务类型文本
const getTaskTypeText = (taskType) => {
  const typeMap = {
    'single_case': '单个用例',
    'module': '模块',
    'project': '项目',
    'test_suite': '测试套件',
    'api': 'API'
  }
  return typeMap[taskType] || taskType || '-'
}

// 格式化日期时间
const formatDateTime = (dateTime) => {
  if (!dateTime) return '-'
  const date = new Date(dateTime)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

// 转换后端数据为前端需要的格式
const transformBackendData = (item) => {
  return {
    id: item.taskId,
    name: item.taskName,
    description: item.description,
    taskType: item.taskType,
    targetId: item.targetId,
    targetName: item.targetName || '',
    frequency: item.triggerType,
    lastExecution: item.lastExecutionTime ? formatDateTime(item.lastExecutionTime) : '-',
    nextExecution: item.nextTriggerTime ? formatDateTime(item.nextTriggerTime) : '-',
    caseCount: item.totalExecutions || 0,
    creator: item.createdBy || '-',
    createTime: item.createdAt ? formatDateTime(item.createdAt) : '-',
    status: item.isEnabled ? 'enabled' : 'disabled',
    isEnabled: item.isEnabled,
    executionTime: item.dailyHour !== undefined ?
      `${String(item.dailyHour).padStart(2, '0')}:${String(item.dailyMinute || 0).padStart(2, '0')}` : '-',
    timeout: item.timeoutSeconds ? Math.ceil(item.timeoutSeconds / 60) : 60,
    lastExecutionStatus: item.lastExecutionStatus,
    successRate: item.successRate || 0,
    totalExecutions: item.totalExecutions || 0,
    successfulExecutions: item.successfulExecutions || 0,
    failedExecutions: item.failedExecutions || 0,
    skippedExecutions: item.skippedExecutions || 0,
    weeklyDays: item.weeklyDays,
    monthlyDay: item.monthlyDay,
    triggerType: item.triggerType,
    executionEnvironment: item.executionEnvironment,
    cronExpression: item.cronExpression,
    retryEnabled: item.retryEnabled,
    maxRetryAttempts: item.maxRetryAttempts,
    notifyOnSuccess: item.notifyOnSuccess,
    notifyOnFailure: item.notifyOnFailure,
    notificationRecipients: item.notificationRecipients,
    skipIfPreviousFailed: item.skipIfPreviousFailed,
    maxDurationSeconds: item.maxDurationSeconds
  }
}

// 加载任务数据
const loadTask = async () => {
  try {
    loading.value = true
    const response = await getTaskDetail(taskId.value)

    if (response.code === 200 && response.data) {
      task.value = transformBackendData(response.data)
      // 加载执行历史
      loadExecutionHistory()
    } else {
      task.value = null
    }
  } catch (error) {
    console.error('加载任务失败:', error)
    ElMessage.error('加载任务失败')
    task.value = null
  } finally {
    loading.value = false
  }
}

// 加载执行历史
const loadExecutionHistory = async () => {
  try {
    historyLoading.value = true
    const response = await getTaskExecutionHistory(taskId.value, { page: 1, page_size: 5 })
    if (response.code === 200 && response.data && response.data.list) {
      executionHistory.value = response.data.list.map(item => ({
        id: item.executionId,
        time: item.scheduledTime ? formatDateTime(item.scheduledTime) : '-',
        startTime: item.startTime ? formatDateTime(item.startTime) : '-',
        endTime: item.endTime ? formatDateTime(item.endTime) : '-',
        duration: item.duration ? `${Math.floor(item.duration / 60)}分${item.duration % 60}秒` : '-',
        status: item.status,
        passed: item.passedCount || 0,
        failed: item.failedCount || 0,
        warning: item.warningCount || 0,
        total: item.totalCount || 0
      }))
    }
  } catch (error) {
    console.error('加载执行历史失败:', error)
  } finally {
    historyLoading.value = false
  }
}

// 处理启用/禁用
const handleToggleStatus = async () => {
  try {
    const action = task.value.status === 'enabled' ? '禁用' : '启用'
    await ElMessageBox.confirm(
      `确定要${action}任务"${task.value.name}"吗？`,
      `${action}确认`,
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    if (task.value.status === 'enabled') {
      await disableTask(taskId.value)
      ElMessage.success('任务已禁用')
    } else {
      await enableTask(taskId.value)
      ElMessage.success('任务已启用')
    }
    loadTask()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('操作失败:', error)
      ElMessage.error('操作失败，请稍后重试')
    }
  }
}

// 处理立即执行
const handleExecute = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要立即执行任务"${task.value.name}"吗？`,
      '执行确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }
    )

    await executeTask(taskId.value)
    ElMessage.success('任务已提交执行')
    loadTask()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('执行失败:', error)
      ElMessage.error('执行失败，请稍后重试')
    }
  }
}

// 处理编辑
const handleEdit = () => {
  // 跳转到编辑页面（后续可实现）
  ElMessage.info('编辑功能即将实现')
}

// 处理删除
const handleDelete = async () => {
  try {
    await ElMessageBox.confirm('确定要删除这个定时任务吗？', '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const response = await deleteTask(taskId.value)
    if (response.code === 200) {
      ElMessage.success('删除成功')
      router.push('/tasks')
    } else {
      ElMessage.error(response.msg || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

onMounted(() => {
  loadTask()
})
</script>

<style scoped>
.task-detail-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.page-content {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px 24px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.breadcrumb {
  font-size: 14px;
  color: #666;
  cursor: pointer;
}

.breadcrumb-item.active {
  color: #409eff;
  font-weight: 500;
}

.breadcrumb-separator {
  margin: 0 8px;
  color: #ccc;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.task-detail-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.task-summary {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.task-summary h2 {
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 600;
  color: #303133;
}

.summary-desc {
  margin: 0 0 8px 0;
  color: #606266;
  font-size: 16px;
}

.summary-execution {
  margin: 0 0 16px 0;
  color: #909399;
  font-size: 14px;
}

.task-status {
  display: flex;
  justify-content: center;
}

.task-status-row {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
}

.stat-card.success {
  background: #f0f9ff;
  border: 1px solid #bae7ff;
}

.stat-card.danger {
  background: #fff1f0;
  border: 1px solid #ffccc7;
}

.stat-card.info {
  background: #f9f9f9;
  border: 1px solid #e8e8e8;
}

.stat-card .stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.stat-card.success .stat-value {
  color: #67c23a;
}

.stat-card.danger .stat-value {
  color: #f56c6c;
}

.stat-card .stat-label {
  font-size: 14px;
  color: #606266;
}

.info-section {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.section-title {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-label {
  font-weight: 500;
  color: #606266;
  font-size: 14px;
}

.info-value {
  color: #303133;
  font-size: 14px;
}

.plan-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.plan-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.plan-label {
  font-weight: 500;
  color: #606266;
  min-width: 80px;
}

.plan-value {
  color: #303133;
  font-weight: 500;
}

.case-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.case-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}

.case-status.success {
  color: #67c23a;
}

.case-status.failed {
  color: #f56c6c;
}

.case-name {
  color: #303133;
  font-weight: 500;
}

.empty-cases,
.empty-results {
  text-align: center;
  padding: 20px;
  color: #909399;
  font-style: italic;
}

.execution-results {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.execution-item {
  padding: 16px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: #fafafa;
}

.execution-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.execution-status {
  font-size: 18px;
}

.execution-time {
  font-weight: 500;
  color: #303133;
}

.execution-duration {
  color: #909399;
  font-size: 14px;
}

.execution-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  font-size: 14px;
  font-weight: 500;
}

.stat-item.success {
  color: #67c23a;
}

.stat-item.failed {
  color: #f56c6c;
}

.stat-item.warning {
  color: #e6a23c;
}

.stat-item.total {
  color: #909399;
}

.history-btn {
  margin-top: 16px;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.error-container {
  text-align: center;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-title {
  font-size: 24px;
  font-weight: bold;
  color: #666;
  margin-bottom: 8px;
}

.error-message {
  color: #999;
  margin-bottom: 24px;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .plan-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .execution-stats {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
