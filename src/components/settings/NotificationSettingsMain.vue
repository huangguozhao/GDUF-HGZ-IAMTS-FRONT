<template>
  <div class="notification-settings-main">
    <!-- 通知设置头部 -->
    <div class="settings-header">
      <h3 class="section-title">通知设置</h3>
      <p class="section-description">配置系统通知、邮件、短信等通知渠道和规则</p>
    </div>

    <!-- 通知设置标签页 -->
    <el-tabs v-model="activeTab" class="notification-tabs">
      <!-- 通知类型配置 -->
      <el-tab-pane label="通知类型" name="types">
        <NotificationTypesConfig
          :settings="notificationSettings"
          :loading="loading"
          @update="handleUpdateSettings"
        />
      </el-tab-pane>

      <!-- 通知模板 -->
      <el-tab-pane label="通知模板" name="templates">
        <NotificationTemplates
          :templates="templates"
          :loading="templatesLoading"
          @refresh="fetchTemplates"
          @edit="handleEditTemplate"
          @delete="handleDeleteTemplate"
        />
      </el-tab-pane>

      <!-- 通知规则 -->
      <el-tab-pane label="通知规则" name="rules">
        <NotificationRules
          :rules="rules"
          :loading="rulesLoading"
          @refresh="fetchRules"
          @edit="handleEditRule"
          @delete="handleDeleteRule"
          @toggle-status="handleToggleRuleStatus"
        />
      </el-tab-pane>

      <!-- 通知历史 -->
      <el-tab-pane label="通知历史" name="history">
        <NotificationHistory
          :history="notificationHistory"
          :loading="historyLoading"
          :pagination="historyPagination"
          @refresh="fetchNotificationHistory"
          @page-change="handleHistoryPageChange"
          @search="handleHistorySearch"
        />
      </el-tab-pane>
    </el-tabs>

    <!-- 编辑通知模板弹窗 -->
    <EditTemplateModal
      :visible="isEditTemplateModalVisible"
      :template="currentTemplate"
      :is-editing="isEditingTemplate"
      @close="closeEditTemplateModal"
      @submit="handleSubmitTemplate"
    />

    <!-- 编辑通知规则弹窗 -->
    <EditRuleModal
      :visible="isEditRuleModalVisible"
      :rule="currentRule"
      :is-editing="isEditingRule"
      @close="closeEditRuleModal"
      @submit="handleSubmitRule"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getNotificationSettings,
  updateNotificationSettings,
  getNotificationTemplates,
  createNotificationTemplate,
  updateNotificationTemplate,
  deleteNotificationTemplate,
  getNotificationRules,
  createNotificationRule,
  updateNotificationRule,
  deleteNotificationRule,
  toggleNotificationRuleStatus,
  getNotificationHistory
} from '@/api/settings'

// 导入子组件
import NotificationTypesConfig from './notification/NotificationTypesConfig.vue'
import NotificationTemplates from './notification/NotificationTemplates.vue'
import NotificationRules from './notification/NotificationRules.vue'
import NotificationHistory from './notification/NotificationHistory.vue'
import EditTemplateModal from './notification/EditTemplateModal.vue'
import EditRuleModal from './notification/EditRuleModal.vue'

// 当前活跃标签页
const activeTab = ref('types')

// 通知设置数据
const notificationSettings = reactive({
  emailEnabled: true,
  smsEnabled: false,
  systemEnabled: true,
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
  }
})

// 加载状态
const loading = ref(false)

// 通知模板相关
const templates = ref([])
const templatesLoading = ref(false)

// 通知规则相关
const rules = ref([])
const rulesLoading = ref(false)

// 通知历史相关
const notificationHistory = ref([])
const historyLoading = ref(false)
const historyPagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 模态框状态
const isEditTemplateModalVisible = ref(false)
const isEditRuleModalVisible = ref(false)
const isEditingTemplate = ref(false)
const isEditingRule = ref(false)
const currentTemplate = ref(null)
const currentRule = ref(null)

