<template>
  <div class="case-detail-panel">
    <div class="detail-header">
      <h3 class="detail-title">用例详情</h3>
      <div class="header-actions">
        <el-button size="small" :icon="Edit" @click="handleEdit">
          编辑
        </el-button>
        <el-button size="small" type="danger" :icon="Delete" @click="handleDelete">
          删除
        </el-button>
        <button class="detail-close" @click="$emit('close')">×</button>
      </div>
    </div>

    <div class="detail-content">
      <!-- 用例标题 -->
      <div class="detail-case-title">
        <span class="detail-icon">›</span>
        <span class="detail-case-name">{{ testCase.name }}</span>
      </div>

      <!-- 基本信息 -->
      <div class="detail-section">
        <div class="detail-section-title">
          <span class="section-icon">ℹ</span>
          基本信息
        </div>
        <div class="detail-info-grid">
          <div class="info-row">
            <span class="info-label">用例ID：</span>
            <span class="info-value">{{ testCase.id }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">用例名称：</span>
            <span class="info-value">{{ testCase.name }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">所属接口：</span>
            <span class="info-value">{{ testCase.api_url }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">创建时间：</span>
            <span class="info-value">{{ testCase.created_time }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">最后执行：</span>
            <span class="info-value">{{ testCase.last_executed_time || '-' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">执行状态：</span>
            <span class="status-indicator">
              <span class="status-dot" :class="'status-' + testCase.status"></span>
              <span class="status-text">{{ getStatusText(testCase.status) }}</span>
            </span>
          </div>
        </div>
      </div>

      <!-- 请求参数 -->
      <div class="detail-section">
        <div class="detail-section-header">
          <div class="detail-section-title">
            <span class="section-icon">📝</span>
            请求参数
          </div>
          <button class="detail-link-btn" @click="copyToClipboard(testCase.request_params)">
            复制
          </button>
        </div>
        <div class="code-preview">
          <pre>{{ formatJSON(testCase.request_params) }}</pre>
        </div>
      </div>

      <!-- 预期结果 -->
      <div class="detail-section">
        <div class="detail-section-title">
          <span class="section-icon">✓</span>
          预期结果
        </div>
        <div class="result-box">
          <div class="result-item">
            <span class="result-label">返回状态码：</span>
            <span class="result-badge">{{ testCase.expected_status_code || 200 }}</span>
          </div>
          <div class="result-item">
            <span class="result-label">验证规则：</span>
            <span class="result-text">{{ testCase.validation_rules || '-' }}</span>
          </div>
        </div>
      </div>

      <!-- 实际结果（失败时显示） -->
      <div v-if="testCase.status === 'failed'" class="detail-section">
        <div class="detail-section-title">
          <span class="section-icon">⚠</span>
          实际结果
        </div>
        <div class="result-box error">
          <div class="result-item">
            <span class="result-label">返回状态码：</span>
            <span class="result-badge error">{{ testCase.actual_status_code || '-' }}</span>
          </div>
          <div class="result-item">
            <span class="result-label">返回信息：</span>
            <span class="result-text">{{ testCase.actual_result || '-' }}</span>
          </div>
        </div>
      </div>

      <!-- 执行历史 -->
      <div class="detail-section" v-if="executionHistory && executionHistory.length > 0">
        <div class="detail-section-title">
          <span class="section-icon">🕒</span>
          执行历史
        </div>
        <div class="history-timeline">
          <div 
            v-for="(history, index) in executionHistory" 
            :key="index"
            class="history-item"
          >
            <div class="history-dot" :class="'status-' + history.status"></div>
            <div class="history-content">
              <div class="history-action">{{ history.action }}</div>
              <div class="history-note">{{ history.note }}</div>
              <div class="history-time">{{ history.executed_time }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Delete } from '@element-plus/icons-vue'

const props = defineProps({
  testCase: {
    type: Object,
    required: true
  },
  executionHistory: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'edit', 'delete'])

const getStatusText = (status) => {
  const textMap = {
    passed: '通过',
    failed: '失败',
    not_executed: '未执行'
  }
  return textMap[status] || '未知'
}

const formatJSON = (jsonStr) => {
  if (!jsonStr) return '无'
  try {
    const obj = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr
    return JSON.stringify(obj, null, 2)
  } catch (e) {
    return jsonStr
  }
}

const copyToClipboard = (text) => {
  const str = formatJSON(text)
  navigator.clipboard.writeText(str).then(() => {
    ElMessage.success('已复制到剪贴板')
  }).catch(() => {
    ElMessage.error('复制失败')
  })
}

const handleEdit = () => {
  emit('edit', props.testCase)
}

const handleDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用例 "${props.testCase.name}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    emit('delete', props.testCase)
    emit('close')
  } catch (error) {
    // 用户取消删除
  }
}
</script>

<style scoped>
.case-detail-panel {
  width: 450px;
  background: white;
  border-left: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.detail-header {
  padding: 16px 24px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.detail-close {
  width: 28px;
  height: 28px;
  background: transparent;
  border: none;
  font-size: 24px;
  color: #909399;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s;
}

.detail-close:hover {
  background: #f5f7fa;
  color: #606266;
}

.detail-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
}

.detail-case-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.detail-icon {
  font-size: 20px;
  color: #409eff;
}

.detail-case-name {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.detail-section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
}

.section-icon {
  font-size: 16px;
}

.detail-link-btn {
  padding: 4px 12px;
  background: transparent;
  border: none;
  color: #409eff;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
}

.detail-link-btn:hover {
  text-decoration: underline;
}

.detail-info-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: flex;
  font-size: 13px;
  line-height: 1.6;
}

.info-label {
  width: 90px;
  color: #909399;
  flex-shrink: 0;
}

.info-value {
  flex: 1;
  color: #606266;
  word-break: break-all;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.status-dot.status-passed {
  background: #67c23a;
}

.status-dot.status-failed {
  background: #f56c6c;
}

.status-dot.status-not_executed {
  background: #909399;
}

.status-text {
  font-size: 13px;
  color: #606266;
}

.code-preview {
  background: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 12px;
  overflow-x: auto;
}

.code-preview pre {
  margin: 0;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #606266;
  line-height: 1.5;
}

.result-box {
  background: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 12px;
}

.result-box.error {
  background: #fef0f0;
  border-color: #fde2e2;
}

.result-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 13px;
}

.result-item:last-child {
  margin-bottom: 0;
}

.result-label {
  width: 90px;
  color: #909399;
  flex-shrink: 0;
}

.result-badge {
  padding: 2px 8px;
  background: #e1f3d8;
  color: #67c23a;
  border-radius: 3px;
  font-size: 12px;
  font-weight: 500;
}

.result-badge.error {
  background: #fde2e2;
  color: #f56c6c;
}

.result-text {
  color: #606266;
}

.history-timeline {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.history-item {
  display: flex;
  gap: 12px;
  position: relative;
}

.history-item:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 4px;
  top: 20px;
  bottom: -16px;
  width: 1px;
  background: #e4e7ed;
}

.history-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;
}

.history-content {
  flex: 1;
}

.history-action {
  font-size: 13px;
  color: #303133;
  font-weight: 500;
  margin-bottom: 4px;
}

.history-note {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.history-time {
  font-size: 12px;
  color: #c0c4cc;
}
</style>

