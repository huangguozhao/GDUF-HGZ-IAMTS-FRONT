<template>
  <div 
    class="case-card" 
    :class="{ 
      'is-active': isActive,
      'is-failed': testCase.status === 'failed'
    }"
    @click="$emit('select', testCase)"
  >
    <div class="case-header">
      <div class="case-left">
        <input 
          type="checkbox" 
          class="case-checkbox"
          :checked="isSelected"
          @click.stop
          @change="$emit('toggle-select', testCase.id)"
        />
        <span class="case-id">{{ testCase.id }}</span>
        <span class="case-name">{{ testCase.name }}</span>
      </div>
      
      <div class="case-right">
        <span class="status-indicator">
          <span class="status-dot" :class="'status-' + testCase.status"></span>
          <span class="status-text">{{ getStatusText() }}</span>
        </span>
      </div>
    </div>
    
    <div class="case-body">
      <div class="case-info">
        <span class="info-label">描述：</span>
        <span class="info-value">{{ testCase.description || '-' }}</span>
      </div>
      <div class="case-info">
        <span class="info-label">最后执行：</span>
        <span class="info-value">{{ formatTime(testCase.last_executed_time) }}</span>
      </div>
      <div class="case-info">
        <span class="info-label">预期状态码：</span>
        <span class="info-value">{{ testCase.expected_status_code || 200 }}</span>
      </div>
    </div>
    
    <div class="case-actions" @click.stop>
      <button class="case-action-btn" title="执行" @click="$emit('execute', testCase)">
        <span class="btn-icon">▶</span>
        执行
      </button>
      <button class="case-action-btn" title="复制" @click="$emit('copy', testCase)">
        <span class="btn-icon">📋</span>
        复制
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  testCase: {
    type: Object,
    required: true
  },
  isSelected: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: false
  }
})

defineEmits(['select', 'toggle-select', 'execute', 'edit', 'copy', 'delete'])

const getStatusText = () => {
  const textMap = {
    passed: '通过',
    failed: '失败',
    not_executed: '未执行'
  }
  return textMap[props.testCase?.status] || '未知'
}

const formatTime = (time) => {
  if (!time) return '-'
  return time
}
</script>

<style scoped>
.case-card {
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.case-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-color: #c0c4cc;
}

.case-card.is-active {
  border-color: #409eff;
  background: #ecf5ff;
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.2);
}

.case-card.is-failed {
  background: #fef0f0;
  border-color: #fbc4c4;
}

.case-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.case-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.case-checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.case-id {
  font-size: 13px;
  color: #909399;
  font-weight: 500;
  min-width: 60px;
}

.case-name {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.case-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 12px;
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
  color: #606266;
}

.case-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
  padding: 12px;
  background: #fafafa;
  border-radius: 4px;
}

.case-info {
  display: flex;
  font-size: 13px;
}

.info-label {
  color: #909399;
  min-width: 90px;
}

.info-value {
  color: #606266;
  flex: 1;
}

.case-actions {
  display: flex;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #e4e7ed;
}

.case-action-btn {
  flex: 1;
  padding: 6px 12px;
  background: white;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  color: #606266;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: all 0.3s;
}

.case-action-btn:hover {
  color: #409eff;
  border-color: #409eff;
  background: #ecf5ff;
}

.case-action-btn.danger:hover {
  color: #f56c6c;
  border-color: #f56c6c;
  background: #fef0f0;
}

.btn-icon {
  font-size: 12px;
}
</style>