// 获取通知设置
const fetchNotificationSettings = async () => {
  loading.value = true
  try {
    const response = await getNotificationSettings()
    Object.assign(notificationSettings, response.data)
  } catch (error) {
    console.error('获取通知设置失败:', error)
    ElMessage.error('获取通知设置失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 更新通知设置
const handleUpdateSettings = async (settings) => {
  try {
    await updateNotificationSettings(settings)
    Object.assign(notificationSettings, settings)
    ElMessage.success('通知设置更新成功')
  } catch (error) {
    console.error('更新通知设置失败:', error)
    ElMessage.error('更新通知设置失败，请稍后重试')
  }
}

// 获取通知模板
const fetchTemplates = async () => {
  templatesLoading.value = true
  try {
    const response = await getNotificationTemplates()
    templates.value = response.data || []
  } catch (error) {
    console.error('获取通知模板失败:', error)
    ElMessage.error('获取通知模板失败，请稍后重试')
  } finally {
    templatesLoading.value = false
  }
}

// 获取通知规则
const fetchRules = async () => {
  rulesLoading.value = true
  try {
    const response = await getNotificationRules()
    rules.value = response.data || []
  } catch (error) {
    console.error('获取通知规则失败:', error)
    ElMessage.error('获取通知规则失败，请稍后重试')
  } finally {
    rulesLoading.value = false
  }
}

// 获取通知历史
const fetchNotificationHistory = async () => {
  historyLoading.value = true
  try {
    const params = {
      page: historyPagination.currentPage,
      pageSize: historyPagination.pageSize
    }
    const response = await getNotificationHistory(params)
    notificationHistory.value = response.data.items || []
    historyPagination.total = response.data.total || 0
  } catch (error) {
    console.error('获取通知历史失败:', error)
    ElMessage.error('获取通知历史失败，请稍后重试')
  } finally {
    historyLoading.value = false
  }
}

// 模板相关事件处理
const handleEditTemplate = (template) => {
  currentTemplate.value = template ? { ...template } : null
  isEditingTemplate.value = !!template
  isEditTemplateModalVisible.value = true
}

const closeEditTemplateModal = () => {
  isEditTemplateModalVisible.value = false
  currentTemplate.value = null
  isEditingTemplate.value = false
}

const handleSubmitTemplate = async (templateData) => {
  try {
    if (isEditingTemplate.value) {
      await updateNotificationTemplate(currentTemplate.value.id, templateData)
      ElMessage.success('模板更新成功')
    } else {
      await createNotificationTemplate(templateData)
      ElMessage.success('模板创建成功')
    }
    closeEditTemplateModal()
    await fetchTemplates()
  } catch (error) {
    console.error('保存模板失败:', error)
    ElMessage.error('保存模板失败，请稍后重试')
  }
}

const handleDeleteTemplate = async (template) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除模板"${template.name}"吗？此操作不可恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await deleteNotificationTemplate(template.id)
    ElMessage.success('模板删除成功')
    await fetchTemplates()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除模板失败:', error)
      ElMessage.error('删除模板失败，请稍后重试')
    }
  }
}

// 规则相关事件处理
const handleEditRule = (rule) => {
  currentRule.value = rule ? { ...rule } : null
  isEditingRule.value = !!rule
  isEditRuleModalVisible.value = true
}

const closeEditRuleModal = () => {
  isEditRuleModalVisible.value = false
  currentRule.value = null
  isEditingRule.value = false
}

const handleSubmitRule = async (ruleData) => {
  try {
    if (isEditingRule.value) {
      await updateNotificationRule(currentRule.value.id, ruleData)
      ElMessage.success('规则更新成功')
    } else {
      await createNotificationRule(ruleData)
      ElMessage.success('规则创建成功')
    }
    closeEditRuleModal()
    await fetchRules()
  } catch (error) {
    console.error('保存规则失败:', error)
    ElMessage.error('保存规则失败，请稍后重试')
  }
}

const handleDeleteRule = async (rule) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除规则"${rule.name}"吗？此操作不可恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await deleteNotificationRule(rule.id)
    ElMessage.success('规则删除成功')
    await fetchRules()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除规则失败:', error)
      ElMessage.error('删除规则失败，请稍后重试')
    }
  }
}

const handleToggleRuleStatus = async (rule) => {
  try {
    await toggleNotificationRuleStatus(rule.id, !rule.enabled)
    rule.enabled = !rule.enabled
    ElMessage.success('规则状态更新成功')
  } catch (error) {
    console.error('更新规则状态失败:', error)
    ElMessage.error('更新规则状态失败，请稍后重试')
  }
}

// 历史相关事件处理
const handleHistoryPageChange = (page) => {
  historyPagination.currentPage = page
  fetchNotificationHistory()
}

const handleHistorySearch = (searchParams) => {
  historyPagination.currentPage = 1
  fetchNotificationHistory()
}

// 组件挂载时加载数据
onMounted(() => {
  fetchNotificationSettings()
  if (activeTab.value === 'templates') {
    fetchTemplates()
  } else if (activeTab.value === 'rules') {
    fetchRules()
  } else if (activeTab.value === 'history') {
    fetchNotificationHistory()
  }
})
</script>

<style scoped>
.notification-settings-main {
  padding: 20px;
}

.settings-header {
  margin-bottom: 24px;
}

.section-title {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.section-description {
  margin: 0;
  font-size: 14px;
  color: #606266;
}

.notification-tabs {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
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

:deep(.el-tabs__content) {
  padding: 20px;
}
</style>
