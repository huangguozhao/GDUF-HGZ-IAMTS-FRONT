<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑集成服务' : '添加集成服务'"
    width="700px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="modal-content">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
        size="default"
      >
        <!-- 基本信息 -->
        <div class="form-section">
          <h4>基本信息</h4>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="服务名称" prop="name">
                <el-input
                  v-model="formData.name"
                  placeholder="输入服务名称"
                  maxlength="50"
                  show-word-limit
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="服务类型" prop="type">
                <el-select
                  v-model="formData.type"
                  placeholder="选择服务类型"
                  @change="handleTypeChange"
                  style="width: 100%"
                >
                  <el-option-group
                    v-for="group in serviceTypeGroups"
                    :key="group.label"
                    :label="group.label"
                  >
                    <el-option
                      v-for="type in group.options"
                      :key="type.value"
                      :label="type.label"
                      :value="type.value"
                    >
                      <div class="option-content">
                        <i :class="type.icon" class="option-icon"></i>
                        <span>{{ type.label }}</span>
                        <span class="option-desc">{{ type.description }}</span>
                      </div>
                    </el-option>
                  </el-option-group>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="服务地址" prop="baseUrl">
            <el-input
              v-model="formData.baseUrl"
              placeholder="输入服务基础URL"
              maxlength="500"
            >
              <template #prepend>
                <el-select v-model="protocol" style="width: 90px" @change="updateBaseUrl">
                  <el-option label="https://" value="https://" />
                  <el-option label="http://" value="http://" />
                </el-select>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item label="描述" prop="description">
            <el-input
              v-model="formData.description"
              type="textarea"
              :rows="3"
              placeholder="输入服务描述"
              maxlength="200"
              show-word-limit
            />
          </el-form-item>
        </div>

        <!-- 认证配置 -->
        <div class="form-section">
          <h4>认证配置</h4>
          <el-form-item label="认证方式" prop="authType">
            <el-radio-group v-model="formData.authType" @change="handleAuthTypeChange">
              <el-radio label="none">无认证</el-radio>
              <el-radio label="basic">Basic Auth</el-radio>
              <el-radio label="token">API Token</el-radio>
              <el-radio label="oauth">OAuth 2.0</el-radio>
            </el-radio-group>
          </el-form-item>

          <!-- Basic Auth -->
          <div v-if="formData.authType === 'basic'" class="auth-config">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="用户名" prop="authConfig.username">
                  <el-input
                    v-model="formData.authConfig.username"
                    placeholder="输入用户名"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="密码" prop="authConfig.password">
                  <el-input
                    v-model="formData.authConfig.password"
                    type="password"
                    placeholder="输入密码"
                    show-password
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <!-- API Token -->
          <div v-if="formData.authType === 'token'" class="auth-config">
            <el-form-item label="API Token" prop="authConfig.token">
              <el-input
                v-model="formData.authConfig.token"
                type="password"
                placeholder="输入API Token"
                show-password
              />
            </el-form-item>
            <el-form-item label="Token位置">
              <el-radio-group v-model="formData.authConfig.tokenLocation">
                <el-radio label="header">请求头 (Authorization)</el-radio>
                <el-radio label="query">查询参数</el-radio>
              </el-radio-group>
            </el-form-item>
          </div>

          <!-- OAuth 2.0 -->
          <div v-if="formData.authType === 'oauth'" class="auth-config">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Client ID" prop="authConfig.clientId">
                  <el-input
                    v-model="formData.authConfig.clientId"
                    placeholder="输入Client ID"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Client Secret" prop="authConfig.clientSecret">
                  <el-input
                    v-model="formData.authConfig.clientSecret"
                    type="password"
                    placeholder="输入Client Secret"
                    show-password
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Token URL" prop="authConfig.tokenUrl">
                  <el-input
                    v-model="formData.authConfig.tokenUrl"
                    placeholder="输入Token获取URL"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Scope">
                  <el-input
                    v-model="formData.authConfig.scope"
                    placeholder="输入权限范围"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </div>

        <!-- 高级配置 -->
        <div class="form-section">
          <h4>高级配置</h4>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="请求超时">
                <el-input-number
                  v-model="formData.timeout"
                  :min="5"
                  :max="300"
                  :step="5"
                  style="width: 100%"
                />
                <div class="form-tip">秒</div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="重试次数">
                <el-input-number
                  v-model="formData.retryCount"
                  :min="0"
                  :max="10"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="自定义Headers">
            <div class="headers-config">
              <div
                v-for="(header, index) in formData.customHeaders"
                :key="index"
                class="header-item"
              >
                <el-input
                  v-model="header.key"
                  placeholder="Header名称"
                  class="header-key"
                />
                <el-input
                  v-model="header.value"
                  placeholder="Header值"
                  class="header-value"
                />
                <el-button
                  type="danger"
                  size="small"
                  @click="removeHeader(index)"
                  :disabled="formData.customHeaders.length <= 1"
                >
                  删除
                </el-button>
              </div>
              <el-button
                type="primary"
                size="small"
                @click="addHeader"
              >
                添加Header
              </el-button>
            </div>
          </el-form-item>

          <el-form-item label="其他配置">
            <div class="checkbox-group">
              <el-checkbox v-model="formData.enableLogging">
                启用请求日志
              </el-checkbox>
              <el-checkbox v-model="formData.enableHealthCheck">
                启用健康检查
              </el-checkbox>
              <el-checkbox v-model="formData.skipSSLVerify">
                跳过SSL验证 (不推荐)
              </el-checkbox>
            </div>
          </el-form-item>
        </div>
      </el-form>
    </div>

    <template #footer>
      <div class="modal-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button
          type="primary"
          :loading="testingConnection"
          @click="handleTestConnection"
        >
          测试连接
        </el-button>
        <el-button
          type="primary"
          :loading="saving"
          @click="handleConfirm"
        >
          {{ isEdit ? '保存' : '添加' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  service: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:visible', 'confirm'])

// 响应式数据
const visible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const isEdit = computed(() => !!props.service)
const saving = ref(false)
const testingConnection = ref(false)
const formRef = ref(null)
const protocol = ref('https://')

// 服务类型分组
const serviceTypeGroups = ref([
  {
    label: '代码管理',
    options: [
      { value: 'github', label: 'GitHub', icon: 'el-icon-github', description: '代码托管和CI/CD' },
      { value: 'gitlab', label: 'GitLab', icon: 'el-icon-gitlab', description: '代码托管平台' },
      { value: 'bitbucket', label: 'Bitbucket', icon: 'el-icon-bitbucket', description: 'Atlassian代码托管' }
    ]
  },
  {
    label: '项目管理',
    options: [
      { value: 'jira', label: 'Jira', icon: 'el-icon-jira', description: '问题跟踪和项目管理' },
      { value: 'trello', label: 'Trello', icon: 'el-icon-trello', description: '敏捷项目管理' },
      { value: 'asana', label: 'Asana', icon: 'el-icon-asana', description: '团队协作工具' }
    ]
  },
  {
    label: 'CI/CD',
    options: [
      { value: 'jenkins', label: 'Jenkins', icon: 'el-icon-jenkins', description: '自动化构建工具' },
      { value: 'gitlab-ci', label: 'GitLab CI', icon: 'el-icon-gitlab', description: 'GitLab持续集成' },
      { value: 'github-actions', label: 'GitHub Actions', icon: 'el-icon-github', description: 'GitHub自动化工作流' }
    ]
  },
  {
    label: '通信工具',
    options: [
      { value: 'slack', label: 'Slack', icon: 'el-icon-slack', description: '团队通信平台' },
      { value: 'teams', label: 'Teams', icon: 'el-icon-teams', description: 'Microsoft Teams' },
      { value: 'webhook', label: 'Webhook', icon: 'el-icon-webhook', description: 'HTTP回调通知' }
    ]
  },
  {
    label: '其他',
    options: [
      { value: 'api', label: '通用API', icon: 'el-icon-api', description: 'RESTful API集成' },
      { value: 'database', label: '数据库', icon: 'el-icon-database', description: '数据库连接' },
      { value: 'custom', label: '自定义', icon: 'el-icon-setting', description: '自定义集成' }
    ]
  }
])

// 表单数据
const formData = ref({
  name: '',
  type: '',
  baseUrl: '',
  description: '',
  authType: 'none',
  authConfig: {
    username: '',
    password: '',
    token: '',
    tokenLocation: 'header',
    clientId: '',
    clientSecret: '',
    tokenUrl: '',
    scope: ''
  },
  timeout: 30,
  retryCount: 3,
  customHeaders: [{ key: '', value: '' }],
  enableLogging: true,
  enableHealthCheck: true,
  skipSSLVerify: false
})

// 表单验证规则
const formRules = ref({
  name: [
    { required: true, message: '请输入服务名称', trigger: 'blur' },
    { min: 2, max: 50, message: '服务名称长度应在2-50字符之间', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择服务类型', trigger: 'change' }
  ],
  baseUrl: [
    { required: true, message: '请输入服务地址', trigger: 'blur' },
    {
      pattern: /^https?:\/\/.+/,
      message: '服务地址必须以http://或https://开头',
      trigger: 'blur'
    }
  ],
  description: [
    { max: 200, message: '描述不能超过200字符', trigger: 'blur' }
  ],
  'authConfig.username': [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  'authConfig.password': [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ],
  'authConfig.token': [
    { required: true, message: '请输入API Token', trigger: 'blur' }
  ],
  'authConfig.clientId': [
    { required: true, message: '请输入Client ID', trigger: 'blur' }
  ],
  'authConfig.clientSecret': [
    { required: true, message: '请输入Client Secret', trigger: 'blur' }
  ],
  'authConfig.tokenUrl': [
    { required: true, message: '请输入Token URL', trigger: 'blur' },
    {
      pattern: /^https?:\/\/.+/,
      message: 'Token URL必须以http://或https://开头',
      trigger: 'blur'
    }
  ]
})

// 初始化表单数据
const initializeForm = () => {
  if (props.service) {
    // 编辑模式
    formData.value = {
      ...props.service,
      authConfig: {
        username: props.service.authConfig?.username || '',
        password: props.service.authConfig?.password || '',
        token: props.service.authConfig?.token || '',
        tokenLocation: props.service.authConfig?.tokenLocation || 'header',
        clientId: props.service.authConfig?.clientId || '',
        clientSecret: props.service.authConfig?.clientSecret || '',
        tokenUrl: props.service.authConfig?.tokenUrl || '',
        scope: props.service.authConfig?.scope || ''
      },
      customHeaders: props.service.customHeaders?.length
        ? props.service.customHeaders
        : [{ key: '', value: '' }]
    }

    // 解析协议
    if (props.service.baseUrl) {
      const urlMatch = props.service.baseUrl.match(/^https?:\/\//)
      if (urlMatch) {
        protocol.value = urlMatch[0]
        formData.value.baseUrl = props.service.baseUrl.replace(/^https?:\/\//, '')
      }
    }
  } else {
    // 添加模式
    formData.value = {
      name: '',
      type: '',
      baseUrl: '',
      description: '',
      authType: 'none',
      authConfig: {
        username: '',
        password: '',
        token: '',
        tokenLocation: 'header',
        clientId: '',
        clientSecret: '',
        tokenUrl: '',
        scope: ''
      },
      timeout: 30,
      retryCount: 3,
      customHeaders: [{ key: '', value: '' }],
      enableLogging: true,
      enableHealthCheck: true,
      skipSSLVerify: false
    }
    protocol.value = 'https://'
  }
}

// 处理服务类型变化
const handleTypeChange = (type) => {
  // 可以根据类型预设一些配置
  console.log('Service type changed:', type)
}

// 处理认证类型变化
const handleAuthTypeChange = (authType) => {
  // 重置认证配置
  formData.value.authConfig = {
    username: '',
    password: '',
    token: '',
    tokenLocation: 'header',
    clientId: '',
    clientSecret: '',
    tokenUrl: '',
    scope: ''
  }
}

// 更新基础URL
const updateBaseUrl = () => {
  // URL会在计算属性中自动更新
}

// 添加自定义Header
const addHeader = () => {
  formData.value.customHeaders.push({ key: '', value: '' })
}

// 删除自定义Header
const removeHeader = (index) => {
  if (formData.value.customHeaders.length > 1) {
    formData.value.customHeaders.splice(index, 1)
  }
}

// 测试连接
const handleTestConnection = async () => {
  try {
    await formRef.value?.validate()

    testingConnection.value = true

    // 构建完整的配置数据
    const configData = {
      ...formData.value,
      baseUrl: protocol.value + formData.value.baseUrl.replace(/^https?:\/\//, ''),
      authConfig: formData.value.authConfig
    }

    // 这里应该调用实际的测试API
    // 暂时模拟测试
    await new Promise(resolve => setTimeout(resolve, 2000))

    ElMessage.success('连接测试成功')
  } catch (error) {
    if (error !== 'validation') {
      console.error('连接测试失败:', error)
      ElMessage.error('连接测试失败，请检查配置信息')
    }
  } finally {
    testingConnection.value = false
  }
}

// 确认保存
const handleConfirm = async () => {
  try {
    await formRef.value?.validate()

    saving.value = true

    // 构建完整的配置数据
    const configData = {
      ...formData.value,
      baseUrl: protocol.value + formData.value.baseUrl.replace(/^https?:\/\//, ''),
      authConfig: formData.value.authConfig,
      customHeaders: formData.value.customHeaders.filter(h => h.key.trim() || h.value.trim())
    }

    emit('confirm', configData)
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    saving.value = false
  }
}

// 关闭模态框
const handleClose = () => {
  visible.value = false
  formRef.value?.resetFields()
}

// 监听visible变化，初始化表单
watch(() => props.visible, (newVal) => {
  if (newVal) {
    initializeForm()
  }
})

// 监听service变化，重新初始化表单
watch(() => props.service, () => {
  if (props.visible) {
    initializeForm()
  }
}, { deep: true })
</script>

<style scoped>
.modal-content {
  max-height: 600px;
  overflow-y: auto;
}

.form-section {
  margin-bottom: 24px;
  padding: 16px;
  background: #fafafa;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
}

.form-section h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  padding-bottom: 8px;
  border-bottom: 2px solid #409eff;
}

.auth-config {
  margin-top: 16px;
  padding: 16px;
  background: white;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

.headers-config {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.header-item {
  display: flex;
  gap: 8px;
  align-items: center;
}

.header-key,
.header-value {
  flex: 1;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.modal-footer {
  text-align: right;
}

.option-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.option-icon {
  font-size: 16px;
  color: #409eff;
}

.option-desc {
  font-size: 12px;
  color: #909399;
  margin-left: auto;
}

:deep(.el-select-dropdown .el-select-group__title) {
  font-weight: 500;
  color: #303133;
}

:deep(.el-select-dropdown .el-select-group__wrap:not(:last-of-type)::after) {
  height: 1px;
  background: #e4e7ed;
}
</style>
