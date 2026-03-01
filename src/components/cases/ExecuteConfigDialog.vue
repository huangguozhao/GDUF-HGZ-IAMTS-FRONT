<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="$emit('update:visible', $event)"
    title="🎯 执行测试配置"
    width="900px"
    class="execute-dialog-enhanced"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <div class="execute-dialog-content">
      <!-- 执行目标信息卡片 -->
      <el-card class="target-info-card" shadow="never">
        <div class="target-header">
          <div class="target-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="target-details">
            <div class="target-title">{{ title }}</div>
            <div class="target-meta">
              <el-tag v-if="targetInfo.tag" size="small" :type="targetInfo.tagType">
                {{ targetInfo.tag }}
              </el-tag>
              <span class="target-desc" v-if="targetInfo.description">
                {{ targetInfo.description }}
              </span>
            </div>
          </div>
          <div class="target-stats" v-if="targetInfo.stats">
            <div class="stat-item" v-for="(stat, index) in targetInfo.stats" :key="index">
              <span class="stat-value">{{ stat.value }}</span>
              <span class="stat-label">{{ stat.label }}</span>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 配置区域 -->
      <div class="config-sections-wrapper">
        <!-- 环境配置区块 -->
        <div class="config-section">
          <div class="section-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>执行环境</span>
          </div>
          <el-card class="config-card" shadow="never">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="执行环境" required>
                  <el-select
                    v-model="config.environment"
                    placeholder="请选择执行环境"
                    style="width: 100%"
                    :loading="loadingEnvironments"
                    filterable
                  >
                    <el-option
                      v-for="env in environmentList"
                      :key="env.env_id"
                      :label="`${env.env_name} (${env.env_code})`"
                      :value="env.env_id"
                    >
                      <div class="option-content">
                        <span 
                          class="option-dot" 
                          :style="{ background: envTypeColors[env.env_type] || '#909399' }"
                        ></span>
                        <span>{{ env.env_name }}</span>
                        <span class="option-desc">{{ env.base_url || env.env_code }}</span>
                      </div>
                    </el-option>
                    <el-empty v-if="!loadingEnvironments && environmentList.length === 0" description="暂无环境配置" :image-size="60" />
                  </el-select>
                </el-form-item>
              </el-col>

              <el-col :span="6">
                <el-form-item label="超时时间">
                  <el-input-number
                    v-model="config.timeout"
                    :min="1"
                    :max="300"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>

              <el-col :span="6">
                <el-form-item label="单位">
                  <span class="timeout-unit">秒</span>
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item label="Base URL">
              <el-input
                v-model="config.baseUrl"
                placeholder="留空则使用环境默认URL"
                clearable
              >
                <template #prefix>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </template>
              </el-input>
              <div class="url-preview" v-if="previewUrl">
                <span class="preview-label">🌐 预览：</span>
                <span class="preview-url">{{ previewUrl }}</span>
              </div>
            </el-form-item>
          </el-card>
        </div>

        <!-- 执行模式区块 -->
        <div class="config-section">
          <div class="section-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>执行模式</span>
          </div>
          <el-card class="config-card" shadow="never">
            <el-form-item label="执行方式">
              <el-radio-group v-model="config.async" class="execution-mode-group">
                <el-radio :label="false" class="mode-option">
                  <div class="mode-content">
                    <div class="mode-title">⚡ 同步执行</div>
                    <div class="mode-desc">等待测试完成并返回详细结果</div>
                  </div>
                </el-radio>
                <el-radio :label="true" class="mode-option">
                  <div class="mode-content">
                    <div class="mode-title">🚀 异步执行</div>
                    <div class="mode-desc">立即返回任务ID，后台执行</div>
                  </div>
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-card>
        </div>

        <!-- 执行变量区块 -->
        <div class="config-section">
          <div class="section-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>执行变量</span>
          </div>
          <el-card class="config-card" shadow="never">
            <el-form-item>
              <div class="variables-wrapper">
                <div class="variables-header">
                  <el-input
                    v-model="variablesText"
                    type="textarea"
                    :rows="4"
                    placeholder='{"username": "testuser", "token": "your-token"}'
                    class="variables-textarea"
                    @input="validateVariables"
                  />
                  <div class="variable-actions">
                    <el-button size="small" text @click="insertTemplate('user')">
                      👤 用户变量
                    </el-button>
                    <el-button size="small" text @click="insertTemplate('token')">
                      🔑 Token
                    </el-button>
                    <el-button size="small" text @click="insertTemplate('custom')">
                      ➕ 自定义
                    </el-button>
                    <el-button 
                      v-if="variablesText" 
                      size="small" text 
                      @click="formatVariables"
                    >
                      ✨ 格式化
                    </el-button>
                  </div>
                </div>
                <div v-if="variablesError" class="variables-error">
                  <span>{{ variablesError }}</span>
                </div>
                <div v-else class="variables-hint">
                  <span>💡 变量会覆盖默认值，支持动态参数化测试</span>
                </div>
              </div>
            </el-form-item>
          </el-card>
        </div>
      </div>

      <!-- 执行预览摘要 -->
      <el-card class="summary-card" shadow="never">
        <template #header>
          <div class="summary-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>执行预览</span>
          </div>
        </template>
        <div class="summary-content">
          <div class="summary-item">
            <span class="summary-label">执行目标：</span>
            <span class="summary-value">{{ targetInfo.name }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">执行环境：</span>
            <el-tag size="small" :type="getEnvironmentTagType(config.environment)">
              {{ config.environment || '未选择' }}
            </el-tag>
          </div>
          <div class="summary-item">
            <span class="summary-label">超时设置：</span>
            <span class="summary-value">{{ config.timeout }} 秒</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">执行方式：</span>
            <span class="summary-value">{{ config.async ? '异步执行' : '同步执行' }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">变量数量：</span>
            <span class="summary-value">{{ variableCount }} 个</span>
          </div>
        </div>
      </el-card>
    </div>

    <template #footer>
      <div class="execute-dialog-footer">
        <div class="footer-info">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <path d="M12 16v-4M12 8h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <span>执行过程中请勿关闭页面，测试结果将自动显示</span>
        </div>
        <div class="footer-actions">
          <el-button @click="handleCancel" size="large">取消</el-button>
          <el-button
            type="primary"
            @click="handleConfirm"
            :loading="loading"
            size="large"
            class="execute-btn"
            :disabled="!config.environment"
          >
            <svg v-if="!loading" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            {{ loading ? '执行中...' : '🚀 开始执行' }}
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { getEnvironmentConfigList } from '../../api/environment'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  // 弹窗标题
  title: {
    type: String,
    default: '执行测试配置'
  },
  // 目标信息
  targetInfo: {
    type: Object,
    default: () => ({
      name: '测试用例',
      tag: '',
      tagType: 'success',
      description: '',
      stats: []
    })
  },
  // 初始配置
  initialConfig: {
    type: Object,
    default: () => ({
      environment: 'test',
      baseUrl: '',
      timeout: 30,
      async: false
    })
  },
  // 初始变量
  initialVariables: {
    type: String,
    default: ''
  },
  // 加载状态
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible', 'confirm', 'cancel'])

// 内部配置状态
const config = ref({ ...props.initialConfig })
const variablesText = ref(props.initialVariables)
const variablesError = ref('')

// 动态环境列表
const environmentList = ref([])
const loadingEnvironments = ref(false)

// 环境类型到颜色的映射
const envTypeColors = {
  development: '#67c23a',
  testing: '#e6a23c',
  staging: '#f56c6c',
  production: '#909399',
  performance: '#409eff',
  disaster_recovery: '#e6a23c'
}

// 获取环境列表
const fetchEnvironments = async () => {
  loadingEnvironments.value = true
  try {
    const res = await getEnvironmentConfigList({ status: 'active', pageSize: 100 })
    // 处理后端返回 code=1 表示成功的情况
    if ((res.code === 200 || res.code === 1) && res.data) {
      environmentList.value = res.data.items || res.data.list || []
      
      console.log('环境列表加载成功:', environmentList.value)
      
      // 自动选择默认环境或第一个环境
      if (!config.value.environment && environmentList.value.length > 0) {
        // 优先选择默认环境
        const defaultEnv = environmentList.value.find(env => env.is_default)
        config.value.environment = defaultEnv ? defaultEnv.env_id : environmentList.value[0].env_id
      }
    } else {
      console.warn('环境列表加载失败:', res.msg)
    }
  } catch (error) {
    console.error('获取环境列表失败:', error)
  } finally {
    loadingEnvironments.value = false
  }
}

// 根据环境ID获取环境信息
const getEnvironmentById = (envId) => {
  return environmentList.value.find(env => env.env_id === envId)
}

// 计算预览URL
const previewUrl = computed(() => {
  // 如果有手动输入的baseUrl，优先使用
  if (config.value.baseUrl) {
    return config.value.baseUrl
  }
  
  // 否则从选中的环境中获取
  const selectedEnv = getEnvironmentById(config.value.environment)
  if (selectedEnv && selectedEnv.baseUrl) {
    return selectedEnv.baseUrl
  }
  
  return ''
})

// 计算变量数量
const variableCount = computed(() => {
  if (!variablesText.value) return 0
  try {
    const parsed = JSON.parse(variablesText.value)
    return Object.keys(parsed).length
  } catch {
    return 0
  }
})

// 监听visible变化，重置状态
watch(() => props.visible, (val) => {
  if (val) {
    config.value = { ...props.initialConfig }
    variablesText.value = props.initialVariables
    variablesError.value = ''
    // 弹窗打开时获取环境列表
    fetchEnvironments()
  }
})

// 验证变量JSON格式
const validateVariables = () => {
  if (!variablesText.value || !variablesText.value.trim()) {
    variablesError.value = ''
    return true
  }
  try {
    JSON.parse(variablesText.value)
    variablesError.value = ''
    return true
  } catch (e) {
    variablesError.value = 'JSON 格式错误：' + (e.message || '无法解析')
    return false
  }
}

// 获取环境标签类型
const getEnvironmentTagType = (envId) => {
  // envId 现在是环境ID（数字）
  const env = getEnvironmentById(envId)
  if (!env) return 'info'
  
  const types = {
    development: 'success',
    testing: 'warning',
    staging: 'danger',
    production: 'info',
    performance: 'primary',
    disaster_recovery: 'warning'
  }
  return types[env.env_type] || 'info'
}

// 插入变量模板
const insertTemplate = (type) => {
  const templates = {
    user: {
      username: 'testuser',
      password: 'Test@123',
      email: 'test@example.com'
    },
    token: {
      access_token: 'your-access-token',
      refresh_token: 'your-refresh-token',
      expires_in: 7200
    },
    custom: {
      key: 'value'
    }
  }
  
  try {
    const currentVars = variablesText.value ? JSON.parse(variablesText.value) : {}
    const newVars = { ...currentVars, ...templates[type] }
    variablesText.value = JSON.stringify(newVars, null, 2)
    variablesError.value = ''
  } catch {
    variablesText.value = JSON.stringify(templates[type], null, 2)
  }
}

// 格式化变量JSON
const formatVariables = () => {
  if (!variablesText.value || !variablesText.value.trim()) {
    return
  }
  try {
    const parsed = JSON.parse(variablesText.value)
    variablesText.value = JSON.stringify(parsed, null, 2)
    variablesError.value = ''
  } catch (e) {
    variablesError.value = 'JSON 格式错误：' + (e.message || '无法解析')
  }
}

// 确认执行
const handleConfirm = () => {
  if (!validateVariables()) return
  
  // 获取完整的环境信息
  const selectedEnv = getEnvironmentById(config.value.environment)
  
  emit('confirm', {
    ...config.value,
    environment: config.value.environment,  // 保留环境ID用于后端
    environmentInfo: selectedEnv,           // 传递完整环境对象
    baseUrl: config.value.baseUrl || selectedEnv?.base_url || '',  // 使用手动输入的或环境默认的
    variables: variablesText.value
  })
}

// 取消
const handleCancel = () => {
  emit('update:visible', false)
  emit('cancel')
}
</script>

<style scoped>
.execute-dialog-enhanced {
  --el-dialog-padding-primary: 24px;
  --el-dialog-border-radius: 12px;
}

.execute-dialog-enhanced :deep(.el-dialog__header) {
  margin: 0;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.execute-dialog-enhanced :deep(.el-dialog__header .el-dialog__title) {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.execute-dialog-enhanced :deep(.el-dialog__body) {
  padding: 20px 24px;
  max-height: 70vh;
  overflow-y: auto;
}

.execute-dialog-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 执行目标信息卡片 */
.target-info-card {
  background: linear-gradient(135deg, #409eff 0%, #53a8ff 50%, #79bbff 100%);
  border: none;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.3);
}

.target-info-card :deep(.el-card__body) {
  padding: 20px;
}

.target-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.target-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.target-details {
  flex: 1;
}

.target-title {
  font-size: 16px;
  font-weight: 600;
  color: white;
  margin-bottom: 4px;
}

.target-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.target-meta :deep(.el-tag) {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
}

.target-desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
}

.target-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
}

.stat-value {
  font-size: 14px;
  font-weight: 600;
  color: white;
}

.stat-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
}

/* 配置区块 */
.config-sections-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.config-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #303133;
  font-size: 14px;
}

