<template>
  <div class="system-config-main">
    <!-- 系统配置说明 -->
    <el-alert
      title="关于系统配置"
      type="info"
      :closable="false"
      class="config-alert"
    >
      <template #default>
        系统配置用于管理整个系统的基础设置，包括系统信息、文件上传、邮件服务、短信服务、系统监控等。这些设置会影响系统的整体运行和用户体验。
      </template>
    </el-alert>

    <!-- 配置分类标签页 -->
    <div class="config-tabs">
      <el-tabs v-model="activeConfigTab" @tab-click="handleTabChange">
        <!-- 系统信息 -->
        <el-tab-pane label="系统信息" name="system-info">
          <SystemInfoConfig />
        </el-tab-pane>

        <!-- 文件上传 -->
        <el-tab-pane label="文件上传" name="file-upload">
          <FileUploadConfig />
        </el-tab-pane>

        <!-- 邮件服务 -->
        <el-tab-pane label="邮件服务" name="email-service">
          <EmailServiceConfig />
        </el-tab-pane>

        <!-- 短信服务 -->
        <el-tab-pane label="短信服务" name="sms-service">
          <SmsServiceConfig />
        </el-tab-pane>

        <!-- 系统监控 -->
        <el-tab-pane label="系统监控" name="system-monitor">
          <SystemMonitorConfig />
        </el-tab-pane>

        <!-- 备份恢复 -->
        <el-tab-pane label="备份恢复" name="backup-restore">
          <div class="config-placeholder">
            <el-icon size="48" color="#c0c4cc"><Box /></el-icon>
            <h3>备份恢复配置</h3>
            <p>配置系统数据备份和恢复策略</p>
            <el-button type="primary" @click="showBackupConfig">
              配置备份
            </el-button>
          </div>
        </el-tab-pane>

        <!-- 日志管理 -->
        <el-tab-pane label="日志管理" name="log-management">
          <div class="config-placeholder">
            <el-icon size="48" color="#c0c4cc"><Document /></el-icon>
            <h3>日志管理配置</h3>
            <p>配置系统日志级别、存储和清理策略</p>
            <el-button type="primary" @click="showLogConfig">
              配置日志
            </el-button>
          </div>
        </el-tab-pane>

        <!-- 性能监控 -->
        <el-tab-pane label="性能监控" name="performance-monitor">
          <div class="config-placeholder">
            <el-icon size="48" color="#c0c4cc"><TrendCharts /></el-icon>
            <h3>性能监控配置</h3>
            <p>配置系统性能指标收集和监控</p>
            <el-button type="primary" @click="showPerformanceConfig">
              配置性能
            </el-button>
          </div>
        </el-tab-pane>

        <!-- 安全配置 -->
        <el-tab-pane label="安全配置" name="security-config">
          <div class="config-placeholder">
            <el-icon size="48" color="#c0c4cc"><Setting /></el-icon>
            <h3>安全配置</h3>
            <p>配置系统安全策略和访问控制</p>
            <el-button type="primary" @click="showSecurityConfig">
              配置安全
            </el-button>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 全局配置操作 -->
    <div class="global-actions">
      <div class="action-group">
        <el-button type="primary" :icon="Document" @click="saveAllConfig">
          保存所有配置
        </el-button>
        <el-button :icon="Refresh" @click="resetAllConfig">
          重置所有配置
        </el-button>
      </div>
      <div class="action-group">
        <el-button :icon="Download" @click="exportConfig">
          导出配置
        </el-button>
        <el-button :icon="Upload" @click="importConfig">
          导入配置
        </el-button>
      </div>
    </div>

    <!-- 备份恢复配置对话框 -->
    <el-dialog
      v-model="backupDialogVisible"
      title="备份恢复配置"
      width="600px"
      :close-on-click-modal="false"
    >
      <div class="backup-config">
        <el-form :model="backupConfig" label-width="120px">
          <el-form-item label="自动备份">
            <el-switch v-model="backupConfig.autoBackup" />
          </el-form-item>
          <el-form-item label="备份频率">
            <el-select v-model="backupConfig.backupFrequency" style="width: 100%">
              <el-option label="每日备份" value="daily" />
              <el-option label="每周备份" value="weekly" />
              <el-option label="每月备份" value="monthly" />
            </el-select>
          </el-form-item>
          <el-form-item label="备份保留时间">
            <div class="input-with-unit">
              <el-input-number
                v-model="backupConfig.retentionDays"
                :min="7"
                :max="365"
                :precision="0"
                controls-position="right"
              />
              <span class="unit">天</span>
            </div>
          </el-form-item>
          <el-form-item label="备份路径">
            <el-input v-model="backupConfig.backupPath" placeholder="/backups/" />
          </el-form-item>
          <el-form-item label="加密备份">
            <el-switch v-model="backupConfig.encryptBackup" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="backupDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveBackupConfig">保存</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 日志管理配置对话框 -->
    <el-dialog
      v-model="logDialogVisible"
      title="日志管理配置"
      width="600px"
      :close-on-click-modal="false"
    >
      <div class="log-config">
        <el-form :model="logConfig" label-width="120px">
          <el-form-item label="日志级别">
            <el-select v-model="logConfig.logLevel" style="width: 100%">
              <el-option label="DEBUG" value="debug" />
              <el-option label="INFO" value="info" />
              <el-option label="WARN" value="warn" />
              <el-option label="ERROR" value="error" />
            </el-select>
          </el-form-item>
          <el-form-item label="日志文件大小">
            <div class="input-with-unit">
              <el-input-number
                v-model="logConfig.maxFileSize"
                :min="10"
                :max="1024"
                :precision="0"
                controls-position="right"
              />
              <span class="unit">MB</span>
            </div>
          </el-form-item>
          <el-form-item label="日志保留时间">
            <div class="input-with-unit">
              <el-input-number
                v-model="logConfig.retentionDays"
                :min="7"
                :max="365"
                :precision="0"
                controls-position="right"
              />
              <span class="unit">天</span>
            </div>
          </el-form-item>
          <el-form-item label="日志路径">
            <el-input v-model="logConfig.logPath" placeholder="/var/log/" />
          </el-form-item>
          <el-form-item label="启用日志轮转">
            <el-switch v-model="logConfig.enableRotation" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="logDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveLogConfig">保存</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 性能监控配置对话框 -->
    <el-dialog
      v-model="performanceDialogVisible"
      title="性能监控配置"
      width="600px"
      :close-on-click-modal="false"
    >
      <div class="performance-config">
        <el-form :model="performanceConfig" label-width="120px">
          <el-form-item label="启用性能监控">
            <el-switch v-model="performanceConfig.enableMonitoring" />
          </el-form-item>
          <el-form-item label="采样间隔">
            <div class="input-with-unit">
              <el-input-number
                v-model="performanceConfig.sampleInterval"
                :min="1"
                :max="60"
                :precision="0"
                controls-position="right"
              />
              <span class="unit">秒</span>
            </div>
          </el-form-item>
          <el-form-item label="数据保留时间">
            <div class="input-with-unit">
              <el-input-number
                v-model="performanceConfig.dataRetention"
                :min="1"
                :max="90"
                :precision="0"
                controls-position="right"
              />
              <span class="unit">天</span>
            </div>
          </el-form-item>
          <el-form-item label="监控指标">
            <el-checkbox-group v-model="performanceConfig.metrics">
              <el-checkbox label="cpu">CPU使用率</el-checkbox>
              <el-checkbox label="memory">内存使用率</el-checkbox>
              <el-checkbox label="disk">磁盘I/O</el-checkbox>
              <el-checkbox label="network">网络流量</el-checkbox>
              <el-checkbox label="response_time">响应时间</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="performanceDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="savePerformanceConfig">保存</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 安全配置对话框 -->
    <el-dialog
      v-model="securityDialogVisible"
      title="安全配置"
      width="600px"
      :close-on-click-modal="false"
    >
      <div class="security-config">
        <el-form :model="securityConfig" label-width="120px">
          <el-form-item label="启用HTTPS">
            <el-switch v-model="securityConfig.enableHttps" />
          </el-form-item>
          <el-form-item label="会话超时时间">
            <div class="input-with-unit">
              <el-input-number
                v-model="securityConfig.sessionTimeout"
                :min="5"
                :max="1440"
                :precision="0"
                controls-position="right"
              />
              <span class="unit">分钟</span>
            </div>
          </el-form-item>
          <el-form-item label="密码复杂度">
            <el-select v-model="securityConfig.passwordComplexity" style="width: 100%">
              <el-option label="简单 (6位以上)" value="simple" />
              <el-option label="中等 (8位+字母数字)" value="medium" />
              <el-option label="复杂 (12位+特殊字符)" value="complex" />
            </el-select>
          </el-form-item>
          <el-form-item label="启用双因素认证">
            <el-switch v-model="securityConfig.enable2FA" />
          </el-form-item>
          <el-form-item label="IP白名单">
            <el-input
              v-model="securityConfig.ipWhitelist"
              type="textarea"
              :rows="3"
              placeholder="每行一个IP地址或CIDR网段"
            />
          </el-form-item>
          <el-form-item label="启用审计日志">
            <el-switch v-model="securityConfig.enableAuditLog" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="securityDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveSecurityConfig">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import {
  Box,
  Document,
  TrendCharts,
  Setting,
  Download,
  Upload
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import SystemInfoConfig from './SystemInfoConfig.vue'
import FileUploadConfig from './FileUploadConfig.vue'
import EmailServiceConfig from './EmailServiceConfig.vue'
import SmsServiceConfig from './SmsServiceConfig.vue'
import SystemMonitorConfig from './SystemMonitorConfig.vue'

// 响应式数据
const activeConfigTab = ref('system-info')
const backupDialogVisible = ref(false)
const logDialogVisible = ref(false)
const performanceDialogVisible = ref(false)
const securityDialogVisible = ref(false)

const backupConfig = reactive({
  autoBackup: true,
  backupFrequency: 'daily',
  retentionDays: 30,
  backupPath: '/backups/',
  encryptBackup: true
})

const logConfig = reactive({
  logLevel: 'info',
  maxFileSize: 100,
  retentionDays: 30,
  logPath: '/var/log/',
  enableRotation: true
})

const performanceConfig = reactive({
  enableMonitoring: true,
  sampleInterval: 30,
  dataRetention: 7,
  metrics: ['cpu', 'memory', 'disk', 'network']
})

const securityConfig = reactive({
  enableHttps: true,
  sessionTimeout: 30,
  passwordComplexity: 'medium',
  enable2FA: false,
  ipWhitelist: '',
  enableAuditLog: true
})

// 方法
const handleTabChange = (tab) => {
  activeConfigTab.value = tab.props.name
}

const showBackupConfig = () => {
  backupDialogVisible.value = true
}

const showLogConfig = () => {
  logDialogVisible.value = true
}

const showPerformanceConfig = () => {
  performanceDialogVisible.value = true
}

const showSecurityConfig = () => {
  securityDialogVisible.value = true
}

const saveAllConfig = () => {
  ElMessage.success('所有配置保存成功')
}

const resetAllConfig = () => {
  ElMessageBox.confirm('确定要重置所有系统配置吗？这将恢复到默认设置。', '重置确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('所有配置已重置')
  })
}

