<template>
  <div class="execution-detail-dialog">
    <!-- 基本信息 -->
    <div class="detail-section">
      <h3 class="section-title">基本信息</h3>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="执行ID">
          {{ executionData.recordId }}
        </el-descriptions-item>
        <el-descriptions-item label="执行人">
          <div class="executor-info">
            <el-avatar :size="32" :src="executionData.executorInfo?.avatarUrl || executionData.executorAvatar" class="executor-avatar">
              {{ executionData.executor.charAt(0) }}
            </el-avatar>
            <div class="executor-details">
              <div class="executor-name">{{ executionData.executor }}</div>
              <div class="executor-meta" v-if="executionData.executorInfo">
                <span class="executor-dept" v-if="executionData.executorInfo.departmentName">
                  {{ executionData.executorInfo.departmentName }}
                </span>
                <span class="executor-position" v-if="executionData.executorInfo.position">
                  {{ executionData.executorInfo.position }}
                </span>
              </div>
            </div>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="执行类型">
          <el-tag :type="executionData.executionType === 'manual' ? 'primary' : 'info'" size="small">
            {{ getExecutionTypeText(executionData.executionType) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="执行状态">
          <el-tag 
            :type="getStatusTagType(executionData.status)"
            size="small"
          >
            {{ getStatusText(executionData.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="执行环境">
          {{ executionData.environment || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="开始时间">
          {{ formatTime(executionData.startTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="结束时间">
          {{ formatTime(executionData.endTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="执行耗时">
          {{ formatDuration(executionData.durationSeconds) }}
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- 执行人详细信息 -->
    <div class="detail-section" v-if="executionData.executorInfo">
      <h3 class="section-title">执行人信息</h3>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="姓名">
          {{ executionData.executorInfo.name }}
        </el-descriptions-item>
        <el-descriptions-item label="邮箱">
          {{ executionData.executorInfo.email }}
        </el-descriptions-item>
        <el-descriptions-item label="电话">
          {{ executionData.executorInfo.phone }}
        </el-descriptions-item>
        <el-descriptions-item label="工号">
          {{ executionData.executorInfo.employeeId }}
        </el-descriptions-item>
        <el-descriptions-item label="部门">
          {{ executionData.executorInfo.departmentName }}
        </el-descriptions-item>
        <el-descriptions-item label="职位">
          {{ executionData.executorInfo.position }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="executionData.executorInfo.status === 'active' ? 'success' : 'info'" size="small">
            {{ executionData.executorInfo.status === 'active' ? '在职' : '离职' }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- 执行统计 -->
    <div class="detail-section" v-if="executionData.totalCases > 0">
      <h3 class="section-title">执行统计</h3>
      <el-descriptions :column="3" border>
        <el-descriptions-item label="总用例数">
          {{ executionData.totalCases }}
        </el-descriptions-item>
        <el-descriptions-item label="已执行">
          {{ executionData.executedCases || executionData.totalCases }}
        </el-descriptions-item>
        <el-descriptions-item label="通过数">
          <span style="color: #67c23a; font-weight: bold;">
            {{ executionData.passedCases }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="失败数">
          <span style="color: #f56c6c; font-weight: bold;">
            {{ executionData.failedCases }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item label="跳过数">
          {{ executionData.skippedCases || 0 }}
        </el-descriptions-item>
        <el-descriptions-item label="成功率">
          <span :style="{ 
            color: getSuccessRateColor(executionData.successRate),
            fontWeight: 'bold'
          }">
            {{ executionData.successRate.toFixed(2) }}%
          </span>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- 错误信息 -->
    <div class="detail-section" v-if="executionData.errorMessage">
      <h3 class="section-title">错误信息</h3>
      <el-alert 
        type="error" 
        :closable="false"
        show-icon
      >
        <pre class="error-message">{{ executionData.errorMessage }}</pre>
      </el-alert>
    </div>

    <!-- 报告链接 -->
    <div class="detail-section" v-if="executionData.reportUrl">
      <h3 class="section-title">测试报告</h3>
      <el-link 
        :href="executionData.reportUrl" 
        type="primary" 
        target="_blank"
        :icon="Document"
      >
        查看完整测试报告
      </el-link>
    </div>

    <!-- 操作按钮 -->
    <div class="detail-actions">
      <el-button @click="handleClose">关闭</el-button>
      <el-button 
        type="success" 
        :icon="Refresh"
        @click="handleRetest"
      >
        重新测试
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { Document, Refresh } from '@element-plus/icons-vue'

const props = defineProps({
  executionData: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'retest'])

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

const getSuccessRateColor = (rate) => {
  if (rate >= 90) return '#67c23a'
  if (rate >= 70) return '#e6a23c'
  return '#f56c6c'
}

// 事件处理
const handleClose = () => {
  emit('close')
}

const handleRetest = () => {
  emit('retest', props.executionData)
}
</script>

<style scoped>
.execution-detail-dialog {
  max-height: 600px;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid #409eff;
}

.executor-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.executor-details {
  flex: 1;
}

.executor-name {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.executor-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.executor-dept {
  font-size: 12px;
  color: #606266;
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 3px;
}

.executor-position {
  font-size: 12px;
  color: #909399;
  background: #f0f2f5;
  padding: 2px 6px;
  border-radius: 3px;
}

.error-message {
  margin: 0;
  padding: 12px;
  background: #fef0f0;
  border-radius: 4px;
  font-size: 13px;
  line-height: 1.6;
  color: #f56c6c;
  white-space: pre-wrap;
  word-break: break-word;
}

.detail-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;
}
</style>
