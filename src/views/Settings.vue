<template>
  <div class="settings-container">
    <!-- 页面头部 -->
    <div class="settings-header">
      <div class="header-content">
        <div class="header-icon">
          <el-icon :size="32"><Setting /></el-icon>
        </div>
        <div class="header-text">
          <h1 class="header-title">系统设置</h1>
          <p class="header-description">管理系统基本配置、界面主题、安全设置等</p>
        </div>
      </div>
      <div class="header-actions">
        <el-button type="primary" :icon="Document" @click="handleSaveSettings" :loading="saving">
          保存设置
        </el-button>
        <el-button :icon="RefreshRight" @click="handleRestoreDefaults">
          恢复默认
        </el-button>
      </div>
    </div>

    <!-- 标签页 -->
    <el-tabs v-model="activeTab" class="settings-tabs" tab-position="left">
      <!-- 基本设置标签页 -->
      <el-tab-pane name="basic">
        <template #label>
          <div class="tab-label">
            <el-icon><House /></el-icon>
            <span>基本设置</span>
          </div>
        </template>
        <div class="tab-content">
          <!-- 系统信息 -->
          <div class="settings-section">
            <div class="section-header">
              <el-icon class="section-icon"><InfoFilled /></el-icon>
              <h3 class="section-title">系统信息</h3>
            </div>
            <div class="settings-card">
              <div class="settings-grid">
                <div class="setting-item">
                  <label class="setting-label">
                    <span class="label-text">系统名称</span>
                  </label>
                  <el-input v-model="basicSettings.systemName" placeholder="请输入系统名称" />
                </div>
                <div class="setting-item">
                  <label class="setting-label">部署模式</label>
                  <el-select v-model="basicSettings.deploymentMode" placeholder="请选择部署模式" style="width: 100%">
                    <el-option label="私有化部署" value="private" />
                    <el-option label="云端部署" value="cloud" />
                    <el-option label="混合部署" value="hybrid" />
                  </el-select>
                </div>
                <div class="setting-item">
                  <label class="setting-label">系统版本</label>
                  <div class="version-input">
                    <el-input v-model="basicSettings.systemVersion" placeholder="请输入系统版本" />
                    <el-button type="primary" plain @click="checkUpdate">检查更新</el-button>
                  </div>
                </div>
                <div class="setting-item">
                  <label class="setting-label">系统ID</label>
                  <el-input v-model="basicSettings.systemId" placeholder="请输入系统ID" />
                </div>
                <div class="setting-item full-width">
                  <label class="setting-label">系统描述</label>
                  <el-input
                    v-model="basicSettings.systemDescription"
                    type="textarea"
                    :rows="3"
                    placeholder="请输入系统描述"
                    show-word-limit
                    :maxlength="500"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- 界面设置 -->
          <div class="settings-section">
            <div class="section-header">
              <el-icon class="section-icon"><Brush /></el-icon>
              <h3 class="section-title">界面设置</h3>
            </div>
            <div class="settings-card">
              <div class="settings-grid">
                <div class="setting-item">
                  <label class="setting-label">主题色选择</label>
                  <div class="theme-colors">
                    <div 
                      v-for="color in themeColors" 
                      :key="color.value"
                      class="color-option"
                      :class="{ active: basicSettings.themeColor === color.value }"
                      @click="basicSettings.themeColor = color.value"
                    >
                      <div class="color-block" :style="{ backgroundColor: color.hex }"></div>
                      <span>{{ color.label }}</span>
                    </div>
                  </div>
                </div>
                <div class="setting-item">
                  <label class="setting-label">布局选项</label>
                  <div class="layout-options">
                    <div 
                      class="layout-preview"
                      :class="{ active: basicSettings.layout === 'sidebar' }"
                      @click="basicSettings.layout = 'sidebar'"
                    >
                      <div class="layout-icon">
                        <div class="layout-sidebar"></div>
                        <div class="layout-main"></div>
                      </div>
                      <span>侧边布局</span>
                    </div>
                    <div 
                      class="layout-preview"
                      :class="{ active: basicSettings.layout === 'top' }"
                      @click="basicSettings.layout = 'top'"
                    >
                      <div class="layout-icon">
                        <div class="layout-top"></div>
                        <div class="layout-main"></div>
                      </div>
                      <span>顶部布局</span>
                    </div>
                    <div 
                      class="layout-preview"
                      :class="{ active: basicSettings.layout === 'right' }"
                      @click="basicSettings.layout = 'right'"
                    >
                      <div class="layout-icon">
                        <div class="layout-main"></div>
                        <div class="layout-sidebar"></div>
                      </div>
                      <span>右侧布局</span>
                    </div>
                  </div>
                </div>
                <div class="setting-item">
                  <label class="setting-label">表格密度</label>
                  <el-radio-group v-model="basicSettings.tableDensity">
                    <el-radio-button label="compact">紧凑</el-radio-button>
                    <el-radio-button label="standard">标准</el-radio-button>
                    <el-radio-button label="loose">宽松</el-radio-button>
                  </el-radio-group>
                </div>
                <div class="setting-item">
                  <label class="setting-label">自定义主题色</label>
                  <div class="color-input">
                    <el-color-picker v-model="basicSettings.customColor" show-alpha />
                    <el-input v-model="basicSettings.customColor" placeholder="#409EFF" />
                  </div>
                </div>
                <div class="setting-item">
                  <label class="setting-label">语言设置</label>
                  <el-select v-model="basicSettings.language" placeholder="请选择语言" style="width: 100%">
                    <el-option label="简体中文" value="zh-CN" />
                    <el-option label="English" value="en-US" />
                    <el-option label="繁體中文" value="zh-TW" />
                  </el-select>
                </div>
                <div class="setting-item">
                  <label class="setting-label">主题模式</label>
                  <el-radio-group v-model="basicSettings.themeMode">
                    <el-radio-button label="light">浅色模式</el-radio-button>
                    <el-radio-button label="dark">深色模式</el-radio-button>
                    <el-radio-button label="auto">跟随系统</el-radio-button>
                  </el-radio-group>
                </div>
                <div class="setting-item">
                  <label class="setting-label">动画效果</label>
                  <el-switch v-model="basicSettings.animationEnabled" />
                </div>
              </div>
            </div>
          </div>

          <!-- 用户默认设置 -->
          <div class="settings-section">
            <div class="section-header">
              <el-icon class="section-icon"><User /></el-icon>
              <h3 class="section-title">用户默认设置</h3>
            </div>
            <div class="settings-card">
              <div class="settings-grid">
                <div class="setting-item">
                  <label class="setting-label">默认首页</label>
                  <el-select v-model="basicSettings.defaultHomepage" placeholder="请选择默认首页" style="width: 100%">
                    <el-option label="仪表盘" value="dashboard" />
                    <el-option label="用例管理" value="cases" />
                    <el-option label="报告中心" value="reports" />
                  </el-select>
                </div>
                <div class="setting-item">
                  <label class="setting-label">默认项目视图</label>
                  <el-select v-model="basicSettings.defaultProjectView" placeholder="请选择默认项目视图" style="width: 100%">
                    <el-option label="列表视图" value="list" />
                    <el-option label="卡片视图" value="card" />
                    <el-option label="树形视图" value="tree" />
                  </el-select>
                </div>
                <div class="setting-item">
                  <label class="setting-label">默认分页大小</label>
                  <el-select v-model="basicSettings.defaultPageSize" placeholder="请选择默认分页大小" style="width: 100%">
                    <el-option label="10条/页" :value="10" />
                    <el-option label="20条/页" :value="20" />
                    <el-option label="50条/页" :value="50" />
                  </el-select>
                </div>
                <div class="setting-item">
                  <label class="setting-label">时间格式</label>
                  <el-select v-model="basicSettings.timeFormat" placeholder="请选择时间格式" style="width: 100%">
                    <el-option label="YYYY-MM-DD HH:mm:ss" value="YYYY-MM-DD HH:mm:ss" />
                    <el-option label="MM/DD/YYYY HH:mm" value="MM/DD/YYYY HH:mm" />
                    <el-option label="DD/MM/YYYY HH:mm" value="DD/MM/YYYY HH:mm" />
                  </el-select>
                </div>
                <div class="setting-item full-width">
                  <div class="checkbox-group">
                    <el-checkbox v-model="basicSettings.autoSave">启用自动保存功能</el-checkbox>
                    <el-checkbox v-model="basicSettings.showWelcomePage">登录后显示欢迎页</el-checkbox>
                    <el-checkbox v-model="basicSettings.rememberTabs">记住上次打开的标签页</el-checkbox>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 安全设置 -->
          <div class="settings-section">
            <div class="section-header">
              <el-icon class="section-icon"><Lock /></el-icon>
              <h3 class="section-title">安全设置</h3>
            </div>
            <div class="settings-card">
              <div class="settings-grid">
                <div class="setting-item">
                  <label class="setting-label">密码策略</label>
                  <el-input v-model="basicSettings.passwordPolicy" readonly class="readonly-input" />
                </div>
                <div class="setting-item">
                  <label class="setting-label">登录IP限制</label>
                  <el-radio-group v-model="basicSettings.ipRestriction">
                    <el-radio-button label="off">关闭</el-radio-button>
                    <el-radio-button label="whitelist">配置白名单</el-radio-button>
                  </el-radio-group>
                </div>
                <div class="setting-item">
                  <label class="setting-label">会话超时</label>
                  <div class="number-input">
                    <el-input-number v-model="basicSettings.sessionTimeout" :min="5" :max="1440" />
                    <span class="unit">分钟</span>
                  </div>
                </div>
                <div class="setting-item">
                  <label class="setting-label">登录失败处理</label>
                  <div class="failure-handling">
                    <el-input-number v-model="basicSettings.maxFailures" :min="1" :max="10" />
                    <span class="desc">次失败后锁定</span>
                    <el-input-number v-model="basicSettings.lockoutDuration" :min="1" :max="1440" />
                    <span class="unit">分钟</span>
                  </div>
                </div>
                <div class="setting-item">
                  <label class="setting-label">双因素认证</label>
                  <el-switch v-model="basicSettings.twoFactorAuth" />
                </div>
              </div>
            </div>
          </div>

          <!-- 数据存储 -->
          <div class="settings-section">
            <div class="section-header">
              <el-icon class="section-icon"><Folder /></el-icon>
              <h3 class="section-title">数据存储</h3>
            </div>
            <div class="settings-card">
              <div class="settings-grid">
                <div class="setting-item">
                  <label class="setting-label">数据保留周期</label>
                  <el-input v-model="basicSettings.dataRetention" readonly class="readonly-input" />
                </div>
                <div class="setting-item">
                  <label class="setting-label">备份策略</label>
                  <el-select v-model="basicSettings.backupStrategy" placeholder="请选择备份策略" style="width: 100%">
                    <el-option label="每日备份" value="daily" />
                    <el-option label="每周备份" value="weekly" />
                    <el-option label="每月备份" value="monthly" />
                  </el-select>
                </div>
                <div class="setting-item">
                  <label class="setting-label">日志级别</label>
                  <el-select v-model="basicSettings.logLevel" placeholder="请选择日志级别" style="width: 100%">
                    <el-option label="详细 (Debug)" value="debug" />
                    <el-option label="信息 (Info)" value="info" />
                    <el-option label="警告 (Warn)" value="warn" />
                    <el-option label="错误 (Error)" value="error" />
                  </el-select>
                </div>
                <div class="setting-item">
                  <label class="setting-label">日志存储路径</label>
                  <el-input v-model="basicSettings.logPath" placeholder="/var/log/apiops/" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 通知设置标签页 -->
      <el-tab-pane name="notification">
        <template #label>
          <div class="tab-label">
            <el-icon><Bell /></el-icon>
            <span>通知设置</span>
          </div>
        </template>
        <NotificationSettingsMain />
      </el-tab-pane>

      <!-- 集成管理标签页 -->
      <el-tab-pane name="integration">
        <template #label>
          <div class="tab-label">
            <el-icon><Connection /></el-icon>
            <span>集成管理</span>
          </div>
        </template>
        <div class="tab-content">
          <IntegrationManagementMain
            :settings="integrationSettings"
            :loading="integrationLoading"
            @update="handleIntegrationUpdate"
          />
        </div>
      </el-tab-pane>
    </el-tabs>

  </div>
