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
            <p class="summary-desc">{{ getFrequencyText(task.frequency) }} {{ task.executionTime }} 自动执行</p>
            <div class="task-status">
              <el-tag
                :type="task.status === 'enabled' ? 'success' : 'info'"
                size="large"
              >
                {{ task.status === 'enabled' ? '启用' : '禁用' }}
              </el-tag>
            </div>
          </div>

          <!-- 基本信息 -->
          <div class="info-section">
            <h3 class="section-title">基本信息</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">创建者</span>
                <span class="info-value">{{ task.creator }}</span>
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
              <div class="info-item">
                <span class="info-label">关联用例</span>
                <span class="info-value">{{ task.caseCount }}个</span>
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
            </div>
          </div>

          <!-- 关联用例列表 -->
          <div class="info-section">
            <h3 class="section-title">关联用例列表</h3>
            <div class="case-list">
              <div class="case-item" v-for="caseItem in task.cases" :key="caseItem.id">
                <el-icon
                  :class="['case-status', caseItem.status === 'passed' ? 'success' : 'failed']"
                >
                  <SuccessFilled v-if="caseItem.status === 'passed'" />
                  <CircleCloseFilled v-else />
                </el-icon>
                <span class="case-name">{{ caseItem.name }}</span>
              </div>
              <div v-if="!task.cases || task.cases.length === 0" class="empty-cases">
                暂无关联用例
              </div>
            </div>
          </div>

          <!-- 最近执行结果 -->
          <div class="info-section">
            <h3 class="section-title">最近执行结果</h3>
            <div class="execution-results">
              <div class="execution-item" v-for="result in task.executionResults" :key="result.id">
                <div class="execution-header">
                  <el-icon class="execution-status success">
                    <SuccessFilled />
                  </el-icon>
                  <span class="execution-time">{{ result.time }}</span>
                  <span class="execution-duration">耗时: {{ result.duration }}</span>
                </div>
                <div class="execution-stats">
                  <span class="stat-item success">{{ result.passed }} 通过</span>
                  <span class="stat-item failed">{{ result.failed }} 失败</span>
                  <span class="stat-item warning">{{ result.warning }} 警告</span>
                </div>
              </div>
              <div v-if="!task.executionResults || task.executionResults.length === 0" class="empty-results">
                暂无执行记录
              </div>
              <el-button link type="primary" class="history-btn">查看完整历史记录</el-button>
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
import { Edit, Delete, SuccessFilled, CircleCloseFilled } from '@element-plus/icons-vue'
import PageEnterTransition from '../components/ui/PageEnterTransition.vue'
import LoadingSpinner from '../components/ui/LoadingSpinner.vue'
import { getTaskDetail, deleteTask } from '../api/task'

const route = useRoute()
const router = useRouter()

const taskId = ref(route.params.taskId)
const loading = ref(true)
const task = ref(null)

// 获取频率文本
const getFrequencyText = (frequency) => {
  const frequencyMap = {
    'daily': '每日执行',
    'weekly': '每周执行',
    'monthly': '每月执行'
  }
  return frequencyMap[frequency] || frequency
}

// 加载任务数据
const loadTask = async () => {
  try {
    loading.value = true
    const response = await getTaskDetail(taskId.value)

    if (response.code === 200 && response.data) {
      task.value = response.data
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
  margin: 0 0 16px 0;
  color: #606266;
  font-size: 16px;
}

.task-status {
  display: flex;
  justify-content: center;
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
