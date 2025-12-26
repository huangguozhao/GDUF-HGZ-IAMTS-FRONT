<template>
  <div class="user-permission-tab">
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <button class="btn btn-primary" @click="openBatchAssignModal">
          批量分配角色
        </button>
        <button class="btn btn-secondary" @click="exportUserPermissions">
          导出权限配置
        </button>
      </div>
      <div class="toolbar-right">
        <div class="search-input-wrapper">
          <svg class="search-icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M909.6 854.1 646.1 590.6a360.6 360.6 0 1 0-23.5 23.5l263.5 263.5a16.9 16.9 0 0 0 23.5 0l23.5-23.5a16.9 16.9 0 0 0 0-23.5zM413.5 755.1a320.6 320.6 0 1 1 0-641.2 320.6 320.6 0 0 1 0 641.2z"></path>
          </svg>
          <input
            type="text"
            class="search-input"
            placeholder="搜索用户..."
            v-model="searchKeyword"
            @keyup.enter="handleSearch"
          >
        </div>
        <button class="btn btn-filter" @click="openFilterModal">
          筛选条件
        </button>
      </div>
    </div>

    <!-- 用户列表 -->
    <div class="user-list">
      <div
        v-for="user in filteredUserList"
        :key="user.id"
        class="user-item"
        :class="{ 'processing': isUserProcessing(user.id) }"
      >
        <div class="user-header">
          <div class="user-avatar">
            <img
              v-if="user.avatar"
              :src="user.avatar"
              :alt="user.name"
              @error="handleAvatarError(user)"
            >
            <div v-else class="avatar-placeholder">
              {{ user.name.charAt(0).toUpperCase() }}
            </div>
          </div>
          <div class="user-info">
            <div class="user-name">{{ user.name }}</div>
            <div class="user-email">{{ user.email }}</div>
          </div>
          <div class="user-status">
            <el-tag :type="user.status === 'active' ? 'success' : 'info'" size="small">
              {{ user.status === 'active' ? '正常' : '禁用' }}
            </el-tag>
          </div>
        </div>

        <div class="user-roles">
          <div class="roles-label">当前角色：</div>
          <div class="roles-tags">
            <el-tag
              v-for="roleId in user.roleIds || []"
              :key="roleId"
              size="small"
              closable
              @close="removeUserRole(user, roleId)"
            >
              {{ getRoleName(roleId) }}
            </el-tag>
            <el-button
              size="small"
              type="primary"
              @click="openRoleAssignModal(user)"
            >
              + 添加角色
            </el-button>
          </div>
        </div>

        <div class="user-permissions">
          <div class="permissions-summary">
            <span class="summary-label">权限统计：</span>
            <span class="summary-value">{{ getUserPermissionCount(user) }} 个权限</span>
          </div>
          <el-button size="small" @click="showUserPermissions(user)">
            查看详情
          </el-button>
        </div>

        <div class="user-actions">
          <el-button size="small" @click="resetUserRoles(user)">
            重置角色
          </el-button>
          <el-button size="small" type="danger" @click="clearUserRoles(user)">
            清空角色
          </el-button>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <el-pagination
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="$emit('page-change', $event)"
      />
    </div>

    <!-- 角色分配对话框 -->
    <el-dialog
      v-model="roleAssignVisible"
      :title="`为用户 ${currentUser?.name || ''} 分配角色`"
      width="600px"
      :close-on-click-modal="false"
    >
      <div class="role-assign-content">
        <div class="current-roles">
          <h5>当前角色</h5>
          <div class="roles-display">
            <el-tag
              v-for="roleId in currentUser?.roleIds || []"
              :key="roleId"
              size="small"
              closable
              @close="removeRoleFromAssign(roleId)"
            >
              {{ getRoleName(roleId) }}
            </el-tag>
            <span v-if="!currentUser?.roleIds?.length" class="no-roles">
              暂无角色
            </span>
          </div>
        </div>

        <div class="available-roles">
          <h5>可选角色</h5>
          <div class="roles-selection">
            <el-checkbox-group v-model="selectedRolesForAssign">
              <el-checkbox
                v-for="role in roleList"
                :key="role.id"
                :label="role.id"
                :disabled="currentUser?.roleIds?.includes(role.id)"
              >
                <div class="role-option">
                  <span class="role-name">{{ role.name }}</span>
                  <span class="role-desc">{{ role.description }}</span>
                </div>
              </el-checkbox>
            </el-checkbox-group>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="roleAssignVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmRoleAssign" :loading="assigning">
            确定分配
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 用户权限详情对话框 -->
    <el-dialog
      v-model="permissionDetailVisible"
      :title="`用户权限详情 - ${currentUser?.name || ''}`"
      width="700px"
      :close-on-click-modal="false"
    >
      <div class="permission-detail-content">
        <div class="permission-tabs">
          <el-tabs v-model="permissionTab">
            <el-tab-pane label="通过角色获得" name="role">
              <div class="role-permissions">
                <div
                  v-for="roleId in currentUser?.roleIds || []"
                  :key="roleId"
                  class="role-permission-item"
                >
                  <div class="role-header">
                    <h6>{{ getRoleName(roleId) }}</h6>
                    <span class="permission-count">
                      {{ getRolePermissionCount(roleId) }} 个权限
                    </span>
                  </div>
                  <div class="role-permission-list">
                    <el-tag
                      v-for="perm in getRolePermissions(roleId)"
                      :key="perm.id"
                      size="small"
                      :type="getPermissionTypeColor(perm.type)"
                    >
                      {{ perm.name }}
                    </el-tag>
                  </div>
                </div>
              </div>
            </el-tab-pane>
            <el-tab-pane label="所有权限汇总" name="all">
              <div class="all-permissions">
                <div class="permission-group">
                  <h6>菜单权限</h6>
                  <div class="permission-tags">
                    <el-tag
                      v-for="perm in getUserPermissionsByType('menu')"
                      :key="perm.id"
                      size="small"
                      type="success"
                    >
                      {{ perm.name }}
                    </el-tag>
                  </div>
                </div>
                <div class="permission-group">
                  <h6>操作权限</h6>
                  <div class="permission-tags">
                    <el-tag
                      v-for="perm in getUserPermissionsByType('action')"
                      :key="perm.id"
                      size="small"
                      type="primary"
                    >
                      {{ perm.name }}
                    </el-tag>
                  </div>
                </div>
                <div class="permission-group">
                  <h6>数据权限</h6>
                  <div class="permission-tags">
                    <el-tag
                      v-for="perm in getUserPermissionsByType('data')"
                      :key="perm.id"
                      size="small"
                      type="warning"
                    >
                      {{ perm.name }}
                    </el-tag>
                  </div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </el-dialog>

    <!-- 批量分配对话框 -->
    <el-dialog
      v-model="batchAssignVisible"
      title="批量分配角色"
      width="600px"
      :close-on-click-modal="false"
    >
      <div class="batch-assign-content">
        <div class="batch-step">
          <h5>第一步：选择用户</h5>
          <div class="user-selection">
            <el-checkbox-group v-model="selectedUsersForBatch">
              <el-checkbox
                v-for="user in userList"
                :key="user.id"
                :label="user.id"
              >
                <div class="user-option">
                  <span class="user-name">{{ user.name }}</span>
                  <span class="user-email">{{ user.email }}</span>
                </div>
              </el-checkbox>
            </el-checkbox-group>
          </div>
        </div>

        <div class="batch-step">
          <h5>第二步：选择角色</h5>
          <div class="role-selection">
            <el-radio-group v-model="batchAssignType">
              <el-radio label="add">添加角色</el-radio>
              <el-radio label="replace">替换角色</el-radio>
              <el-radio label="remove">移除角色</el-radio>
            </el-radio-group>
            <div class="roles-selection">
              <el-checkbox-group v-model="selectedRolesForBatch">
                <el-checkbox
                  v-for="role in roleList"
                  :key="role.id"
                  :label="role.id"
                >
                  <div class="role-option">
                    <span class="role-name">{{ role.name }}</span>
                    <span class="role-desc">{{ role.description }}</span>
                  </div>
                </el-checkbox>
              </el-checkbox-group>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="batchAssignVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmBatchAssign" :loading="batchAssigning">
            确定批量分配
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 筛选对话框 -->
    <el-dialog
      v-model="filterVisible"
      title="筛选条件"
      width="400px"
      :close-on-click-modal="false"
    >
      <div class="filter-content">
        <el-form :model="filters" label-width="80px">
          <el-form-item label="用户状态">
            <el-select v-model="filters.status" placeholder="请选择状态" clearable>
              <el-option label="正常" value="active" />
              <el-option label="禁用" value="inactive" />
            </el-select>
          </el-form-item>
          <el-form-item label="拥有角色">
            <el-select
              v-model="filters.hasRole"
              placeholder="选择角色"
              multiple
              clearable
            >
              <el-option
                v-for="role in roleList"
                :key="role.id"
                :label="role.name"
                :value="role.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="注册时间">
            <el-date-picker
              v-model="filters.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="resetFilters">重置</el-button>
          <el-button type="primary" @click="applyFilters">应用</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// Props