.section-header svg {
  color: #409eff;
}

.config-card {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.config-card:hover {
  border-color: #409eff;
  box-shadow: 0 2px 12px 0 rgba(64, 158, 255, 0.1);
}

.config-card :deep(.el-card__body) {
  padding: 20px;
}

/* 选项样式 */
.option-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.option-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.option-dot.dev { background: #67c23a; }
.option-dot.test { background: #e6a23c; }
.option-dot.staging { background: #f56c6c; }
.option-dot.prod { background: #909399; }

.option-desc {
  color: #909399;
  font-size: 12px;
  margin-left: auto;
}

/* 超时单位 */
.timeout-unit {
  color: #606266;
  font-size: 14px;
  line-height: 32px;
}

/* URL预览 */
.url-preview {
  margin-top: 8px;
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.preview-label {
  color: #909399;
}

.preview-url {
  color: #409eff;
  font-family: 'Monaco', 'Menlo', monospace;
}

/* 执行变量样式 */
.variables-wrapper {
  width: 100%;
}

.variables-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.variables-textarea :deep(.el-textarea__inner) {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 13px;
}

.variable-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.variable-actions .el-button {
  display: flex;
  align-items: center;
  gap: 4px;
}

.variables-error {
  margin-top: 8px;
  padding: 8px 12px;
  background: #fef0f0;
  border: 1px solid #fde2e2;
  border-radius: 4px;
  color: #f56c6c;
  font-size: 13px;
}

.variables-hint {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}

/* 执行摘要卡片 */
.summary-card {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);
  border: none;
}

.summary-card :deep(.el-card__header) {
  background: transparent;
  border-bottom: 1px solid #e4e7ed;
  padding: 12px 16px;
}

.summary-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #303133;
  font-size: 14px;
}

.summary-header svg {
  color: #409eff;
}

.summary-content {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: white;
  border-radius: 6px;
  min-width: 150px;
}

.summary-label {
  color: #909399;
  font-size: 13px;
}

.summary-value {
  color: #303133;
  font-size: 13px;
  font-weight: 500;
}

/* 执行模式 */
.execution-mode-group {
  display: flex;
  gap: 16px;
}

.execution-mode-group :deep(.el-radio) {
  margin-right: 0;
}

.execution-mode-group :deep(.el-radio__label) {
  display: none;
}

.mode-option {
  padding: 12px 16px;
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.mode-option:hover {
  border-color: #409eff;
}

.mode-option:has(:checked) {
  border-color: #409eff;
  background: #f0f7ff;
}

.mode-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mode-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.mode-desc {
  font-size: 12px;
  color: #909399;
}

/* 对话框底部 */
.execute-dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
}

.footer-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #909399;
  font-size: 13px;
}

.footer-info svg {
  color: #409eff;
}

.footer-actions {
  display: flex;
  gap: 12px;
}

.execute-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
}
</style>