</template>

<script setup>
import { ref, reactive, onMounted, defineAsyncComponent } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  RefreshRight,
  Document,
  Setting,
  House,
  InfoFilled,
  Brush,
  User,
  Lock,
  Folder,
  Bell,
  Connection
} from '@element-plus/icons-vue'
import {
  getBasicSettings,
  updateBasicSettings,
  getIntegrationSettings
} from '../api/settings'

// 懒加载设置组件
const NotificationSettingsMain = defineAsyncComponent(() =>
  import('../components/settings/NotificationSettingsMain.vue')
)
const IntegrationManagementMain = defineAsyncComponent(() =>
  import('../components/settings/IntegrationManagementMain.vue')
)

// 当前标签页
const activeTab = ref('basic')
const saving = ref(false)

// 主题色选项 - 使用系统蓝色风格
const themeColors = [
  { value: 'blue', label: '蓝色', hex: '#409EFF' },
  { value: 'green', label: '绿色', hex: '#67C23A' },
  { value: 'purple', label: '紫色', hex: '#9C27B0' },
  { value: 'orange', label: '橙色', hex: '#E6A23C' }
]

// 基本设置
const basicSettings = reactive({
  systemName: '接口自动化管理系统',
  deploymentMode: 'private',
  systemVersion: 'V2.5.3',
  systemId: 'API-OPS-202405-1234',
  systemDescription: '接口自动化管理系统是一个高效的API测试和管理工具，支持多种API类型，提供完整的测试流程管理和持续集成功能。',
  themeColor: 'blue',
  layout: 'sidebar',
  tableDensity: 'standard',
  customColor: '#409EFF',
  language: 'zh-CN',
  themeMode: 'light',
  animationEnabled: true,
  defaultHomepage: 'dashboard',
  defaultProjectView: 'list',
  defaultPageSize: 10,
  timeFormat: 'YYYY-MM-DD HH:mm:ss',
  autoSave: true,
  showWelcomePage: true,
  rememberTabs: true,
  passwordPolicy: '高强度 (至少8位,包含大小写字母、数字和特殊字符)',
  ipRestriction: 'off',
  sessionTimeout: 30,
  maxFailures: 5,
  lockoutDuration: 30,
  twoFactorAuth: true,
  dataRetention: '30天',
  backupStrategy: 'daily',
  logLevel: 'debug',
  logPath: '/var/log/apiops/'
})

