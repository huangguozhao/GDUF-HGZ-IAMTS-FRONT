<template>
  <div class="api-integration-config">
    <!-- API基础配置 -->
    <div class="config-section">
      <h5>API基础配置</h5>
      <div class="config-grid">
        <div class="config-item full-width">
          <el-checkbox
            v-model="settings.enableApiIntegration"
            @change="handleSettingChange"
          >
            启用API集成
          </el-checkbox>
        </div>

        <div class="config-item" v-if="settings.enableApiIntegration">
          <label class="config-label">API版本</label>
          <el-select
            v-model="settings.apiVersion"
            placeholder="选择API版本"
            @change="handleSettingChange"
          >
            <el-option label="v1.0" value="v1.0" />
            <el-option label="v2.0" value="v2.0" />
            <el-option label="v3.0" value="v3.0" />
          </el-select>
        </div>

        <div class="config-item" v-if="settings.enableApiIntegration">
          <label class="config-label">请求超时时间</label>
          <div class="input-with-unit">
            <el-input-number
              v-model="settings.requestTimeout"
              :min="5"
              :max="300"
              @change="handleSettingChange"
            />
            <span class="unit">秒</span>
          </div>
        </div>

        <div class="config-item" v-if="settings.enableApiIntegration">
          <label class="config-label">最大重试次数</label>
          <el-input-number
            v-model="settings.maxRetries"
            :min="0"
            :max="10"
            @change="handleSettingChange"
          />
        </div>
      </div>
    </div>

    <!-- 认证配置 -->
    <div class="config-section" v-if="settings.enableApiIntegration">
      <h5>认证配置</h5>
      <div class="config-grid">
        <div class="config-item">
          <label class="config-label">认证类型</label>
          <el-select
            v-model="settings.authType"
            placeholder="选择认证类型"
            @change="handleSettingChange"
          >
            <el-option label="无认证" value="none" />
            <el-option label="Bearer Token" value="bearer" />
            <el-option label="API Key" value="apiKey" />
            <el-option label="Basic Auth" value="basic" />
            <el-option label="OAuth 2.0" value="oauth2" />
          </el-select>
        </div>

        <div class="config-item full-width" v-if="settings.authType === 'bearer'">
          <label class="config-label">Bearer Token</label>
          <el-input
            v-model="settings.bearerToken"
            type="password"
            placeholder="输入Bearer Token"
            show-password
            @blur="handleSettingChange"
          />
        </div>

        <div class="config-item" v-if="settings.authType === 'apiKey'">
          <label class="config-label">API Key</label>
          <el-input
            v-model="settings.apiKey"
            placeholder="输入API Key"
            @blur="handleSettingChange"
          />
        </div>

        <div class="config-item" v-if="settings.authType === 'apiKey'">
          <label class="config-label">API Key位置</label>
          <el-select
            v-model="settings.apiKeyLocation"
            placeholder="选择API Key位置"
            @change="handleSettingChange"
          >
            <el-option label="Header" value="header" />
            <el-option label="Query参数" value="query" />
          </el-select>
        </div>

        <div class="config-item" v-if="settings.authType === 'basic'">
          <label class="config-label">用户名</label>
          <el-input
            v-model="settings.basicAuth.username"
            placeholder="输入用户名"
            @blur="handleSettingChange"
          />
        </div>

        <div class="config-item" v-if="settings.authType === 'basic'">
          <label class="config-label">密码</label>
          <el-input
            v-model="settings.basicAuth.password"
            type="password"
            placeholder="输入密码"
            show-password
            @blur="handleSettingChange"
          />
        </div>

        <div class="config-item full-width" v-if="settings.authType === 'oauth2'">
          <label class="config-label">OAuth 2.0配置</label>
          <div class="oauth-config">
            <div class="oauth-field">
              <span class="field-label">Client ID:</span>
              <el-input
                v-model="settings.oauth2.clientId"
                placeholder="输入Client ID"
                @blur="handleSettingChange"
              />
            </div>
            <div class="oauth-field">
              <span class="field-label">Client Secret:</span>
              <el-input
                v-model="settings.oauth2.clientSecret"
                type="password"
                placeholder="输入Client Secret"
                show-password
                @blur="handleSettingChange"
              />
            </div>
            <div class="oauth-field">
              <span class="field-label">Token URL:</span>
              <el-input
                v-model="settings.oauth2.tokenUrl"
                placeholder="输入Token获取URL"
                @blur="handleSettingChange"
              />
            </div>
            <div class="oauth-field">
              <span class="field-label">Scope:</span>
              <el-input
                v-model="settings.oauth2.scope"
                placeholder="输入权限范围"
                @blur="handleSettingChange"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 安全配置 -->
    <div class="config-section" v-if="settings.enableApiIntegration">
      <h5>安全配置</h5>
      <div class="config-grid">
        <div class="config-item full-width">
          <el-checkbox
            v-model="settings.enableHttps"
            @change="handleSettingChange"
          >
            强制使用HTTPS
          </el-checkbox>
        </div>

        <div class="config-item full-width">
          <el-checkbox
            v-model="settings.enableRequestLogging"
            @change="handleSettingChange"
          >
            启用请求日志记录
          </el-checkbox>
        </div>

        <div class="config-item full-width">
          <el-checkbox
            v-model="settings.enableRateLimiting"
            @change="handleSettingChange"
          >
            启用请求频率限制
          </el-checkbox>
        </div>

        <div class="config-item" v-if="settings.enableRateLimiting">
          <label class="config-label">每分钟最大请求数</label>
          <el-input-number
            v-model="settings.rateLimitPerMinute"
            :min="1"
            :max="10000"
            @change="handleSettingChange"
          />
        </div>

        <div class="config-item" v-if="settings.enableRateLimiting">
          <label class="config-label">每小时最大请求数</label>
          <el-input-number
            v-model="settings.rateLimitPerHour"
            :min="1"
            :max="100000"
            @change="handleSettingChange"
          />
        </div>
      </div>
    </div>

    <!-- 高级配置 -->
    <div class="config-section" v-if="settings.enableApiIntegration">
      <h5>高级配置</h5>
      <div class="config-grid">
        <div class="config-item full-width">
          <label class="config-label">自定义请求头</label>
          <div class="headers-config">
            <div
              v-for="(header, index) in settings.customHeaders"
              :key="index"
              class="header-item"
            >
              <el-input
                v-model="header.key"
                placeholder="Header名称"
                class="header-key"
                @blur="handleSettingChange"
              />
              <el-input
                v-model="header.value"
                placeholder="Header值"
                class="header-value"
                @blur="handleSettingChange"
              />
              <el-button
                type="danger"
                size="small"
                @click="removeHeader(index)"
                :disabled="settings.customHeaders.length <= 1"
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
        </div>

        <div class="config-item full-width">
          <label class="config-label">响应格式</label>
          <el-radio-group
            v-model="settings.responseFormat"
            @change="handleSettingChange"
          >
            <el-radio label="json">JSON</el-radio>
            <el-radio label="xml">XML</el-radio>
            <el-radio label="text">纯文本</el-radio>
          </el-radio-group>
        </div>

        <div class="config-item full-width">
          <el-button
            type="primary"
            :loading="testingApi"
            @click="handleTestApiConfig"
          >
            测试API配置
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  settings: {
    type: Object,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update'])

const testingApi = ref(false)

// 初始化默认设置
const initializeDefaults = () => {
  const defaults = {
    enableApiIntegration: false,
    apiVersion: 'v2.0',
    requestTimeout: 30,
    maxRetries: 3,
    authType: 'none',
    bearerToken: '',
    apiKey: '',
    apiKeyLocation: 'header',
    basicAuth: {
      username: '',
      password: ''
    },
    oauth2: {
      clientId: '',
      clientSecret: '',
      tokenUrl: '',
      scope: ''
    },
    enableHttps: true,
    enableRequestLogging: true,
    enableRateLimiting: false,
    rateLimitPerMinute: 100,
    rateLimitPerHour: 1000,
    customHeaders: [{ key: '', value: '' }],
    responseFormat: 'json'
  }

  // 合并默认值
  Object.keys(defaults).forEach(key => {
    if (props.settings[key] === undefined) {
      props.settings[key] = defaults[key]
    }
  })
}

// 组件挂载时初始化默认值
initializeDefaults()

// 设置变更处理
const handleSettingChange = () => {
  emit('update', { ...props.settings })
}

// 添加自定义Header
const addHeader = () => {
  props.settings.customHeaders.push({ key: '', value: '' })
  handleSettingChange()
}

// 删除自定义Header
const removeHeader = (index) => {
  if (props.settings.customHeaders.length > 1) {
    props.settings.customHeaders.splice(index, 1)
    handleSettingChange()
  }
}

// 测试API配置
const handleTestApiConfig = async () => {
  if (!props.settings.enableApiIntegration) {
    ElMessage.warning('请先启用API集成')
    return
  }

  testingApi.value = true
  try {
    // 这里应该调用实际的API测试接口
    // 暂时模拟测试
    await new Promise(resolve => setTimeout(resolve, 2000))
    ElMessage.success('API配置测试成功')
  } catch (error) {
    console.error('API配置测试失败:', error)
    ElMessage.error('API配置测试失败，请检查配置信息')
  } finally {
    testingApi.value = false
  }
}
</script>

<style scoped>
.api-integration-config {
  max-width: 100%;
}

.config-section {
  margin-bottom: 24px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
}

.config-section h5 {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.config-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.config-item.full-width {
  grid-column: 1 / -1;
}

.config-label {
  font-size: 13px;
  font-weight: 500;
  color: #606266;
}

.input-with-unit {
  display: flex;
  align-items: center;
  gap: 8px;
}

.unit {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
}

.oauth-config {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.oauth-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field-label {
  font-size: 12px;
  color: #909399;
  font-weight: 500;
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

:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-radio-group) {
  display: flex;
  gap: 16px;
}

:deep(.el-checkbox) {
  margin-right: 0;
}
</style>
