<template>
  <div class="notification-types-config">
    <!-- 通知类型开关 -->
    <div class="settings-section">
      <h4 class="section-subtitle">通知渠道</h4>
      <div class="settings-grid">
        <div class="setting-item">
          <div class="channel-item">
            <div class="channel-header">
              <div class="channel-info">
                <i class="channel-icon el-icon-message"></i>
                <div>
                  <div class="channel-name">系统通知</div>
                  <div class="channel-desc">系统内部消息通知</div>
                </div>
              </div>
              <el-switch
                v-model="settings.systemEnabled"
                @change="handleSettingChange('systemEnabled', $event)"
              />
            </div>
          </div>
        </div>

        <div class="setting-item">
          <div class="channel-item">
            <div class="channel-header">
              <div class="channel-info">
                <i class="channel-icon el-icon-message-solid"></i>
                <div>
                  <div class="channel-name">邮件通知</div>
                  <div class="channel-desc">通过邮件发送通知</div>
                </div>
              </div>
              <el-switch
                v-model="settings.emailEnabled"
                @change="handleSettingChange('emailEnabled', $event)"
              />
            </div>
            <div v-if="settings.emailEnabled" class="channel-config">
              <div class="config-section">
                <h5>SMTP服务器配置</h5>
                <div class="config-grid">
                  <div class="config-item">
                    <label class="config-label">服务器地址</label>
                    <el-input
                      v-model="settings.emailServer.host"
                      placeholder="smtp.example.com"
                      @blur="handleSettingChange('emailServer', settings.emailServer)"
                    />
                  </div>
                  <div class="config-item">
                    <label class="config-label">端口号</label>
                    <el-input-number
                      v-model="settings.emailServer.port"
                      :min="1"
                      :max="65535"
                      @change="handleSettingChange('emailServer', settings.emailServer)"
                    />
                  </div>
                  <div class="config-item">
                    <label class="config-label">用户名</label>
                    <el-input
                      v-model="settings.emailServer.username"
                      placeholder="your-email@example.com"
                      @blur="handleSettingChange('emailServer', settings.emailServer)"
                    />
                  </div>
                  <div class="config-item">
                    <label class="config-label">密码</label>
                    <el-input
                      v-model="settings.emailServer.password"
                      type="password"
                      placeholder="邮件服务器密码"
                      show-password
                      @blur="handleSettingChange('emailServer', settings.emailServer)"
                    />
                  </div>
                  <div class="config-item full-width">
                    <el-checkbox
                      v-model="settings.emailServer.ssl"
                      @change="handleSettingChange('emailServer', settings.emailServer)"
                    >
                      使用SSL/TLS加密
                    </el-checkbox>
                  </div>
                  <div class="config-item full-width">
                    <el-button
                      type="primary"
                      :loading="testingEmail"
                      @click="handleTestEmailConfig"
                    >
                      测试邮件配置
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="setting-item">
          <div class="channel-item">
            <div class="channel-header">
              <div class="channel-info">
                <i class="channel-icon el-icon-phone"></i>
                <div>
                  <div class="channel-name">短信通知</div>
                  <div class="channel-desc">通过短信发送通知</div>
                </div>
              </div>
              <el-switch
                v-model="settings.smsEnabled"
                @change="handleSettingChange('smsEnabled', $event)"
              />
            </div>
            <div v-if="settings.smsEnabled" class="channel-config">
              <div class="config-section">
                <h5>SMS服务配置</h5>
                <div class="config-grid">
                  <div class="config-item">
                    <label class="config-label">服务商</label>
                    <el-select
                      v-model="settings.smsProvider.provider"
                      placeholder="选择服务商"
                      @change="handleSettingChange('smsProvider', settings.smsProvider)"
                    >
                      <el-option label="阿里云" value="aliyun" />
                      <el-option label="腾讯云" value="tencent" />
                      <el-option label="华为云" value="huawei" />
                    </el-select>
                  </div>
                  <div class="config-item">
                    <label class="config-label">Access Key</label>
                    <el-input
                      v-model="settings.smsProvider.accessKey"
                      placeholder="Access Key ID"
                      @blur="handleSettingChange('smsProvider', settings.smsProvider)"
                    />
                  </div>
                  <div class="config-item">
                    <label class="config-label">Secret Key</label>
                    <el-input
                      v-model="settings.smsProvider.secretKey"
                      type="password"
                      placeholder="Access Key Secret"
                      show-password
                      @blur="handleSettingChange('smsProvider', settings.smsProvider)"
                    />
                  </div>
                  <div class="config-item">
                    <label class="config-label">短信签名</label>
                    <el-input
                      v-model="settings.smsProvider.signName"
                      placeholder="短信签名"
                      @blur="handleSettingChange('smsProvider', settings.smsProvider)"
                    />
                  </div>
                  <div class="config-item full-width">
                    <el-button
                      type="primary"
                      :loading="testingSms"
                      @click="handleTestSmsConfig"
                    >
                      测试短信配置
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 通知频率设置 -->
    <div class="settings-section">
      <h4 class="section-subtitle">通知频率</h4>
      <div class="settings-grid">
        <div class="setting-item">
          <label class="setting-label">重复通知间隔</label>
          <div class="frequency-input">
            <el-input-number
              v-model="settings.notificationInterval"
              :min="1"
              :max="1440"
              @change="handleSettingChange('notificationInterval', $event)"
            />
            <span class="unit">分钟</span>
          </div>
        </div>
        <div class="setting-item">
          <label class="setting-label">每日最大通知次数</label>
          <el-input-number
            v-model="settings.maxDailyNotifications"
            :min="1"
            :max="1000"
            @change="handleSettingChange('maxDailyNotifications', $event)"
          />
        </div>
        <div class="setting-item">
          <label class="setting-label">静默时间段</label>
          <div class="time-range">
            <el-time-picker
              v-model="settings.quietStartTime"
              format="HH:mm"
              placeholder="开始时间"
              @change="handleSettingChange('quietStartTime', $event)"
            />
            <span class="separator">至</span>
            <el-time-picker
              v-model="settings.quietEndTime"
              format="HH:mm"
              placeholder="结束时间"
              @change="handleSettingChange('quietEndTime', $event)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 高级设置 -->
    <div class="settings-section">
      <h4 class="section-subtitle">高级设置</h4>
      <div class="settings-grid">
        <div class="setting-item full-width">
          <div class="checkbox-group">
            <el-checkbox
              v-model="settings.enableNotificationQueue"
              @change="handleSettingChange('enableNotificationQueue', $event)"
            >
              启用通知队列 (避免高频通知阻塞)
            </el-checkbox>
            <el-checkbox
              v-model="settings.enableNotificationRetry"
              @change="handleSettingChange('enableNotificationRetry', $event)"
            >
              启用失败重试 (发送失败时自动重试)
            </el-checkbox>
            <el-checkbox
              v-model="settings.enableNotificationLog"
              @change="handleSettingChange('enableNotificationLog', $event)"
            >
              启用通知日志 (记录所有通知发送情况)
            </el-checkbox>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { testEmailConfig, testSmsConfig } from '@/api/settings'

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