// 集成管理设置
const integrationSettings = reactive({})
const integrationLoading = ref(false)

// 获取集成设置
const fetchIntegrationSettings = async () => {
  integrationLoading.value = true
  try {
    const response = await getIntegrationSettings()
    Object.assign(integrationSettings, response.data || {})
  } catch (error) {
    console.error('获取集成设置失败:', error)
  } finally {
    integrationLoading.value = false
  }
}

// 处理集成设置更新
const handleIntegrationUpdate = (newSettings) => {
  Object.assign(integrationSettings, newSettings)
}

// 获取基本设置
const fetchBasicSettings = async () => {
  try {
    const response = await getBasicSettings()
    if (response.data) {
      Object.assign(basicSettings, response.data)
    }
  } catch (error) {
    console.error('获取基本设置失败:', error)
  }
}

// 检查更新
const checkUpdate = () => {
  ElMessage.info('当前已是最新版本')
}

// 保存设置
const handleSaveSettings = async () => {
  saving.value = true
  try {
    await updateBasicSettings(basicSettings)
    ElMessage.success('设置保存成功')
  } catch (error) {
    console.error('保存设置失败:', error)
    ElMessage.error('保存设置失败，请稍后重试')
  } finally {
    saving.value = false
  }
}

// 恢复默认设置
const handleRestoreDefaults = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要恢复默认设置吗？这将覆盖当前的所有设置。',
      '恢复默认确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 重置为默认值
    Object.assign(basicSettings, {
      systemName: '接口自动化管理系统',
      deploymentMode: 'private',
      systemVersion: 'V2.5.3',
      systemId: 'API-OPS-202405-1234',
      systemDescription: '接口自动化管理系统是一个高效的API测试和管理工具',
      themeColor: 'blue',
      layout: 'sidebar',
      tableDensity: 'standard',
      customColor: '#409EFF',
      language: 'zh-CN',
      themeMode: 'light',
      animationEnabled: true,
      defaultHomepage: 'dashboard',
      defaultProjectView: 'list',
      defaultPageSize: 10,
      timeFormat: 'YYYY-MM-DD HH:mm:ss',
      autoSave: true,
      showWelcomePage: true,
      rememberTabs: true,
      ipRestriction: 'off',
      sessionTimeout: 30,
      maxFailures: 5,
      lockoutDuration: 30,
      twoFactorAuth: true,
      dataRetention: '30天',
      backupStrategy: 'daily',
      logLevel: 'debug',
      logPath: '/var/log/apiops/'
    })
    
    ElMessage.success('已恢复默认设置')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('恢复默认设置失败:', error)
      ElMessage.error('恢复默认设置失败，请稍后重试')
    }
  }
}

