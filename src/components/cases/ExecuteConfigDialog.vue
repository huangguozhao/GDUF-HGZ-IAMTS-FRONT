<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="900px"
    :close-on-click-modal="false"
    destroy-on-close
    class="execute-dialog-enhanced"
    @close="handleClose"
  >
    <div class="execute-dialog-content">
      <!-- 执行目标信息卡片 -->
      <el-card class="target-info-card" shadow="never">
        <div class="target-header">
          <div class="target-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="target-details">
            <div class="target-title">{{ targetTypeLabel }}</div>
            <div class="target-meta">
              <el-tag size="small" type="primary">{{ targetName }}</el-tag>
              <span class="target-desc">将执行 {{ caseCount }} 个测试用例</span>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 环境配置区域 -->
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
                <el-select v-model="formData.environment" placeholder="请选择执行环境" style="width: 100%">
                  <el-option v-for="env in environmentList" :key="env.value" :label="env.label" :value="env.value">
                    <div class="option-content">
                      <span class="option-dot" :class="env.value"></span>
                      <span>{{ env.label }}</span>
                      <span class="option-desc">{{ env.value }}</span>
                    </div>
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="6">
              <el-form-item label="超时时间">
                <el-input-number
                  v-model="formData.timeout"
                  :min="1"
                  :max="300"
                  placeholder="30"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>

            <el-col :span="6">
              <el-form-item label="单位">
                <div class="timeout-unit">秒</div>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="Base URL">
            <el-input
              v-model="formData.baseUrl"
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
              <span class="preview-label">预览：</span>
              <span class="preview-url">{{ previewUrl }}</span>
            </div>
          </el-form-item>
        </el-card>
      </div>

      <!-- 测试用例筛选 -->
      <div class="config-section">
        <div class="section-header">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>测试用例筛选</span>
          <el-tag size="small" type="warning">高级选项</el-tag>
        </div>
        <el-card class="config-card advanced-card" shadow="never">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="并发执行数">
                <el-input-number
                  v-model="formData.concurrency"
                  :min="1"
                  :max="10"
                  placeholder="3"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="执行顺序">
                <el-select v-model="formData.executionOrder" placeholder="选择执行顺序" style="width: 100%">
                  <el-option label="依赖顺序执行（推荐）" value="dependency" />
                  <el-option label="优先级降序" value="priority_desc" />
                  <el-option label="优先级升序" value="priority_asc" />
                  <el-option label="名称升序" value="name_asc" />
                  <el-option label="名称降序" value="name_desc" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="优先级过滤">
                <el-select
                  v-model="formData.priorityFilter"
                  multiple
                  placeholder="全部优先级"
                  style="width: 100%"
                >
                  <el-option label="P0（最高优先级）" value="P0" />
                  <el-option label="P1（高优先级）" value="P1" />
                  <el-option label="P2（中等优先级）" value="P2" />
                  <el-option label="P3（低优先级）" value="P3" />
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="标签过滤">
                <el-select
                  v-model="formData.tagFilter"
                  multiple
                  filterable
                  allow-create
                  placeholder="全部标签"
                  style="width: 100%"
                >
                  <el-option v-for="tag in availableTags" :key="tag" :label="tag" :value="tag" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item>
            <el-checkbox v-model="formData.enabledOnly">
              <span>仅执行已启用的测试用例</span>
            </el-checkbox>
          </el-form-item>
        </el-card>
      </div>

      <!-- 执行模式配置 -->
      <div class="config-section">
        <div class="section-header">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>执行模式与变量</span>
        </div>
        <el-card class="config-card" shadow="never">
          <el-form-item label="执行方式">
            <el-radio-group v-model="formData.async" class="execution-mode-group">
              <el-radio :value="false" class="mode-option">
                <div class="mode-content">
                  <div class="mode-title">同步执行</div>
                  <div class="mode-desc">等待测试完成并返回详细结果</div>
                </div>
              </el-radio>
              <el-radio :value="true" class="mode-option">
                <div class="mode-content">
                  <div class="mode-title">异步执行</div>
                  <div class="mode-desc">立即返回任务ID，后台执行</div>
                </div>
              </el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="执行变量">
            <div class="variables-header">
              <el-input
                v-model="formData.variables"
                type="textarea"
                :rows="4"
                placeholder='{"username": "testuser", "token": "your-token"}'
                class="variables-textarea"
              />
              <div class="variable-actions">
                <el-button size="small" text @click="insertVariableTemplate('user')">
                  用户变量
                </el-button>
                <el-button size="small" text @click="insertVariableTemplate('token')">
                  Token
                </el-button>
                <el-button size="small" text @click="insertVariableTemplate('custom')">
                  自定义
                </el-button>
              </div>
            </div>
          </el-form-item>
        </el-card>
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
            <span class="summary-value">{{ targetTypeLabel }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">执行环境：</span>
            <el-tag size="small" :type="getEnvironmentTagType(formData.environment)">
              {{ formData.environment }}
            </el-tag>
          </div>
          <div class="summary-item">
            <span class="summary-label">超时设置：</span>
            <span class="summary-value">{{ formData.timeout }} 秒</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">执行方式：</span>
            <span class="summary-value">{{ formData.async ? '异步执行' : '同步执行' }}</span>
          </div>
        </div>
      </el-card>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose" size="large">取消</el-button>
        <el-button
          type="primary"
          @click="handleExecute"
          :loading="executing"
          size="large"
          class="execute-btn"
        >
          <svg v-if="!executing" width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          {{ executing ? '执行中...' : '开始执行' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { getEnvironmentList } from '@/api/project'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  targetType: { type: String, default: 'module' },
  targetId: { type: Number, default: null },
  targetName: { type: String, default: '' },
  caseCount: { type: Number, default: 0 },
  projectId: { type: Number, default: null }
})

const emit = defineEmits(['update:modelValue', 'execute'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const title = computed(() => {
  return props.targetType === 'project' ? '执行项目测试' : '执行模块测试'
})

const targetTypeLabel = computed(() => {
  return props.targetType === 'project' ? '项目级测试' : '模块级测试'
})

const executing = ref(false)
const environmentList = ref([
  { label: '开发环境', value: 'dev' },
  { label: '测试环境', value: 'test' },
  { label: '预发布环境', value: 'staging' },
  { label: '生产环境', value: 'prod' }
])
const availableTags = ref(['冒烟测试', '回归测试', '功能测试', '缺陷验证', '性能测试'])

const formData = ref({
  environment: 'test',
  baseUrl: '',
  timeout: 30,
  async: false,
  concurrency: 3,
  executionOrder: 'dependency',
  priorityFilter: [],
  tagFilter: [],
  enabledOnly: true,
  variables: ''
})

const previewUrl = computed(() => {
  if (formData.value.baseUrl) {
    return formData.value.baseUrl
  }
  const env = environmentList.value.find(e => e.value === formData.value.environment)
  return env?.baseUrl || ''
})

const getEnvironmentTagType = (env) => {
  const types = {
    dev: 'success',
    test: 'warning',
    staging: 'danger',
    prod: 'info'
  }
  return types[env] || 'info'
}

const insertVariableTemplate = (type) => {
  const templates = {
    user: '{"username": "testuser", "password": "Test@123"}',
    token: '{"token": "your-auth-token-here"}',
    custom: '{"key": "value"}'
  }
  formData.value.variables = templates[type]
}

const loadEnvironments = async () => {
  try {
    const response = await getEnvironmentList({ pageSize: 100 })
    if (response.code === 1 && response.data?.items) {
      environmentList.value = response.data.items.map(env => ({
        label: env.envName,
        value: env.envCode || env.envId?.toString(),
        baseUrl: env.baseUrl
      }))
    }
  } catch (error) {
    console.warn('加载环境配置失败，使用默认环境列表')
  }
}

const handleClose = () => {
  visible.value = false
}

const handleExecute = () => {
  executing.value = true
  
  let parsedVariables = {}
  if (formData.value.variables) {
    try {
      parsedVariables = JSON.parse(formData.value.variables)
    } catch (e) {
      // 忽略解析错误
    }
  }
  
  emit('execute', {
    environment: formData.value.environment,
    baseUrl: formData.value.baseUrl,
    timeout: formData.value.timeout,
    async: formData.value.async,
    concurrency: formData.value.concurrency,
    executionOrder: formData.value.executionOrder,
    priorityFilter: formData.value.priorityFilter,
    tagFilter: formData.value.tagFilter,
    enabledOnly: formData.value.enabledOnly,
    variables: parsedVariables,
    targetId: props.targetId,
    targetType: props.targetType
  })
  
  setTimeout(() => {
    executing.value = false
  }, 1000)
}

watch(visible, (val) => {
  if (!val) {
    executing.value = false
  }
})

onMounted(() => {
  loadEnvironments()
})
</script>

<style scoped>
.execute-dialog-content {
  padding: 0;
}

.target-info-card {
  margin-bottom: 20px;
  border: 1px solid #e4e7ed;
}

.target-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.target-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #409eff, #67c23a);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.target-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.target-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 4px;
}

.target-desc {
  font-size: 13px;
  color: #909399;
}

.config-section {
  margin-bottom: 16px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.config-card {
  border: 1px solid #e4e7ed;
}

.advanced-card {
  background: #fafafa;
}

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

.timeout-unit {
  line-height: 32px;
  color: #606266;
}

.url-preview {
  margin-top: 8px;
  font-size: 12px;
}

.preview-label {
  color: #909399;
}

.preview-url {
  color: #409eff;
}

.execution-mode-group {
  display: flex;
  gap: 20px;
}

.mode-option {
  display: flex;
  align-items: flex-start;
  padding: 12px 16px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  margin-right: 0;
}

.mode-option.is-checked {
  border-color: #409eff;
  background: #ecf5ff;
}

.mode-content {
  margin-left: 8px;
}

.mode-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.mode-desc {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
}

.variables-header {
  width: 100%;
}

.variables-textarea {
  font-family: monospace;
}

.variable-actions {
  margin-top: 8px;
  display: flex;
  gap: 8px;
}

.summary-card {
  border: 1px solid #e4e7ed;
  background: #f5f7fa;
}

.summary-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
}

.summary-content {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.summary-label {
  color: #909399;
  font-size: 13px;
}

.summary-value {
  color: #303133;
  font-size: 13px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.execute-btn {
  display: flex;
  align-items: center;
  gap: 6px;
}
</style>