const testingEmail = ref(false)
const testingSms = ref(false)

// 设置变更处理
const handleSettingChange = (key, value) => {
  const updatedSettings = { ...props.settings }

  if (typeof key === 'string') {
    updatedSettings[key] = value
  } else {
    // 如果key是对象路径，如 'emailServer'
    Object.assign(updatedSettings, key)
  }

  emit('update', updatedSettings)
}

// 测试邮件配置
const handleTestEmailConfig = async () => {
  if (!props.settings.emailServer.host || !props.settings.emailServer.username) {
    ElMessage.warning('请先配置邮件服务器信息')
    return
  }

  testingEmail.value = true
  try {
    await testEmailConfig(props.settings.emailServer)
    ElMessage.success('邮件配置测试成功')
  } catch (error) {
    console.error('邮件配置测试失败:', error)
    ElMessage.error('邮件配置测试失败，请检查配置信息')
  } finally {
    testingEmail.value = false
  }
}

// 测试短信配置
const handleTestSmsConfig = async () => {
  if (!props.settings.smsProvider.accessKey || !props.settings.smsProvider.secretKey) {
    ElMessage.warning('请先配置SMS服务信息')
    return
  }

  testingSms.value = true
  try {
    await testSmsConfig(props.settings.smsProvider)
    ElMessage.success('短信配置测试成功')
  } catch (error) {
    console.error('短信配置测试失败:', error)
    ElMessage.error('短信配置测试失败，请检查配置信息')
  } finally {
    testingSms.value = false
  }
}

// 初始化默认值
const initializeDefaults = () => {
  const defaults = {
    systemEnabled: true,
    emailEnabled: true,
    smsEnabled: false,
    emailServer: {
      host: '',
      port: 587,
      username: '',
      password: '',
      ssl: true
    },
    smsProvider: {
      provider: 'aliyun',
      accessKey: '',
      secretKey: '',
      signName: ''
    },
    notificationInterval: 5,
    maxDailyNotifications: 100,
    quietStartTime: '22:00',
    quietEndTime: '08:00',
    enableNotificationQueue: true,
    enableNotificationRetry: true,
    enableNotificationLog: true
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
</script>

<style scoped>
.notification-types-config {
  max-width: 100%;
}

.settings-section {
  margin-bottom: 32px;
}

.section-subtitle {
  margin: 0 0 20px 0;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  padding-bottom: 8px;
  border-bottom: 2px solid #409eff;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.setting-item.full-width {
  grid-column: 1 / -1;
}

.setting-label {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
}

.channel-item {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
}

.channel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #fafafa;
  border-bottom: 1px solid #e4e7ed;
}

.channel-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.channel-icon {
  font-size: 24px;
  color: #409eff;
}

.channel-name {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.channel-desc {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.channel-config {
  padding: 20px;
}

.config-section h5 {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 500;
  color: #606266;
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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

.frequency-input {
  display: flex;
  align-items: center;
  gap: 8px;
}

.unit {
  font-size: 14px;
  color: #606266;
}

.time-range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.separator {
  font-size: 14px;
  color: #606266;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

:deep(.el-input-number) {
  width: 100%;
}

:deep(.el-time-picker) {
  flex: 1;
}
</style>
