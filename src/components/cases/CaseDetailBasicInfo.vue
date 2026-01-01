<template>
  <div class="case-detail-basic-info">
    <!-- 基本信息卡片 -->
    <div class="info-card">
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">优先级</span>
          <el-tag
            :type="getPriorityType(testCase?.priority)"
            size="small"
          >
            {{ testCase?.priority || 'P0' }}
          </el-tag>
        </div>
        <div class="info-item">
          <span class="info-label">严重程度</span>
          <el-tag
            :type="getSeverityType(testCase?.severity)"
            size="small"
          >
            {{ getSeverityText(testCase?.severity) }}
          </el-tag>
        </div>
        <div class="info-item">
          <span class="info-label">测试类型</span>
          <el-tag
            :type="getTestTypeTagType(testCase?.testType || testCase?.test_type)"
            size="small"
            class="test-type-tag"
          >
            {{ getTestTypeText(testCase?.testType || testCase?.test_type) }}
          </el-tag>
        </div>
        <div class="info-item">
          <span class="info-label">创建人</span>
          <span class="info-value">{{ getCreatorName() }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">版本</span>
          <span class="info-value">{{ testCase?.version || '1.0' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">创建时间</span>
          <span class="info-value">{{ formatTime(testCase?.createdAt || testCase?.created_time) }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">最后修改</span>
          <span class="info-value">{{ formatTime(testCase?.updatedAt || testCase?.updated_time) }}</span>
        </div>
      </div>
    </div>

    <!-- 用例描述 -->
    <div class="section-card" v-if="testCase?.description">
      <h3 class="section-title">用例描述</h3>
      <p class="description-text">{{ testCase?.description }}</p>
    </div>

    <!-- 标签 -->
    <div class="section-card" v-if="displayTags.length > 0">
      <h3 class="section-title">标签</h3>
      <div class="tags-container">
        <el-tag
          v-for="(tag, index) in displayTags"
          :key="index"
          class="tag-item"
          type="info"
        >
          {{ tag }}
        </el-tag>
      </div>
    </div>

    <!-- 测试步骤 -->
    <div class="section-card">
      <h3 class="section-title">测试步骤</h3>
      <div v-if="displaySteps.length > 0" class="steps-list">
        <div v-for="(step, index) in displaySteps" :key="index" class="step-item">
          <div class="step-number">{{ index + 1 }}</div>
          <div class="step-content">
            <div class="step-operation">{{ step.operation }}</div>
            <div class="step-expected" v-if="step.expected">
              预期结果：{{ step.expected }}
            </div>
            <div class="step-actual" v-if="step.actual">
              实际结果：{{ step.actual }}
            </div>
          </div>
        </div>
      </div>
      <div v-else class="empty-steps">
        <el-empty
          :image-size="80"
          description="暂无测试步骤"
        >
          <template #description>
            <p>该测试用例尚未配置测试步骤</p>
            <p class="empty-tip">请联系测试人员添加具体的测试步骤</p>
          </template>
        </el-empty>
      </div>
    </div>

    <!-- 测试数据 -->
    <div class="section-card">
      <h3 class="section-title">测试数据</h3>
      <div v-if="displayTestData.length > 0" class="data-grid">
        <div v-for="(item, index) in displayTestData" :key="index" class="data-item">
          <span class="data-label">{{ item.label }}</span>
          <span class="data-value">{{ item.value }}</span>
        </div>
      </div>
      <div v-else class="empty-data">
        <el-empty
          :image-size="60"
          description="暂无测试数据"
        >
          <template #description>
            <p>该测试用例尚未配置测试数据</p>
            <p class="empty-tip">请联系测试人员添加具体的测试数据</p>
          </template>
        </el-empty>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  testCase: {
    type: Object,
    default: () => null
  }
})

// 显示标签
const displayTags = computed(() => {
  const tags = props.testCase?.tags

  if (tags && Array.isArray(tags)) {
    return tags
  }

  if (typeof tags === 'string') {
    try {
      const parsed = JSON.parse(tags)
      return Array.isArray(parsed) ? parsed : []
    } catch (e) {
      return []
    }
  }

  return []
})

// 显示测试步骤
const displaySteps = computed(() => {
  if (props.testCase?.test_steps && Array.isArray(props.testCase?.test_steps)) {
    return props.testCase?.test_steps
  }

  return []
})

// 显示测试数据
const displayTestData = computed(() => {
  const data = props.testCase?.preConditions
    || props.testCase?.pre_conditions
    || props.testCase?.request_override
    || props.testCase?.request_params

  if (data && typeof data === 'object') {
    return Object.entries(data).map(([key, value]) => ({
      label: key,
      value: typeof value === 'object' ? JSON.stringify(value) : String(value)
    }))
  }

  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data)
      return Object.entries(parsed).map(([key, value]) => ({
        label: key,
        value: typeof value === 'object' ? JSON.stringify(value) : String(value)
      }))
    } catch (e) {
      // 解析失败，返回空数组
    }
  }

  return []
})

