<template>
  <div class="system-monitor-config">
    <div class="config-header">
      <h3 class="config-title">系统监控配置</h3>
      <div class="header-actions">
        <el-button type="primary" :icon="Monitor" @click="startMonitor">
          {{ isMonitoring ? '停止监控' : '启动监控' }}
        </el-button>
        <el-button :icon="Refresh" @click="refreshStatus">
          刷新状态
        </el-button>
      </div>
    </div>

    <div class="config-content">
      <!-- 监控概览 -->
      <div class="config-section">
        <h4 class="section-title">监控概览</h4>
        <div class="overview-grid">
          <div class="overview-card">
            <div class="card-header">
              <el-icon size="24" color="#409EFF"><Monitor /></el-icon>
              <span class="card-title">监控状态</span>
            </div>
            <div class="card-content">
              <div class="status-indicator" :class="{ active: isMonitoring }">
                <span class="status-dot"></span>
                <span class="status-text">{{ isMonitoring ? '运行中' : '已停止' }}</span>
              </div>
              <div class="status-time">
                <span>运行时间: {{ formatUptime(monitorStats.uptime) }}</span>
              </div>
            </div>
          </div>
          <div class="overview-card">
            <div class="card-header">
              <el-icon size="24" color="#67C23A"><Check /></el-icon>
              <span class="card-title">健康检查</span>
            </div>
            <div class="card-content">
              <div class="health-score">
                <span class="score-value">{{ monitorStats.healthScore }}</span>
                <span class="score-unit">分</span>
              </div>
              <div class="health-desc">
                <el-tag :type="getHealthType(monitorStats.healthScore)">
                  {{ getHealthText(monitorStats.healthScore) }}
                </el-tag>
              </div>
            </div>
          </div>
          <div class="overview-card">
            <div class="card-header">
              <el-icon size="24" color="#E6A23C"><Warning /></el-icon>
              <span class="card-title">告警数量</span>
            </div>
            <div class="card-content">
              <div class="alert-count">
                <span class="count-value">{{ monitorStats.alertCount }}</span>
                <span class="count-unit">个</span>
              </div>
              <div class="alert-trend">
                <span :class="{ 'trend-up': monitorStats.alertTrend > 0, 'trend-down': monitorStats.alertTrend < 0 }">
                  {{ monitorStats.alertTrend > 0 ? '+' : '' }}{{ monitorStats.alertTrend }}
                </span>
                <span class="trend-desc">较昨日</span>
              </div>
            </div>
          </div>
          <div class="overview-card">
            <div class="card-header">
              <el-icon size="24" color="#F56C6C"><Clock /></el-icon>
              <span class="card-title">响应时间</span>
            </div>
            <div class="card-content">
              <div class="response-time">
                <span class="time-value">{{ monitorStats.avgResponseTime }}</span>
                <span class="time-unit">ms</span>
              </div>
              <div class="response-trend">
                <span :class="{ 'trend-up': monitorStats.responseTrend > 0, 'trend-down': monitorStats.responseTrend < 0 }">
                  {{ monitorStats.responseTrend > 0 ? '+' : '' }}{{ monitorStats.responseTrend }}ms
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 监控配置 -->
      <div class="config-section">
        <h4 class="section-title">监控配置</h4>
        <div class="monitor-tabs">
          <el-tabs v-model="activeMonitorTab" @tab-click="handleTabChange">
            <!-- 基础监控 -->
            <el-tab-pane label="基础监控" name="basic">
              <div class="monitor-config">
                <div class="config-grid">
                  <div class="config-item">
                    <label class="config-label">监控间隔</label>
                    <div class="input-with-unit">
                      <el-input-number
                        v-model="monitorConfig.monitorInterval"
                        :min="10"
                        :max="3600"
                        :precision="0"
                        controls-position="right"
                      />
                      <span class="unit">秒</span>
                    </div>
                  </div>
                  <div class="config-item">
                    <label class="config-label">数据保留时间</label>
                    <div class="input-with-unit">
                      <el-input-number
                        v-model="monitorConfig.dataRetention"
                        :min="1"
                        :max="365"
                        :precision="0"
                        controls-position="right"
                      />
                      <span class="unit">天</span>
                    </div>
                  </div>
                  <div class="config-item">
                    <label class="config-label">启用CPU监控</label>
                    <el-switch v-model="monitorConfig.enableCpuMonitor" />
                  </div>
                  <div class="config-item">
                    <label class="config-label">启用内存监控</label>
                    <el-switch v-model="monitorConfig.enableMemoryMonitor" />
                  </div>
                  <div class="config-item">
                    <label class="config-label">启用磁盘监控</label>
                    <el-switch v-model="monitorConfig.enableDiskMonitor" />
                  </div>
                  <div class="config-item">
                    <label class="config-label">启用网络监控</label>
                    <el-switch v-model="monitorConfig.enableNetworkMonitor" />
                  </div>
                </div>
              </div>
            </el-tab-pane>

            <!-- 告警配置 -->
            <el-tab-pane label="告警配置" name="alert">
              <div class="alert-config">
                <div class="alert-rules">
                  <div class="rule-header">
                    <h5>告警规则</h5>
                    <el-button type="primary" size="small" :icon="Plus" @click="addAlertRule">
                      添加规则
                    </el-button>
                  </div>
                  <div class="rules-list">
                    <div
                      v-for="(rule, index) in alertRules"
                      :key="rule.id"
                      class="rule-item"
                    >
                      <div class="rule-content">
                        <div class="rule-info">
                          <span class="rule-name">{{ rule.name }}</span>
                          <el-tag :type="getRuleType(rule.type)" size="small">
                            {{ getRuleTypeText(rule.type) }}
                          </el-tag>
                        </div>
                        <div class="rule-condition">
                          {{ rule.metric }} {{ rule.operator }} {{ rule.threshold }} {{ rule.unit }}
                        </div>
                        <div class="rule-actions">
                          <el-switch
                            v-model="rule.enabled"
                            size="small"
                            @change="toggleRule(rule)"
                          />
                          <el-button
                            link
                            type="primary"
                            size="small"
                            @click="editRule(rule)"
                          >
                            编辑
                          </el-button>
                          <el-button
                            link
                            type="danger"
                            size="small"
                            @click="deleteRule(rule, index)"
                          >
                            删除
                          </el-button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </el-tab-pane>

            <!-- 通知配置 -->
            <el-tab-pane label="通知配置" name="notification">
              <div class="notification-config">
                <div class="notification-grid">
                  <div class="config-item">
                    <label class="config-label">启用邮件通知</label>
                    <el-switch v-model="notificationConfig.enableEmail" />
                  </div>
                  <div class="config-item">
                    <label class="config-label">启用短信通知</label>
                    <el-switch v-model="notificationConfig.enableSms" />
                  </div>
                  <div class="config-item">
                    <label class="config-label">启用WebHook</label>
                    <el-switch v-model="notificationConfig.enableWebhook" />
                  </div>
                  <div class="config-item">
                    <label class="config-label">告警级别</label>
                    <el-select v-model="notificationConfig.alertLevel" style="width: 100%">
                      <el-option label="全部告警" value="all" />
                      <el-option label="严重告警" value="critical" />
                      <el-option label="警告以上" value="warning" />
                      <el-option label="错误以上" value="error" />
                    </el-select>
                  </div>
                  <div class="config-item full-width">
                    <label class="config-label">通知接收人</label>
                    <el-select
                      v-model="notificationConfig.recipients"
                      multiple
                      filterable
                      placeholder="选择通知接收人"
                      style="width: 100%"
                    >
                      <el-option
                        v-for="user in userList"
                        :key="user.id"
                        :label="user.name"
                        :value="user.id"
                      />
                    </el-select>
                  </div>
                  <div class="config-item full-width">
                    <label class="config-label">WebHook URL</label>
                    <el-input
                      v-model="notificationConfig.webhookUrl"
                      placeholder="https://example.com/webhook"
                    />
                  </div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>

      <!-- 监控指标 -->
      <div class="config-section">
        <h4 class="section-title">实时监控指标</h4>
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-header">
              <span class="metric-title">CPU使用率</span>
              <span class="metric-value">{{ metrics.cpu }}%</span>
            </div>
            <div class="metric-bar">
              <div class="bar-fill" :style="{ width: metrics.cpu + '%' }"></div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-header">
              <span class="metric-title">内存使用率</span>
              <span class="metric-value">{{ metrics.memory }}%</span>
            </div>
            <div class="metric-bar">
              <div class="bar-fill" :style="{ width: metrics.memory + '%' }"></div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-header">
              <span class="metric-title">磁盘使用率</span>
              <span class="metric-value">{{ metrics.disk }}%</span>
            </div>
            <div class="metric-bar">
              <div class="bar-fill" :style="{ width: metrics.disk + '%' }"></div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-header">
              <span class="metric-title">网络I/O</span>
              <span class="metric-value">{{ metrics.network }}Mbps</span>
            </div>
            <div class="metric-bar">
              <div class="bar-fill" :style="{ width: Math.min(metrics.network / 10 * 100, 100) + '%' }"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 告警历史 -->
      <div class="config-section">
        <h4 class="section-title">告警历史</h4>
        <div class="alert-history">
          <el-table :data="alertHistory" style="width: 100%" size="small">
            <el-table-column prop="time" label="时间" width="160" />
            <el-table-column prop="type" label="类型" width="100">
              <template #default="scope">
                <el-tag :type="getAlertType(scope.row.level)">
                  {{ scope.row.type }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="message" label="告警信息" min-width="200" />
            <el-table-column prop="value" label="当前值" width="100" />
            <el-table-column prop="threshold" label="阈值" width="100" />
            <el-table-column label="状态" width="80">
              <template #default="scope">
                <el-tag :type="scope.row.status === 'resolved' ? 'success' : 'danger'">
                  {{ scope.row.status === 'resolved' ? '已解决' : '未解决' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100">
              <template #default="scope">
                <el-button
                  v-if="scope.row.status === 'active'"
                  link
                  type="success"
                  size="small"
                  @click="resolveAlert(scope.row)"
                >
                  解决
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import {
  Monitor,
  Refresh,
  Check,
  Warning,
  Clock,
  Plus,
  Document
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 响应式数据
const activeMonitorTab = ref('basic')
const isMonitoring = ref(true)

const monitorStats = reactive({
  uptime: 86400 * 2, // 2天
  healthScore: 85,
  alertCount: 3,
  alertTrend: -2,
  avgResponseTime: 245,
  responseTrend: -15
})

const monitorConfig = reactive({
  monitorInterval: 30,
  dataRetention: 30,
  enableCpuMonitor: true,
  enableMemoryMonitor: true,
  enableDiskMonitor: true,
  enableNetworkMonitor: true
})

const alertRules = ref([
  {
    id: 1,
    name: 'CPU使用率过高',
    type: 'cpu',
    metric: 'CPU使用率',
    operator: '>',
    threshold: 80,
    unit: '%',
    enabled: true
  },
  {
    id: 2,
    name: '内存使用率过高',
    type: 'memory',
    metric: '内存使用率',
    operator: '>',
    threshold: 90,
    unit: '%',
    enabled: true
  },
  {
    id: 3,
    name: '磁盘空间不足',
    type: 'disk',
    metric: '磁盘使用率',
    operator: '>',
    threshold: 85,
    unit: '%',
    enabled: true
  }
])

const notificationConfig = reactive({
  enableEmail: true,
  enableSms: false,
  enableWebhook: false,
  alertLevel: 'warning',
  recipients: [],
  webhookUrl: ''
})

const userList = ref([
  { id: 1, name: '管理员' },
  { id: 2, name: '运维人员' },
  { id: 3, name: '开发人员' }
])

const metrics = reactive({
  cpu: 35,
  memory: 62,
  disk: 45,
  network: 25
})

const alertHistory = ref([
  {
    id: 1,
    time: '2024-01-15 10:30:00',
    type: 'CPU告警',
    level: 'warning',
    message: 'CPU使用率超过80%',
    value: '85%',
    threshold: '80%',
    status: 'resolved'
  },
  {
    id: 2,
    time: '2024-01-15 09:15:00',
    type: '内存告警',
    level: 'critical',
    message: '内存使用率超过90%',
    value: '92%',
    threshold: '90%',
    status: 'active'
  },
  {
    id: 3,
    time: '2024-01-15 08:45:00',
    type: '磁盘告警',
    level: 'warning',
    message: '磁盘使用率超过85%',
    value: '87%',
    threshold: '85%',
    status: 'active'
  }
])

// 方法
const formatUptime = (seconds) => {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  return `${days}天 ${hours}小时`
}

const getHealthType = (score) => {
  if (score >= 90) return 'success'
  if (score >= 70) return 'warning'
  return 'danger'
}

const getHealthText = (score) => {
  if (score >= 90) return '健康'
  if (score >= 70) return '一般'
  return '异常'
}

const startMonitor = () => {
  isMonitoring.value = !isMonitoring.value
  ElMessage.success(isMonitoring.value ? '监控已启动' : '监控已停止')
}

const refreshStatus = () => {
  // 刷新监控状态
  ElMessage.success('状态已刷新')
}

const handleTabChange = (tab) => {
  activeMonitorTab.value = tab.props.name
}

const addAlertRule = () => {
  ElMessage.info('添加告警规则功能开发中')
}

const toggleRule = (rule) => {
  ElMessage.success(`${rule.name}已${rule.enabled ? '启用' : '禁用'}`)
}

const editRule = (rule) => {
  ElMessage.info('编辑规则功能开发中')
}

const deleteRule = (rule, index) => {
  ElMessageBox.confirm(`确定要删除告警规则"${rule.name}"吗？`, '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    alertRules.value.splice(index, 1)
    ElMessage.success('规则已删除')
  })
}

const getRuleType = (type) => {
  const typeMap = {
    cpu: 'warning',
    memory: 'danger',
    disk: 'info'
  }
  return typeMap[type] || 'info'
}

const getRuleTypeText = (type) => {
  const typeMap = {
    cpu: 'CPU',
    memory: '内存',
    disk: '磁盘'
  }
  return typeMap[type] || type
}

const getAlertType = (level) => {
  const levelMap = {
    critical: 'danger',
    warning: 'warning',
    info: 'info'
  }
  return levelMap[level] || 'info'
}

const resolveAlert = (alert) => {
  alert.status = 'resolved'
  ElMessage.success('告警已标记为已解决')
}

const saveConfig = () => {
  ElMessage.success('监控配置保存成功')
}

const resetConfig = () => {
  ElMessageBox.confirm('确定要重置所有监控配置吗？', '重置确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('配置已重置')
  })
}

// 初始化
onMounted(() => {
  // 加载配置数据
})
</script>

<style scoped>
.system-monitor-config {
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

.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.overview-card {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.card-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #f56c6c;
}

.status-indicator.active .status-dot {
  background: #67c23a;
}

.status-text {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.status-time {
  font-size: 12px;
  color: #909399;
}

.health-score {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.score-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
}

.score-unit {
  font-size: 16px;
  color: #909399;
}

.alert-count {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.count-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
}

.count-unit {
  font-size: 16px;
  color: #909399;
}

.alert-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}

.trend-up {
  color: #f56c6c;
}

.trend-down {
  color: #67c23a;
}

.trend-desc {
  color: #909399;
}

.response-time {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.time-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
}

.time-unit {
  font-size: 16px;
  color: #909399;
}

.response-trend {
  font-size: 12px;
}

.monitor-tabs {
  margin-top: 16px;
}

.monitor-config,
.alert-config,
.notification-config {
  padding: 16px 0;
}

.config-grid,
.notification-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.config-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.config-item.full-width {
  grid-column: 1 / -1;
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

.alert-rules {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.rule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rule-header h5 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.rules-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rule-item {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.rule-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.rule-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 150px;
}

.rule-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.rule-condition {
  font-size: 12px;
  color: #909399;
}

.rule-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.metric-card {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.metric-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.metric-value {
  font-size: 16px;
  font-weight: 600;
  color: #409eff;
}

.metric-bar {
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #409eff 0%, #67c23a 100%);
  transition: width 0.3s ease;
}

.alert-history {
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
</style>