// 组件挂载时加载数据
onMounted(() => {
  fetchBasicSettings()
  fetchIntegrationSettings()
})
</script>

<style scoped>
.settings-container {
  padding: 0;
  background-color: #f0f2f5;
  min-height: 100vh;
}

/* 页面头部 - 使用蓝色渐变 */
.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 28px;
  background: linear-gradient(135deg, #1890ff 0%, #36cfc9 100%);
  color: white;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.header-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.header-description {
  margin: 4px 0 0;
  font-size: 14px;
  opacity: 0.9;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.header-actions .el-button {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
}

.header-actions .el-button:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* 标签页样式 */
.settings-tabs {
  margin: 0 28px 28px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.settings-tabs :deep(.el-tabs__header) {
  margin: 0;
  background: #fafafa;
}

.settings-tabs :deep(.el-tabs__nav-wrap) {
  padding: 12px 0;
}

.settings-tabs :deep(.el-tabs__item) {
  height: 48px;
  padding: 0 24px;
  line-height: 48px;
  font-size: 14px;
}

.settings-tabs :deep(.el-tabs__item.is-active) {
  background: linear-gradient(90deg, rgba(24, 144, 255, 0.1) 0%, transparent 100%);
  border-right: 3px solid #1890ff;
  color: #1890ff;
  font-weight: 500;
}

.settings-tabs :deep(.el-tabs__content) {
  padding: 0;
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 内容区域 */
.tab-content {
  padding: 24px;
}

.settings-section {
  margin-bottom: 24px;
}

.settings-section:last-child {
  margin-bottom: 0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.section-icon {
  font-size: 20px;
  color: #1890ff;
}

.section-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f1f1f;
}

/* 卡片样式 - 与Personnel.vue一致 */
.settings-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
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
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #595959;
}

/* 主题色选项 */
.theme-colors {
  display: flex;
  gap: 12px;
}

.color-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border: 2px solid transparent;
}

.color-option:hover {
  background: #f5f5f5;
}

.color-option.active {
  border-color: #1890ff;
  background: rgba(24, 144, 255, 0.1);
}

.color-block {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.color-option span {
  font-size: 12px;
  color: #595959;
}

/* 布局选项 */
.layout-options {
  display: flex;
  gap: 16px;
}

.layout-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border: 2px solid #e8e8e8;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.layout-preview:hover {
  border-color: #1890ff;
}

.layout-preview.active {
  border-color: #1890ff;
  background: rgba(24, 144, 255, 0.05);
}

.layout-icon {
  display: flex;
  width: 60px;
  height: 40px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  overflow: hidden;
}

.layout-sidebar,
.layout-top {
  background: linear-gradient(135deg, #1890ff 0%, #36cfc9 100%);
  flex-shrink: 0;
}

.layout-sidebar {
  width: 20px;
}

.layout-top {
  width: 100%;
  height: 12px;
}

.layout-main {
  flex: 1;
  background: #fff;
}

.layout-preview span {
  font-size: 12px;
  color: #595959;
}

/* 颜色输入 */
.color-input {
  display: flex;
  gap: 12px;
  align-items: center;
}

.color-input .el-input {
  flex: 1;
}

/* 版本输入 */
.version-input {
  display: flex;
  gap: 10px;
}

.version-input .el-input {
  flex: 1;
}

/* 只读输入 */
.readonly-input :deep(.el-input__wrapper) {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

/* 数字输入 */
.number-input {
  display: flex;
  align-items: center;
  gap: 8px;
}

.number-input .unit {
  font-size: 14px;
  color: #8c8c8c;
}

/* 失败处理 */
.failure-handling {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.failure-handling .desc {
  font-size: 14px;
  color: #8c8c8c;
}

/* 复选框组 */
.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.checkbox-group .el-checkbox {
  margin-right: 0;
}

/* 响应式 */
@media (max-width: 768px) {
  .settings-header {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .header-content {
    flex-direction: column;
  }
  
  .settings-grid {
    grid-template-columns: 1fr;
  }
  
  .theme-colors {
    flex-wrap: wrap;
  }
  
  .layout-options {
    flex-wrap: wrap;
  }
  
  .settings-tabs :deep(.el-tabs__header) {
    width: 100%;
  }
}
</style>
