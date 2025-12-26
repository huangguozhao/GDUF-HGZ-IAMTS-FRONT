<template>
  <div class="email-service-config">
    <div class="config-header">
      <h3 class="config-title">邮件服务配置</h3>
      <div class="header-actions">
        <el-button type="primary" :icon="Message" @click="testEmailConfig">
          测试配置
        </el-button>
        <el-button :icon="Refresh" @click="refreshConfig">
          刷新配置
        </el-button>
      </div>
    </div>

    <div class="config-content">
      <!-- SMTP配置 -->
      <div class="config-section">
        <h4 class="section-title">SMTP服务器配置</h4>
        <div class="smtp-config">
          <div class="config-grid">
            <div class="config-item">
              <label class="config-label">SMTP服务器</label>
              <el-input
                v-model="emailConfig.smtpHost"
                placeholder="smtp.example.com"
              />
            </div>
            <div class="config-item">
              <label class="config-label">端口</label>
              <el-input-number
                v-model="emailConfig.smtpPort"
                :min="1"
                :max="65535"
                :precision="0"
                controls-position="right"
              />
            </div>
            <div class="config-item">
              <label class="config-label">安全连接</label>
              <el-select v-model="emailConfig.security" style="width: 100%">
                <el-option label="无" value="none" />
                <el-option label="SSL" value="ssl" />
                <el-option label="TLS" value="tls" />
                <el-option label="STARTTLS" value="starttls" />
              </el-select>
            </div>
            <div class="config-item">
              <label class="config-label">发件人邮箱</label>
              <el-input
                v-model="emailConfig.senderEmail"
                placeholder="noreply@example.com"
              />
            </div>
            <div class="config-item">
              <label class="config-label">发件人姓名</label>
              <el-input
                v-model="emailConfig.senderName"
                placeholder="系统管理员"
              />
            </div>
            <div class="config-item">
              <label class="config-label">认证方式</label>
              <el-select v-model="emailConfig.authType" style="width: 100%">
                <el-option label="密码认证" value="password" />
                <el-option label="OAuth2" value="oauth2" />
                <el-option label="客户端证书" value="certificate" />
              </el-select>
            </div>
            <div class="config-item">
              <label class="config-label">用户名</label>
              <el-input
                v-model="emailConfig.username"
                placeholder="发件人邮箱或用户名"
              />
            </div>
            <div class="config-item">
              <label class="config-label">密码</label>
              <el-input
                v-model="emailConfig.password"
                type="password"
                placeholder="邮箱密码或授权码"
                show-password
              />
            </div>
          </div>

          <!-- 高级配置 -->
          <div class="advanced-section">
            <el-collapse>
              <el-collapse-item title="高级配置" name="advanced">
                <div class="advanced-grid">
                  <div class="config-item">
                    <label class="config-label">连接超时时间</label>
                    <div class="input-with-unit">
                      <el-input-number
                        v-model="emailConfig.connectionTimeout"
                        :min="5"
                        :max="300"
                        :precision="0"
                        controls-position="right"
                      />
                      <span class="unit">秒</span>
                    </div>
                  </div>
                  <div class="config-item">
                    <label class="config-label">读取超时时间</label>
                    <div class="input-with-unit">
                      <el-input-number
                        v-model="emailConfig.readTimeout"
                        :min="5"
                        :max="300"
                        :precision="0"
                        controls-position="right"
                      />
                      <span class="unit">秒</span>
                    </div>
                  </div>
                  <div class="config-item">
                    <label class="config-label">发送频率限制</label>
                    <div class="input-with-unit">
                      <el-input-number
                        v-model="emailConfig.rateLimit"
                        :min="1"
                        :max="1000"
                        :precision="0"
                        controls-position="right"
                      />
                      <span class="unit">封/分钟</span>
                    </div>
                  </div>
                  <div class="config-item">
                    <label class="config-label">重试次数</label>
                    <el-input-number
                      v-model="emailConfig.retryCount"
                      :min="0"
                      :max="5"
                      :precision="0"
                      controls-position="right"
                    />
                  </div>
                  <div class="config-item">
                    <label class="config-label">启用调试模式</label>
                    <el-switch v-model="emailConfig.debugMode" />
                  </div>
                  <div class="config-item">
                    <label class="config-label">启用邮件队列</label>
                    <el-switch v-model="emailConfig.enableQueue" />
                  </div>
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>
        </div>
      </div>

      <!-- 邮件模板配置 -->
      <div class="config-section">
        <h4 class="section-title">邮件模板配置</h4>
        <div class="template-tabs">
          <el-tabs v-model="activeTemplate" @tab-click="handleTemplateChange">
            <el-tab-pane
              v-for="template in emailTemplates"
              :key="template.key"
              :label="template.name"
              :name="template.key"
            >
              <div class="template-config">
                <div class="template-form">
                  <div class="form-item">
                    <label class="form-label">邮件标题</label>
                    <el-input
                      v-model="template.subject"
                      :placeholder="`请输入${template.name}邮件标题`"
                    />
                  </div>
                  <div class="form-item">
                    <label class="form-label">邮件内容</label>
                    <el-input
                      v-model="template.content"
                      type="textarea"
                      :rows="8"
                      :placeholder="`请输入${template.name}邮件内容，支持HTML`"
                    />
                  </div>
                  <div class="form-item">
                    <label class="form-label">可用变量</label>
                    <div class="variables-list">
                      <el-tag
                        v-for="variable in template.variables"
                        :key="variable"
                        size="small"
                        type="info"
                      >
                        {{ variable }}
                      </el-tag>
                    </div>
                  </div>
                  <div class="form-actions">
                    <el-button type="primary" size="small" @click="previewTemplate(template)">
                      预览
                    </el-button>
                    <el-button size="small" @click="resetTemplate(template)">
                      重置
                    </el-button>
                  </div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>

      <!-- 发送统计 -->
      <div class="config-section">
        <h4 class="section-title">发送统计</h4>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">
              <el-icon size="24" color="#409EFF"><Message /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">今日发送</div>
              <div class="stat-value">{{ emailStats.todaySent }}</div>
              <div class="stat-unit">封</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <el-icon size="24" color="#67C23A"><Check /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">成功率</div>
              <div class="stat-value">{{ emailStats.successRate }}</div>
              <div class="stat-unit">%</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <el-icon size="24" color="#E6A23C"><Clock /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">平均发送时间</div>
              <div class="stat-value">{{ emailStats.avgSendTime }}</div>
              <div class="stat-unit">秒</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <el-icon size="24" color="#F56C6C"><Close /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">失败次数</div>
              <div class="stat-value">{{ emailStats.failedCount }}</div>
              <div class="stat-unit">次</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 发送记录 -->
      <div class="config-section">
        <h4 class="section-title">最近发送记录</h4>
        <div class="send-records">
          <el-table :data="sendRecords" style="width: 100%" size="small">
            <el-table-column prop="recipient" label="收件人" width="200" />
            <el-table-column prop="subject" label="邮件标题" min-width="200" />
            <el-table-column prop="sendTime" label="发送时间" width="160" />
            <el-table-column label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)">
                  {{ getStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120">
              <template #default="scope">
                <el-button
                  link
                  type="primary"
                  size="small"
                  @click="viewRecordDetail(scope.row)"
                >
                  详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>

    <!-- 保存按钮 -->
    <div class="action-buttons">
      <el-button type="primary" :icon="Document" @click="saveConfig">
        保存配置
      </el-button>
      <el-button :icon="Refresh" @click="resetConfig">
        重置配置
      </el-button>
    </div>

    <!-- 测试邮件对话框 -->
    <el-dialog
      v-model="testDialogVisible"
      title="发送测试邮件"
      width="500px"
      :close-on-click-modal="false"
    >
      <div class="test-email-form">
        <el-form :model="testEmailForm" :rules="testEmailRules" ref="testEmailFormRef" label-width="100px">
          <el-form-item label="收件人" prop="recipient">
            <el-input
              v-model="testEmailForm.recipient"
              placeholder="请输入测试收件人邮箱"
            />
          </el-form-item>
          <el-form-item label="邮件标题" prop="subject">
            <el-input
              v-model="testEmailForm.subject"
              placeholder="测试邮件标题"
            />
          </el-form-item>
          <el-form-item label="邮件内容" prop="content">
            <el-input
              v-model="testEmailForm.content"
              type="textarea"
              :rows="4"
              placeholder="测试邮件内容"
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="testDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="sendingTest" @click="sendTestEmail">
            发送测试邮件
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 邮件预览对话框 -->
    <el-dialog
      v-model="previewDialogVisible"
      title="邮件预览"
      width="700px"
      :close-on-click-modal="false"
    >
      <div class="email-preview">
        <div class="preview-header">
          <div class="preview-field">
            <strong>收件人：</strong>{{ previewData.recipient }}
          </div>
          <div class="preview-field">
            <strong>标题：</strong>{{ previewData.subject }}
          </div>
        </div>
        <div class="preview-content" v-html="previewData.content"></div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import {
  Message,
  Refresh,
  Check,
  Close,
  Clock,
  Document
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { testEmailConfig as testEmailApi } from '@/api/settings'

// 响应式数据
const activeTemplate = ref('welcome')
const testDialogVisible = ref(false)
const previewDialogVisible = ref(false)
const sendingTest = ref(false)

const emailConfig = reactive({
  smtpHost: 'smtp.example.com',
  smtpPort: 587,
  security: 'tls',
  senderEmail: 'noreply@example.com',
  senderName: '系统管理员',
  authType: 'password',
  username: '',
  password: '',
  connectionTimeout: 30,
  readTimeout: 60,
  rateLimit: 60,
  retryCount: 3,
  debugMode: false,
  enableQueue: true
})

const emailTemplates = ref([
  {
    key: 'welcome',
    name: '欢迎邮件',
    subject: '欢迎使用接口自动化测试管理系统',
    content: '亲爱的{username}，\n\n欢迎您加入我们的团队！\n\n系统地址：{systemUrl}\n\n如有任何问题，请随时联系管理员。\n\n此致\n系统管理员',
    variables: ['{username}', '{systemUrl}', '{loginUrl}']
  },
  {
    key: 'password_reset',
    name: '密码重置',
    subject: '密码重置通知',
    content: '亲爱的{username}，\n\n您请求重置密码，请点击以下链接完成重置：\n\n{resetUrl}\n\n此链接将在24小时后过期。\n\n如果您没有请求重置密码，请忽略此邮件。\n\n此致\n系统管理员',
    variables: ['{username}', '{resetUrl}', '{expiryTime}']
  },
  {
    key: 'test_result',
    name: '测试结果通知',
    subject: '测试执行结果通知 - {projectName}',
    content: '亲爱的{username}，\n\n您的测试任务已执行完成。\n\n项目名称：{projectName}\n测试用例：{testCaseCount}\n执行时间：{executionTime}\n成功率：{successRate}%\n\n查看详情：{resultUrl}\n\n此致\n系统管理员',
    variables: ['{username}', '{projectName}', '{testCaseCount}', '{executionTime}', '{successRate}', '{resultUrl}']
  },
  {
    key: 'system_alert',
    name: '系统告警',
    subject: '系统告警通知 - {alertType}',
    content: '系统管理员，\n\n系统检测到异常情况：\n\n告警类型：{alertType}\n告警级别：{alertLevel}\n告警时间：{alertTime}\n告警详情：{alertMessage}\n\n请及时处理。\n\n此致\n系统监控',
    variables: ['{alertType}', '{alertLevel}', '{alertTime}', '{alertMessage}', '{systemStatus}']
  }
])

const emailStats = reactive({
  todaySent: 245,
  successRate: 98.5,
  avgSendTime: 2.3,
  failedCount: 3
})

const sendRecords = ref([
  {
    id: 1,
    recipient: 'user@example.com',
    subject: '欢迎使用系统',
    sendTime: '2024-01-15 10:30:00',
    status: 'success'
  },
  {
    id: 2,
    recipient: 'admin@example.com',
    subject: '密码重置通知',
    sendTime: '2024-01-15 09:15:00',
    status: 'success'
  },
  {
    id: 3,
    recipient: 'test@example.com',
    subject: '测试结果通知',
    sendTime: '2024-01-15 08:45:00',
    status: 'failed'
  }
])

const testEmailForm = reactive({
  recipient: '',
  subject: '测试邮件',
  content: '这是一封测试邮件，用于验证邮件配置是否正确。'
})

const testEmailRules = {
  recipient: [
    { required: true, message: '请输入收件人邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  subject: [
    { required: true, message: '请输入邮件标题', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入邮件内容', trigger: 'blur' }
  ]
}

const previewData = reactive({
  recipient: '',
  subject: '',
  content: ''
})

// 方法
const testEmailConfig = () => {
  testDialogVisible.value = true
}

const refreshConfig = () => {
  ElMessage.success('配置已刷新')
}

const handleTemplateChange = (tab) => {
  activeTemplate.value = tab.props.name
}

const previewTemplate = (template) => {
  previewData.recipient = 'preview@example.com'
  previewData.subject = template.subject
  previewData.content = template.content.replace(/\n/g, '<br>')
  previewDialogVisible.value = true
}

const resetTemplate = (template) => {
  const defaultTemplate = emailTemplates.value.find(t => t.key === template.key)
  if (defaultTemplate) {
    template.subject = defaultTemplate.subject
    template.content = defaultTemplate.content
  }
  ElMessage.success('模板已重置')
}

const getStatusType = (status) => {
  return status === 'success' ? 'success' : status === 'failed' ? 'danger' : 'warning'
}

const getStatusText = (status) => {
  const statusMap = {
    success: '成功',
    failed: '失败',
    pending: '发送中'
  }
  return statusMap[status] || status
}

const viewRecordDetail = (record) => {
  ElMessage.info('查看详情功能开发中')
}

const saveConfig = () => {
  ElMessage.success('邮件配置保存成功')
}

const resetConfig = () => {
  ElMessageBox.confirm('确定要重置所有配置吗？', '重置确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('配置已重置')
  })
}

const sendTestEmail = async () => {
  try {
    sendingTest.value = true
    await testEmailApi(testEmailForm)
    ElMessage.success('测试邮件发送成功')
    testDialogVisible.value = false
  } catch (error) {
    console.error('发送测试邮件失败:', error)
    ElMessage.error('测试邮件发送失败，请检查配置')
  } finally {
    sendingTest.value = false
  }
}

// 初始化
onMounted(() => {
  // 加载配置数据
})
</script>

<style scoped>
.email-service-config {
  padding: 20px;
}

.config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.config-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.config-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.config-section {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.section-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  padding-bottom: 8px;
  border-bottom: 2px solid #409eff;
}

.smtp-config {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.config-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.config-label {
  font-size: 14px;
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
  color: #909399;
  white-space: nowrap;
}

.advanced-section {
  margin-top: 20px;
}

.advanced-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.template-tabs {
  margin-top: 16px;
}

.template-config {
  padding: 16px 0;
}

.template-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
}

.variables-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.form-actions {
  display: flex;
  gap: 12px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.stat-info {
  flex: 1;
}

.stat-title {
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 2px;
}

.stat-unit {
  font-size: 12px;
  color: #909399;
}

.send-records {
  margin-top: 16px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  margin-top: 24px;
}

.test-email-form {
  padding: 20px 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.email-preview {
  padding: 20px 0;
}

.preview-header {
  margin-bottom: 20px;
}

.preview-field {
  margin-bottom: 12px;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 4px;
}

.preview-content {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 4px;
  min-height: 200px;
  line-height: 1.6;
}
</style>
