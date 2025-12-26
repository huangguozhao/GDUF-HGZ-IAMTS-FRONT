<template>
  <div class="permission-settings-main">
    <!-- 权限设置说明 -->
    <el-alert
      title="关于权限设置"
      type="info"
      :closable="false"
      class="permission-alert"
    >
      <template #default>
        权限设置用于管理系统中的用户角色、权限分配和访问控制。包括角色管理、权限分配、用户权限管理等功能，确保系统安全和用户体验。
      </template>
    </el-alert>

    <!-- 权限设置标签页 -->
    <div class="permission-tabs">
      <el-tabs v-model="activePermissionTab" @tab-click="handleTabChange">
        <!-- 角色管理 -->
        <el-tab-pane label="角色管理" name="role-management">
          <RoleManagementTab
            :roleList="roleList"
            :loading="loading"
            :pagination="pagination"
            :deletingIds="deletingIds"
            @edit="openEditRoleModal"
            @delete="handleDeleteRole"
            @page-change="handlePageChange"
          />
        </el-tab-pane>

        <!-- 权限分配 -->
        <el-tab-pane label="权限分配" name="permission-assignment">
          <PermissionAssignmentTab
            :roleList="roleList"
            :permissionTree="permissionTree"
            :loading="loading"
            @role-permission-change="handleRolePermissionChange"
          />
        </el-tab-pane>

        <!-- 用户权限管理 -->
        <el-tab-pane label="用户权限管理" name="user-permission">
          <UserPermissionTab
            :userList="userList"
            :roleList="roleList"
            :loading="loading"
            :pagination="pagination"
            @user-role-change="handleUserRoleChange"
            @page-change="handleUserPageChange"
          />
        </el-tab-pane>

        <!-- 权限日志 -->
        <el-tab-pane label="权限日志" name="permission-logs">
          <PermissionLogsTab
            :logList="logList"
            :loading="loading"
            :pagination="pagination"
            @page-change="handleLogPageChange"
            @filter-change="handleLogFilterChange"
          />
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 角色创建/编辑模态框 -->
    <CreateEditRoleModal
      :visible="isRoleModalVisible"
      :isEditing="isEditing"
      :role="currentRole"
      :isSubmitting="isSubmitting"
      @close="closeRoleModal"
      @submit="handleRoleSubmit"
    />

    <!-- 权限配置模态框 -->
    <PermissionConfigModal
      :visible="isPermissionModalVisible"
      :permissionTree="permissionTree"
      :selectedPermissions="selectedPermissions"
      :isSubmitting="isSubmitting"
      @close="closePermissionModal"
      @submit="handlePermissionSubmit"
    />

    <!-- 权限批量操作工具 -->
    <PermissionBatchTools
      :visible="isBatchToolsVisible"
      :roleList="roleList"
      :userList="userList"
      @close="closeBatchTools"
      @batch-assign="handleBatchAssign"
      @batch-remove="handleBatchRemove"
    />

    <!-- 全局操作按钮 -->
    <div class="global-actions">
      <div class="action-group">
        <el-button type="primary" :icon="Plus" @click="openCreateRoleModal">
          新建角色
        </el-button>
        <el-button :icon="Setting" @click="openBatchTools">
          批量操作
        </el-button>
        <el-button :icon="Document" @click="handleExportPermissions">
          导出权限配置
        </el-button>
      </div>
      <div class="action-group">
        <el-button :icon="Refresh" @click="refreshPermissions">
          刷新权限
        </el-button>
        <el-button :icon="InfoFilled" @click="showPermissionGuide">
          权限说明
        </el-button>
      </div>
    </div>

    <!-- 权限设置指南对话框 -->
    <el-dialog
      v-model="guideDialogVisible"
      title="权限设置使用指南"
      width="700px"
      :close-on-click-modal="false"
    >
      <div class="permission-guide">
        <div class="guide-section">
          <h4>角色管理</h4>
          <p>创建和管理系统中的角色，为不同职责的用户分配合适的角色。</p>
          <ul>
            <li>系统管理员：拥有系统最高权限</li>
            <li>项目管理员：管理特定项目的权限</li>
            <li>测试工程师：执行测试用例的权限</li>
            <li>普通用户：基础的查看和使用权限</li>
          </ul>
        </div>
        <div class="guide-section">
          <h4>权限分配</h4>
          <p>为每个角色分配具体的功能权限，确保用户只能访问授权的功能。</p>
          <ul>
            <li>菜单权限：控制用户能访问的页面和功能模块</li>
            <li>操作权限：控制用户能执行的具体操作</li>
            <li>数据权限：控制用户能访问的数据范围</li>
          </ul>
        </div>
        <div class="guide-section">
          <h4>用户权限管理</h4>
          <p>为用户分配角色，快速设置用户的权限组合。</p>
          <p>支持批量操作，提高管理效率。</p>
        </div>
      </div>
    </el-dialog>

    <!-- Toast 提示 -->
    <div v-if="toast.visible" class="toast">
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import {
  Plus,
  Setting,
  Document,
  Refresh,
  InfoFilled
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

import RoleManagementTab from './permission/RoleManagementTab.vue'
import PermissionAssignmentTab from './permission/PermissionAssignmentTab.vue'
import UserPermissionTab from './permission/UserPermissionTab.vue'
import PermissionLogsTab from './permission/PermissionLogsTab.vue'
import CreateEditRoleModal from './permission/CreateEditRoleModal.vue'
import PermissionConfigModal from './permission/PermissionConfigModal.vue'
import PermissionBatchTools from './permission/PermissionBatchTools.vue'

import {
  getPermissionSettings,
  updatePermissionSettings,
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  assignRolePermissions,
  assignUserRoles,
  getPermissionLogs,
  exportPermissions
} from '@/api/settings'

// 响应式数据
const activePermissionTab = ref('role-management')
const guideDialogVisible = ref(false)
const loading = ref(false)
const isSubmitting = ref(false)
const isEditing = ref(false)
const toast = reactive({ visible: false, message: '' })

// 列表数据
const roleList = ref([])
const userList = ref([])
const logList = ref([])
const permissionTree = ref([])
const selectedPermissions = ref([])

// 分页配置
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const logPagination = reactive({
  currentPage: 1,
  pageSize: 20,
  total: 0
})

// 删除状态跟踪
const deletingIds = ref(new Set())

// 模态框状态
const isRoleModalVisible = ref(false)
const isPermissionModalVisible = ref(false)
const isBatchToolsVisible = ref(false)
const currentRole = ref(null)

// 权限筛选条件
const logFilters = reactive({
  startDate: '',
  endDate: '',
  operation: '',
  operator: ''
})

// 方法定义
const showToast = (message, duration = 2000) => {
  toast.message = message
  toast.visible = true
  setTimeout(() => { toast.visible = false }, duration)
}

const handleTabChange = (tab) => {
  activePermissionTab.value = tab.props.name
  // 切换标签页时刷新数据
  loadTabData(tab.props.name)
}

const loadTabData = async (tabName) => {
  loading.value = true
  try {
    switch (tabName) {
      case 'role-management':
        await loadRoles()
        break
      case 'permission-assignment':
        await loadPermissionTree()
        break
      case 'user-permission':
        await loadUsers()
        break
      case 'permission-logs':
        await loadPermissionLogs()
        break
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    showToast('数据加载失败')
  } finally {
    loading.value = false
  }
}

const loadRoles = async () => {
  try {
    const response = await getRoles({
      page: pagination.currentPage,
      pageSize: pagination.pageSize
    })
    roleList.value = response.data?.items || []
    pagination.total = response.data?.total || 0
  } catch (error) {
    console.error('加载角色列表失败:', error)
    roleList.value = []
  }
}

const loadUsers = async () => {
  try {
    const response = await getUserList({
      page: pagination.currentPage,
      pageSize: pagination.pageSize
    })
    userList.value = response.data?.items || []
    pagination.total = response.data?.total || 0
  } catch (error) {
    console.error('加载用户列表失败:', error)
    userList.value = []
  }
}

const loadPermissionTree = async () => {
  try {
    const response = await getPermissionSettings()
    permissionTree.value = response.data?.permissionTree || []
  } catch (error) {
    console.error('加载权限树失败:', error)
    permissionTree.value = []
  }
}

const loadPermissionLogs = async () => {
  try {
    const response = await getPermissionLogs({
      page: logPagination.currentPage,
      pageSize: logPagination.pageSize,
      ...logFilters
    })
    logList.value = response.data?.items || []
    logPagination.total = response.data?.total || 0
  } catch (error) {
    console.error('加载权限日志失败:', error)
    logList.value = []
  }
}

// 角色管理相关方法
const openCreateRoleModal = () => {
  currentRole.value = null
  isEditing.value = false
  isRoleModalVisible.value = true
}

const openEditRoleModal = (role) => {
  currentRole.value = role
  isEditing.value = true
  isRoleModalVisible.value = true
}

const closeRoleModal = () => {
  isRoleModalVisible.value = false
  currentRole.value = null
  isEditing.value = false
}

const handleRoleSubmit = async (roleData) => {
  isSubmitting.value = true
  try {
    if (isEditing.value) {
      await updateRole(currentRole.value.id, roleData)
      showToast('角色更新成功')
    } else {
      await createRole(roleData)
      showToast('角色创建成功')
    }
    closeRoleModal()
    await loadRoles()
  } catch (error) {
    console.error('角色操作失败:', error)
    showToast(isEditing.value ? '角色更新失败' : '角色创建失败')
  } finally {
    isSubmitting.value = false
  }
}

const handleDeleteRole = async (role) => {
  if (!role?.id || deletingIds.value.has(role.id)) return

  const confirmed = await ElMessageBox.confirm(
    `确定要删除角色 "${role.name}" 吗？删除后不可恢复。`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )

  if (!confirmed) return

  deletingIds.value.add(role.id)
  try {
    await deleteRole(role.id)
    showToast('角色删除成功')
    await loadRoles()
  } catch (error) {
    console.error('删除角色失败:', error)
    showToast('角色删除失败')
  } finally {
    deletingIds.value.delete(role.id)
  }
}

// 权限分配相关方法
const handleRolePermissionChange = async ({ roleId, permissions }) => {
  try {
    await assignRolePermissions(roleId, permissions)
    showToast('权限分配更新成功')
  } catch (error) {
    console.error('权限分配失败:', error)
    showToast('权限分配更新失败')
  }
}

// 用户权限管理相关方法
const handleUserRoleChange = async ({ userId, roleIds }) => {
  try {
    await assignUserRoles(userId, roleIds)
    showToast('用户角色分配成功')
  } catch (error) {
    console.error('用户角色分配失败:', error)
    showToast('用户角色分配失败')
  }
}

// 分页相关方法
const handlePageChange = (page) => {
  if (page > 0 && page <= Math.ceil(pagination.total / pagination.pageSize)) {
    pagination.currentPage = page
    loadRoles()
  }
}

const handleUserPageChange = (page) => {
  if (page > 0 && page <= Math.ceil(pagination.total / pagination.pageSize)) {
    pagination.currentPage = page
    loadUsers()
  }
}

const handleLogPageChange = (page) => {
  if (page > 0 && page <= Math.ceil(logPagination.total / logPagination.pageSize)) {
    logPagination.currentPage = page
    loadPermissionLogs()
  }
}

const handleLogFilterChange = (filters) => {
  Object.assign(logFilters, filters)
  logPagination.currentPage = 1
  loadPermissionLogs()
}

// 其他方法
const openBatchTools = () => {
  isBatchToolsVisible.value = true
}

const closeBatchTools = () => {
  isBatchToolsVisible.value = false
}

const handleBatchAssign = async ({ userIds, roleIds }) => {
  try {
    // 批量分配角色逻辑
    await Promise.all(userIds.map(userId => assignUserRoles(userId, roleIds)))
    showToast(`成功为 ${userIds.length} 个用户分配角色`)
    closeBatchTools()
    await loadUsers()
  } catch (error) {
    console.error('批量分配失败:', error)
    showToast('批量分配失败')
  }
}

const handleBatchRemove = async ({ userIds, roleIds }) => {
  try {
    // 批量移除角色逻辑
    await Promise.all(userIds.map(userId => removeUserRoles(userId, roleIds)))
    showToast(`成功从 ${userIds.length} 个用户移除角色`)
    closeBatchTools()
    await loadUsers()
  } catch (error) {
    console.error('批量移除失败:', error)
    showToast('批量移除失败')
  }
}

const handleExportPermissions = async () => {
  try {
    const response = await exportPermissions()
    const blob = new Blob([response.data], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'permission-config.json'
    link.click()
    window.URL.revokeObjectURL(url)
    showToast('权限配置导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    showToast('权限配置导出失败')
  }
}

const refreshPermissions = async () => {
  await loadTabData(activePermissionTab.value)
  showToast('权限数据已刷新')
}

const showPermissionGuide = () => {
  guideDialogVisible.value = true
}

// 组件挂载时加载数据
onMounted(() => {
  loadTabData(activePermissionTab.value)
})
</script>

<style scoped>
.permission-settings-main {
  padding: 20px;
}

.permission-alert {
  margin-bottom: 24px;
}

.permission-tabs {
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

.permission-guide {
  max-height: 400px;
  overflow-y: auto;
}

.guide-section {
  margin-bottom: 24px;
}

.guide-section h4 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.guide-section p {
  margin: 0 0 12px 0;
  color: #606266;
  line-height: 1.6;
}

.guide-section ul {
  margin: 0;
  padding-left: 20px;
  color: #606266;
}

.guide-section li {
  margin-bottom: 4px;
  line-height: 1.5;
}

.toast {
  position: fixed;
  top: 16px;
  right: 16px;
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  z-index: 1100;
  box-shadow: 0 6px 16px rgba(0,0,0,0.18);
}
</style>
