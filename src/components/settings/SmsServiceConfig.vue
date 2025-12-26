<template>
  <div class="sms-service-config">
    <div class="config-header">
      <h3 class="config-title">短信服务配置</h3>
      <div class="header-actions">
        <el-button type="primary" :icon="Message" @click="testSmsConfig">
          测试配置
        </el-button>
        <el-button :icon="Refresh" @click="refreshConfig">
          刷新配置
        </el-button>
      </div>
    </div>

    <div class="config-content">
      <!-- 服务商配置 -->
      <div class="config-section">
        <h4 class="section-title">短信服务商配置</h4>
        <div class="provider-config">
          <div class="config-grid">
            <div class="config-item">
              <label class="config-label">服务商</label>
              <el-select v-model="smsConfig.provider" style="width: 100%" @change="handleProviderChange">
                <el-option label="阿里云" value="aliyun" />
                <el-option label="腾讯云" value="tencent" />
                <el-option label="华为云" value="huawei" />
                <el-option label="百度云" value="baidu" />
                <el-option label="京东云" value="jd" />
                <el-option label="七牛云" value="qiniu" />
                <el-option label="容联云" value="yuntongxun" />
                <el-option label="创蓝253" value="chuanglan" />
                <el-option label="梦网云" value="monternet" />
              </el-select>
            </div>
            <div class="config-item">
              <label class="config-label">Access Key ID</label>
              <el-input
                v-model="smsConfig.accessKeyId"
                placeholder="请输入Access Key ID"
              />
            </div>
            <div class="config-item">
              <label class="config-label">Access Key Secret</label>
              <el-input
                v-model="smsConfig.accessKeySecret"
                type="password"
                placeholder="请输入Access Key Secret"
                show-password
              />
            </div>
            <div class="config-item">
              <label class="config-label">短信签名</label>
              <el-input
                v-model="smsConfig.signName"
                placeholder="请输入短信签名"
              />
            </div>
            <div class="config-item">
              <label class="config-label">模板ID</label>
              <el-input
                v-model="smsConfig.templateId"
                placeholder="请输入短信模板ID"
              />
            </div>
            <div class="config-item">
              <label class="config-label">地域</label>
              <el-input
                v-model="smsConfig.region"
                placeholder="cn-hangzhou"
              />
            </div>
          </div>

          <!-- 服务商特定配置 -->
          <div class="provider-specific" v-if="smsConfig.provider">
            <div class="specific-config">
              <h5>{{ getProviderName(smsConfig.provider) }} 特定配置</h5>
              <div class="specific-grid">
                <div v-if="smsConfig.provider === 'aliyun'" class="config-item">
                  <label class="config-label">短信服务域名</label>
                  <el-input
                    v-model="smsConfig.endpoint"
                    placeholder="dysmsapi.aliyuncs.com"
                  />
                </div>
                <div v-if="smsConfig.provider === 'tencent'" class="config-item">
                  <label class="config-label">SDK App ID</label>
                  <el-input
                    v-model="smsConfig.sdkAppId"
                    placeholder="请输入SDK App ID"
                  />
                </div>
                <div v-if="smsConfig.provider === 'huawei'" class="config-item">
                  <label class="config-label">App Key</label>
                  <el-input
                    v-model="smsConfig.appKey"
                    placeholder="请输入App Key"
                  />
                </div>
                <div v-if="smsConfig.provider === 'yuntongxun'" class="config-item">
                  <label class="config-label">Account SID</label>
                  <el-input
                    v-model="smsConfig.accountSid"
                    placeholder="请输入Account SID"
                  />
                </div>
                <div v-if="smsConfig.provider === 'chuanglan'" class="config-item">
                  <label class="config-label">企业ID</label>
                  <el-input
                    v-model="smsConfig.enterpriseId"
                    placeholder="请输入企业ID"
                  />
                </div>
              </div>
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
                        v-model="smsConfig.connectionTimeout"
                        :min="5"
                        :max="60"
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
                        v-model="smsConfig.rateLimit"
                        :min="1"
                        :max="500"
                        :precision="0"
                        controls-position="right"
                      />
                      <span class="unit">条/分钟</span>
                    </div>
                  </div>
                  <div class="config-item">
                    <label class="config-label">重试次数</label>
                    <el-input-number
                      v-model="smsConfig.retryCount"
                      :min="0"
                      :max="3"
                      :precision="0"
                      controls-position="right"
                    />
                  </div>
                  <div class="config-item">
                    <label class="config-label">启用调试模式</label>
                    <el-switch v-model="smsConfig.debugMode" />
                  </div>
                  <div class="config-item">
                    <label class="config-label">启用短信队列</label>
                    <el-switch v-model="smsConfig.enableQueue" />
                  </div>
                  <div class="config-item">
                    <label class="config-label">短信长度限制</label>
                    <div class="input-with-unit">
                      <el-input-number
                        v-model="smsConfig.maxLength"
                        :min="70"
                        :max="500"
                        :precision="0"
                        controls-position="right"
                      />
                      <span class="unit">字符</span>
                    </div>
                  </div>
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>
        </div>
      </div>

      <!-- 短信模板配置 -->
      <div class="config-section">
        <h4 class="section-title">短信模板配置</h4>
        <div class="template-tabs">
          <el-tabs v-model="activeTemplate" @tab-click="handleTemplateChange">
            <el-tab-pane
              v-for="template in smsTemplates"
              :key="template.key"
              :label="template.name"
              :name="template.key"
            >
              <div class="template-config">
                <div class="template-form">
                  <div class="form-item">
                    <label class="form-label">模板内容</label>
                    <el-input
                      v-model="template.content"
                      type="textarea"
                      :rows="4"
                      :placeholder="`请输入${template.name}短信内容`"
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
                  <div class="form-item">
                    <label class="form-label">字符统计</label>
                    <div class="char-count">
                      <span :class="{ 'over-limit': template.content.length > smsConfig.maxLength }">
                        {{ template.content.length }}/{{ smsConfig.maxLength }}
                      </span>
                      <span class="count-desc">字符 (短信按70字符拆分)</span>
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
              <div class="stat-value">{{ smsStats.todaySent }}</div>
              <div class="stat-unit">条</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <el-icon size="24" color="#67C23A"><Check /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">成功率</div>
              <div class="stat-value">{{ smsStats.successRate }}</div>
              <div class="stat-unit">%</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <el-icon size="24" color="#E6A23C"><Clock /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">平均发送时间</div>
              <div class="stat-value">{{ smsStats.avgSendTime }}</div>
              <div class="stat-unit">秒</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <el-icon size="24" color="#F56C6C"><Close /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-title">失败次数</div>
              <div class="stat-value">{{ smsStats.failedCount }}</div>
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
            <el-table-column prop="recipient" label="收件人" width="150" />
            <el-table-column prop="content" label="短信内容" min-width="200" />
            <el-table-column prop="sendTime" label="发送时间" width="160" />
            <el-table-column label="状态" width="100">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)">
                  {{ getStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="费用" width="80">
              <template #default="scope">
                <span class="fee-amount">¥{{ scope.row.fee }}</span>
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

      <!-- 费用统计 -->
      <div class="config-section">
        <h4 class="section-title">费用统计</h4>
        <div class="fee-stats">
          <div class="fee-overview">
            <div class="fee-item">
              <span class="fee-label">本月费用</span>
              <span class="fee-value">¥{{ feeStats.monthlyFee }}</span>
            </div>
            <div class="fee-item">
              <span class="fee-label">剩余额度</span>
              <span class="fee-value">¥{{ feeStats.remainingQuota }}</span>
            </div>
            <div class="fee-item">
              <span class="fee-label">单价</span>
              <span class="fee-value">¥{{ feeStats.unitPrice }}/条</span>
            </div>
          </div>
          <div class="fee-chart">
            <div class="chart-placeholder">
              <el-icon size="48" color="#c0c4cc"><PieChart /></el-icon>
              <p>费用趋势图</p>
              <small>图表功能开发中</small>
            </div>
          </div>
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

    <!-- 测试短信对话框 -->
    <el-dialog
      v-model="testDialogVisible"
      title="发送测试短信"
      width="500px"
      :close-on-click-modal="false"
    >
      <div class="test-sms-form">
        <el-form :model="testSmsForm" :rules="testSmsRules" ref="testSmsFormRef" label-width="80px">
          <el-form-item label="手机号" prop="phone">
            <el-input
              v-model="testSmsForm.phone"
              placeholder="请输入测试手机号"
            />
          </el-form-item>
          <el-form-item label="短信内容" prop="content">
            <el-input
              v-model="testSmsForm.content"
              type="textarea"
              :rows="3"
              placeholder="请输入测试短信内容"
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="testDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="sendingTest" @click="sendTestSms">
            发送测试短信
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 短信预览对话框 -->
    <el-dialog
      v-model="previewDialogVisible"
      title="短信预览"
      width="400px"
      :close-on-click-modal="false"
    >
      <div class="sms-preview">
        <div class="preview-content">
          <div class="phone-number">发送至: {{ previewData.phone }}</div>
          <div class="message-content">{{ previewData.content }}</div>
          <div class="message-info">
            <span>字符数: {{ previewData.content.length }}</span>
            <span>预计条数: {{ Math.ceil(previewData.content.length / 70) }}</span>
          </div>
        </div>
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
  Document,
  PieChart
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { testSmsConfig as testSmsApi } from '@/api/settings'

// 响应式数据
const activeTemplate = ref('verification')
const testDialogVisible = ref(false)
const previewDialogVisible = ref(false)
const sendingTest = ref(false)

const smsConfig = reactive({
  provider: 'aliyun',
  accessKeyId: '',
  accessKeySecret: '',
  signName: '',
  templateId: '',
  region: 'cn-hangzhou',
  endpoint: 'dysmsapi.aliyuncs.com',
  sdkAppId: '',
  appKey: '',
  accountSid: '',
  enterpriseId: '',
  connectionTimeout: 30,
  rateLimit: 200,
  retryCount: 2,
  debugMode: false,
  enableQueue: true,
  maxLength: 500
})

const smsTemplates = ref([
  {
    key: 'verification',
    name: '验证码',
    content: '您的验证码是：{code}，{expiry}分钟内有效。如非本人操作，请忽略此短信。',
    variables: ['{code}', '{expiry}']
  },
  {
    key: 'login_alert',
    name: '登录提醒',
    content: '您的账号于{time}在{location}登录系统，如非本人操作，请及时修改密码。',
    variables: ['{time}', '{location}', '{ip}']
  },
  {
    key: 'password_reset',
    name: '密码重置',
    content: '您正在重置密码，验证码：{code}，请在{expiry}分钟内完成操作。',
    variables: ['{code}', '{expiry}']
  },
  {
    key: 'system_alert',
    name: '系统告警',
    content: '系统告警：{message}，请及时处理。告警时间：{time}',
    variables: ['{message}', '{time}', '{level}']
  },
  {
    key: 'task_notification',
    name: '任务通知',
    content: '您的任务"{taskName}"已{status}。执行时间：{duration}，结果：{result}',
    variables: ['{taskName}', '{status}', '{duration}', '{result}']
  }
])

const smsStats = reactive({
  todaySent: 1250,
  successRate: 99.2,
  avgSendTime: 1.8,
  failedCount: 10
})

const sendRecords = ref([
  {
    id: 1,
    recipient: '138****1234',
    content: '您的验证码是：123456，5分钟内有效。',
    sendTime: '2024-01-15 10:30:00',
    status: 'success',
    fee: 0.045
  },
  {
    id: 2,
    recipient: '139****5678',
    content: '登录提醒：您的账号于10:25在北京登录',
    sendTime: '2024-01-15 09:15:00',
    status: 'success',
    fee: 0.045
  },
  {
    id: 3,
    recipient: '137****9012',
    content: '系统告警：服务器CPU使用率过高',
    sendTime: '2024-01-15 08:45:00',
    status: 'failed',
    fee: 0.000
  }
])

const feeStats = reactive({
  monthlyFee: 156.80,
  remainingQuota: 500.00,
  unitPrice: 0.045
})

const testSmsForm = reactive({
  phone: '',
  content: '这是一条测试短信，用于验证短信配置是否正确。'
})

const testSmsRules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入正确的手机号格式',
      trigger: 'blur'
    }
  ],
  content: [
    { required: true, message: '请输入短信内容', trigger: 'blur' },
    { max: 500, message: '短信内容不能超过500字符', trigger: 'blur' }
  ]
}

