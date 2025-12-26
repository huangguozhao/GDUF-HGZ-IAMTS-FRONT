<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="handleVisibleChange"
    title="测试执行结果"
    width="800px"
    :close-on-click-modal="false"
  >
    <div class="execution-result-container" v-if="executionResult">
      <!-- 结果状态横幅 -->
      <div class="result-banner" :class="'status-' + getDisplayStatus(executionResult.status)">
        <div class="banner-icon">
          <el-icon v-if="getDisplayStatus(executionResult.status) === 'passed'" :size="60" color="#67c23a">
            <CircleCheckFilled />
          </el-icon>
          <el-icon v-else :size="60" color="#f56c6c">
            <CircleCloseFilled />
          </el-icon>
        </div>
        <div class="banner-content">
          <h3 class="result-title">
            {{ getDisplayStatus(executionResult.status) === 'passed' ? '✓ 测试通过' : '✗ 测试失败' }}
          </h3>
          <p class="result-subtitle">{{ executionResult.scopeName || '未知' }}</p>
        </div>
      </div>

      <!-- 执行信息 -->
      <div class="result-info-section">
        <div class="info-grid" :class="{ 'info-grid-api': executionResult.totalCases }">
          <div class="info-card">
            <div class="info-label">执行ID</div>
            <div class="info-value">{{ executionResult.recordId }}</div>
          </div>
          <div class="info-card">
            <div class="info-label">执行环境</div>
            <div class="info-value">
              <el-tag size="small" type="info">
                {{ getEnvironmentText(executionResult.environment) }}
              </el-tag>
            </div>
          </div>
          <div class="info-card">
            <div class="info-label">执行耗时</div>
            <div class="info-value highlight">
              {{ formatDuration(executionResult.durationSeconds) }}
            </div>
          </div>
          <div class="info-card">
            <div class="info-label">{{ executionResult.totalCases ? '用例数' : '执行类型' }}</div>
            <div class="info-value">
              <template v-if="executionResult.totalCases">
                <span class="total-count">{{ executionResult.totalCases }} 个</span>
              </template>
              <template v-else>
                <el-tag size="small" type="primary">
                  {{ getExecutionTypeText(executionResult.executionType) }}
                </el-tag>
              </template>
            </div>
          </div>
          <!-- 接口测试专用信息 -->
          <template v-if="executionResult.totalCases">
            <div class="info-card">
              <div class="info-label">通过率</div>
              <div class="info-value highlight">
                <span :style="{
                  color: executionResult.successRate >= 90 ? '#67c23a' :
                         executionResult.successRate >= 70 ? '#e6a23c' : '#f56c6c'
                }">
                  {{ executionResult.successRate.toFixed(1) }}%
                </span>
              </div>
            </div>
            <div class="info-card">
              <div class="info-label">通过/失败</div>
              <div class="info-value">
                <span class="success-count">{{ executionResult.passedCases }}</span>
                <span class="divider">/</span>
                <span class="failed-count">{{ executionResult.failedCases }}</span>
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- 时间信息 -->
      <div class="result-time-section">
        <div class="time-item">
          <span class="time-label">开始时间：</span>
          <span class="time-value">{{ formatTime(executionResult.startTime) }}</span>
        </div>
        <div class="time-item">
          <span class="time-label">结束时间：</span>
          <span class="time-value">{{ formatTime(executionResult.endTime) }}</span>
        </div>
        <div class="time-item" v-if="executionResult.executorInfo">
          <span class="time-label">执行人：</span>
          <span class="time-value">{{ executionResult.executorInfo.name }}</span>
        </div>
        <div class="time-item">
          <span class="time-label">执行范围：</span>
          <span class="time-value">{{ executionResult.executionScope === 'api' ? '接口测试' : executionResult.executionScope }}</span>
        </div>
      </div>

      <!-- 失败信息（如果有） -->
      <div class="result-failure-section" v-if="executionResult.status === 'failed' && executionResult.errorMessage">
        <div class="failure-title">失败原因</div>
        <div class="failure-message">{{ executionResult.errorMessage }}</div>
      </div>

      <!-- 测试统计详情（接口测试） -->
      <div class="test-stats-section" v-if="executionResult.totalCases">
        <div class="test-stats-title">测试统计详情</div>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-label">总用例数</div>
            <div class="stat-value total">{{ executionResult.totalCases }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">已执行</div>
            <div class="stat-value executed">{{ executionResult.executedCases }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">通过</div>
            <div class="stat-value passed">{{ executionResult.passedCases }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">失败</div>
            <div class="stat-value failed">{{ executionResult.failedCases }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">跳过</div>
            <div class="stat-value skipped">{{ executionResult.skippedCases }}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">成功率</div>
            <div class="stat-value rate" :class="{
              'rate-high': executionResult.successRate >= 90,
              'rate-medium': executionResult.successRate >= 70 && executionResult.successRate < 90,
              'rate-low': executionResult.successRate < 70
            }">
              {{ executionResult.successRate.toFixed(1) }}%
            </div>
          </div>
        </div>
      </div>

      <!-- 操作链接 -->
      <div class="result-links-section">
        <el-button
          type="primary"
          :icon="Document"
          @click="$emit('view-logs')"
          v-if="executionResult.logFilePath"
        >
          查看执行日志
        </el-button>
        <el-button
          :icon="DocumentCopy"
          @click="$emit('view-report')"
          v-if="executionResult.reportUrl"
        >
          查看测试报告
        </el-button>
        <el-button
          :icon="Refresh"
          @click="$emit('retest')"
        >
          重新测试
        </el-button>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="visible = false">
          关闭
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { CircleCheckFilled, CircleCloseFilled, DocumentCopy, Document, Refresh } from '@element-plus/icons-vue'
import { formatTime } from './apiDetail/formatters'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  executionResult: { type: Object, default: null }
})
const emit = defineEmits(['update:modelValue', 'view-logs', 'view-report', 'retest'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

// 获取显示状态（将后端状态转换为前端显示状态）
const getDisplayStatus = (backendStatus) => {
  return backendStatus === 'completed' ? 'passed' : backendStatus
}

// 获取环境文本
const getEnvironmentText = (env) => {
  const envMap = {
    'dev': '开发环境',
    'test': '测试环境',
    'staging': '预发布环境',
    'prod': '生产环境'
  }
  return envMap[env] || env || '未知环境'
}

// 获取执行类型文本
const getExecutionTypeText = (type) => {
  const typeMap = {
    'manual': '手动执行',
    'auto': '自动执行',
    'scheduled': '定时任务',
    'trigger': '触发执行'
  }
  return typeMap[type] || type || '未知类型'
}

// 格式化时长
const formatDuration = (seconds) => {
  if (!seconds && seconds !== 0) return '-'
  if (seconds < 1) {
    return `${Math.round(seconds * 1000)}ms`
  }
  if (seconds < 60) {
    return `${seconds.toFixed(2)}s`
  }
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}m ${remainingSeconds.toFixed(0)}s`
}

// 处理对话框可见性变化
const handleVisibleChange = (value) => {
  emit('update:modelValue', value)
}
</script>

<style scoped>
.result-banner {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 32px 24px;
  border-radius: 8px;
  margin-bottom: 24px;
}

.result-banner.status-passed {
  background: linear-gradient(135deg, #f0f9ff 0%, #e1f3d8 100%);
  border: 2px solid #67c23a;
}

.result-banner.status-failed {
  background: linear-gradient(135deg, #fef0f0 0%, #fde2e2 100%);
  border: 2px solid #f56c6c;
}

.banner-icon {
  flex-shrink: 0;
}

.banner-content {
  flex: 1;
}

.result-title {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.result-subtitle {
  margin: 0;
  font-size: 16px;
  color: #606266;
}

.result-info-section {
  margin-bottom: 24px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.info-grid-api {
  grid-template-columns: repeat(3, 1fr);
}

.info-card {
  background: #fafafa;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
}

.info-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}

.info-value {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.info-value.highlight {
  color: #409eff;
}

.success-count {
  color: #67c23a;
  font-weight: 600;
}

.failed-count {
  color: #f56c6c;
  font-weight: 600;
}

.divider {
  margin: 0 4px;
  color: #c0c4cc;
}

.result-time-section {
  background: #f5f7fa;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 24px;
  display: flex;
  justify-content: space-around;
}

.time-item {
  font-size: 14px;
}

.time-label {
  color: #909399;
  margin-right: 8px;
}

.time-value {
  color: #303133;
  font-weight: 500;
}

.result-failure-section {
  background: #fef0f0;
  border: 1px solid #fbc4c4;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 24px;
}

.failure-title {
  font-size: 14px;
  font-weight: 600;
  color: #f56c6c;
  margin-bottom: 8px;
}

.failure-message {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}

.result-links-section {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.case-results-section {
  margin-bottom: 24px;
}

.case-results-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid #409eff;
}

.case-results-table {
  width: 100%;
}

.case-results-table .case-code {
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #606266;
}

.case-results-table .case-name {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.case-results-table .duration-text {
  font-size: 13px;
  color: #606266;
  font-weight: 500;
}

.case-results-table .failure-text {
  color: #f56c6c;
  font-size: 13px;
}

.case-results-table .success-text {
  color: #67c23a;
  font-size: 13px;
}

.total-count {
  color: #409eff;
  font-weight: 600;
}

.test-stats-section {
  margin-bottom: 24px;
}

.test-stats-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #409eff;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.stat-item {
  background: #fafafa;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
}

.stat-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.stat-value.total { color: #409eff; }
.stat-value.executed { color: #909399; }
.stat-value.passed { color: #67c23a; }
.stat-value.failed { color: #f56c6c; }
.stat-value.skipped { color: #e6a23c; }

.stat-value.rate {
  font-size: 20px;
  color: #f56c6c;
}

.stat-value.rate.rate-high { color: #67c23a; }
.stat-value.rate.rate-medium { color: #e6a23c; }
</style>


