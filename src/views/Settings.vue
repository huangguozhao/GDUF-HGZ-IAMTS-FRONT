<template>
  <div class="settings-container">
    <!-- 面包屑导航 -->
    <div class="breadcrumb">
      <span class="breadcrumb-item">首页</span>
      <span class="breadcrumb-separator">></span>
      <span class="breadcrumb-item active">系统设置</span>
    </div>

    <!-- 标签页 -->
    <el-tabs v-model="activeTab" class="settings-tabs">
      <!-- 基本设置标签页 -->
      <el-tab-pane label="基本设置" name="basic">
        <div class="tab-content">
          <!-- 系统信息 -->
          <div class="settings-section">
            <h3 class="section-title">系统信息</h3>
            <div class="settings-grid">
              <div class="setting-item">
                <label class="setting-label">系统名称</label>
                <el-input v-model="basicSettings.systemName" placeholder="请输入系统名称" />
              </div>
              <div class="setting-item">
                <label class="setting-label">部署模式</label>
                <el-select v-model="basicSettings.deploymentMode" placeholder="请选择部署模式">
                  <el-option label="私有化部署" value="private" />
                  <el-option label="云端部署" value="cloud" />
                  <el-option label="混合部署" value="hybrid" />
                </el-select>
              </div>
              <div class="setting-item">
                <label class="setting-label">系统版本</label>
                <div class="version-input">
                  <el-input v-model="basicSettings.systemVersion" placeholder="请输入系统版本" />
                  <el-button type="primary" :icon="Refresh">检查更新</el-button>
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
                  :rows="4"
                  placeholder="请输入系统描述"
                />
              </div>
            </div>
          </div>

          <!-- 界面设置 -->
          <div class="settings-section">
            <h3 class="section-title">界面设置</h3>
            <div class="settings-grid">
              <div class="setting-item">
                <label class="setting-label">主题色选择</label>
                <el-radio-group v-model="basicSettings.themeColor">
                  <el-radio label="blue">蓝色 (默认)</el-radio>
                  <el-radio label="green">绿色</el-radio>
                  <el-radio label="purple">紫色</el-radio>
                  <el-radio label="orange">橙色</el-radio>
                </el-radio-group>
              </div>
              <div class="setting-item">
                <label class="setting-label">布局选项</label>
                <div class="layout-options">
                  <div 
                    class="layout-preview"
                    :class="{ active: basicSettings.layout === 'sidebar' }"
                    @click="basicSettings.layout = 'sidebar'"
                  >
                    <div class="layout-sidebar"></div>
                    <div class="layout-main"></div>
                    <span>侧边布局</span>
                  </div>
                  <div 
                    class="layout-preview"
                    :class="{ active: basicSettings.layout === 'top' }"
                    @click="basicSettings.layout = 'top'"
                  >
                    <div class="layout-top"></div>
                    <div class="layout-main"></div>
                    <span>顶部布局</span>
                  </div>
                  <div 
                    class="layout-preview"
                    :class="{ active: basicSettings.layout === 'right' }"
                    @click="basicSettings.layout = 'right'"
                  >
                    <div class="layout-main"></div>
                    <div class="layout-sidebar"></div>
                    <span>右侧布局</span>
                  </div>
                </div>
              </div>
              <div class="setting-item">
                <label class="setting-label">表格密度</label>
                <el-radio-group v-model="basicSettings.tableDensity">
                  <el-radio label="compact">紧凑</el-radio>
                  <el-radio label="standard">标准</el-radio>
                  <el-radio label="loose">宽松</el-radio>
                </el-radio-group>
              </div>
              <div class="setting-item">
                <label class="setting-label">自定义主题色</label>
                <div class="color-input">
                  <el-input v-model="basicSettings.customColor" placeholder="#2C6FD1" />
                  <div class="color-picker" :style="{ backgroundColor: basicSettings.customColor }"></div>
                </div>
              </div>
              <div class="setting-item">
                <label class="setting-label">语言设置</label>
                <el-select v-model="basicSettings.language" placeholder="请选择语言">
                  <el-option label="简体中文" value="zh-CN" />
                  <el-option label="English" value="en-US" />
                  <el-option label="繁體中文" value="zh-TW" />
                </el-select>
              </div>
              <div class="setting-item">
                <label class="setting-label">主题模式</label>
                <el-radio-group v-model="basicSettings.themeMode">
                  <el-radio label="light">浅色模式</el-radio>
                  <el-radio label="dark">深色模式</el-radio>
                  <el-radio label="auto">跟随系统</el-radio>
                </el-radio-group>
              </div>
              <div class="setting-item">
                <label class="setting-label">动画效果</label>
                <el-switch v-model="basicSettings.animationEnabled" />
              </div>
            </div>
          </div>

          <!-- 用户默认设置 -->
          <div class="settings-section">
            <h3 class="section-title">用户默认设置</h3>
            <div class="settings-grid">
              <div class="setting-item">
                <label class="setting-label">默认首页</label>
                <el-select v-model="basicSettings.defaultHomepage" placeholder="请选择默认首页">
                  <el-option label="仪表盘" value="dashboard" />
                  <el-option label="用例管理" value="cases" />
                  <el-option label="报告中心" value="reports" />
                </el-select>
              </div>
              <div class="setting-item">
                <label class="setting-label">默认项目视图</label>
                <el-select v-model="basicSettings.defaultProjectView" placeholder="请选择默认项目视图">
                  <el-option label="列表视图" value="list" />
                  <el-option label="卡片视图" value="card" />
                  <el-option label="树形视图" value="tree" />
                </el-select>
              </div>
              <div class="setting-item">
                <label class="setting-label">默认分页大小</label>
                <el-select v-model="basicSettings.defaultPageSize" placeholder="请选择默认分页大小">
                  <el-option label="10条/页" value="10" />
                  <el-option label="20条/页" value="20" />
                  <el-option label="50条/页" value="50" />
                </el-select>
              </div>
              <div class="setting-item">
                <label class="setting-label">时间格式</label>
                <el-select v-model="basicSettings.timeFormat" placeholder="请选择时间格式">
                  <el-option label="YYYY-MM-DD HH:mm:ss" value="YYYY-MM-DD HH:mm:ss" />
                  <el-option label="MM/DD/YYYY HH:mm" value="MM/DD/YYYY HH:mm" />
                  <el-option label="DD/MM/YYYY HH:mm" value="DD/MM/YYYY HH:mm" />
                </el-select>
              </div>
              <div class="setting-item full-width">
                <div class="checkbox-group">
                  <el-checkbox v-model="basicSettings.autoSave">启用自动保存功能 (每5分钟)</el-checkbox>
                  <el-checkbox v-model="basicSettings.showWelcomePage">登录后显示欢迎页</el-checkbox>
                  <el-checkbox v-model="basicSettings.rememberTabs">记住上次打开的标签页</el-checkbox>
                </div>
              </div>
            </div>
          </div>

          <!-- 安全设置 -->
          <div class="settings-section">
            <h3 class="section-title">安全设置</h3>
            <div class="settings-grid">
              <div class="setting-item">
                <label class="setting-label">密码策略</label>
                <el-input 
                  v-model="basicSettings.passwordPolicy" 
                  placeholder="高强度 (至少8位,包含大小写字母、数字和特殊字符)"
                  readonly
                />
              </div>
              <div class="setting-item">
                <label class="setting-label">登录IP限制</label>
                <el-radio-group v-model="basicSettings.ipRestriction">
                  <el-radio label="off">关闭</el-radio>
                  <el-radio label="whitelist">配置白名单</el-radio>
                </el-radio-group>
              </div>
              <div class="setting-item">
                <label class="setting-label">会话超时 (分钟)</label>
                <el-input-number v-model="basicSettings.sessionTimeout" :min="5" :max="1440" />
              </div>
              <div class="setting-item">
                <label class="setting-label">登录失败处理</label>
                <div class="failure-handling">
                  <el-input-number v-model="basicSettings.maxFailures" :min="1" :max="10" />
                  <span>次失败后,锁定账户</span>
                  <el-input-number v-model="basicSettings.lockoutDuration" :min="1" :max="1440" />
                  <span>分钟</span>
                </div>
              </div>
              <div class="setting-item">
                <label class="setting-label">双因素认证</label>
                <el-switch v-model="basicSettings.twoFactorAuth" />
              </div>
            </div>
          </div>

          <!-- 数据存储 -->
          <div class="settings-section">
            <h3 class="section-title">数据存储</h3>
            <div class="settings-grid">
              <div class="setting-item">
                <label class="setting-label">数据保留周期</label>
                <el-input v-model="basicSettings.dataRetention" placeholder="30天" readonly />
              </div>
              <div class="setting-item">
                <label class="setting-label">备份策略</label>
                <el-select v-model="basicSettings.backupStrategy" placeholder="请选择备份策略">
                  <el-option label="每日备份" value="daily" />
                  <el-option label="每周备份" value="weekly" />
                  <el-option label="每月备份" value="monthly" />
                </el-select>
              </div>
              <div class="setting-item">
                <label class="setting-label">日志级别</label>
                <el-select v-model="basicSettings.logLevel" placeholder="请选择日志级别">
                  <el-option label="详细 (Debug)" value="debug" />
                  <el-option label="信息 (Info)" value="info" />
                  <el-option label="警告 (Warn)" value="warn" />
                  <el-option label="错误 (Error)" value="error" />
                </el-select>
              </div>
              <div class="setting-item">
                <label class="setting-label">日志存储路径</label>
                <div class="path-input">
                  <el-input v-model="basicSettings.logPath" placeholder="/var/log/apiops/" />
                  <el-button :icon="FolderOpened">浏览</el-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- 系统配置标签页 -->
      <el-tab-pane label="系统配置" name="system">
        <div class="tab-content">
          <!-- 系统配置说明 -->
          <el-alert
            title="关于系统配置"
            type="info"
            :closable="false"
            class="config-alert"
          >
            <template #default>
              系统配置用于管理整个系统的基础设置，包括系统名称、数据备份策略、文件上传限制等。这些设置会影响系统的整体运行和用户体验。
            </template>
          </el-alert>

          <!-- 配置列表 -->
          <div class="config-section">
            <div class="config-header">
              <h3>配置列表</h3>
              <el-button type="primary" :icon="Plus" @click="showAddConfigDialog">
                添加配置
              </el-button>
            </div>

            <el-table :data="configList" class="config-table">
              <el-table-column prop="name" label="配置项" width="200" />
              <el-table-column prop="value" label="当前值" />
              <el-table-column label="操作" width="150">
                <template #default="scope">
                  <el-button 
                    link 
                    type="primary" 
                    :icon="Edit"
                    @click="handleEditConfig(scope.row)"
                  >
                    编辑
                  </el-button>
                  <el-button 
                    link 
                    type="danger" 
                    :icon="Delete"
                    @click="handleDeleteConfig(scope.row)"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </el-tab-pane>

      <!-- 权限设置标签页 -->
      <el-tab-pane label="权限设置" name="permission">
        <div class="tab-content">
          <div class="permission-section">
            <h3>权限设置</h3>
            <p>这里将显示权限设置相关功能</p>
            <!-- TODO: 实现权限设置功能 -->
          </div>
        </div>
      </el-tab-pane>

      <!-- 通知设置标签页 -->
      <el-tab-pane label="通知设置" name="notification">
        <div class="tab-content">
          <div class="notification-section">
            <h3>通知设置</h3>
            <p>这里将显示通知设置相关功能</p>
            <!-- TODO: 实现通知设置功能 -->
          </div>
        </div>
      </el-tab-pane>

      <!-- 集成管理标签页 -->
      <el-tab-pane label="集成管理" name="integration">
        <div class="tab-content">
          <div class="integration-section">
            <h3>集成管理</h3>
            <p>这里将显示集成管理相关功能</p>
            <!-- TODO: 实现集成管理功能 -->
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 底部操作按钮 -->
    <div class="action-buttons">
      <el-button type="primary" :icon="Document" @click="handleSaveSettings">
        保存设置
      </el-button>
      <el-button :icon="Refresh" @click="handleRestoreDefaults">
        恢复默认
      </el-button>
    </div>

    <!-- 添加配置对话框 -->
    <el-dialog
      v-model="addConfigDialogVisible"
      title="添加配置"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="addConfigFormRef"
        :model="addConfigForm"
        :rules="addConfigRules"
        label-width="100px"
      >
        <el-form-item label="配置项" prop="name">
          <el-input v-model="addConfigForm.name" placeholder="请输入配置项名称" />
        </el-form-item>
        <el-form-item label="配置值" prop="value">
          <el-input v-model="addConfigForm.value" placeholder="请输入配置值" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input 
            v-model="addConfigForm.description" 
            type="textarea" 
            :rows="3"
            placeholder="请输入配置描述"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="addConfigDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleAddConfig">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 编辑配置对话框 -->
    <el-dialog
      v-model="editConfigDialogVisible"
      title="编辑配置"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="editConfigFormRef"
        :model="editConfigForm"
        :rules="editConfigRules"
        label-width="100px"
      >
        <el-form-item label="配置项" prop="name">
          <el-input v-model="editConfigForm.name" placeholder="请输入配置项名称" />
        </el-form-item>
        <el-form-item label="配置值" prop="value">
          <el-input v-model="editConfigForm.value" placeholder="请输入配置值" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input 
            v-model="editConfigForm.description" 
            type="textarea" 
            :rows="3"
            placeholder="请输入配置描述"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editConfigDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleUpdateConfig">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Refresh,
  Plus,
  Edit,
  Delete,
  Document,
  FolderOpened
} from '@element-plus/icons-vue'
import { 
  getBasicSettings, 
  updateBasicSettings, 
  getSystemConfigs, 
  addSystemConfig, 
  updateSystemConfig, 
  deleteSystemConfig 
} from '../api/settings'