const props = defineProps({
  userList: {
    type: Array,
    default: () => []
  },
  roleList: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  pagination: {
    type: Object,
    default: () => ({})
  }
})

// Emits
const emit = defineEmits(['user-role-change', 'page-change'])

// 响应式数据
const searchKeyword = ref('')
const processingUsers = ref(new Set())

const roleAssignVisible = ref(false)
const permissionDetailVisible = ref(false)
const batchAssignVisible = ref(false)
const filterVisible = ref(false)

const currentUser = ref(null)
const permissionTab = ref('role')
const assigning = ref(false)
const batchAssigning = ref(false)

const selectedRolesForAssign = ref([])
const selectedUsersForBatch = ref([])
const selectedRolesForBatch = ref([])
const batchAssignType = ref('add')

const filters = reactive({
  status: '',
  hasRole: [],
  dateRange: []
})

const filteredUserList = computed(() => {
  let list = props.userList

  // 搜索过滤
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    list = list.filter(user =>
      user.name.toLowerCase().includes(keyword) ||
      user.email.toLowerCase().includes(keyword)
    )
  }

  // 状态过滤
  if (filters.status) {
    list = list.filter(user => user.status === filters.status)
  }

  // 角色过滤
  if (filters.hasRole.length > 0) {
    list = list.filter(user =>
      filters.hasRole.some(roleId => user.roleIds?.includes(roleId))
    )
  }

  // 时间范围过滤
  if (filters.dateRange && filters.dateRange.length === 2) {
    const [startDate, endDate] = filters.dateRange
    list = list.filter(user => {
      const createDate = new Date(user.createdAt).toISOString().split('T')[0]
      return createDate >= startDate && createDate <= endDate
    })
  }

  return list
})

