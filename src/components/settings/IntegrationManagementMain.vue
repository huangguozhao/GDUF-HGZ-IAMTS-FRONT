<template>
  <div class="integration-management-main">
    <!-- 集成概览 -->
    <div class="settings-section">
      <h4 class="section-subtitle">集成概览</h4>
      <div class="integration-overview">
        <div class="overview-stats">
          <div class="stat-item">
            <div class="stat-number">{{ integrationStats.total }}</div>
            <div class="stat-label">总集成数</div>
          </div>
          <div class="stat-item">
            <div class="stat-number active">{{ integrationStats.active }}</div>
            <div class="stat-label">活跃集成</div>
          </div>
          <div class="stat-item">
            <div class="stat-number warning">{{ integrationStats.warning }}</div>
            <div class="stat-label">异常集成</div>
          </div>
          <div class="stat-item">
            <div class="stat-number error">{{ integrationStats.error }}</div>
            <div class="stat-label">失败集成</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 集成服务管理 -->
    <div class="settings-section">
      <div class="section-header">
        <h4 class="section-subtitle">集成服务管理</h4>
        <el-button
          type="primary"
          size="small"
          @click="handleAddIntegration"
        >
          添加集成
        </el-button>
      </div>
      <IntegrationServiceList
        :services="services"
        :loading="loading"
        @edit="handleEditIntegration"
        @delete="handleDeleteIntegration"
        @toggle-status="handleToggleStatus"
        @test-connection="handleTestConnection"
      />
    </div>

    <!-- API集成配置 -->
    <div class="settings-section">
      <h4 class="section-subtitle">API集成配置</h4>
      <ApiIntegrationConfig
        :settings="apiSettings"
        :loading="apiLoading"
        @update="handleUpdateApiSettings"
      />
    </div>

    <!-- 集成状态监控 -->
    <div class="settings-section">
      <h4 class="section-subtitle">集成状态监控</h4>
      <IntegrationStatusMonitor
        :services="services"
        :loading="loading"
      />
    </div>

    <!-- 集成日志查看 -->
    <div class="settings-section">
      <h4 class="section-subtitle">集成日志</h4>
      <IntegrationLogsViewer
        :logs="logs"
        :loading="logsLoading"
        @refresh="handleRefreshLogs"
      />
    </div>

    <!-- 添加/编辑集成模态框 -->
    <AddEditIntegrationModal
      v-model="showModal"
      :service="editingService"
      @confirm="handleConfirmIntegration"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getIntegrationSettings,
  updateIntegrationSettings,
  getIntegrationServices,
  addIntegrationService,
  updateIntegrationService,
  deleteIntegrationService,
  toggleIntegrationStatus,
  testIntegrationConnection,
  getIntegrationLogs
} from '@/api/settings'

import IntegrationServiceList from './integration/IntegrationServiceList.vue'
import ApiIntegrationConfig from './integration/ApiIntegrationConfig.vue'
import IntegrationStatusMonitor from './integration/IntegrationStatusMonitor.vue'
import IntegrationLogsViewer from './integration/IntegrationLogsViewer.vue'
import AddEditIntegrationModal from './integration/AddEditIntegrationModal.vue'

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

// 响应式数据
const services = ref([])
const apiSettings = ref({})
const logs = ref([])
const loading = ref(false)
const apiLoading = ref(false)
const logsLoading = ref(false)
const showModal = ref(false)
const editingService = ref(null)

// 集成统计
const integrationStats = computed(() => {
  const total = services.value.length
  const active = services.value.filter(s => s.status === 'active').length
  const warning = services.value.filter(s => s.status === 'warning').length
  const error = services.value.filter(s => s.status === 'error').length

  return { total, active, warning, error }
})

// 获取集成服务列表
const fetchIntegrationServices = async () => {
  loading.value = true
  try {
    const response = await getIntegrationServices()
    services.value = response.data || []
  } catch (error) {
    console.error('获取集成服务列表失败:', error)
    ElMessage.error('获取集成服务列表失败')
  } finally {
    loading.value = false
  }
}