// 当前标签页
const activeTab = ref('basic')

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
  customColor: '#2C6FD1',
  language: 'zh-CN',
  themeMode: 'light',
  animationEnabled: true,
  defaultHomepage: 'dashboard',
  defaultProjectView: 'list',
  defaultPageSize: '10',
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

// 系统配置
const configList = ref([])

// 添加配置对话框
const addConfigDialogVisible = ref(false)
const addConfigFormRef = ref()
const addConfigForm = reactive({
  name: '',
  value: '',
  description: ''
})

const addConfigRules = {
  name: [
    { required: true, message: '请输入配置项名称', trigger: 'blur' }
  ],
  value: [
    { required: true, message: '请输入配置值', trigger: 'blur' }
  ]
}

// 编辑配置对话框
const editConfigDialogVisible = ref(false)
const editConfigFormRef = ref()
const editConfigForm = reactive({
  id: '',
  name: '',
  value: '',
  description: ''
})

const editConfigRules = {
  name: [
    { required: true, message: '请输入配置项名称', trigger: 'blur' }
  ],
  value: [
    { required: true, message: '请输入配置值', trigger: 'blur' }
  ]
}

// 获取基本设置
const fetchBasicSettings = async () => {
  try {
    const response = await getBasicSettings()
    Object.assign(basicSettings, response.data)
  } catch (error) {
    console.error('获取基本设置失败:', error)
    // 使用默认设置
  }
}

