<template>
  <div class="ai-diagnosis">
    <!-- 诊断类型选择 -->
    <div class="diagnosis-header">
      <h3 class="diagnosis-title">AI智能诊断</h3>
      <el-radio-group v-model="diagnosisType" size="small">
        <el-radio-button value="test_failure">测试失败</el-radio-button>
        <el-radio-button value="performance">性能问题</el-radio-button>
        <el-radio-button value="error_log">错误日志</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 输入区域 -->
    <div class="diagnosis-input">
      <!-- 错误信息输入 -->
      <el-form-item label="错误信息" v-if="diagnosisType === 'test_failure'">
        <el-input
          v-model="errorMessage"
          type="textarea"
          :rows="3"
          placeholder="请输入测试失败时的错误信息"
        />
      </el-form-item>

      <!-- 错误日志输入 -->
      <el-form-item :label="diagnosisType === 'error_log' ? '错误日志' : '错误日志(可选)'">
        <el-input
          v-model="errorLog"
          type="textarea"
          :rows="6"
          :placeholder="diagnosisType === 'error_log' ? '请粘贴错误日志' : '请粘贴相关的错误日志(可选)'"
        />
      </el-form-item>

      <!-- 性能数据输入 -->
      <el-form-item label="性能数据" v-if="diagnosisType === 'performance'">
        <el-input
          v-model="performanceData"
          type="textarea"
          :rows="4"
          placeholder="请输入性能测试数据(如响应时间、吞吐量等)"
        />
      </el-form-item>

      <!-- 附加描述 -->
      <el-form-item label="问题描述(可选)">
        <el-input
          v-model="description"
          type="textarea"
          :rows="2"
          placeholder="请补充描述问题的具体情况"
        />
      </el-form-item>

      <!-- 诊断按钮 -->
      <div class="diagnosis-actions">
        <el-button 
          type="primary" 
          :loading="loading" 
          :disabled="!canDiagnose"
          @click="handleDiagnose"
        >
          <el-icon v-if="!loading"><MagicStick /></el-icon>
          {{ loading ? '诊断中...' : '开始AI诊断' }}
        </el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>
    </div>

    <!-- 诊断结果展示 -->
    <div v-if="result" class="diagnosis-result">
      <el-divider content-position="left">诊断结果</el-divider>
      
      <!-- 诊断信息 -->
      <div class="diagnosis-info" style="margin-bottom: 15px; color: #909399; font-size: 13px;">
        <span v-if="result.diagnosisType">诊断类型：{{ getDiagnosisTypeText(result.diagnosisType) }}</span>
        <span v-if="result.diagnosisId" style="margin-left: 20px;">诊断ID：{{ result.diagnosisId }}</span>
      </div>
      
      <!-- 置信度 -->
      <div class="confidence-section" v-if="result.confidenceScore">
        <span class="confidence-label">置信度：</span>
        <el-progress 
          :percentage="result.confidenceScore" 
          :color="getConfidenceColor(result.confidenceScore)"
          :stroke-width="10"
          style="width: 200px; display: inline-block;"
        />
      </div>

      <!-- 总体结果 -->
      <div class="result-section" v-if="result.result">
        <h4>诊断结论</h4>
        <p>{{ result.result }}</p>
      </div>

      <!-- 根本原因 -->
      <div class="result-section" v-if="result.rootCause">
        <h4>根本原因分析</h4>
        <p>{{ result.rootCause }}</p>
      </div>

      <!-- 建议修复 -->
      <div class="result-section" v-if="result.suggestedFix">
        <h4>建议修复方案</h4>
        <p>{{ result.suggestedFix }}</p>
      </div>

      <!-- 可能原因列表 -->
      <div class="result-section" v-if="result.possibleCauses && result.possibleCauses.length">
        <h4>可能原因</h4>
        <ul>
          <li v-for="(cause, index) in result.possibleCauses" :key="index">
            {{ cause }}
          </li>
        </ul>
      </div>

      <!-- 改进建议列表 -->
      <div class="result-section" v-if="result.improvementSuggestions && result.improvementSuggestions.length">
        <h4>改进建议</h4>
        <ul>
          <li v-for="(suggestion, index) in result.improvementSuggestions" :key="index">
            {{ suggestion }}
          </li>
        </ul>
      </div>

      <!-- 错误信息 -->
      <el-alert
        v-if="result.status === 'failed'"
        :title="result.errorMessage || '诊断失败'"
        type="error"
        show-icon
        :closable="false"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { MagicStick } from '@element-plus/icons-vue'