// 获取创建人姓名
const getCreatorName = () => {
  if (props.testCase?.creatorInfo && props.testCase?.creatorInfo.name) {
    return props.testCase?.creatorInfo.name
  }
  if (props.testCase?.creator_info && props.testCase?.creator_info.name) {
    return props.testCase?.creator_info.name
  }
  return props.testCase?.creator_name || '未知'
}

// 格式化时间
const formatTime = (time) => {
  if (!time) return '-'

  if (typeof time === 'string' && time.includes('T')) {
    const date = new Date(time)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(/\//g, '-')
  }

  return time
}

// 获取优先级类型
const getPriorityType = (priority) => {
  const typeMap = {
    'P0': 'danger',
    'P1': 'danger',
    'P2': 'warning',
    'P3': 'info',
    '高': 'danger',
    '中': 'warning',
    '低': 'info'
  }
  return typeMap[priority] || 'warning'
}

// 获取严重程度类型
const getSeverityType = (severity) => {
  const typeMap = {
    'critical': 'danger',
    'high': 'warning',
    'medium': 'info',
    'low': ''
  }
  return typeMap[severity] || 'info'
}

// 获取严重程度文本
const getSeverityText = (severity) => {
  const textMap = {
    'critical': '严重',
    'high': '高',
    'medium': '中',
    'low': '低'
  }
  return textMap[severity] || severity || '中'
}

// 获取测试类型标签颜色
const getTestTypeTagType = (type) => {
  const typeMap = {
    'functional': 'primary',
    'boundary': 'warning',
    'exception': 'danger',
    'security': 'success',
    'performance': 'info',
    'integration': 'primary',
    'smoke': 'success',
    'regression': 'warning'
  }
  return typeMap[type] || ''
}

// 获取测试类型文本
const getTestTypeText = (type) => {
  const textMap = {
    'functional': '功能测试',
    'boundary': '边界测试',
    'exception': '异常测试',
    'security': '安全测试',
    'performance': '性能测试',
    'integration': '集成测试',
    'smoke': '冒烟测试',
    'regression': '回归测试'
  }
  return textMap[type] || type || '功能测试'
}
</script>

<style scoped>
.case-detail-basic-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.info-label {
  font-weight: 500;
  color: #606266;
  min-width: 60px;
}

.info-value {
  color: #303133;
}

.test-type-tag {
  font-size: 12px;
}

.section-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 16px 0;
}

.description-text {
  color: #606266;
  line-height: 1.6;
  margin: 0;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  margin: 0;
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.step-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  background-color: #fafafa;
}

.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #409eff;
  color: white;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-operation {
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.step-expected,
.step-actual {
  font-size: 14px;
  color: #606266;
  margin-top: 4px;
}

.step-expected {
  color: #67c23a;
}

.step-actual {
  color: #f56c6c;
}

.empty-steps,
.empty-data {
  text-align: center;
  padding: 20px;
}

.empty-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

.data-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 12px;
}

.data-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  background-color: #fafafa;
}

.data-label {
  font-weight: 500;
  color: #303133;
  font-size: 14px;
}

.data-value {
  color: #606266;
  font-size: 13px;
  word-break: break-all;
}

@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }

  .data-grid {
    grid-template-columns: 1fr;
  }

  .step-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
