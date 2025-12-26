<template>
  <div class="system-info-config">
    <div class="config-header">
      <h3 class="config-title">系统信息配置</h3>
      <el-button type="primary" :icon="Setting" @click="showAdvancedConfig">
        高级配置
      </el-button>
    </div>

    <div class="config-content">
      <!-- 系统基本信息 -->
      <div class="config-section">
        <h4 class="section-title">系统基本信息</h4>
        <div class="info-grid">
          <div class="info-item">
            <label class="info-label">系统名称</label>
            <el-input
              v-model="systemInfo.name"
              placeholder="请输入系统名称"
              :disabled="!isEditable"
            />
          </div>
          <div class="info-item">
            <label class="info-label">系统版本</label>
            <div class="version-display">
              <span class="version-text">{{ systemInfo.version }}</span>
              <el-button type="primary" size="small" :icon="Refresh" @click="checkUpdate">
                检查更新
              </el-button>
            </div>
          </div>
          <div class="info-item">
            <label class="info-label">运行环境</label>
            <el-select v-model="systemInfo.environment" :disabled="!isEditable">
              <el-option label="开发环境" value="development" />
              <el-option label="测试环境" value="testing" />
              <el-option label="预生产环境" value="staging" />
              <el-option label="生产环境" value="production" />
            </el-select>
          </div>
          <div class="info-item">
            <label class="info-label">部署模式</label>
            <el-select v-model="systemInfo.deploymentMode" :disabled="!isEditable">
              <el-option label="单机部署" value="standalone" />
              <el-option label="分布式部署" value="distributed" />
              <el-option label="集群部署" value="cluster" />
            </el-select>
          </div>
          <div class="info-item full-width">
            <label class="info-label">系统描述</label>
            <el-input
              v-model="systemInfo.description"
              type="textarea"
              :rows="3"
              placeholder="请输入系统描述"
              :disabled="!isEditable"
            />
          </div>
          <div class="info-item full-width">
            <label class="info-label">技术栈信息</label>
            <div class="tech-stack">
              <el-tag
                v-for="tech in systemInfo.techStack"
                :key="tech.name"
                :type="tech.type"
                size="small"
              >
                {{ tech.name }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>

      <!-- 系统状态信息 -->
      <div class="config-section">
        <h4 class="section-title">系统状态信息</h4>
        <div class="status-grid">
          <div class="status-card">
            <div class="status-icon">
              <el-icon size="24" color="#67C23A"><SuccessFilled /></el-icon>
            </div>
            <div class="status-info">
              <div class="status-title">运行状态</div>
              <div class="status-value">{{ systemStatus.running ? '正常运行' : '服务异常' }}</div>
            </div>
          </div>
          <div class="status-card">
            <div class="status-icon">
              <el-icon size="24" color="#E6A23C"><Clock /></el-icon>
            </div>
            <div class="status-info">
              <div class="status-title">运行时间</div>
              <div class="status-value">{{ formatUptime(systemStatus.uptime) }}</div>
            </div>
          </div>
          <div class="status-card">
            <div class="status-icon">
              <el-icon size="24" color="#409EFF"><Monitor /></el-icon>
            </div>
            <div class="status-info">
              <div class="status-title">CPU使用率</div>
              <div class="status-value">{{ systemStatus.cpuUsage }}%</div>
            </div>
          </div>
          <div class="status-card">
            <div class="status-icon">
              <el-icon size="24" color="#F56C6C"><Files /></el-icon>
            </div>
            <div class="status-info">
              <div class="status-title">内存使用</div>
              <div class="status-value">{{ systemStatus.memoryUsage }}%</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 许可证信息 -->
      <div class="config-section">
        <h4 class="section-title">许可证信息</h4>
        <div class="license-info">
          <div class="license-item">
            <span class="license-label">许可证类型:</span>
            <span class="license-value">{{ licenseInfo.type }}</span>
          </div>
          <div class="license-item">
            <span class="license-label">有效期至:</span>
            <span class="license-value">{{ licenseInfo.expiryDate }}</span>
          </div>
          <div class="license-item">
            <span class="license-label">用户数量限制:</span>
            <span class="license-value">{{ licenseInfo.userLimit }}</span>
          </div>
          <div class="license-item">
            <span class="license-label">项目数量限制:</span>
            <span class="license-value">{{ licenseInfo.projectLimit }}</span>
          </div>
          <div class="license-progress">
            <div class="progress-item">
              <span>用户使用率</span>
              <el-progress
                :percentage="licenseInfo.userUsagePercent"
                :status="licenseInfo.userUsagePercent > 80 ? 'warning' : 'success'"
                :show-text="false"
              />
              <span class="progress-text">{{ licenseInfo.currentUsers }}/{{ licenseInfo.userLimit }}</span>
            </div>
            <div class="progress-item">
              <span>项目使用率</span>
              <el-progress
                :percentage="licenseInfo.projectUsagePercent"
                :status="licenseInfo.projectUsagePercent > 80 ? 'warning' : 'success'"
                :show-text="false"
              />
              <span class="progress-text">{{ licenseInfo.currentProjects }}/{{ licenseInfo.projectLimit }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 高级配置对话框 -->
    <el-dialog
      v-model="advancedConfigVisible"
      title="高级配置"
      width="600px"
      :close-on-click-modal="false"
    >
      <div class="advanced-config-form">
        <el-form :model="advancedConfig" label-width="120px">
          <el-form-item label="系统ID">
            <el-input v-model="advancedConfig.systemId" placeholder="系统唯一标识" />
          </el-form-item>
          <el-form-item label="服务器地址">
            <el-input v-model="advancedConfig.serverUrl" placeholder="服务器访问地址" />
          </el-form-item>
          <el-form-item label="API端口">
            <el-input-number v-model="advancedConfig.apiPort" :min="1" :max="65535" />
          </el-form-item>
          <el-form-item label="数据库类型">
            <el-select v-model="advancedConfig.databaseType">
              <el-option label="MySQL" value="mysql" />
              <el-option label="PostgreSQL" value="postgresql" />
              <el-option label="Oracle" value="oracle" />
              <el-option label="SQL Server" value="sqlserver" />
            </el-select>
          </el-form-item>
          <el-form-item label="缓存类型">
            <el-select v-model="advancedConfig.cacheType">
              <el-option label="Redis" value="redis" />
              <el-option label="Memcached" value="memcached" />
              <el-option label="本地缓存" value="local" />
            </el-select>
          </el-form-item>
          <el-form-item label="日志级别">
            <el-select v-model="advancedConfig.logLevel">
              <el-option label="DEBUG" value="debug" />
              <el-option label="INFO" value="info" />
              <el-option label="WARN" value="warn" />
              <el-option label="ERROR" value="error" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="advancedConfigVisible = false">取消</el-button>
          <el-button type="primary" @click="saveAdvancedConfig">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import {
  Setting,
  Refresh,
  SuccessFilled,
  Clock,
  Monitor,
  Files
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getSystemInfo, checkSystemUpdate, updateSystemInfo } from '@/api/settings'

// 响应式数据
const isEditable = ref(false)
const advancedConfigVisible = ref(false)

const systemInfo = reactive({
  name: '接口自动化测试管理系统',
  version: 'V2.5.3',
  environment: 'production',
  deploymentMode: 'standalone',
  description: '专业的接口自动化测试管理平台，提供完整的测试流程管理和持续集成能力',
  techStack: [
    { name: 'Vue.js 3', type: '' },
    { name: 'Element Plus', type: 'info' },
    { name: 'Node.js', type: 'success' },
    { name: 'Spring Boot', type: 'warning' },
    { name: 'MySQL', type: '' },
    { name: 'Redis', type: 'danger' }
  ]
})

const systemStatus = reactive({
  running: true,
  uptime: 86400 * 7, // 7天
  cpuUsage: 35,
  memoryUsage: 62
})

const licenseInfo = reactive({
  type: '企业版',
  expiryDate: '2026-12-31',
  userLimit: 100,
  projectLimit: 50,
  currentUsers: 68,
  currentProjects: 32,
  userUsagePercent: 68,
  projectUsagePercent: 64
})

const advancedConfig = reactive({
  systemId: 'IATMS-2024-001',
  serverUrl: 'http://localhost:8080',
  apiPort: 8080,
  databaseType: 'mysql',
  cacheType: 'redis',
  logLevel: 'info'
})

// 方法
const formatUptime = (seconds) => {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${days}天 ${hours}小时 ${minutes}分钟`
}

const showAdvancedConfig = () => {
  advancedConfigVisible.value = true
}

const checkUpdate = async () => {
  try {
    const response = await checkSystemUpdate()
    if (response.data.hasUpdate) {
      ElMessage.info(`发现新版本: ${response.data.latestVersion}`)
    } else {
      ElMessage.success('当前已是最新版本')
    }
  } catch (error) {
    console.error('检查更新失败:', error)
    ElMessage.error('检查更新失败，请稍后重试')
  }
}

const saveAdvancedConfig = async () => {
  try {
    await updateSystemInfo(advancedConfig)
    ElMessage.success('高级配置保存成功')
    advancedConfigVisible.value = false
  } catch (error) {
    console.error('保存高级配置失败:', error)
    ElMessage.error('保存失败，请稍后重试')
  }
}

// 初始化数据
const loadSystemInfo = async () => {
  try {
    const response = await getSystemInfo()
    // 处理API返回的数据结构，支持多种可能的返回格式
    const data = response.data || {}

    // 如果API返回成功的数据结构
    if (data.systemInfo) {
      Object.assign(systemInfo, data.systemInfo)
    }
    if (data.systemStatus) {
      Object.assign(systemStatus, data.systemStatus)
    }
    if (data.licenseInfo) {
      Object.assign(licenseInfo, data.licenseInfo)
    }

    // 如果API直接返回系统信息（兼容旧格式）
    if (data.name || data.version) {
      Object.assign(systemInfo, data)
    }

  } catch (error) {
    console.error('获取系统信息失败:', error)
    // 使用默认数据，不显示错误提示
  }
}

onMounted(() => {
  loadSystemInfo()
})
</script>

<style scoped>
.system-info-config {
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

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-label {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
}

.version-display {
  display: flex;
  align-items: center;
  gap: 12px;
}

.version-text {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.tech-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.status-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.status-info {
  flex: 1;
}

.status-title {
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 4px;
}

.status-value {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.license-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.license-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.license-item:last-child {
  border-bottom: none;
}

.license-label {
  font-size: 14px;
  color: #606266;
}

.license-value {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.license-progress {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 16px;
}

.progress-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-item span:first-child {
  min-width: 80px;
  font-size: 14px;
  color: #606266;
}

.progress-text {
  font-size: 12px;
  color: #909399;
  margin-left: 8px;
}

.advanced-config-form {
  padding: 20px 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