// 获取系统配置
const fetchSystemConfigs = async () => {
  try {
    const response = await getSystemConfigs()
    configList.value = response.data || []
  } catch (error) {
    console.error('获取系统配置失败:', error)
    // 使用模拟数据
    configList.value = getMockConfigData()
  }
}

// 模拟配置数据
const getMockConfigData = () => {
  return [
    {
      id: 1,
      name: '系统名称',
      value: '企业管理系统V2.0',
      description: '系统显示名称'
    },
    {
      id: 2,
      name: '系统语言',
      value: '简体中文',
      description: '系统界面语言'
    },
    {
      id: 3,
      name: '数据备份周期',
      value: '每日',
      description: '数据备份频率'
    },
    {
      id: 4,
      name: '最大文件上传大小',
      value: '50 MB',
      description: '单个文件上传大小限制'
    },
    {
      id: 5,
      name: '允许的文件类型',
      value: '.jpg, .png, .pdf, .doc, .xls',
      description: '允许上传的文件格式'
    },
    {
      id: 6,
      name: '账号闲置锁定时间',
      value: '30分钟',
      description: '用户无操作后锁定时间'
    },
    {
      id: 7,
      name: '密码过期时间',
      value: '90天',
      description: '用户密码有效期'
    }
  ]
}

// 保存设置
const handleSaveSettings = async () => {
  try {
    await updateBasicSettings(basicSettings)
    ElMessage.success('设置保存成功')
  } catch (error) {
    console.error('保存设置失败:', error)
    ElMessage.error('保存设置失败，请稍后重试')
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
      themeColor: 'blue',
      layout: 'sidebar',
      tableDensity: 'standard',
      customColor: '#2C6FD1',
      language: 'zh-CN',
      themeMode: 'light',
      animationEnabled: true,
      defaultHomepage: 'dashboard',
      defaultProjectView: 'list',
      defaultPageSize: '10',
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

// 显示添加配置对话框
const showAddConfigDialog = () => {
  addConfigDialogVisible.value = true
  Object.assign(addConfigForm, {
    name: '',
    value: '',
    description: ''
  })
}

// 添加配置
const handleAddConfig = async () => {
  try {
    await addConfigFormRef.value.validate()
    
    await addSystemConfig(addConfigForm)
    ElMessage.success('配置添加成功')
    addConfigDialogVisible.value = false
    fetchSystemConfigs()
  } catch (error) {
    console.error('添加配置失败:', error)
    ElMessage.error('添加配置失败，请稍后重试')
  }
}

// 编辑配置
const handleEditConfig = (config) => {
  editConfigDialogVisible.value = true
  Object.assign(editConfigForm, {
    id: config.id,
    name: config.name,
    value: config.value,
    description: config.description
  })
}

// 更新配置
const handleUpdateConfig = async () => {
  try {
    await editConfigFormRef.value.validate()
    
    await updateSystemConfig(editConfigForm.id, editConfigForm)
    ElMessage.success('配置更新成功')
    editConfigDialogVisible.value = false
    fetchSystemConfigs()
  } catch (error) {
    console.error('更新配置失败:', error)
    ElMessage.error('更新配置失败，请稍后重试')
  }
}

// 删除配置
const handleDeleteConfig = async (config) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除配置"${config.name}"吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await deleteSystemConfig(config.id)
    ElMessage.success('配置删除成功')
    fetchSystemConfigs()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除配置失败:', error)
      ElMessage.error('删除配置失败，请稍后重试')
    }
  }
}