const previewData = reactive({
  phone: '',
  content: ''
})

// 方法
const testSmsConfig = () => {
  testDialogVisible.value = true
}

const refreshConfig = () => {
  ElMessage.success('配置已刷新')
}

const handleProviderChange = () => {
  // 清空特定配置
  smsConfig.endpoint = ''
  smsConfig.sdkAppId = ''
  smsConfig.appKey = ''
  smsConfig.accountSid = ''
  smsConfig.enterpriseId = ''
}

const getProviderName = (provider) => {
  const providerMap = {
    aliyun: '阿里云',
    tencent: '腾讯云',
    huawei: '华为云',
    baidu: '百度云',
    jd: '京东云',
    qiniu: '七牛云',
    yuntongxun: '容联云',
    chuanglan: '创蓝253',
    monternet: '梦网云'
  }
  return providerMap[provider] || provider
}

const handleTemplateChange = (tab) => {
  activeTemplate.value = tab.props.name
}

const previewTemplate = (template) => {
  previewData.phone = '138****1234'
  previewData.content = template.content
  previewDialogVisible.value = true
}

const resetTemplate = (template) => {
  const defaultTemplate = smsTemplates.value.find(t => t.key === template.key)
  if (defaultTemplate) {
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
  ElMessage.success('短信配置保存成功')
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

const sendTestSms = async () => {
  try {
    sendingTest.value = true
    await testSmsApi(testSmsForm)
    ElMessage.success('测试短信发送成功')
    testDialogVisible.value = false
  } catch (error) {
    console.error('发送测试短信失败:', error)
    ElMessage.error('测试短信发送失败，请检查配置')
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
.sms-service-config {
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

.provider-config {
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

.provider-specific {
  margin-top: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
}

.specific-config h5 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.specific-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
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

.char-count {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: #909399;
}

.over-limit {
  color: #f56c6c;
  font-weight: 500;
}

.count-desc {
  color: #c0c4cc;
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

.fee-amount {
  font-size: 12px;
  color: #f56c6c;
  font-weight: 500;
}

.fee-stats {
  display: flex;
  gap: 24px;
  align-items: center;
}

.fee-overview {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.fee-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.fee-item:last-child {
  border-bottom: none;
}

.fee-label {
  font-size: 14px;
  color: #606266;
}

.fee-value {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.fee-chart {
  flex: 1;
  min-height: 120px;
}

.chart-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 120px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 2px dashed #e9ecef;
  color: #c0c4cc;
  text-align: center;
}

.chart-placeholder p {
  margin: 8px 0 4px 0;
  font-size: 14px;
}

.chart-placeholder small {
  font-size: 12px;
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

.test-sms-form {
  padding: 20px 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.sms-preview {
  padding: 20px 0;
}

.preview-content {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.phone-number {
  font-size: 14px;
  color: #606266;
  margin-bottom: 12px;
}

.message-content {
  font-size: 14px;
  line-height: 1.6;
  color: #303133;
  margin-bottom: 12px;
  padding: 12px;
  background: #fff;
  border-radius: 4px;
  border: 1px solid #e9ecef;
}

.message-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
}
</style>
