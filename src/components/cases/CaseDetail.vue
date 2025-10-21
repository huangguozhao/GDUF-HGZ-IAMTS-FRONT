<template>
  <div class="case-detail-container">
    <!-- 面包屑导航 -->
    <div class="breadcrumb">
      <span class="breadcrumb-item">测试用例</span>
      <span class="breadcrumb-separator">›</span>
      <span class="breadcrumb-item active">{{ testCase.caseCode || testCase.case_code || testCase.id }}</span>
    </div>

    <!-- 用例标题 -->
    <div class="case-header">
      <h2 class="case-title">{{ testCase.name }}</h2>
      <div class="case-actions">
        <el-button 
          type="primary" 
          size="default"
          :icon="CaretRight"
          @click="handleExecute"
        >
          执行测试
        </el-button>
        <el-button 
          size="default"
          :icon="Edit"
          @click="handleEdit"
        >
          编辑
        </el-button>
        <el-button 
          size="default"
          :icon="CopyDocument"
          @click="handleCopy"
        >
          复制
        </el-button>
        <el-dropdown @command="handleMoreAction">
          <el-button size="default" :icon="MoreFilled">
            更多
        </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="export" :icon="Download">
                导出用例
              </el-dropdown-item>
              <el-dropdown-item command="history" :icon="Clock">
                查看历史
              </el-dropdown-item>
              <el-dropdown-item command="share" :icon="Share">
                分享用例
              </el-dropdown-item>
              <el-dropdown-item divided command="disable" :icon="CircleClose">
                禁用用例
              </el-dropdown-item>
              <el-dropdown-item command="delete" :icon="Delete">
                <span style="color: #f56c6c;">删除用例</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="case-content">
      <!-- 左侧主要信息 -->
      <div class="case-main">
        <!-- 基本信息卡片 -->
        <div class="info-card">
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">优先级</span>
              <el-tag 
                :type="getPriorityType(testCase.priority)" 
                size="small"
              >
                {{ testCase.priority || 'P0' }}
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
              <span class="info-label">创建人</span>
              <span class="info-value">{{ getCreatorName() }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">版本</span>
              <span class="info-value">{{ testCase.version || '1.0' }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">创建时间</span>
              <span class="info-value">{{ formatTime(testCase.createdAt || testCase.created_time) }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">最后修改</span>
              <span class="info-value">{{ formatTime(testCase.updatedAt || testCase.updated_time) }}</span>
            </div>
          </div>
      </div>

        <!-- 用例描述 -->
        <div class="section-card" v-if="testCase.description">
          <h3 class="section-title">用例描述</h3>
          <p class="description-text">{{ testCase.description }}</p>
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
          <div class="steps-list">
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
          </div>

        <!-- 测试数据 -->
        <div class="section-card">
          <h3 class="section-title">测试数据</h3>
          <div class="data-grid">
            <div v-for="(item, index) in displayTestData" :key="index" class="data-item">
              <span class="data-label">{{ item.label }}</span>
              <span class="data-value">{{ item.value }}</span>
          </div>
        </div>
      </div>

        <!-- 预期响应 -->
        <div class="section-card">
          <h3 class="section-title">预期响应</h3>
          <div class="expected-response-section">
            <div class="response-item">
              <span class="response-label">状态码</span>
              <el-tag 
                :type="getStatusCodeType(testCase.expectedHttpStatus || testCase.expected_http_status)" 
                size="small"
              >
                {{ testCase.expectedHttpStatus || testCase.expected_http_status || 200 }}
              </el-tag>
            </div>
            <div class="response-item">
              <span class="response-label">响应时间</span>
              <span class="response-value">&lt; {{ testCase.expectedResponseTime || testCase.expected_response_time || '2秒' }}</span>
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
                <pre>{{ formatExpectedResponse() }}</pre>
              </div>
            </div>
            <div class="response-item full-width" v-if="hasExpectedResponseSchema">
              <span class="response-label">响应Schema</span>
              <div class="response-code">
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

      <!-- 右侧辅助信息 -->
      <div class="case-sidebar">
        <!-- 执行历史 -->
        <div class="sidebar-section">
          <h4 class="sidebar-title">执行历史</h4>
          <div class="history-list">
            <div 
              v-for="(history, index) in displayHistory" 
              :key="index"
              class="history-card"
            >
              <div class="history-header">
                <el-icon 
                  :color="history.status === 'passed' ? '#67c23a' : '#f56c6c'"
                  :size="16"
                >
                  <CircleCheckFilled v-if="history.status === 'passed'" />
                  <CircleCloseFilled v-else />
                </el-icon>
                <span class="history-executor">{{ history.action }}</span>
        </div>
              <div class="history-body">{{ history.note }}</div>
              <div class="history-footer">{{ history.executed_time }}</div>
          </div>
        </div>
      </div>

        <!-- 关联信息 -->
        <div class="sidebar-section">
          <h4 class="sidebar-title">关联信息</h4>
          <div class="related-list">
            <div class="related-item">
              <el-icon color="#409eff" :size="16">
                <Link />
              </el-icon>
              <div class="related-content">
                <div class="related-title">用户认证功能需求</div>
                <div class="related-code">REQ-2024-001</div>
              </div>
        </div>
            <div class="related-item">
              <el-icon color="#f56c6c" :size="16">
                <WarningFilled />
              </el-icon>
              <div class="related-content">
                <div class="related-title">密码输入框显示问题</div>
                <div class="related-code">BUG-1002</div>
          </div>
          </div>
        </div>
      </div>

        <!-- 讨论区 -->
        <div class="sidebar-section">
          <h4 class="sidebar-title">讨论</h4>
          <div class="comments-list">
            <div class="comment-item">
              <el-avatar :size="32" class="comment-avatar">
                <el-icon><User /></el-icon>
              </el-avatar>
              <div class="comment-content">
                <div class="comment-header">
                  <span class="comment-author">李华</span>
                  <span class="comment-time">2024-01-20 17:00</span>
                </div>
                <div class="comment-text">
                  已完成此次测试，所有步骤均按正常执行
                </div>
              </div>
            </div>
            <div class="comment-item">
              <el-avatar :size="32" class="comment-avatar">
                <el-icon><User /></el-icon>
              </el-avatar>
              <div class="comment-content">
                <div class="comment-header">
                  <span class="comment-author">张明</span>
                  <span class="comment-time">2024-01-20 16:45</span>
                </div>
                <div class="comment-text">
                  请关注密码输入框的显示效果是否正确
        </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>

    <!-- 执行测试配置对话框 -->
    <el-dialog
      v-model="executeDialogVisible"
      title="执行测试配置"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="executeFormData" label-width="100px">
        <el-form-item label="执行环境">
          <el-select v-model="executeFormData.environment" placeholder="请选择执行环境">
            <el-option label="开发环境 (dev)" value="dev" />
            <el-option label="测试环境 (test)" value="test" />
            <el-option label="预发布环境 (staging)" value="staging" />
            <el-option label="生产环境 (prod)" value="prod" />
          </el-select>
        </el-form-item>

        <el-form-item label="Base URL">
          <el-input 
            v-model="executeFormData.baseUrl" 
            placeholder="留空则使用环境默认URL"
          />
        </el-form-item>

        <el-form-item label="超时时间">
          <el-input-number 
            v-model="executeFormData.timeout" 
            :min="1" 
            :max="300"
            placeholder="秒"
          />
          <span style="margin-left: 8px; color: #909399;">秒</span>
        </el-form-item>

        <el-form-item label="执行模式">
          <el-radio-group v-model="executeFormData.async">
            <el-radio :label="false">同步执行</el-radio>
            <el-radio :label="true">异步执行</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="执行变量">
          <el-input 
            v-model="executeVariables" 
            type="textarea"
            :rows="4"
            placeholder='可选，JSON格式的变量，例如：&#10;{&#10;  "username": "testuser",&#10;  "password": "Test@123"&#10;}'
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="executeDialogVisible = false">取消</el-button>
          <el-button 
            type="primary" 
            @click="handleConfirmExecute" 
            :loading="executing"
          >
            {{ executing ? '执行中...' : '开始执行' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 执行结果对话框 -->
    <el-dialog
      v-model="resultDialogVisible"
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
          <div class="info-grid">
            <div class="info-card">
              <div class="info-label">执行ID</div>
              <div class="info-value">{{ executionResult.executionId }}</div>
            </div>
            <div class="info-card">
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
              <div class="info-value highlight">{{ executionResult.duration }}ms</div>
            </div>
            <div class="info-card">
              <div class="info-label">断言结果</div>
              <div class="info-value">
                <span class="success-count">{{ executionResult.assertionsPassed }} 通过</span>
                <span class="divider">/</span>
                <span class="failed-count">{{ executionResult.assertionsFailed }} 失败</span>
              </div>
            </div>
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

        <!-- 操作链接 -->
        <div class="result-links-section">
          <el-button 
            type="primary" 
            :icon="Document"
            @click="handleViewLogs"
            v-if="executionResult.logsLink"
          >
            查看执行日志
          </el-button>
          <el-button 
            :icon="DocumentCopy"
            @click="handleViewReport"
            v-if="executionResult.reportId"
          >
            查看测试报告
          </el-button>
          <el-button 
            :icon="Refresh"
            @click="handleRetestFromResult"
          >
            重新测试
          </el-button>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="resultDialogVisible = false">
            关闭
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 复制测试用例对话框 -->
    <el-dialog
      v-model="copyDialogVisible"
      title="复制测试用例"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="copyFormRef"
        :model="copyFormData"
        :rules="copyFormRules"
        label-width="100px"
      >
        <el-form-item label="用例编码" prop="caseCode">
          <el-input 
            v-model="copyFormData.caseCode" 
            placeholder="请输入新的用例编码"
            maxlength="50"
            show-word-limit
          />
          <div class="form-tip">系统将自动生成唯一编码，您也可以自定义</div>
        </el-form-item>
        
        <el-form-item label="用例名称" prop="name">
          <el-input 
            v-model="copyFormData.name" 
            placeholder="请输入新的用例名称"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="用例描述" prop="description">
          <el-input 
            v-model="copyFormData.description" 
            type="textarea"
            :rows="3"
            placeholder="请输入用例描述"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        
        <div class="copy-info">
          <el-alert
            title="复制说明"
            type="info"
            :closable="false"
            show-icon
          >
            <template #default>
              <p>复制后将创建新的测试用例，包含以下内容：</p>
              <ul>
                <li>• 接口关联和请求配置</li>
                <li>• 前置条件和测试步骤</li>
                <li>• 断言规则和验证器</li>
                <li>• 响应提取规则</li>
                <li>• 优先级和标签</li>
              </ul>
            </template>
          </el-alert>
        </div>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="copyDialogVisible = false">取消</el-button>
          <el-button 
            type="primary" 
            @click="handleConfirmCopy" 
            :loading="copying"
          >
            {{ copying ? '复制中...' : '确认复制' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Edit, 
  Delete, 
  CircleCheckFilled, 
  CircleCloseFilled,
  Link,
  WarningFilled,
  User,
  CaretRight,
  CopyDocument,
  MoreFilled,
  Download,
  Clock,
  Share,
  CircleClose,
  Document,
  Refresh
} from '@element-plus/icons-vue'
import { executeTestCase, copyTestCase, getTestCaseForCopy, createTestCase } from '../../api/testCase'

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

const emit = defineEmits(['close', 'edit', 'delete', 'refresh'])

// 显示标签
const displayTags = computed(() => {
  const tags = props.testCase.tags
  
  if (tags && Array.isArray(tags)) {
    return tags
  }
  
  if (typeof tags === 'string') {
    try {
      const parsed = JSON.parse(tags)
      return Array.isArray(parsed) ? parsed : []
    } catch (e) {
      // 解析失败，返回空数组
      return []
    }
  }
  
  return []
})

// 显示提取器
const displayExtractors = computed(() => {
  const extractors = props.testCase.extractors
  
  if (extractors && Array.isArray(extractors)) {
    return extractors
  }
  
  if (typeof extractors === 'string') {
    try {
      const parsed = JSON.parse(extractors)
      return Array.isArray(parsed) ? parsed : []
    } catch (e) {
      // 解析失败，返回空数组
      return []
    }
  }
  
  return []
})

// 是否有预期响应Schema
const hasExpectedResponseSchema = computed(() => {
  return !!(props.testCase.expectedResponseSchema || props.testCase.expected_response_schema)
})

// 显示测试步骤
const displaySteps = computed(() => {
  if (props.testCase.test_steps && Array.isArray(props.testCase.test_steps)) {
    return props.testCase.test_steps
  }
  
  // 默认测试步骤
  return [
    {
      operation: '访问登录页面',
      expected: '显示登录表单'
    },
    {
      operation: '输入正确的用户名和密码',
      expected: '显示登录成功提示'
    },
    {
      operation: '点击登录按钮',
      expected: '跳转到首页'
    }
  ]
})

// 显示测试数据
const displayTestData = computed(() => {
  // 优先使用 preConditions（后端返回的驼峰命名）
  const data = props.testCase.preConditions 
    || props.testCase.pre_conditions 
    || props.testCase.request_override 
    || props.testCase.request_params
  
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
      // 解析失败，使用默认数据
    }
  }
  
  // 默认测试数据
  return [
    { label: 'username', value: 'testuser' },
    { label: 'password', value: 'Test@123' }
  ]
})

// 显示执行历史
const displayHistory = computed(() => {
  if (props.executionHistory && props.executionHistory.length > 0) {
    return props.executionHistory
  }
  
  // 默认执行历史
  return [
    {
      action: '李华',
      note: '开发环境',
      executed_time: '2024-01-20 16:45',
      status: 'passed'
    },
    {
      action: '王芳',
      note: '测试环境',
      executed_time: '2024-01-19 15:30',
      status: 'failed'
    },
    {
      action: '张明',
      note: '开发环境',
      executed_time: '2024-01-18 11:20',
      status: 'passed'
    }
  ]
})

// 显示验证规则
const displayValidationRules = computed(() => {
  // 从assertions解析验证规则
  if (props.testCase.assertions && Array.isArray(props.testCase.assertions)) {
    return props.testCase.assertions.map(assertion => {
      if (assertion.type === 'status_code') {
        return `状态码 = ${assertion.expected}`
      } else if (assertion.type === 'json_path') {
        return `${assertion.expression} = ${assertion.expected}`
      }
      return assertion.expression || assertion.field
    })
  }
  
  // 从validation_rules字符串解析
  if (props.testCase.validation_rules) {
    return props.testCase.validation_rules.split(',').map(r => r.trim())
  }
  
  // 默认验证规则
  return ['code = 0', 'msg = "success"', 'data != null']
})

// 格式化预期响应
const formatExpectedResponse = () => {
  // 优先使用驼峰命名的字段
  const responseBody = props.testCase.expectedResponseBody 
    || props.testCase.expected_response_body
  
  if (responseBody) {
    try {
      const parsed = typeof responseBody === 'string' 
        ? JSON.parse(responseBody)
        : responseBody
      return JSON.stringify(parsed, null, 2)
    } catch (e) {
      return responseBody
    }
  }
  
  // 默认响应
  return JSON.stringify({
    code: 200,
    message: '操作成功',
    data: null
  }, null, 2)
}

// 格式化预期响应Schema
const formatExpectedResponseSchema = () => {
  const responseSchema = props.testCase.expectedResponseSchema 
    || props.testCase.expected_response_schema
  
  if (responseSchema) {
    try {
      const parsed = typeof responseSchema === 'string'
        ? JSON.parse(responseSchema)
        : responseSchema
      return JSON.stringify(parsed, null, 2)
    } catch (e) {
      return responseSchema
    }
  }
  
  return ''
}

// 获取创建人名称
const getCreatorName = () => {
  if (props.testCase.creatorInfo && props.testCase.creatorInfo.name) {
    return props.testCase.creatorInfo.name
  }
  if (props.testCase.creator_info && props.testCase.creator_info.name) {
    return props.testCase.creator_info.name
  }
  return props.testCase.creator_name || '未知'
}

// 格式化时间
const formatTime = (time) => {
  if (!time) return '-'
  
  // 如果是ISO格式，转换为本地时间
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

// 获取状态码标签类型
const getStatusCodeType = (code) => {
  if (!code) return 'success'
  if (code >= 200 && code < 300) return 'success'
  if (code >= 400 && code < 500) return 'warning'
  if (code >= 500) return 'danger'
  return 'info'
}

const getStatusText = (status) => {
  const textMap = {
    passed: '通过',
    failed: '失败',
    not_executed: '未执行'
  }
  return textMap[status] || '未知'
}

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

// 执行测试对话框
const executeDialogVisible = ref(false)
const executing = ref(false)
const executeVariables = ref('')
const executeFormData = reactive({
  environment: 'dev',
  baseUrl: '',
  timeout: 30,
  variables: {},
  async: false
})

// 执行结果对话框
const resultDialogVisible = ref(false)
const executionResult = ref(null)

// 复制相关数据
const copyDialogVisible = ref(false)
const copying = ref(false)
const copyFormRef = ref(null)
const copyFormData = reactive({
  caseCode: '',
  name: '',
  description: ''
})

// 复制表单验证规则
const copyFormRules = {
  caseCode: [
    { required: true, message: '请输入用例编码', trigger: 'blur' },
    { min: 2, max: 50, message: '编码长度在 2 到 50 个字符', trigger: 'blur' },
    { pattern: /^[A-Z0-9_-]+$/, message: '编码只能包含大写字母、数字、下划线和连字符', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入用例名称', trigger: 'blur' },
    { min: 2, max: 100, message: '名称长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  description: [
    { max: 500, message: '描述不能超过 500 个字符', trigger: 'blur' }
  ]
}

// 执行测试
const handleExecute = () => {
  executeDialogVisible.value = true
}

// 确认执行测试
const handleConfirmExecute = async () => {
  try {
    executing.value = true
    
    // 解析执行变量
    let parsedVariables = {}
    if (executeVariables.value) {
      try {
        parsedVariables = JSON.parse(executeVariables.value)
  } catch (e) {
        ElMessage.error('执行变量必须是有效的JSON格式')
        executing.value = false
        return
      }
    }
    
    // 构建请求数据
    const requestData = {
      environment: executeFormData.environment,
      async: executeFormData.async
    }
    
    if (executeFormData.baseUrl) {
      requestData.base_url = executeFormData.baseUrl
    }
    
    if (executeFormData.timeout) {
      requestData.timeout = executeFormData.timeout
    }
    
    if (Object.keys(parsedVariables).length > 0) {
      requestData.variables = parsedVariables
    }
    
    // 调用执行API
    const caseId = props.testCase.caseId || props.testCase.case_id
    
    const response = await executeTestCase(null, caseId, requestData)
    
    if (response.code === 1) {
      if (requestData.async) {
        // 异步执行
        ElMessage.success(`测试任务已提交，任务ID: ${response.data.taskId || response.data.task_id}`)
        executeDialogVisible.value = false
      } else {
        // 同步执行 - 显示执行结果对话框
        executionResult.value = {
          executionId: response.data.executionId || response.data.execution_id,
          caseId: response.data.caseId || response.data.case_id,
          caseName: response.data.caseName || response.data.case_name,
          status: response.data.status,
          duration: response.data.duration,
          startTime: response.data.startTime || response.data.start_time,
          endTime: response.data.endTime || response.data.end_time,
          responseStatus: response.data.responseStatus || response.data.response_status,
          assertionsPassed: response.data.assertionsPassed || response.data.assertions_passed || 0,
          assertionsFailed: response.data.assertionsFailed || response.data.assertions_failed || 0,
          failureMessage: response.data.failureMessage || response.data.failure_message,
          logsLink: response.data.logsLink || response.data.logs_link,
          reportId: response.data.reportId || response.data.report_id
        }
        
        executeDialogVisible.value = false
        resultDialogVisible.value = true
      }
      
      emit('refresh')
    } else {
      ElMessage.error(response.msg || '执行失败')
    }
    
  } catch (error) {
    console.error('执行测试失败:', error)
    ElMessage.error(error.msg || error.message || '执行测试失败，请稍后重试')
  } finally {
    executing.value = false
  }
}

// 查看执行日志
const handleViewLogs = () => {
  if (executionResult.value && executionResult.value.logsLink) {
    window.open(executionResult.value.logsLink, '_blank')
  } else {
    ElMessage.info('日志链接不可用')
  }
}

// 查看测试报告
const handleViewReport = () => {
  if (executionResult.value && executionResult.value.reportId) {
    ElMessage.info(`查看报告ID: ${executionResult.value.reportId}`)
    // TODO: 跳转到报告详情页面
    // router.push(`/reports/${executionResult.value.reportId}`)
  } else {
    ElMessage.info('报告不可用')
  }
}

// 从结果对话框重新测试
const handleRetestFromResult = () => {
  resultDialogVisible.value = false
  executeDialogVisible.value = true
}

// 编辑用例
const handleEdit = () => {
  emit('edit', props.testCase)
}

// 复制用例
// 复制测试用例
const handleCopy = () => {
  // 生成默认的复制数据
  const originalCode = props.testCase.caseCode || props.testCase.case_code || props.testCase.id
  const originalName = props.testCase.name
  
  // 生成新的编码和名称
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  copyFormData.caseCode = `${originalCode}_COPY_${timestamp}`
  copyFormData.name = `${originalName}(副本)`
  copyFormData.description = props.testCase.description || ''
  
  copyDialogVisible.value = true
}

// 确认复制
const handleConfirmCopy = async () => {
  if (!copyFormRef.value) return
  
  try {
    await copyFormRef.value.validate()
    
    copying.value = true
    
    console.log('开始复制测试用例...')
    console.log('原用例数据:', props.testCase)
    console.log('复制表单数据:', copyFormData)
    
    // 使用复制接口，传递新的编码、名称和描述
    const copyData = {
      caseCode: copyFormData.caseCode,
      name: copyFormData.name,
      description: copyFormData.description
    }
    
    console.log('复制数据:', copyData)
    
    const caseId = props.testCase.case_id || props.testCase.id
    const copyResponse = await copyTestCase(caseId, copyData)
    console.log('复制响应:', copyResponse)
    
    if (copyResponse.code === 1) {
      ElMessage.success('测试用例复制成功')
      copyDialogVisible.value = false
      emit('refresh') // 通知父组件刷新数据
    } else {
      ElMessage.error(copyResponse.msg || '复制失败')
    }
  } catch (error) {
    console.error('复制测试用例失败:', error)
    console.error('错误详情:', error.response || error.message)
    ElMessage.error('复制失败，请检查输入信息')
  } finally {
    copying.value = false
  }
}

// 更多操作
const handleMoreAction = async (command) => {
  switch (command) {
    case 'export':
      ElMessage.info('导出用例')
      // TODO: 实现导出功能
      break
      
    case 'history':
      ElMessage.info('查看历史')
      // TODO: 打开历史记录对话框
      break
      
    case 'share':
      ElMessage.info('分享用例')
      // TODO: 实现分享功能
      break
      
    case 'disable':
      try {
        await ElMessageBox.confirm(
          `确定要禁用用例 "${props.testCase.name}" 吗？`,
          '禁用确认',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        ElMessage.success('用例已禁用')
        // TODO: 调用禁用API
      } catch (error) {
        // 用户取消
      }
      break
      
    case 'delete':
      await handleDelete()
      break
  }
}

// 删除用例
const handleDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用例 "${props.testCase.name}" 吗？此操作不可恢复！`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    emit('delete', props.testCase)
    emit('close')
    ElMessage.success('用例已删除')
  } catch (error) {
    // 用户取消删除
  }
}
</script>

<style scoped>
.case-detail-container {
  height: 100%;
  background: white;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 面包屑导航 */
.breadcrumb {
  padding: 16px 24px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.breadcrumb-item {
  font-size: 14px;
  color: #606266;
}

.breadcrumb-item.active {
  color: #303133;
  font-weight: 500;
}

.breadcrumb-separator {
  color: #c0c4cc;
  font-size: 14px;
}

/* 用例标题 */
.case-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.case-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  flex: 1;
}

.case-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* 内容区域 */
.case-content {
  flex: 1;
  display: flex;
  gap: 24px;
  padding: 24px;
  overflow-y: auto;
  overflow-x: hidden;
}

.case-content::-webkit-scrollbar {
  width: 8px;
}

.case-content::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 4px;
}

.case-content::-webkit-scrollbar-thumb:hover {
  background: #c0c4cc;
}

.case-content::-webkit-scrollbar-track {
  background: #f5f7fa;
}

/* 左侧主要内容 */
.case-main {
  flex: 1;
  min-width: 0;
}

/* 右侧辅助信息 */
.case-sidebar {
  width: 320px;
  flex-shrink: 0;
}

/* 信息卡片 */
.info-card {
  background: #fafafa;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
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

/* 测试数据 */
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

/* 预期响应部分 */
.expected-response-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.response-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.response-item.full-width {
  flex-direction: column;
}

.response-label {
  min-width: 80px;
  font-size: 14px;
  color: #909399;
  font-weight: 500;
  flex-shrink: 0;
}

.response-value {
  font-size: 14px;
  color: #606266;
}

.validation-rules {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.rule-tag {
  padding: 6px 12px;
  background: #f0f9ff;
  color: #409eff;
  border-radius: 4px;
  font-size: 13px;
  border: 1px solid #b3d8ff;
}

.response-code {
  width: 100%;
  background: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 12px;
  overflow-x: auto;
  margin-top: 8px;
}

.response-code pre {
  margin: 0;
  font-family: 'Courier New', 'Monaco', 'Menlo', monospace;
  font-size: 13px;
  color: #303133;
  line-height: 1.6;
}

/* 侧边栏区块 */
.sidebar-section {
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.sidebar-title {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

/* 执行历史 */
.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-card {
  background: #fafafa;
  border-radius: 6px;
  padding: 12px;
}

.history-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.history-executor {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.history-body {
  font-size: 13px;
  color: #606266;
  margin-bottom: 8px;
}

.history-footer {
  font-size: 12px;
  color: #909399;
}

/* 关联信息 */
.related-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.related-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px;
  background: #fafafa;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.related-item:hover {
  background: #f0f0f0;
}

.related-content {
  flex: 1;
}

.related-title {
  font-size: 13px;
  color: #303133;
  margin-bottom: 4px;
}

.related-code {
  font-size: 12px;
  color: #909399;
}

/* 讨论区 */
.comments-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-item {
  display: flex;
  gap: 12px;
}

.comment-avatar {
  flex-shrink: 0;
  background: #409eff;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.comment-author {
  font-size: 13px;
  color: #303133;
  font-weight: 500;
}

.comment-time {
  font-size: 12px;
  color: #909399;
}

.comment-text {
  font-size: 13px;
  color: #606266;
  line-height: 1.6;
}

/* 执行结果对话框 */
.execution-result-container {
  padding: 0;
}

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

/* 执行信息卡片 */
.result-info-section {
  margin-bottom: 24px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
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

/* 时间信息 */
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

/* 失败信息 */
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

/* 操作链接 */
.result-links-section {
  display: flex;
  gap: 12px;
  justify-content: center;
}

/* 用例描述 */
.description-text {
  margin: 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.8;
}

/* 标签容器 */
.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  margin: 0;
}

/* 响应提取规则 */
.extractors-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.extractor-item {
  background: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 16px;
}

.extractor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.extractor-name {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.extractor-expression {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.expression-label {
  font-size: 13px;
  color: #909399;
  flex-shrink: 0;
}

.expression-code {
  flex: 1;
  padding: 4px 8px;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-family: 'Courier New', 'Monaco', 'Menlo', monospace;
  font-size: 13px;
  color: #409eff;
}

.extractor-description {
  font-size: 13px;
  color: #606266;
  line-height: 1.6;
}

/* 复制对话框样式 */
.copy-info {
  margin-top: 20px;
}

.copy-info .el-alert {
  margin-bottom: 0;
}

.copy-info ul {
  margin: 8px 0 0 0;
  padding-left: 20px;
}

.copy-info li {
  margin: 4px 0;
  font-size: 13px;
  color: #606266;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}
</style>