// 方法
const isUserProcessing = (userId) => {
  return processingUsers.value.has(userId)
}

const getRoleName = (roleId) => {
  const role = props.roleList.find(r => r.id === roleId)
  return role ? role.name : '未知角色'
}

const getUserPermissionCount = (user) => {
  let count = 0
  user.roleIds?.forEach(roleId => {
    const role = props.roleList.find(r => r.id === roleId)
    count += role?.permissionCount || 0
  })
  return count
}

const handleAvatarError = (user) => {
  user.avatarError = true
}

const handleSearch = () => {
  // 搜索逻辑已通过computed实现
}

const handleSizeChange = (size) => {
  emit('page-change', 1) // 重置到第一页
}

const openRoleAssignModal = (user) => {
  currentUser.value = user
  selectedRolesForAssign.value = []
  roleAssignVisible.value = true
}

const removeUserRole = async (user, roleId) => {
  const roleName = getRoleName(roleId)
  const confirmed = await ElMessageBox.confirm(
    `确定要移除用户 "${user.name}" 的角色 "${roleName}" 吗？`,
    '确认移除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )

  if (!confirmed) return

  processingUsers.value.add(user.id)
  try {
    const newRoleIds = user.roleIds.filter(id => id !== roleId)
    await emit('user-role-change', {
      userId: user.id,
      roleIds: newRoleIds
    })
    user.roleIds = newRoleIds
  } catch (error) {
    console.error('移除用户角色失败:', error)
    ElMessage.error('移除角色失败')
  } finally {
    processingUsers.value.delete(user.id)
  }
}

const removeRoleFromAssign = (roleId) => {
  const index = currentUser.value.roleIds.indexOf(roleId)
  if (index > -1) {
    currentUser.value.roleIds.splice(index, 1)
  }
}

const confirmRoleAssign = async () => {
  if (!currentUser.value || selectedRolesForAssign.value.length === 0) {
    ElMessage.warning('请选择要分配的角色')
    return
  }

  assigning.value = true
  try {
    const newRoleIds = [...new Set([...(currentUser.value.roleIds || []), ...selectedRolesForAssign.value])]
    await emit('user-role-change', {
      userId: currentUser.value.id,
      roleIds: newRoleIds
    })
    currentUser.value.roleIds = newRoleIds
    roleAssignVisible.value = false
    ElMessage.success('角色分配成功')
  } catch (error) {
    console.error('分配角色失败:', error)
    ElMessage.error('分配角色失败')
  } finally {
    assigning.value = false
  }
}

const showUserPermissions = (user) => {
  currentUser.value = user
  permissionDetailVisible.value = true
}

const getRolePermissionCount = (roleId) => {
  const role = props.roleList.find(r => r.id === roleId)
  return role?.permissionCount || 0
}

const getRolePermissions = (roleId) => {
  const role = props.roleList.find(r => r.id === roleId)
  return role?.permissions || []
}

const getUserPermissionsByType = (type) => {
  const permissions = new Set()
  currentUser.value?.roleIds?.forEach(roleId => {
    const role = props.roleList.find(r => r.id === roleId)
    role?.permissions?.forEach(perm => {
      if (perm.type === type) {
        permissions.add(perm)
      }
    })
  })
  return Array.from(permissions)
}

const getPermissionTypeColor = (type) => {
  const colorMap = {
    menu: 'success',
    action: 'primary',
    data: 'warning'
  }
  return colorMap[type] || 'info'
}

const resetUserRoles = async (user) => {
  const confirmed = await ElMessageBox.confirm(
    `确定要重置用户 "${user.name}" 的所有角色吗？`,
    '确认重置',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )

  if (!confirmed) return

  processingUsers.value.add(user.id)
  try {
    await emit('user-role-change', {
      userId: user.id,
      roleIds: []
    })
    user.roleIds = []
    ElMessage.success('角色重置成功')
  } catch (error) {
    console.error('重置用户角色失败:', error)
    ElMessage.error('重置角色失败')
  } finally {
    processingUsers.value.delete(user.id)
  }
}

const clearUserRoles = async (user) => {
  await resetUserRoles(user)
}

const openBatchAssignModal = () => {
  selectedUsersForBatch.value = []
  selectedRolesForBatch.value = []
  batchAssignType.value = 'add'
  batchAssignVisible.value = true
}

const confirmBatchAssign = async () => {
  if (selectedUsersForBatch.value.length === 0) {
    ElMessage.warning('请选择用户')
    return
  }

  if (selectedRolesForBatch.value.length === 0) {
    ElMessage.warning('请选择角色')
    return
  }

  batchAssigning.value = true
  try {
    for (const userId of selectedUsersForBatch.value) {
      const user = props.userList.find(u => u.id === userId)
      if (!user) continue

      let newRoleIds = [...(user.roleIds || [])]

      switch (batchAssignType.value) {
        case 'add':
          newRoleIds = [...new Set([...newRoleIds, ...selectedRolesForBatch.value])]
          break
        case 'replace':
          newRoleIds = selectedRolesForBatch.value
          break
        case 'remove':
          newRoleIds = newRoleIds.filter(id => !selectedRolesForBatch.value.includes(id))
          break
      }

      await emit('user-role-change', {
        userId: user.id,
        roleIds: newRoleIds
      })
      user.roleIds = newRoleIds
    }

    batchAssignVisible.value = false
    ElMessage.success('批量分配完成')
  } catch (error) {
    console.error('批量分配失败:', error)
    ElMessage.error('批量分配失败')
  } finally {
    batchAssigning.value = false
  }
}

const exportUserPermissions = () => {
  // 导出用户权限配置的逻辑
  ElMessage.info('导出功能开发中')
}

const openFilterModal = () => {
  filterVisible.value = true
}

const resetFilters = () => {
  Object.assign(filters, {
    status: '',
    hasRole: [],
    dateRange: []
  })
}

const applyFilters = () => {
  filterVisible.value = false
  // 过滤逻辑已通过computed实现
}
</script>

<style scoped>
.user-permission-tab {
  padding: 20px 0;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 12px;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn {
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(90deg, #1890ff 0%, #40a9ff 100%);
  color: #fff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.2);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

.btn-secondary {
  background: #fff;
  color: #475569;
  border: 1px solid #e6eef8;
}

.btn-secondary:hover {
  background: #f8fbff;
}

.btn-filter {
  background: #fff;
  color: #475569;
  border: 1px solid #e6eef8;
  padding: 6px 12px;
  border-radius: 6px;
}

.btn-filter:hover {
  background: #f8fbff;
}

.search-input-wrapper {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: #9aa4b2;
}

.search-input {
  border: 1px solid #e6eef8;
  border-radius: 12px;
  padding: 8px 12px 8px 36px;
  width: 220px;
  background: #fff;
  transition: box-shadow 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #40a9ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
}

.user-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}

.user-item {
  background: #fff;
  border: 1px solid #e6eef8;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s;
}

.user-item:hover {
  border-color: #40a9ff;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.1);
}

.user-item.processing {
  opacity: 0.7;
  pointer-events: none;
}

.user-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1890ff, #40a9ff);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 18px;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 16px;
  font-weight: 600;
  color: #182026;
  margin-bottom: 4px;
}

.user-email {
  font-size: 14px;
  color: #6b7280;
}

.user-status {
  flex-shrink: 0;
}

.user-roles {
  margin-bottom: 12px;
}

.roles-label {
  font-size: 14px;
  font-weight: 500;
  color: #182026;
  margin-bottom: 8px;
}

.roles-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.user-permissions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 12px;
  background: #f8fbff;
  border-radius: 6px;
}

.permissions-summary {
  display: flex;
  align-items: center;
  gap: 8px;
}

.summary-label {
  font-size: 14px;
  color: #6b7280;
}

.summary-value {
  font-size: 14px;
  font-weight: 600;
  color: #1890ff;
}

.user-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* 对话框样式 */
.role-assign-content,
.permission-detail-content,
.batch-assign-content {
  max-height: 500px;
  overflow-y: auto;
}

.current-roles,
.available-roles,
.batch-step {
  margin-bottom: 24px;
}

.current-roles h5,
.available-roles h5,
.batch-step h5 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #182026;
}

.roles-display,
.roles-selection {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.no-roles {
  color: #9aa4b2;
  font-style: italic;
}

.role-option,
.user-option {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.role-name,
.user-name {
  font-weight: 500;
  color: #182026;
}

.role-desc,
.user-email {
  font-size: 12px;
  color: #6b7280;
}

.role-permissions {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.role-permission-item {
  border: 1px solid #e6eef8;
  border-radius: 8px;
  padding: 16px;
}

.role-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.role-header h6 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #182026;
}

.permission-count {
  font-size: 12px;
  color: #9aa4b2;
}

.role-permission-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.all-permissions {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.permission-group h6 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #182026;
}

.permission-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.user-selection,
.role-selection {
  margin-top: 12px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.filter-content {
  padding: 20px 0;
}
</style>