// 组件挂载时加载数据
onMounted(() => {
  fetchBasicSettings()
  fetchSystemConfigs()
})
</script>

<style scoped>
.settings-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100%;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 14px;
}

.breadcrumb-item {
  color: #606266;
}

.breadcrumb-item.active {
  color: #303133;
  font-weight: 500;
}

.breadcrumb-separator {
  color: #c0c4cc;
}

.settings-tabs {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
}

.tab-content {
  padding: 20px;
}

.settings-section {
  margin-bottom: 32px;
}

.section-title {
  margin: 0 0 20px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  padding-bottom: 8px;
  border-bottom: 2px solid #409eff;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
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

.version-input {
  display: flex;
  gap: 8px;
}

.color-input {
  display: flex;
  gap: 8px;
  align-items: center;
}

.color-picker {
  width: 40px;
  height: 32px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
}

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
  border: 2px solid #e4e7ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.layout-preview:hover {
  border-color: #409eff;
}

.layout-preview.active {
  border-color: #409eff;
  background: #f0f9ff;
}

.layout-preview > div {
  width: 60px;
  height: 40px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

.layout-sidebar {
  background: #f5f7fa;
}

.layout-top {
  background: #f5f7fa;
}

.layout-main {
  background: #fff;
}

.layout-preview span {
  font-size: 12px;
  color: #606266;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.failure-handling {
  display: flex;
  align-items: center;
  gap: 8px;
}

.path-input {
  display: flex;
  gap: 8px;
}

.config-alert {
  margin-bottom: 24px;
}

.config-section {
  margin-bottom: 24px;
}

.config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.config-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.config-table {
  margin-bottom: 20px;
}

.permission-section,
.notification-section,
.integration-section {
  padding: 40px;
  text-align: center;
  color: #909399;
}

.permission-section h3,
.notification-section h3,
.integration-section h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  color: #606266;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
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

:deep(.el-table th) {
  background: #f5f7fa;
  color: #606266;
  font-weight: 500;
}

:deep(.el-table td) {
  padding: 16px 0;
}

:deep(.el-input-number) {
  width: 100px;
}

:deep(.el-switch) {
  margin-top: 4px;
}
</style>
