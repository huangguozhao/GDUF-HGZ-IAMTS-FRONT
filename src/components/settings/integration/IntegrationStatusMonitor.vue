<template>
  <div class="integration-status-monitor">
    <!-- 状态概览 -->
    <div class="status-overview">
      <div class="overview-grid">
        <div class="status-card">
          <div class="status-icon success">
            <i class="el-icon-success"></i>
          </div>
          <div class="status-info">
            <div class="status-count">{{ statusStats.active }}</div>
            <div class="status-label">正常运行</div>
          </div>
        </div>

        <div class="status-card">
          <div class="status-icon warning">
            <i class="el-icon-warning"></i>
          </div>
          <div class="status-info">
            <div class="status-count">{{ statusStats.warning }}</div>
            <div class="status-label">警告状态</div>
          </div>
        </div>

        <div class="status-card">
          <div class="status-icon error">
            <i class="el-icon-error"></i>
          </div>
          <div class="status-info">
            <div class="status-count">{{ statusStats.error }}</div>
            <div class="status-label">错误状态</div>
          </div>
        </div>

        <div class="status-card">
          <div class="status-icon offline">
            <i class="el-icon-info"></i>
          </div>
          <div class="status-info">
            <div class="status-count">{{ statusStats.offline }}</div>
            <div class="status-label">离线状态</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 服务状态列表 -->
    <div class="service-status-list">
      <div class="list-header">
        <h5>服务状态详情</h5>
        <div class="header-actions">
          <el-button
            size="small"
            @click="refreshStatus"
            :loading="refreshing"
          >
            刷新状态
          </el-button>
          <el-button
            size="small"
            type="primary"
            @click="startAutoRefresh"
            :disabled="autoRefreshEnabled"
          >
            {{ autoRefreshEnabled ? '自动刷新中' : '开启自动刷新' }}
          </el-button>
        </div>
      </div>

      <div class="status-table">
        <div class="table-header">
          <div class="table-cell service-name">服务名称</div>
          <div class="table-cell service-type">类型</div>
          <div class="table-cell status">状态</div>
          <div class="table-cell uptime">运行时间</div>
          <div class="table-cell last-check">最后检查</div>
          <div class="table-cell response-time">响应时间</div>
          <div class="table-cell actions">操作</div>
        </div>

        <div
          v-for="service in services"
          :key="service.id"
          class="table-row"
          :class="{ disabled: !service.enabled }"
        >
          <div class="table-cell service-name">
            <div class="service-info">
              <div class="service-icon">
                <i :class="getServiceIcon(service.type)"></i>
              </div>
              <div>
                <div class="service-title">{{ service.name }}</div>
                <div class="service-desc">{{ service.description }}</div>
              </div>
            </div>
          </div>

          <div class="table-cell service-type">
            {{ getServiceTypeLabel(service.type) }}
          </div>

          <div class="table-cell status">
            <div class="status-indicator" :class="`status-${service.status}`">
              <span class="status-dot"></span>
              <span class="status-text">{{ getStatusLabel(service.status) }}</span>
            </div>
          </div>

          <div class="table-cell uptime">
            {{ formatUptime(service.uptime) }}
          </div>

          <div class="table-cell last-check">
            {{ formatLastCheck(service.lastCheck) }}
          </div>

          <div class="table-cell response-time">
            <span :class="getResponseTimeClass(service.responseTime)">
              {{ formatResponseTime(service.responseTime) }}
            </span>
          </div>

          <div class="table-cell actions">
            <el-button
              size="small"
              @click="checkServiceStatus(service)"
              :loading="checkingIds.has(service.id)"
            >
              检查
            </el-button>
            <el-button
              size="small"
              type="primary"
              @click="viewServiceDetails(service)"
            >
              详情
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 性能图表 -->
    <div class="performance-charts">
      <div class="chart-header">
        <h5>性能监控</h5>
        <div class="chart-controls">
          <el-select
            v-model="chartTimeRange"
            size="small"
            style="width: 120px"
            @change="updateChartData"
          >
            <el-option label="最近1小时" value="1h" />
            <el-option label="最近24小时" value="24h" />
            <el-option label="最近7天" value="7d" />
          </el-select>
        </div>
      </div>

      <div class="charts-grid">
        <div class="chart-card">
          <div class="chart-title">响应时间趋势</div>
          <div class="chart-placeholder">
            <div class="chart-line">
              <div
                v-for="point in responseTimeData"
                :key="point.id"
                class="data-point"
                :style="{ height: point.value + 'px' }"
              ></div>
            </div>
            <div class="chart-legend">图表功能开发中</div>
          </div>
        </div>

        <div class="chart-card">
          <div class="chart-title">错误率统计</div>
          <div class="chart-placeholder">
            <div class="error-stats">
              <div class="error-item">
                <span class="error-label">连接错误:</span>
                <span class="error-value">{{ errorStats.connectionErrors }}</span>
              </div>
              <div class="error-item">
                <span class="error-label">超时错误:</span>
                <span class="error-value">{{ errorStats.timeoutErrors }}</span>
              </div>
              <div class="error-item">
                <span class="error-label">认证错误:</span>
                <span class="error-value">{{ errorStats.authErrors }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 服务详情模态框 -->
    <el-dialog
      v-model="showDetailsModal"
      :title="`${selectedService?.name || ''} - 服务详情`"
      width="600px"
    >
      <div v-if="selectedService" class="service-details">
        <div class="detail-section">
          <h6>基本信息</h6>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">服务名称:</span>
              <span class="detail-value">{{ selectedService.name }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">服务类型:</span>
              <span class="detail-value">{{ getServiceTypeLabel(selectedService.type) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">服务地址:</span>
              <span class="detail-value">{{ selectedService.baseUrl }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">当前状态:</span>
              <span :class="['status-badge', `status-${selectedService.status}`]">
                {{ getStatusLabel(selectedService.status) }}
              </span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h6>性能指标</h6>
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">响应时间:</span>
              <span class="detail-value">{{ formatResponseTime(selectedService.responseTime) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">运行时间:</span>
              <span class="detail-value">{{ formatUptime(selectedService.uptime) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">最后检查:</span>
              <span class="detail-value">{{ formatLastCheck(selectedService.lastCheck) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">健康度:</span>
              <span class="detail-value">{{ selectedService.healthScore }}%</span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h6>错误统计 (24小时内)</h6>
          <div class="error-history">
            <div class="error-stat">
              <span class="error-type">连接错误:</span>
              <span class="error-count">{{ selectedService.errorStats?.connection || 0 }}</span>
            </div>
            <div class="error-stat">
              <span class="error-type">超时错误:</span>
              <span class="error-count">{{ selectedService.errorStats?.timeout || 0 }}</span>
            </div>
            <div class="error-stat">
              <span class="error-type">认证错误:</span>
              <span class="error-count">{{ selectedService.errorStats?.auth || 0 }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  services: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const refreshing = ref(false)
const autoRefreshEnabled = ref(false)
const autoRefreshTimer = ref(null)
const checkingIds = ref(new Set())
const showDetailsModal = ref(false)
const selectedService = ref(null)
const chartTimeRange = ref('24h')

// 模拟响应时间数据
const responseTimeData = ref([
  { id: 1, value: 120 },
  { id: 2, value: 150 },
  { id: 3, value: 100 },
  { id: 4, value: 180 },
  { id: 5, value: 90 },
  { id: 6, value: 200 },
  { id: 7, value: 140 }
])

// 错误统计
const errorStats = ref({
  connectionErrors: 5,
  timeoutErrors: 2,
  authErrors: 1
})

// 状态统计
const statusStats = computed(() => {
  const stats = {
    active: 0,
    warning: 0,
    error: 0,
    offline: 0
  }

  props.services.forEach(service => {
    if (!service.enabled) {
      stats.offline++
    } else {
      stats[service.status] = (stats[service.status] || 0) + 1
    }
  })

  return stats
})

// 服务类型映射
const serviceTypeMap = {
  'github': { label: 'GitHub', icon: 'el-icon-github' },
  'gitlab': { label: 'GitLab', icon: 'el-icon-gitlab' },
  'jira': { label: 'Jira', icon: 'el-icon-jira' },
  'jenkins': { label: 'Jenkins', icon: 'el-icon-jenkins' },
  'slack': { label: 'Slack', icon: 'el-icon-slack' },
  'webhook': { label: 'Webhook', icon: 'el-icon-webhook' },
  'api': { label: 'API', icon: 'el-icon-api' },
  'database': { label: '数据库', icon: 'el-icon-database' }
}

const getServiceIcon = (type) => serviceTypeMap[type]?.icon || 'el-icon-link'
const getServiceTypeLabel = (type) => serviceTypeMap[type]?.label || type

const getStatusLabel = (status) => {
  const statusMap = {
    'active': '正常',
    'warning': '警告',
    'error': '错误',
    'offline': '离线',
    'connecting': '连接中'
  }
  return statusMap[status] || status
}

const formatUptime = (uptime) => {
  if (!uptime) return '未知'
  const days = Math.floor(uptime / (24 * 60 * 60 * 1000))
  const hours = Math.floor((uptime % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
  const minutes = Math.floor((uptime % (60 * 60 * 1000)) / (60 * 1000))

  if (days > 0) return `${days}天${hours}小时`
  if (hours > 0) return `${hours}小时${minutes}分钟`
  return `${minutes}分钟`
}

const formatLastCheck = (date) => {
  if (!date) return '从未检查'
  const now = new Date()
  const checkDate = new Date(date)
  const diffMs = now - checkDate
  const diffMins = Math.floor(diffMs / (1000 * 60))

  if (diffMins < 1) return '刚刚'
  if (diffMins < 60) return `${diffMins}分钟前`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}小时前`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}天前`
}

const formatResponseTime = (time) => {
  if (!time && time !== 0) return '-'
  if (time < 1000) return `${time}ms`
  return `${(time / 1000).toFixed(2)}s`
}

const getResponseTimeClass = (time) => {
  if (!time && time !== 0) return ''
  if (time < 500) return 'response-fast'
  if (time < 2000) return 'response-normal'
  return 'response-slow'
}

const refreshStatus = async () => {
  refreshing.value = true
  try {
    // 模拟刷新状态
    await new Promise(resolve => setTimeout(resolve, 1000))
    ElMessage.success('状态刷新完成')
  } catch (error) {
    ElMessage.error('状态刷新失败')
  } finally {
    refreshing.value = false
  }
}

const startAutoRefresh = () => {
  if (autoRefreshEnabled.value) return

  autoRefreshEnabled.value = true
  autoRefreshTimer.value = setInterval(() => {
    refreshStatus()
  }, 30000) // 每30秒自动刷新

  ElMessage.success('已开启自动刷新')
}

const stopAutoRefresh = () => {
  if (autoRefreshTimer.value) {
    clearInterval(autoRefreshTimer.value)
    autoRefreshTimer.value = null
  }
  autoRefreshEnabled.value = false
}

const checkServiceStatus = async (service) => {
  checkingIds.value.add(service.id)
  try {
    // 模拟检查服务状态
    await new Promise(resolve => setTimeout(resolve, 2000))
    ElMessage.success(`${service.name} 状态检查完成`)
  } catch (error) {
    ElMessage.error(`${service.name} 状态检查失败`)
  } finally {
    checkingIds.value.delete(service.id)
  }
}

const viewServiceDetails = (service) => {
  selectedService.value = service
  showDetailsModal.value = true
}

const updateChartData = () => {
  // 更新图表数据逻辑
  ElMessage.info('图表数据更新中...')
}

onMounted(() => {
  // 初始化一些模拟数据
  props.services.forEach(service => {
    if (!service.uptime) service.uptime = Math.random() * 7 * 24 * 60 * 60 * 1000 // 随机运行时间
    if (!service.lastCheck) service.lastCheck = new Date(Date.now() - Math.random() * 60 * 60 * 1000) // 随机最后检查时间
    if (!service.responseTime) service.responseTime = Math.random() * 3000 + 100 // 随机响应时间
    if (!service.healthScore) service.healthScore = Math.floor(Math.random() * 40 + 60) // 随机健康度
    if (!service.errorStats) {
      service.errorStats = {
        connection: Math.floor(Math.random() * 10),
        timeout: Math.floor(Math.random() * 5),
        auth: Math.floor(Math.random() * 3)
      }
    }
  })
})

onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<style scoped>
.integration-status-monitor {
  max-width: 100%;
}

.status-overview {
  margin-bottom: 24px;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.status-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

.status-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
}

.status-icon.success {
  background: #52c41a;
}

.status-icon.warning {
  background: #faad14;
}

.status-icon.error {
  background: #ff4d4f;
}

.status-icon.offline {
  background: #8c8c8c;
}

.status-info {
  flex: 1;
}

.status-count {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.status-label {
  font-size: 14px;
  color: #909399;
}

.service-status-list {
  background: white;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  overflow: hidden;
  margin-bottom: 24px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e4e7ed;
  background: #fafafa;
}

.list-header h5 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.status-table {
  width: 100%;
}

.table-header,
.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr 1.5fr;
  gap: 16px;
  padding: 12px 20px;
  align-items: center;
}

.table-header {
  background: #fafafa;
  border-bottom: 1px solid #e4e7ed;
  font-weight: 500;
  color: #606266;
  font-size: 14px;
}

.table-row {
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;
}

.table-row:hover {
  background: #fafafa;
}

.table-row.disabled {
  opacity: 0.6;
  background: #f9f9f9;
}

.table-cell {
  min-width: 0;
}

.service-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.service-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: #409eff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.service-title {
  font-weight: 500;
  color: #303133;
  margin-bottom: 2px;
}

.service-desc {
  font-size: 12px;
  color: #909399;
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
}

.status-active .status-dot {
  background: #52c41a;
}

.status-warning .status-dot {
  background: #faad14;
}

.status-error .status-dot {
  background: #ff4d4f;
}

.status-offline .status-dot {
  background: #8c8c8c;
}

.status-connecting .status-dot {
  background: #1890ff;
}

.status-text {
  font-size: 12px;
  font-weight: 500;
}

.response-fast {
  color: #52c41a;
}

.response-normal {
  color: #faad14;
}

.response-slow {
  color: #ff4d4f;
}

.performance-charts {
  background: white;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  overflow: hidden;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e4e7ed;
  background: #fafafa;
}

.chart-header h5 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.chart-controls {
  display: flex;
  gap: 8px;
}

.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  padding: 20px;
}

.chart-card {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  overflow: hidden;
}

.chart-title {
  padding: 12px 16px;
  background: #fafafa;
  border-bottom: 1px solid #e4e7ed;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.chart-placeholder {
  padding: 20px;
  text-align: center;
  color: #909399;
}

.chart-line {
  display: flex;
  align-items: end;
  justify-content: space-between;
  height: 80px;
  margin-bottom: 16px;
}

.data-point {
  flex: 1;
  background: #409eff;
  margin: 0 1px;
  border-radius: 2px 2px 0 0;
  transition: background-color 0.3s;
}

.data-point:hover {
  background: #66b1ff;
}

.chart-legend {
  font-size: 12px;
}

.error-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.error-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.error-label {
  font-size: 14px;
  color: #606266;
}

.error-value {
  font-size: 14px;
  font-weight: 500;
  color: #ff4d4f;
}

.service-details {
  max-height: 400px;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 20px;
}

.detail-section h6 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-label {
  font-size: 13px;
  color: #909399;
  font-weight: 500;
}

.detail-value {
  font-size: 13px;
  color: #303133;
}

.status-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.status-active {
  background-color: #f6ffed;
  color: #52c41a;
}

.status-warning {
  background-color: #fffbe6;
  color: #faad14;
}

.status-error {
  background-color: #fff1f0;
  color: #ff4d4f;
}

.status-offline {
  background-color: #f5f5f5;
  color: #8c8c8c;
}

.error-history {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.error-stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #fafafa;
  border-radius: 4px;
}

.error-type {
  font-size: 13px;
  color: #606266;
}

.error-count {
  font-size: 13px;
  font-weight: 500;
  color: #ff4d4f;
}

@media (max-width: 768px) {
  .table-header,
  .table-row {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .table-header {
    display: none;
  }

  .table-cell {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px 0;
  }

  .table-cell::before {
    content: attr(data-label);
    font-weight: 500;
    color: #909399;
    font-size: 12px;
  }

  .service-name::before {
    content: "服务信息";
  }

  .service-type::before {
    content: "类型";
  }

  .status::before {
    content: "状态";
  }

  .uptime::before {
    content: "运行时间";
  }

  .last-check::before {
    content: "最后检查";
  }

  .response-time::before {
    content: "响应时间";
  }

  .actions::before {
    content: "操作";
  }
}
</style>