import { diagnose, getDiagnosisResult } from '@/api/diagnosis'
import { ElMessage } from 'element-plus'

const props = defineProps({
  // 预设的错误信息
  initialErrorMessage: {
    type: String,
    default: ''
  },
  // 预设的错误日志
  initialErrorLog: {
    type: String,
    default: ''
  },
  // 预设的诊断类型
  initialDiagnosisType: {
    type: String,
    default: 'test_failure'
  },
  // 完整的测试执行结果数据
  executionData: {
    type: Object,
    default: null
  },
  // 是否自动开始诊断
  autoDiagnose: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['diagnose-complete'])

const diagnosisType = ref(props.initialDiagnosisType || 'test_failure')
const errorMessage = ref(props.initialErrorMessage || '')
const errorLog = ref(props.initialErrorLog || '')
const performanceData = ref('')
const description = ref('')
const loading = ref(false)
const result = ref(null)

// 从执行数据构建上下文 - 必须在 watch 之前定义
const buildContextFromExecutionData = () => {
  const data = props.executionData
  if (!data) return
  
  // 构建错误信息
  let errorInfo = ''
  if (data.errorMessage) {
    errorInfo += `错误信息: ${data.errorMessage}\n`
  }
  if (data.status) {
    errorInfo += `执行状态: ${data.status === 'failed' ? '失败' : data.status}\n`
  }
  if (data.scopeName) {
    errorInfo += `测试范围: ${data.scopeName}\n`
  }
  if (data.environment) {
    errorInfo += `执行环境: ${data.environment}\n`
  }
  if (data.durationSeconds) {
    errorInfo += `执行耗时: ${data.durationSeconds}s\n`
  }
  
  // 如果是批量测试，添加统计信息
  if (data.totalCases) {
    errorInfo += `\n=== 测试统计 ===\n`
    errorInfo += `总用例数: ${data.totalCases}\n`
    errorInfo += `通过: ${data.passedCases}\n`
    errorInfo += `失败: ${data.failedCases}\n`
    errorInfo += `跳过: ${data.skippedCases}\n`
    errorInfo += `通过率: ${data.successRate}%\n`
  }
  
  // 添加失败类型和堆栈信息
  if (data.failureType) {
    errorInfo += `\n失败类型: ${data.failureType}\n`
  }
  if (data.failureTrace) {
    errorInfo += `\n失败堆栈:\n${data.failureTrace}\n`
  }
  
  // 添加HTTP响应信息
  if (data.responseStatus) {
    errorInfo += `\nHTTP响应状态码: ${data.responseStatus}\n`
  }
  
  if (errorInfo) {
    errorMessage.value = errorInfo.trim()
  }
  
  // 构建错误日志（包含响应体和断言详情）
  let errorLogInfo = ''
  if (data.responseBody) {
    errorLogInfo += `【响应体】\n${data.responseBody}\n\n`
  }
  if (data.assertionDetails && data.assertionDetails.length > 0) {
    errorLogInfo += `【断言详情】\n`
    data.assertionDetails.forEach((assertion, index) => {
      errorLogInfo += `断言${index + 1}:\n`
      errorLogInfo += `  类型: ${assertion.assertionType || '-'}\n`
      errorLogInfo += `  期望值: ${assertion.expectedValue || '-'}\n`
      errorLogInfo += `  实际值: ${assertion.actualValue || '-'}\n`
      errorLogInfo += `  结果: ${assertion.passed ? '通过' : '失败'}\n`
      if (assertion.errorMessage) {
        errorLogInfo += `  错误信息: ${assertion.errorMessage}\n`
      }
    })
  }
  
  if (errorLogInfo) {
    errorLog.value = errorLogInfo.trim()
  }
  
  // 构建描述
  let desc = ''
  if (data.scopeName) {
    desc += `测试接口: ${data.scopeName}\n`
  }
  if (data.executionType) {
    desc += `执行方式: ${data.executionType}\n`
  }
  if (data.startTime) {
    desc += `开始时间: ${data.startTime}\n`
  }
  if (data.executorInfo && data.executorInfo.name) {
    desc += `执行人: ${data.executorInfo.name}\n`
  }
  if (data.duration) {
    desc += `执行耗时: ${data.duration}ms\n`
  }
  
  if (desc) {
    description.value = desc.trim()
  }
}

// 判断是否可以开始诊断 - 必须在 watch 之前定义
const canDiagnose = computed(() => {
  // 如果有执行数据传入（从报告页面），则可以诊断
  if (props.executionData && props.executionData.executionId) {
    return true
  }
  
  if (diagnosisType.value === 'test_failure') {
    return errorMessage.value.trim().length > 0 || errorLog.value.trim().length > 0
  } else if (diagnosisType.value === 'performance') {
    return performanceData.value.trim().length > 0
  } else if (diagnosisType.value === 'error_log') {
    return errorLog.value.trim().length > 0
  }
  return false
})

// 初始化数据和自动诊断
onMounted(() => {
  // 如果传入了完整的执行数据，自动构建上下文
  if (props.executionData) {
    buildContextFromExecutionData()
  }
  // 注意：自动诊断逻辑在 watch 中处理（watch 有 immediate: true）
})

// 标记是否已经自动触发过诊断（防止watch和用户点击重复触发）
const hasAutoDiagnosed = ref(false)

// 监听executionData变化
watch(() => props.executionData, (newData) => {
  if (newData) {
    buildContextFromExecutionData()
    // 只有当设置了autoDiagnose、没有诊断结果、且未自动触发过时才自动诊断
    if (props.autoDiagnose && canDiagnose.value && !result.value && !hasAutoDiagnosed.value) {
      hasAutoDiagnosed.value = true  // 标记已自动触发
      setTimeout(() => {
        handleDiagnose()
      }, 500)
    }
  }
}, { immediate: true })

// 获取置信度颜色
const getConfidenceColor = (score) => {
  if (score >= 80) return '#67c23a'
  if (score >= 60) return '#e6a23c'
  return '#f56c6c'
}

// 获取诊断类型的中文描述
const getDiagnosisTypeText = (type) => {
  const typeMap = {
    'test_failure': '测试失败',
    'performance': '性能问题',
    'security': '安全问题',
    'coverage': '覆盖率分析',
    'general': '综合诊断'
  }
  return typeMap[type] || type
}

// 执行诊断
const handleDiagnose = async () => {
  if (!canDiagnose.value) {
    ElMessage.warning('请输入需要诊断的内容')
    return
  }

  loading.value = true
  result.value = null

  try {
    // 确保 diagnosisType 有值，避免 JSON 序列化时丢失字段
    const typeValue = diagnosisType.value || 'test_failure'
    
    const requestData = {
      // 后端期望 diagnosisType 字段
      diagnosisType: typeValue,
      // 如果 description 为空，使用错误信息作为补充
      description: description.value || errorMessage.value || ''
    }

    // 如果有executionData，传递executionId给后端
    // 后端DTO使用 executionId，所以发送 executionId
    if (props.executionData && props.executionData.executionId) {
      requestData.executionId = props.executionData.executionId
    }

    // 添加错误信息和错误日志
    if (errorMessage.value.trim()) {
      requestData.error_message = errorMessage.value
    }
    if (errorLog.value.trim()) {
      requestData.error_log = errorLog.value
    }

    // 如果有executionData，提取更多诊断相关字段（与ExecutionResult.vue保持一致）
    if (props.executionData) {
      const data = props.executionData
      // 失败消息
      if (data.failureMessage || data.errorMessage) {
        requestData.failureMessage = data.failureMessage || data.errorMessage
      }
      // 失败类型
      if (data.failureType) {
        requestData.failureType = data.failureType
      }
      // HTTP响应状态码
      if (data.responseStatus || data.response_status) {
        requestData.responseStatus = data.responseStatus || data.response_status
      }
      // 响应体
      if (data.responseBody || data.response_body) {
        requestData.responseBody = data.responseBody || data.response_body
      }
      // API路径
      if (data.apiPath || data.api_path) {
        requestData.apiPath = data.apiPath || data.api_path
      }
      // API方法
      if (data.apiMethod || data.api_method) {
        requestData.apiMethod = data.apiMethod || data.api_method
      }
      // 用例名称
      if (data.caseName || data.case_name || data.scopeName) {
        requestData.caseName = data.caseName || data.case_name || data.scopeName
      }
      // 批量测试用例结果
      if (data.caseResults && data.caseResults.length > 0) {
        requestData.caseResults = data.caseResults
      }
      // 报告ID（作为后备查询方案）
      if (data.reportId) {
        requestData.reportId = data.reportId
      }
    }

    // 如果是性能诊断，添加性能数据
    if (typeValue === 'performance') {
      requestData.context = {
        performanceData: performanceData.value
      }
    }

    console.log('AI诊断请求数据:', requestData)
    
    const response = await diagnose(requestData)
    const rawData = response.data?.data || response.data

    // 将后端返回的 snake_case 转换为前端使用的 camelCase
    const actualData = transformDiagnosisData(rawData)

    if (actualData) {
      result.value = actualData
      
      // 检查是否需要轮询
      if (actualData.diagnosisId && actualData.aiStatus === 'processing') {
        pollDiagnosisResult(actualData.diagnosisId)
      } else {
        loading.value = false
        emit('diagnose-complete', actualData)
      }
    } else {
      loading.value = false
      ElMessage.error('诊断服务返回数据为空')
    }
  } catch (error) {
    console.error('AI诊断失败:', error)
    loading.value = false
    // 提供更友好的错误提示
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      ElMessage.error('AI诊断请求超时，请稍后重试或检查网络连接')
    } else if (error.msg) {
      ElMessage.error('AI诊断失败: ' + error.msg)
    } else {
      ElMessage.error('AI诊断失败: ' + (error.message || '未知错误'))
    }
  }
}

