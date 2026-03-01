<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="handleVisibleChange"
    title="测试执行结果"
    width="900px"
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
        <!-- AI诊断按钮 - 测试失败时显示 -->
        <el-button 
          v-if="executionResult.status === 'failed'"
          type="danger" 
          :icon="MagicStick" 
          @click="handleAIDiagnosis"
        >
          AI智能诊断
        </el-button>
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
      <div class="result-failure-section" v-if="executionResult.status === 'failed'">
        <!-- 失败概览卡片 -->
        <div class="failure-overview">
          <div class="failure-icon">
            <el-icon :size="32"><WarningFilled /></el-icon>
          </div>
          <div class="failure-summary">
            <div class="failure-title">执行失败</div>
            <div class="failure-subtitle" v-if="executionResult.failureType">
              <el-tag size="small" type="danger" effect="dark">
                {{ getFailureTypeText(executionResult.failureType) }}
              </el-tag>
            </div>
          </div>
          <el-button 
            v-if="executionResult.errorMessage"
            type="primary" 
            link 
            @click="showErrorDetail = !showErrorDetail"
          >
            <el-icon><ArrowDown v-if="!showErrorDetail" /><ArrowUp v-else /></el-icon>
            {{ showErrorDetail ? '收起详情' : '展开详情' }}
          </el-button>
        </div>

        <!-- 错误详情折叠面板 -->
        <el-collapse-transition>
          <div class="failure-detail" v-show="showErrorDetail">
            <!-- 失败原因 -->
            <div class="detail-item" v-if="executionResult.errorMessage">
              <div class="detail-label">
                <el-icon><InfoFilled /></el-icon>
                失败原因
              </div>
              <div class="detail-content error-content">
                <pre class="error-message">{{ executionResult.errorMessage }}</pre>
              </div>
            </div>

            <!-- 失败类型 -->
            <div class="detail-item" v-if="executionResult.failureType">
              <div class="detail-label">
                <el-icon><WarningFilled /></el-icon>
                失败类型
              </div>
              <div class="detail-content">
                <el-tag type="danger">{{ getFailureTypeText(executionResult.failureType) }}</el-tag>
              </div>
            </div>

            <!-- 快速修复建议 -->
            <div class="quick-fix-section" v-if="getQuickFixSuggestions(executionResult.errorMessage).length > 0">
              <div class="detail-label">
                <el-icon><MagicStick /></el-icon>
                💡 快速修复建议
              </div>
              <div class="quick-fix-list">
                <div 
                  class="quick-fix-item" 
                  v-for="(suggestion, index) in getQuickFixSuggestions(executionResult.errorMessage)" 
                  :key="index"
                >
                  <div class="fix-step">{{ index + 1 }}</div>
                  <div class="fix-content">{{ suggestion }}</div>
                </div>
              </div>
            </div>
          </div>
        </el-collapse-transition>

        <!-- 一键修复按钮（针对可修复的错误） -->
        <div class="auto-fix-section" v-if="canAutoFix(executionResult.errorMessage)">
          <el-alert
            :title="getAutoFixTitle(executionResult.errorMessage)"
            type="warning"
            :closable="false"
            show-icon
          />
          <el-button 
            type="primary" 
            class="fix-button"
            @click="handleQuickFix"
          >
            <el-icon><MagicStick /></el-icon>
            一键修复
          </el-button>
        </div>
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

    <!-- AI诊断对话框 -->
    <el-dialog
      v-model="showAIDiagnosis"
      title="AI智能诊断"
      width="700px"
      :close-on-click-modal="false"
      append-to-body
      :before-close="handleDiagnosisClose"
    >
      <AIDiagnosisPanel
        v-if="showAIDiagnosis"
        ref="diagnosisPanelRef"
        :executionData="executionResult"
        :autoDiagnose="true"
      />
    </el-dialog>
  </el-dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { CircleCheckFilled, CircleCloseFilled, DocumentCopy, Document, Refresh, MagicStick, WarningFilled, InfoFilled, ArrowDown, ArrowUp } from '@element-plus/icons-vue'
import { formatTime } from './apiDetail/formatters'
import AIDiagnosisPanel from '@/components/diagnosis/AIDiagnosisPanel.vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  executionResult: { type: Object, default: null }
})
const emit = defineEmits(['update:modelValue', 'view-logs', 'view-report', 'retest', 'open-config'])

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

// AI诊断相关
const showAIDiagnosis = ref(false)
const diagnosisPanelRef = ref(null)

// 错误详情展开状态
const showErrorDetail = ref(true)

// 打开AI诊断对话框
const handleAIDiagnosis = () => {
  showAIDiagnosis.value = true
}

// 获取失败类型文本
const getFailureTypeText = (type) => {
  const typeMap = {
    'URL_FORMAT_ERROR': 'URL格式错误',
    'NETWORK_ERROR': '网络错误',
    'TIMEOUT': '请求超时',
    'ASSERTION_FAILED': '断言失败',
    'AUTH_ERROR': '认证错误',
    'VALIDATION_ERROR': '验证错误',
    'SCRIPT_ERROR': '脚本错误',
    'UNKNOWN_ERROR': '未知错误'
  }
  return typeMap[type] || type || '未知错误'
}

