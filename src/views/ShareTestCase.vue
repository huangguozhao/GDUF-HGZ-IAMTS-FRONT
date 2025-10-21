<template>
  <div class="share-testcase-container">
    <!-- 分享信息头部 -->
    <div class="share-header">
      <div class="share-info">
        <h1 class="share-title">{{ shareInfo.title }}</h1>
        <div class="share-meta">
          <span class="share-id">分享ID: {{ shareInfo.shareId }}</span>
          <span class="share-views">访问次数: {{ shareInfo.views }}</span>
          <span class="share-expire">有效期: {{ shareInfo.expireTime }}</span>
        </div>
      </div>
      <div class="share-actions">
        <el-button 
          v-if="shareInfo.permissions.includes('download')"
          type="primary" 
          :icon="Download"
          @click="handleDownload"
        >
          下载用例
        </el-button>
        <el-button 
          type="default" 
          :icon="Refresh"
          @click="handleRefresh"
        >
          刷新
        </el-button>
      </div>
    </div>

    <!-- 密码验证对话框 -->
    <el-dialog
      v-model="passwordDialogVisible"
      title="访问验证"
      width="400px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div class="password-form">
        <el-alert
          title="此分享链接设置了访问密码"
          type="warning"
          :closable="false"
          show-icon
        >
          <template #default>
            <p>请输入访问密码以查看测试用例详情</p>
          </template>
        </el-alert>
        
        <el-form
          ref="passwordFormRef"
          :model="passwordForm"
          :rules="passwordRules"
          style="margin-top: 20px;"
        >
          <el-form-item label="访问密码" prop="password">
            <el-input
              v-model="passwordForm.password"
              type="password"
              placeholder="请输入访问密码"
              show-password
              @keyup.enter="handlePasswordSubmit"
            />
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCancel">取消</el-button>
          <el-button 
            type="primary" 
            @click="handlePasswordSubmit"
            :loading="passwordLoading"
          >
            确认
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <el-result
        :icon="errorIcon"
        :title="errorTitle"
        :sub-title="errorMessage"
      >
        <template #extra>
          <el-button type="primary" @click="handleRetry">重试</el-button>
          <el-button @click="handleGoHome">返回首页</el-button>
        </template>
      </el-result>
    </div>

    <!-- 测试用例详情 -->
    <div v-else-if="testCase" class="testcase-detail">
      <!-- 基本信息 -->
      <div class="info-card">
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">用例编码</span>
            <span class="info-value">{{ testCase.caseCode }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">优先级</span>
            <el-tag 
              :type="getPriorityType(testCase.priority)" 
              size="small"
            >
              {{ testCase.priority }}
            </el-tag>
          </div>
          <div class="info-item">
            <span class="info-label">严重程度</span>
            <el-tag 
              :type="getSeverityType(testCase.severity)" 
              size="small"
            >
              {{ getSeverityText(testCase.severity) }}
            </el-tag>
          </div>
          <div class="info-item">
            <span class="info-label">版本</span>
            <span class="info-value">{{ testCase.version }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">创建人</span>
            <span class="info-value">{{ getCreatorName() }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">创建时间</span>
            <span class="info-value">{{ formatTime(testCase.createdAt) }}</span>
          </div>
        </div>
      </div>

      <!-- 用例描述 -->
      <div v-if="testCase.description" class="section-card">
        <h3 class="section-title">用例描述</h3>
        <p class="description-text">{{ testCase.description }}</p>
      </div>

      <!-- 标签 -->
      <div v-if="displayTags.length > 0" class="section-card">
        <h3 class="section-title">标签</h3>
        <div class="tags-container">
          <el-tag 
            v-for="tag in displayTags" 
            :key="tag" 
            size="small"
            style="margin-right: 8px; margin-bottom: 8px;"
          >
            {{ tag }}
          </el-tag>
        </div>
      </div>

      <!-- 前置条件 -->
      <div v-if="testCase.preConditions" class="section-card">
        <h3 class="section-title">前置条件</h3>
        <div class="data-grid">
          <div 
            v-for="(value, key) in testCase.preConditions" 
            :key="key" 
            class="data-item"
          >
            <span class="data-label">{{ key }}:</span>
            <span class="data-value">{{ value }}</span>
          </div>
        </div>
      </div>

      <!-- 测试步骤 -->
      <div v-if="testCase.testSteps && testCase.testSteps.length > 0" class="section-card">
        <h3 class="section-title">测试步骤</h3>
        <div class="steps-list">
          <div 
            v-for="(step, index) in testCase.testSteps" 
            :key="index" 
            class="step-item"
          >
            <div class="step-number">{{ index + 1 }}</div>
            <div class="step-content">
              <div class="step-operation">{{ step.operation }}</div>
              <div v-if="step.expected" class="step-expected">预期结果: {{ step.expected }}</div>
              <div v-if="step.actual" class="step-actual">实际结果: {{ step.actual }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 请求配置 -->
      <div v-if="testCase.requestOverride" class="section-card">
        <h3 class="section-title">请求配置</h3>
        <div class="json-content">
          <pre>{{ JSON.stringify(testCase.requestOverride, null, 2) }}</pre>
        </div>
      </div>

      <!-- 预期响应 -->
      <div class="section-card">
        <h3 class="section-title">预期响应</h3>
        <div class="expected-response-section">
          <div class="response-item">
            <span class="response-label">HTTP状态码:</span>
            <el-tag type="success">{{ testCase.expectedHttpStatus }}</el-tag>
          </div>
          
          <div v-if="testCase.expectedResponseBody" class="response-item">
            <span class="response-label">响应体:</span>
            <div class="json-content">
              <pre>{{ testCase.expectedResponseBody }}</pre>
            </div>
          </div>
          
          <div v-if="testCase.expectedResponseSchema" class="response-item">
            <span class="response-label">响应Schema:</span>
            <div class="json-content">
              <pre>{{ JSON.stringify(testCase.expectedResponseSchema, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </div>

      <!-- 断言规则 -->
      <div v-if="testCase.assertions && testCase.assertions.length > 0" class="section-card">
        <h3 class="section-title">断言规则</h3>
        <div class="assertions-list">
          <div 
            v-for="(assertion, index) in testCase.assertions" 
            :key="index" 
            class="assertion-item"
          >
            <div class="assertion-type">{{ assertion.type }}</div>
            <div v-if="assertion.path" class="assertion-path">{{ assertion.path }}</div>
            <div class="assertion-expected">{{ assertion.expected }}</div>
          </div>
        </div>
      </div>

      <!-- 响应提取规则 -->
      <div v-if="testCase.extractors && testCase.extractors.length > 0" class="section-card">
        <h3 class="section-title">响应提取规则</h3>
        <div class="extractors-list">
          <div 
            v-for="(extractor, index) in testCase.extractors" 
            :key="index" 
            class="extractor-item"
          >
            <div class="extractor-name">{{ extractor.name }}</div>
            <div class="extractor-expression">{{ extractor.expression }}</div>
            <div v-if="extractor.description" class="extractor-description">{{ extractor.description }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  Download, 
  Refresh 
} from '@element-plus/icons-vue'
import { getTestCaseByShare } from '../api/testCase'

const route = useRoute()
const router = useRouter()

// 响应式数据
const loading = ref(true)
const error = ref(false)
const errorTitle = ref('')
const errorMessage = ref('')
const errorIcon = ref('error')

const shareInfo = ref({})
const testCase = ref(null)

// 密码验证
const passwordDialogVisible = ref(false)
const passwordLoading = ref(false)
const passwordFormRef = ref(null)
const passwordForm = reactive({
  password: ''
})

const passwordRules = {
  password: [
    { required: true, message: '请输入访问密码', trigger: 'blur' }
  ]
}

// 计算属性
const displayTags = computed(() => {
  const tags = testCase.value?.tags
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

// 生命周期
onMounted(() => {
  loadTestCase()
})

// 加载测试用例
const loadTestCase = async () => {
  try {
    loading.value = true
    error.value = false
    
    const shareId = route.params.shareId
    console.log('加载分享测试用例:', shareId)
    
    const response = await getTestCaseByShare(shareId)
    console.log('分享响应:', response)
    
    if (response.code === 1) {
      shareInfo.value = response.data.shareInfo
      testCase.value = response.data.testCase
    } else {
      if (response.msg === '密码错误') {
        // 需要密码验证
        passwordDialogVisible.value = true
        return
      } else {
        throw new Error(response.msg || '获取测试用例失败')
      }
    }
  } catch (error) {
    console.error('加载测试用例失败:', error)
    handleError(error)
  } finally {
    loading.value = false
  }
}

// 密码验证提交
const handlePasswordSubmit = async () => {
  if (!passwordFormRef.value) return
  
  try {
    await passwordFormRef.value.validate()
    
    passwordLoading.value = true
    
    const shareId = route.params.shareId
    const response = await getTestCaseByShare(shareId, passwordForm.password)
    
    if (response.code === 1) {
      shareInfo.value = response.data.shareInfo
      testCase.value = response.data.testCase
      passwordDialogVisible.value = false
      ElMessage.success('验证成功')
    } else {
      ElMessage.error(response.msg || '密码错误')
    }
  } catch (error) {
    console.error('密码验证失败:', error)
    ElMessage.error('验证失败，请重试')
  } finally {
    passwordLoading.value = false
  }
}

// 取消访问
const handleCancel = () => {
  router.push('/')
}

// 重试
const handleRetry = () => {
  loadTestCase()
}

// 返回首页
const handleGoHome = () => {
  router.push('/')
}

// 刷新
const handleRefresh = () => {
  loadTestCase()
}

// 下载用例
const handleDownload = () => {
  ElMessage.info('下载功能开发中...')
}

// 错误处理
const handleError = (err) => {
  error.value = true
  
  if (err.message.includes('不存在')) {
    errorTitle.value = '分享链接不存在'
    errorMessage.value = '该分享链接可能已被删除或从未创建'
    errorIcon.value = 'error'
  } else if (err.message.includes('过期')) {
    errorTitle.value = '分享链接已过期'
    errorMessage.value = '该分享链接已超过有效期，无法访问'
    errorIcon.value = 'warning'
  } else if (err.message.includes('失效')) {
    errorTitle.value = '分享链接已失效'
    errorMessage.value = '该分享链接已被撤销，无法访问'
    errorIcon.value = 'error'
  } else {
    errorTitle.value = '加载失败'
    errorMessage.value = err.message || '未知错误，请稍后重试'
    errorIcon.value = 'error'
  }
}

// 工具函数
const getPriorityType = (priority) => {
  const typeMap = {
    'P0': 'danger',
    'P1': 'warning', 
    'P2': 'primary',
    'P3': 'info'
  }
  return typeMap[priority] || 'info'
}

const getSeverityType = (severity) => {
  const typeMap = {
    'critical': 'danger',
    'high': 'warning',
    'medium': 'primary',
    'low': 'info'
  }
  return typeMap[severity] || 'info'
}

const getSeverityText = (severity) => {
  const textMap = {
    'critical': '严重',
    'high': '高',
    'medium': '中',
    'low': '低'
  }
  return textMap[severity] || severity
}

const getCreatorName = () => {
  const creator = testCase.value?.creatorInfo
  return creator?.name || '未知'
}

const formatTime = (time) => {
  if (!time) return '-'
  return new Date(time).toLocaleString('zh-CN')
}
</script>

<style scoped>
.share-testcase-container {
  min-height: 100vh;
  background: #f5f7fa;
}

/* 分享头部 */
.share-header {
  background: white;
  padding: 20px 24px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.share-info {
  flex: 1;
}

.share-title {
  margin: 0 0 12px 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.share-meta {
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #606266;
}

.share-actions {
  display: flex;
  gap: 12px;
}

/* 加载和错误状态 */
.loading-container,
.error-container {
  padding: 40px 24px;
}

/* 测试用例详情 */
.testcase-detail {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

/* 信息卡片 */
.info-card {
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 12px;
  color: #909399;
}

.info-value {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

/* 区块卡片 */
.section-card {
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.section-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.description-text {
  margin: 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}

/* 标签 */
.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* 数据网格 */
.data-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.data-item {
  display: flex;
  font-size: 14px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.data-item:last-child {
  border-bottom: none;
}

.data-label {
  width: 120px;
  color: #909399;
  flex-shrink: 0;
}

.data-value {
  flex: 1;
  color: #303133;
  word-break: break-all;
}

/* 测试步骤 */
.steps-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.step-item {
  display: flex;
  gap: 12px;
}

.step-number {
  width: 24px;
  height: 24px;
  background: #409eff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-operation {
  font-size: 14px;
  color: #303133;
  margin-bottom: 4px;
  font-weight: 500;
}

.step-expected {
  font-size: 13px;
  color: #606266;
  margin-bottom: 4px;
}

.step-actual {
  font-size: 13px;
  color: #909399;
}

/* JSON内容 */
.json-content {
  background: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 12px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #303133;
  overflow-x: auto;
}

.json-content pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
}

/* 预期响应 */
.expected-response-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.response-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.response-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

/* 断言规则 */
.assertions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.assertion-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 4px;
}

.assertion-type {
  font-size: 12px;
  color: #409eff;
  background: #ecf5ff;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.assertion-path {
  font-size: 13px;
  color: #606266;
  font-family: 'Courier New', monospace;
}

.assertion-expected {
  font-size: 13px;
  color: #303133;
  font-weight: 500;
}

/* 提取规则 */
.extractors-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.extractor-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
}

.extractor-name {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.extractor-expression {
  font-size: 13px;
  color: #606266;
  font-family: 'Courier New', monospace;
}

.extractor-description {
  font-size: 12px;
  color: #909399;
}

/* 密码表单 */
.password-form {
  max-width: 100%;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .share-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .share-meta {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