// 获取API设置
const fetchApiSettings = async () => {
  apiLoading.value = true
  try {
    const response = await getIntegrationSettings()
    apiSettings.value = response.data?.api || {}
  } catch (error) {
    console.error('获取API设置失败:', error)
    ElMessage.error('获取API设置失败')
  } finally {
    apiLoading.value = false
  }
}

// 获取集成日志
const fetchIntegrationLogs = async () => {
  logsLoading.value = true
  try {
    const response = await getIntegrationLogs({ limit: 50 })
    logs.value = response.data || []
  } catch (error) {
    console.error('获取集成日志失败:', error)
    ElMessage.error('获取集成日志失败')
  } finally {
    logsLoading.value = false
  }
}

// 添加集成
const handleAddIntegration = () => {
  editingService.value = null
  showModal.value = true
}

// 编辑集成
const handleEditIntegration = (service) => {
  editingService.value = { ...service }
  showModal.value = true
}

// 删除集成
const handleDeleteIntegration = async (service) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除集成服务 "${service.name}" 吗？此操作不可撤销。`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    await deleteIntegrationService(service.id)
    ElMessage.success('集成服务删除成功')
    await fetchIntegrationServices()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除集成服务失败:', error)
      ElMessage.error('删除集成服务失败')
    }
  }
}

// 切换状态
const handleToggleStatus = async (service) => {
  try {
    await toggleIntegrationStatus(service.id, !service.enabled)
    ElMessage.success(`${service.enabled ? '禁用' : '启用'}集成成功`)
    await fetchIntegrationServices()
  } catch (error) {
    console.error('切换集成状态失败:', error)
    ElMessage.error('切换集成状态失败')
  }
}

// 测试连接
const handleTestConnection = async (service) => {
  try {
    const response = await testIntegrationConnection(service.id)
    if (response.data?.success) {
      ElMessage.success('连接测试成功')
    } else {
      ElMessage.warning('连接测试失败')
    }
  } catch (error) {
    console.error('连接测试失败:', error)
    ElMessage.error('连接测试失败')
  }
}

// 确认添加/编辑集成
const handleConfirmIntegration = async (serviceData) => {
  try {
    if (editingService.value) {
      await updateIntegrationService(editingService.value.id, serviceData)
      ElMessage.success('集成服务更新成功')
    } else {
      await addIntegrationService(serviceData)
      ElMessage.success('集成服务添加成功')
    }

    showModal.value = false
    editingService.value = null
    await fetchIntegrationServices()
  } catch (error) {
    console.error('保存集成服务失败:', error)
    ElMessage.error('保存集成服务失败')
  }
}

// 更新API设置
const handleUpdateApiSettings = async (newSettings) => {
  try {
    await updateIntegrationSettings({ api: newSettings })
    apiSettings.value = newSettings
    ElMessage.success('API设置更新成功')
  } catch (error) {
    console.error('更新API设置失败:', error)
    ElMessage.error('更新API设置失败')
  }
}

// 刷新日志
const handleRefreshLogs = () => {
  fetchIntegrationLogs()
}

// 组件挂载时获取数据
onMounted(() => {
  fetchIntegrationServices()
  fetchApiSettings()
  fetchIntegrationLogs()
})
</script>

<style scoped>
.integration-management-main {
  max-width: 100%;
}

.settings-section {
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-subtitle {
  margin: 0 0 20px 0;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  padding-bottom: 8px;
  border-bottom: 2px solid #409eff;
}

.integration-overview {
  background: #fafafa;
  border-radius: 8px;
  padding: 20px;
}

.overview-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
}

.stat-item {
  text-align: center;
  padding: 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.stat-number {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.stat-number.active {
  color: #52c41a;
}

.stat-number.warning {
  color: #faad14;
}

.stat-number.error {
  color: #ff4d4f;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}
</style>