// 轮询诊断结果
const pollDiagnosisResult = async (diagnosisId) => {
  const maxAttempts = 30
  const interval = 2000
  let attempts = 0
  
  const poll = async () => {
    try {
      attempts++
      console.log(`轮询诊断结果: diagnosisId=${diagnosisId}, attempt=${attempts}`)
      const res = await getDiagnosisResult(diagnosisId)
      console.log('轮询结果:', res)
      
      if (res.code === 1 && res.data) {
        const actualData = transformDiagnosisData(res.data)
        result.value = actualData
        
        if (res.data.aiCompleted || res.data.aiStatus === 'completed' || res.data.aiStatus === 'failed') {
          loading.value = false
          if (res.data.aiStatus === 'completed') {
            ElMessage.success('AI诊断完成')
          }
          emit('diagnose-complete', actualData)
          return
        }
      }
      
      if (attempts < maxAttempts) {
        setTimeout(poll, interval)
      } else {
        loading.value = false
        ElMessage.warning('AI诊断响应时间较长，结果将稍后更新')
      }
    } catch (error) {
      console.error('轮询诊断结果失败:', error)
      if (attempts < maxAttempts) {
        setTimeout(poll, interval)
      } else {
        loading.value = false
      }
    }
  }
  
  poll()
}

// 将后端 snake_case 数据转换为前端 camelCase
const transformDiagnosisData = (data) => {
  if (!data) return null
  return {
    result: data.result,
    status: data.status,
    diagnosisId: data.diagnosis_id || data.diagnosisId,
    executionId: data.execution_id || data.executionId,
    diagnosisType: data.diagnosis_type || data.diagnosisType,
    rootCause: data.root_cause || data.rootCause,
    suggestedFix: data.suggested_fix || data.suggestedFix,
    possibleCauses: data.possible_causes || data.possibleCauses || [],
    improvementSuggestions: data.improvement_suggestions || data.improvementSuggestions || [],
    confidenceScore: data.confidence_score || data.confidenceScore,
    errorMessage: data.error_message || data.errorMessage,
    errorLog: data.error_log || data.errorLog,
    // 新增异步诊断相关字段
    aiStatus: data.ai_status || data.aiStatus,
    aiCompleted: data.ai_completed || data.aiCompleted,
    severity: data.severity,
    issues: data.issues || [],
    suggestions: data.suggestions || []
  }
}

// 重置
const handleReset = () => {
  errorMessage.value = ''
  errorLog.value = ''
  performanceData.value = ''
  description.value = ''
  result.value = null
}

// 暴露方法供父组件调用
defineExpose({
  setErrorMessage: (msg) => { errorMessage.value = msg },
  setErrorLog: (log) => { errorLog.value = log },
  startDiagnose: () => { if (canDiagnose.value) handleDiagnose() }
})
</script>

<style scoped>
.ai-diagnosis {
  padding: 16px;
}

.diagnosis-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.diagnosis-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.diagnosis-input {
  margin-bottom: 20px;
}

.diagnosis-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.diagnosis-result {
  margin-top: 24px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
}

.confidence-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.confidence-label {
  font-weight: 500;
  color: #606266;
}

.result-section {
  margin-bottom: 16px;
}

.result-section h4 {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.result-section p {
  margin: 0;
  line-height: 1.6;
  color: #606266;
}

.result-section ul {
  margin: 0;
  padding-left: 20px;
}

.result-section li {
  margin-bottom: 4px;
  line-height: 1.6;
  color: #606266;
}
</style>

