<template>
  <el-dialog
    v-model="visible"
    title="测试执行结果"
    width="800px"
    :close-on-click-modal="false"
  >
    <div class="execution-result-container" v-if="executionResult">
      <!-- 结果状态横幅 -->
      <div class="result-banner" :class="'status-' + executionResult.status">
        <div class="banner-icon">
          <el-icon v-if="executionResult.status === 'passed'" :size="60" color="#67c23a">
            <CircleCheckFilled />
          </el-icon>
          <el-icon v-else :size="60" color="#f56c6c">
            <CircleCloseFilled />
          </el-icon>
        </div>
        <div class="banner-content">
          <h3 class="result-title">
            {{ executionResult.status === 'passed' ? '✓ 测试通过' : '✗ 测试失败' }}
          </h3>
          <p class="result-subtitle">{{ executionResult.caseName }}</p>
        </div>
      </div>

      <!-- 执行信息 -->
      <div class="result-info-section">
        <div class="info-grid" :class="{ 'info-grid-api': executionResult.totalCases }">
          <div class="info-card">
            <div class="info-label">执行ID</div>
            <div class="info-value">{{ executionResult.executionId }}</div>
          </div>
          <div class="info-card" v-if="!executionResult.totalCases">
            <div class="info-label">响应状态码</div>
            <div class="info-value">
              <el-tag 
                :type="executionResult.responseStatus >= 200 && executionResult.responseStatus < 300 ? 'success' : 'danger'"
                size="small"
              >
                {{ executionResult.responseStatus }}
              </el-tag>
            </div>
          </div>
          <div class="info-card">
            <div class="info-label">执行耗时</div>
            <div class="info-value highlight">
              {{ executionResult.duration < 1000 ? executionResult.duration + 'ms' : (executionResult.duration / 1000).toFixed(2) + 's' }}
            </div>
          </div>
          <div class="info-card">
            <div class="info-label">{{ executionResult.totalCases ? '用例数' : '断言结果' }}</div>
            <div class="info-value">
              <template v-if="executionResult.totalCases">
                <span class="total-count">{{ executionResult.totalCases }} 个</span>
              </template>
              <template v-else>
              <span class="success-count">{{ executionResult.assertionsPassed }} 通过</span>
              <span class="divider">/</span>
              <span class="failed-count">{{ executionResult.assertionsFailed }} 失败</span>
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
                <span class="success-count">{{ executionResult.assertionsPassed }}</span>
                <span class="divider">/</span>
                <span class="failed-count">{{ executionResult.assertionsFailed }}</span>
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
      </div>

      <!-- 失败信息（如果有） -->
      <div class="result-failure-section" v-if="executionResult.status === 'failed' && executionResult.failureMessage">
        <div class="failure-title">失败原因</div>
        <div class="failure-message">{{ executionResult.failureMessage }}</div>
      </div>

      <!-- 用例执行明细（接口测试） -->
      <div class="case-results-section" v-if="executionResult.caseResults && executionResult.caseResults.length > 0">
        <div class="case-results-title">用例执行明细</div>
        <el-table 
          :data="executionResult.caseResults" 
          class="case-results-table"
          border
          stripe
        >
          <el-table-column label="用例编码" width="150" prop="case_code">
            <template #default="{ row }">
              <span class="case-code">{{ row.case_code || row.caseCode || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="用例名称" min-width="200">
            <template #default="{ row }">
              <span class="case-name">{{ row.case_name || row.caseName }}</span>
            </template>
          </el-table-column>
          <el-table-column label="执行状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag 
                :type="row.status === 'passed' ? 'success' : row.status === 'failed' ? 'danger' : 'info'" 
                size="small"
              >
                {{ row.status === 'passed' ? '通过' : row.status === 'failed' ? '失败' : '跳过' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="响应状态码" width="120" align="center">
            <template #default="{ row }">
              <el-tag 
                v-if="row.response_status || row.responseStatus"
                :type="(row.response_status || row.responseStatus) >= 200 && (row.response_status || row.responseStatus) < 300 ? 'success' : 'danger'" 
                size="small"
              >
                {{ row.response_status || row.responseStatus }}
              </el-tag>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="执行耗时" width="120" align="center">
            <template #default="{ row }">
              <span class="duration-text">{{ row.duration }}ms</span>
            </template>
          </el-table-column>
          <el-table-column label="失败原因" min-width="200">
            <template #default="{ row }">
              <span 
                v-if="row.failure_message || row.failureMessage" 
                class="failure-text"
              >
                {{ row.failure_message || row.failureMessage }}
              </span>
              <span v-else class="success-text">✓ 执行成功</span>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 操作链接 -->
      <div class="result-links-section">
        <el-button 
          type="primary" 
          :icon="Document"
          @click="$emit('view-logs')"
          v-if="executionResult.logsLink"
        >
          查看执行日志
        </el-button>
        <el-button 
          :icon="DocumentCopy"
          @click="$emit('view-report')"
          v-if="executionResult.reportId"
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
</style>


