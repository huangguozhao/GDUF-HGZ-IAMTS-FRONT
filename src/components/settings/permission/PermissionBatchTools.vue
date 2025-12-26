<template>
  <el-dialog
    :model-value="visible"
    title="批量权限操作"
    width="800px"
    :close-on-click-modal="false"
    @update:model-value="$emit('update:visible', $event)"
    @close="$emit('close')"
  >
    <div class="batch-tools-content">
      <!-- 操作步骤指示器 -->
      <div class="step-indicator">
        <div
          v-for="(step, index) in steps"
          :key="step.key"
          class="step-item"
          :class="{ active: currentStep === index, completed: currentStep > index }"
        >
          <div class="step-number">{{ index + 1 }}</div>
          <div class="step-title">{{ step.title }}</div>
        </div>
      </div>

      <!-- 第一步：选择操作类型 -->
      <div v-if="currentStep === 0" class="step-content">
        <h4>选择操作类型</h4>
        <div class="operation-types">
          <div
            v-for="operation in operationTypes"
            :key="operation.key"
            class="operation-card"
            :class="{ selected: selectedOperation === operation.key }"
            @click="selectedOperation = operation.key"
          >
            <div class="operation-icon">
              <el-icon size="32">
                <component :is="operation.icon" />
              </el-icon>
            </div>
            <div class="operation-info">
              <h5>{{ operation.title }}</h5>
              <p>{{ operation.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 第二步：选择用户 -->
      <div v-if="currentStep === 1" class="step-content">
        <h4>选择用户</h4>
        <div class="user-selection">
          <div class="selection-header">
            <div class="search-box">
              <el-input
                v-model="userSearchKeyword"
                placeholder="搜索用户..."
                prefix-icon="Search"
                style="width: 200px"
              />
            </div>
            <div class="selection-actions">
              <el-button size="small" @click="selectAllUsers">全选</el-button>
              <el-button size="small" @click="clearUserSelection">清空</el-button>
              <span class="selection-count">已选择 {{ selectedUsers.length }} 个用户</span>
            </div>
          </div>

          <div class="user-list">
            <div
              v-for="user in filteredUsers"
              :key="user.id"
              class="user-item"
              :class="{ selected: selectedUsers.includes(user.id) }"
              @click="toggleUserSelection(user.id)"
            >
              <el-checkbox
                :model-value="selectedUsers.includes(user.id)"
                @change="toggleUserSelection(user.id)"
              />
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
                <div class="user-roles">
                  <el-tag
                    v-for="roleId in user.roleIds || []"
                    :key="roleId"
                    size="mini"
                  >
                    {{ getRoleName(roleId) }}
                  </el-tag>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 第三步：选择角色 -->
      <div v-if="currentStep === 2" class="step-content">
        <h4>选择角色</h4>
        <div class="role-selection">
          <div class="selection-header">
            <div class="batch-mode">
              <el-radio-group v-model="batchMode">
                <el-radio label="add">添加角色</el-radio>
                <el-radio label="replace">替换角色</el-radio>
                <el-radio label="remove">移除角色</el-radio>
              </el-radio-group>
            </div>
            <div class="selection-actions">
              <el-button size="small" @click="selectAllRoles">全选</el-button>
              <el-button size="small" @click="clearRoleSelection">清空</el-button>
              <span class="selection-count">已选择 {{ selectedRoles.length }} 个角色</span>
            </div>
          </div>

          <div class="role-list">
            <div
              v-for="role in roleList"
              :key="role.id"
              class="role-item"
              :class="{ selected: selectedRoles.includes(role.id) }"
              @click="toggleRoleSelection(role.id)"
            >
              <el-checkbox
                :model-value="selectedRoles.includes(role.id)"
                @change="toggleRoleSelection(role.id)"
              />
              <div class="role-info">
                <div class="role-name">{{ role.name }}</div>
                <div class="role-description">{{ role.description }}</div>
                <div class="role-meta">
                  <el-tag size="mini" :type="role.type === 'admin' ? 'danger' : 'primary'">
                    {{ getRoleTypeText(role.type) }}
                  </el-tag>
                  <span class="user-count">{{ role.userCount || 0 }} 个用户</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 第四步：确认操作 -->
      <div v-if="currentStep === 3" class="step-content">
        <h4>确认操作</h4>
        <div class="confirmation">
          <div class="operation-summary">
            <div class="summary-item">
              <label>操作类型：</label>
              <span>{{ getSelectedOperationText() }}</span>
            </div>
            <div class="summary-item">
              <label>操作模式：</label>
              <span>{{ getBatchModeText() }}</span>
            </div>
            <div class="summary-item">
              <label>目标用户：</label>
              <span>{{ selectedUsers.length }} 个用户</span>
            </div>
            <div class="summary-item">
              <label>目标角色：</label>
              <span>{{ selectedRoles.length }} 个角色</span>
            </div>
          </div>

          <div class="preview-section">
            <h5>操作预览</h5>
            <div class="preview-users">
              <div class="preview-group">
                <h6>将要操作的用户：</h6>
                <div class="user-tags">
                  <el-tag
                    v-for="userId in selectedUsers.slice(0, 10)"
                    :key="userId"
                    size="small"
                  >
                    {{ getUserName(userId) }}
                  </el-tag>
                  <el-tag v-if="selectedUsers.length > 10" size="small" type="info">
                    +{{ selectedUsers.length - 10 }} 个用户
                  </el-tag>
                </div>
              </div>

              <div class="preview-group">
                <h6>{{ batchMode === 'remove' ? '将要移除的角色' : '将要操作的角色' }}：</h6>
                <div class="role-tags">
                  <el-tag
                    v-for="roleId in selectedRoles"
                    :key="roleId"
                    size="small"
                    :type="batchMode === 'remove' ? 'danger' : 'primary'"
                  >
                    {{ getRoleName(roleId) }}
                  </el-tag>
                </div>
              </div>
            </div>
          </div>

          <div class="warning-notice">
            <el-alert
              title="操作提醒"
              :description="getWarningMessage()"
              type="warning"
              :closable="false"
              show-icon
            />
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="$emit('close')" :disabled="isSubmitting">
          取消
        </el-button>
        <el-button
          v-if="currentStep > 0"
          @click="previousStep"
          :disabled="isSubmitting"
        >
          上一步
        </el-button>
        <el-button
          v-if="currentStep < steps.length - 1"
          type="primary"
          @click="nextStep"
          :disabled="!canProceed"
        >
          下一步
        </el-button>
        <el-button
          v-if="currentStep === steps.length - 1"
          type="primary"
          @click="executeBatchOperation"
          :loading="isSubmitting"
        >
          执行操作
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue'
import {
  User,
  Plus,
  Minus,
  Setting,
  Check,
  Close
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  roleList: {
    type: Array,
    default: () => []
  },
  userList: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['close', 'batch-assign', 'batch-remove'])

// 响应式数据
const currentStep = ref(0)
const selectedOperation = ref('')
const selectedUsers = ref([])
const selectedRoles = ref([])
const batchMode = ref('add')
const userSearchKeyword = ref('')
const isSubmitting = ref(false)

const steps = [
  { key: 'operation', title: '选择操作' },
  { key: 'users', title: '选择用户' },
  { key: 'roles', title: '选择角色' },
  { key: 'confirm', title: '确认操作' }
]

const operationTypes = [
  {
    key: 'assign',
    title: '分配角色',
    description: '为选中的用户分配指定的角色',
    icon: Plus
  },
  {
    key: 'remove',
    title: '移除角色',
    description: '从选中的用户移除指定的角色',
    icon: Minus
  },
  {
    key: 'sync',
    title: '同步权限',
    description: '同步用户的角色权限配置',
    icon: Setting
  }
]

const filteredUsers = computed(() => {
  if (!userSearchKeyword.value) return props.userList

  const keyword = userSearchKeyword.value.toLowerCase()
  return props.userList.filter(user =>
    user.name.toLowerCase().includes(keyword) ||
    user.email.toLowerCase().includes(keyword)
  )
})

const canProceed = computed(() => {
  switch (currentStep.value) {
    case 0:
      return !!selectedOperation.value
    case 1:
      return selectedUsers.value.length > 0
    case 2:
      return selectedRoles.value.length > 0
    case 3:
      return true
    default:
      return false
  }
})

// 方法
const getRoleName = (roleId) => {
  const role = props.roleList.find(r => r.id === roleId)
  return role ? role.name : '未知角色'
}

const getUserName = (userId) => {
  const user = props.userList.find(u => u.id === userId)
  return user ? user.name : '未知用户'
}

const getRoleTypeText = (type) => {
  const typeMap = {
    admin: '管理员',
    user: '普通用户',
    guest: '访客',
    custom: '自定义'
  }
  return typeMap[type] || type
}

const handleAvatarError = (user) => {
  user.avatarError = true
}

const toggleUserSelection = (userId) => {
  const index = selectedUsers.value.indexOf(userId)
  if (index > -1) {
    selectedUsers.value.splice(index, 1)
  } else {
    selectedUsers.value.push(userId)
  }
}

const toggleRoleSelection = (roleId) => {
  const index = selectedRoles.value.indexOf(roleId)
  if (index > -1) {
    selectedRoles.value.splice(index, 1)
  } else {
    selectedRoles.value.push(roleId)
  }
}

const selectAllUsers = () => {
  selectedUsers.value = filteredUsers.value.map(user => user.id)
}

const clearUserSelection = () => {
  selectedUsers.value = []
}

const selectAllRoles = () => {
  selectedRoles.value = props.roleList.map(role => role.id)
}

const clearRoleSelection = () => {
  selectedRoles.value = []
}

const nextStep = () => {
  if (currentStep.value < steps.length - 1) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const getSelectedOperationText = () => {
  const operation = operationTypes.find(op => op.key === selectedOperation.value)
  return operation ? operation.title : ''
}

const getBatchModeText = () => {
  const modeMap = {
    add: '添加角色',
    replace: '替换角色',
    remove: '移除角色'
  }
  return modeMap[batchMode.value] || ''
}

const getWarningMessage = () => {
  const operationText = getSelectedOperationText()
  const modeText = getBatchModeText()
  const userCount = selectedUsers.value.length
  const roleCount = selectedRoles.value.length

  if (batchMode.value === 'replace') {
    return `将为 ${userCount} 个用户替换所有角色为选中的 ${roleCount} 个角色，此操作将移除用户现有的所有角色。`
  } else if (batchMode.value === 'remove') {
    return `将从 ${userCount} 个用户移除选中的 ${roleCount} 个角色，请确认操作。`
  } else {
    return `将为 ${userCount} 个用户添加 ${roleCount} 个角色，用户现有的角色将被保留。`
  }
}

const executeBatchOperation = async () => {
  isSubmitting.value = true
  try {
    if (selectedOperation.value === 'assign') {
      emit('batch-assign', {
        userIds: selectedUsers.value,
        roleIds: selectedRoles.value
      })
    } else if (selectedOperation.value === 'remove') {
      emit('batch-remove', {
        userIds: selectedUsers.value,
        roleIds: selectedRoles.value
      })
    }

    // 重置状态
    resetBatchOperation()
    emit('close')
  } catch (error) {
    console.error('批量操作失败:', error)
    ElMessage.error('批量操作失败')
  } finally {
    isSubmitting.value = false
  }
}

const resetBatchOperation = () => {
  currentStep.value = 0
  selectedOperation.value = ''
  selectedUsers.value = []
  selectedRoles.value = []
  batchMode.value = 'add'
  userSearchKeyword.value = ''
}

// 监听visible变化
watch(() => props.visible, (newVisible) => {
  if (!newVisible) {
    resetBatchOperation()
  }
})
</script>

<style scoped>
.batch-tools-content {
  min-height: 400px;
}

.step-indicator {
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
  position: relative;
}

.step-indicator::before {
  content: '';
  position: absolute;
  top: 16px;
  left: 0;
  right: 0;
  height: 2px;
  background: #e6eef8;
  z-index: 1;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  position: relative;
  z-index: 2;
  flex: 1;
  max-width: 120px;
}

.step-item::before {
  content: '';
  position: absolute;
  top: 16px;
  left: 50%;
  right: -50%;
  height: 2px;
  background: #1890ff;
  z-index: 1;
}

.step-item.completed::before {
  background: #52c41a;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e6eef8;
  color: #9aa4b2;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  position: relative;
  z-index: 3;
}

.step-item.active .step-number {
  background: #1890ff;
  color: #fff;
}

.step-item.completed .step-number {
  background: #52c41a;
  color: #fff;
}

.step-title {
  font-size: 12px;
  color: #9aa4b2;
  text-align: center;
}

.step-item.active .step-title {
  color: #1890ff;
  font-weight: 500;
}

.step-item.completed .step-title {
  color: #52c41a;
}

.step-content {
  padding: 20px 0;
}

.step-content h4 {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
  color: #182026;
}

.operation-types {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.operation-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border: 2px solid #e6eef8;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.operation-card:hover {
  border-color: #1890ff;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.1);
}

.operation-card.selected {
  border-color: #1890ff;
  background: #f0f9ff;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
}

.operation-icon {
  color: #1890ff;
}

.operation-info h5 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #182026;
}

.operation-info p {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.4;
}

.user-selection,
.role-selection {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.selection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8fbff;
  border-radius: 8px;
  border: 1px solid #e6eef8;
}

.selection-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.selection-count {
  font-size: 12px;
  color: #6b7280;
}

.user-list,
.role-list {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e6eef8;
  border-radius: 8px;
}

.user-item,
.role-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid #f0f0f0;
}

.user-item:last-child,
.role-item:last-child {
  border-bottom: none;
}

.user-item:hover,
.role-item:hover {
  background: #f8fbff;
}

.user-item.selected,
.role-item.selected {
  background: #f0f9ff;
  border-left: 3px solid #1890ff;
}

.user-avatar {
  width: 32px;
  height: 32px;
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
  font-size: 14px;
}

.user-info,
.role-info {
  flex: 1;
}

.user-name {
  font-weight: 500;
  color: #182026;
  margin-bottom: 2px;
}

.user-email {
  font-size: 12px;
  color: #9aa4b2;
  margin-bottom: 4px;
}

.user-roles {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.role-name {
  font-weight: 500;
  color: #182026;
  margin-bottom: 4px;
}

.role-description {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 8px;
}

.role-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-count {
  font-size: 12px;
  color: #9aa4b2;
}

.batch-mode {
  display: flex;
  align-items: center;
}

.confirmation {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.operation-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f8fbff;
  border-radius: 6px;
  border: 1px solid #e6eef8;
}

.summary-item label {
  font-weight: 500;
  color: #6b7280;
  white-space: nowrap;
}

.summary-item span {
  color: #182026;
  font-weight: 500;
}

.preview-section {
  padding: 20px;
  background: #f8fbff;
  border-radius: 8px;
  border: 1px solid #e6eef8;
}

.preview-section h5 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #182026;
}

.preview-users {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.preview-group h6 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #182026;
}

.user-tags,
.role-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.warning-notice {
  margin-top: 8px;
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
}

/* 响应式 */
@media (max-width: 768px) {
  .step-indicator {
    flex-wrap: wrap;
    gap: 16px;
  }

  .operation-types {
    grid-template-columns: 1fr;
  }

  .selection-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .operation-summary {
    grid-template-columns: 1fr;
  }
}
</style>