const exportConfig = () => {
  ElMessage.success('配置导出成功')
}

const importConfig = () => {
  ElMessage.info('导入配置功能开发中')
}

const saveBackupConfig = () => {
  backupDialogVisible.value = false
  ElMessage.success('备份配置保存成功')
}

const saveLogConfig = () => {
  logDialogVisible.value = false
  ElMessage.success('日志配置保存成功')
}

const savePerformanceConfig = () => {
  performanceDialogVisible.value = false
  ElMessage.success('性能配置保存成功')
}

const saveSecurityConfig = () => {
  securityDialogVisible.value = false
  ElMessage.success('安全配置保存成功')
}
</script>

<style scoped>
.system-config-main {
  padding: 20px;
}

.config-alert {
  margin-bottom: 24px;
}

.config-tabs {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

:deep(.el-tabs__header) {
  margin: 0;
  padding: 0 20px;
  background: #f5f7fa;
}

:deep(.el-tabs__nav-wrap) {
  padding: 0;
}

:deep(.el-tabs__item) {
  padding: 0 20px;
  height: 50px;
  line-height: 50px;
}

:deep(.el-tabs__item.is-active) {
  color: #409eff;
}

:deep(.el-tabs__active-bar) {
  background-color: #409eff;
}

.config-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: #909399;
}

.config-placeholder h3 {
  margin: 16px 0 8px 0;
  font-size: 18px;
  color: #606266;
}

.config-placeholder p {
  margin: 0 0 24px 0;
  font-size: 14px;
}

.global-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.action-group {
  display: flex;
  gap: 12px;
}

.backup-config,
.log-config,
.performance-config,
.security-config {
  padding: 20px 0;
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

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