// 根据错误信息获取快速修复建议
const getQuickFixSuggestions = (errorMessage) => {
  if (!errorMessage) return []
  
  const suggestions = []
  
  if (errorMessage.includes('no protocol') || errorMessage.includes('URL格式错误')) {
    suggestions.push('检查Base URL是否正确配置，确保包含协议前缀（如 http:// 或 https://）')
    suggestions.push('在执行配置中填写正确的环境Base URL')
    suggestions.push('检查接口路径是否以 / 开头')
  }
  
  if (errorMessage.includes('timeout') || errorMessage.includes('超时')) {
    suggestions.push('增加请求超时时间')
    suggestions.push('检查目标服务器是否可达')
    suggestions.push('检查网络连接是否稳定')
  }
  
  if (errorMessage.includes('connection') || errorMessage.includes('连接')) {
    suggestions.push('检查目标服务器是否启动')
    suggestions.push('检查防火墙设置')
    suggestions.push('验证服务器地址和端口是否正确')
  }
  
  if (errorMessage.includes('401') || errorMessage.includes('403') || errorMessage.includes('认证')) {
    suggestions.push('检查Token是否过期')
    suggestions.push('验证认证信息是否正确')
    suggestions.push('检查请求头中的Authorization字段')
  }
  
  if (errorMessage.includes('404') || errorMessage.includes('Not Found')) {
    suggestions.push('检查API路径是否正确')
    suggestions.push('确认接口是否已部署')
    suggestions.push('检查路径参数是否正确传递')
  }
  
  if (errorMessage.includes('500') || errorMessage.includes('Internal Server Error')) {
    suggestions.push('检查服务器端代码是否有bug')
    suggestions.push('查看服务器日志获取详细错误信息')
    suggestions.push('联系后端开发人员排查')
  }
  
  return suggestions
}

// 判断是否可以自动修复
const canAutoFix = (errorMessage) => {
  if (!errorMessage) return false
  return errorMessage.includes('no protocol') || errorMessage.includes('URL格式错误')
}

// 获取自动修复对话框标题
const getAutoFixTitle = (errorMessage) => {
  if (errorMessage.includes('no protocol')) {
    return '检测到URL缺少协议前缀，将自动添加 http://'
  }
  return '检测到配置问题'
}

// 处理快速修复
const handleQuickFix = () => {
  ElMessage.info('请在执行配置中设置正确的Base URL（如 http://localhost:8080）')
  visible.value = false
  emit('open-config')
}

// 关闭AI诊断对话框时重置状态
const handleDiagnosisClose = (done) => {
  showAIDiagnosis.value = false
  done()
}

// 监听对话框关闭，重置AI诊断状态
watch(visible, (newVal) => {
  if (!newVal) {
    showAIDiagnosis.value = false
  }
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
  flex-wrap: wrap;
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
  min-width: 200px;
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
  background: linear-gradient(135deg, #fef0f0 0%, #fff5f5 100%);
  border: 1px solid #fbc4c4;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  overflow: hidden;
}

/* 失败概览 */
.failure-overview {
  display: flex;
  align-items: center;
  gap: 16px;
}

.failure-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f56c6c 0%, #e94343 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.failure-summary {
  flex: 1;
}

.failure-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.failure-subtitle {
  margin-top: 4px;
}

/* 失败详情区域 */
.failure-detail {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px dashed #fbc4c4;
}

.detail-item {
  margin-bottom: 16px;
}

.detail-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  margin-bottom: 8px;
}

.detail-label .el-icon {
  color: #f56c6c;
}

.detail-content {
  padding: 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid #ebeef5;
}

.error-content {
  background: #1e1e1e;
  border: 1px solid #3a3a3a;
}

.error-message {
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu', monospace;
  font-size: 13px;
  color: #e6a23c;
  white-space: pre-wrap;
  word-break: break-all;
  line-height: 1.6;
}

/* 快速修复建议 */
.quick-fix-section {
  margin-top: 20px;
  padding: 16px;
  background: #f0f9ff;
  border-radius: 8px;
  border: 1px solid #bae7ff;
}

.quick-fix-section .detail-label {
  color: #096dd9;
  margin-bottom: 12px;
}

.quick-fix-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.quick-fix-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px;
  background: white;
  border-radius: 6px;
}

.fix-step {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #409eff 0%, #1890ff 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.fix-content {
  flex: 1;
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
  padding-top: 2px;
}

/* 自动修复区域 */
.auto-fix-section {
  margin-top: 20px;
  padding: 16px;
  background: #fffbe6;
  border-radius: 8px;
  border: 1px solid #ffe58f;
  display: flex;
  align-items: center;
  gap: 16px;
}

.auto-fix-section .el-alert {
  flex: 1;
}

.fix-button {
  flex-shrink: 0;
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


