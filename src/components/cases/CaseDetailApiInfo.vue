<template>
  <div class="case-detail-api-info">
    <!-- 预期响应 -->
    <div class="section-card">
      <h3 class="section-title">预期响应</h3>
      <div class="expected-response-section">
        <div class="response-item">
          <span class="response-label">状态码</span>
          <el-tag
            :type="getStatusCodeType(testCase?.expectedHttpStatus || testCase?.expected_http_status)"
            size="small"
          >
            {{ testCase?.expectedHttpStatus || testCase?.expected_http_status || 200 }}
          </el-tag>
        </div>
        <div class="response-item">
          <span class="response-label">响应时间</span>
          <span class="response-value">&lt; {{ testCase?.expectedResponseTime || testCase?.expected_response_time || '2秒' }}</span>
        </div>
        <div class="response-item full-width" v-if="displayValidationRules.length > 0">
          <span class="response-label">验证规则</span>
          <div class="validation-rules">
            <div
              v-for="(rule, index) in displayValidationRules"
              :key="index"
              class="rule-tag"
            >
              {{ rule }}
            </div>
          </div>
        </div>
        <div class="response-item full-width">
          <span class="response-label">响应体</span>
          <div class="response-code">
            <el-button class="copy-btn" size="mini" type="text" :icon="CopyDocument" @click="handleCopyExpectedResponse" title="复制响应体" />
            <pre>{{ formatExpectedResponse() }}</pre>
          </div>
        </div>
        <div class="response-item full-width" v-if="hasExpectedResponseSchema">
          <span class="response-label">响应Schema</span>
          <div class="response-code">
            <el-button class="copy-btn" size="mini" type="text" :icon="CopyDocument" @click="handleCopyExpectedResponseSchema" title="复制响应Schema" />
            <pre>{{ formatExpectedResponseSchema() }}</pre>
          </div>
        </div>
      </div>
    </div>

    <!-- 响应提取规则 -->
    <div class="section-card" v-if="displayExtractors.length > 0">
      <h3 class="section-title">响应提取规则</h3>
      <div class="extractors-list">
        <div
          v-for="(extractor, index) in displayExtractors"
          :key="index"
          class="extractor-item"
        >
          <div class="extractor-header">
            <span class="extractor-name">{{ extractor.name }}</span>
            <el-tag size="small" type="success">提取变量</el-tag>
          </div>
          <div class="extractor-expression">
            <span class="expression-label">表达式:</span>
            <code class="expression-code">{{ extractor.expression }}</code>
          </div>
          <div class="extractor-description" v-if="extractor.description">
            {{ extractor.description }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { CopyDocument } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  testCase: {
    type: Object,
    default: () => null
  }
})

// 显示验证规则
const displayValidationRules = computed(() => {
  const rules = props.testCase?.validationRules || props.testCase?.validation_rules

  if (rules && Array.isArray(rules)) {
    return rules
  }

  if (typeof rules === 'string') {
    try {
      const parsed = JSON.parse(rules)
      return Array.isArray(parsed) ? parsed : []
    } catch (e) {
      return []
    }
  }

  return []
})

// 显示提取器
const displayExtractors = computed(() => {
  const extractors = props.testCase?.extractors

  if (extractors && Array.isArray(extractors)) {
    return extractors
  }

  if (typeof extractors === 'string') {
    try {
      const parsed = JSON.parse(extractors)
      return Array.isArray(parsed) ? parsed : []
    } catch (e) {
      return []
    }
  }

  return []
})

// 是否有预期响应Schema
const hasExpectedResponseSchema = computed(() => {
  return !!(props.testCase?.expectedResponseSchema || props.testCase?.expected_response_schema)
})

// 获取状态码标签类型
const getStatusCodeType = (code) => {
  if (!code) return 'success'
  if (code >= 200 && code < 300) return 'success'
  if (code >= 400 && code < 500) return 'warning'
  if (code >= 500) return 'danger'
  return 'info'
}

// 格式化预期响应
const formatExpectedResponse = () => {
  const response = props.testCase?.expectedResponse || props.testCase?.expected_response

  if (!response) return '{}'

  if (typeof response === 'object') {
    return JSON.stringify(response, null, 2)
  }

  if (typeof response === 'string') {
    try {
      const parsed = JSON.parse(response)
      return JSON.stringify(parsed, null, 2)
    } catch (e) {
      return response
    }
  }

  return String(response)
}

// 格式化预期响应Schema
const formatExpectedResponseSchema = () => {
  const schema = props.testCase?.expectedResponseSchema || props.testCase?.expected_response_schema

  if (!schema) return '{}'

  if (typeof schema === 'object') {
    return JSON.stringify(schema, null, 2)
  }

  if (typeof schema === 'string') {
    try {
      const parsed = JSON.parse(schema)
      return JSON.stringify(parsed, null, 2)
    } catch (e) {
      return schema
    }
  }

  return String(schema)
}

// 复制预期响应到剪贴板
const handleCopyExpectedResponse = async () => {
  try {
    await navigator.clipboard.writeText(formatExpectedResponse())
    ElMessage.success('响应体已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
    ElMessage.error('复制失败')
  }
}

// 复制预期响应Schema到剪贴板
const handleCopyExpectedResponseSchema = async () => {
  try {
    await navigator.clipboard.writeText(formatExpectedResponseSchema())
    ElMessage.success('响应Schema已复制到剪贴板')
  } catch (error) {
    console.error('复制失败:', error)
    ElMessage.error('复制失败')
  }
}
</script>

<style scoped>
.case-detail-api-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
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

.expected-response-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.response-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.response-item.full-width {
  grid-column: 1 / -1;
}

.response-label {
  font-weight: 500;
  color: #606266;
  font-size: 14px;
}

.response-value {
  color: #303133;
  font-size: 14px;
}

.response-code {
  position: relative;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  background-color: #f8f9fa;
  max-height: 300px;
  overflow: auto;
}

.response-code pre {
  margin: 0;
  padding: 12px 40px 12px 12px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  line-height: 1.4;
  color: #303133;
  white-space: pre-wrap;
  word-break: break-all;
}

.copy-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
}

.validation-rules {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.rule-tag {
  padding: 4px 8px;
  background-color: #ecf5ff;
  color: #409eff;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.extractors-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.extractor-item {
  padding: 16px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background-color: #fafafa;
}

.extractor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.extractor-name {
  font-weight: 600;
  color: #303133;
  font-size: 14px;
}

.extractor-expression {
  margin-bottom: 8px;
}

.expression-label {
  font-weight: 500;
  color: #606266;
  font-size: 13px;
  margin-right: 8px;
}

.expression-code {
  background-color: #f1f3f4;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  color: #e74c3c;
}

.extractor-description {
  color: #909399;
  font-size: 13px;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .expected-response-section {
    grid-template-columns: 1fr;
  }

  .response-item.full-width {
    grid-column: auto;
  }
}
</style>
