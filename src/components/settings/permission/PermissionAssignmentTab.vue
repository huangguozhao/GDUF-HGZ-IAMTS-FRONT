<template>
  <div class="permission-assignment-tab">
    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-select
          v-model="selectedRoleId"
          placeholder="选择角色"
          style="width: 200px"
          @change="handleRoleChange"
        >
          <el-option
            v-for="role in roleList"
            :key="role.id"
            :label="role.name"
            :value="role.id"
          />
        </el-select>
        <span v-if="selectedRole" class="role-info">
          {{ selectedRole.description }}
        </span>
      </div>
      <div class="toolbar-right">
        <el-button @click="expandAll">展开全部</el-button>
        <el-button @click="collapseAll">收起全部</el-button>
        <el-button type="primary" @click="savePermissions" :loading="saving">
          保存权限
        </el-button>
      </div>
    </div>

    <!-- 权限树 -->
    <div class="permission-tree-container">
      <el-tree
        ref="permissionTreeRef"
        :data="permissionTree"
        :props="treeProps"
        :default-expand-all="false"
        :expand-on-click-node="false"
        :check-on-click-node="true"
        :show-checkbox="true"
        :check-strictly="false"
        :default-checked-keys="checkedPermissions"
        node-key="id"
        @check="handlePermissionCheck"
      >
        <template #default="{ node, data }">
          <div class="permission-node">
            <div class="permission-info">
              <el-icon :class="getPermissionIconClass(data.type)">
                <component :is="getPermissionIcon(data.type)" />
              </el-icon>
              <div class="permission-details">
                <div class="permission-name">{{ data.name }}</div>
                <div class="permission-code">{{ data.code }}</div>
              </div>
            </div>
            <div class="permission-description" v-if="data.description">
              {{ data.description }}
            </div>
            <div class="permission-meta">
              <el-tag v-if="data.type" size="small" :type="getTypeColor(data.type)">
                {{ getTypeText(data.type) }}
              </el-tag>
              <el-tag v-if="data.level" size="small" type="info">
                级别{{ data.level }}
              </el-tag>
            </div>
          </div>
        </template>
      </el-tree>
    </div>

    <!-- 权限统计 -->
    <div class="permission-stats">
      <div class="stat-item">
        <div class="stat-title">已选择权限</div>
        <div class="stat-value">{{ checkedPermissions.length }}</div>
      </div>
      <div class="stat-item">
        <div class="stat-title">菜单权限</div>
        <div class="stat-value">{{ menuPermissions.length }}</div>
      </div>
      <div class="stat-item">
        <div class="stat-title">操作权限</div>
        <div class="stat-value">{{ actionPermissions.length }}</div>
      </div>
      <div class="stat-item">
        <div class="stat-title">数据权限</div>
        <div class="stat-value">{{ dataPermissions.length }}</div>
      </div>
    </div>

    <!-- 权限预览 -->
    <div class="permission-preview">
      <div class="preview-header">
        <h4>权限预览</h4>
        <el-button size="small" @click="togglePreview">
          {{ showPreview ? '隐藏预览' : '显示预览' }}
        </el-button>
      </div>
      <div v-if="showPreview" class="preview-content">
        <div class="preview-section">
          <h5>菜单权限</h5>
          <div class="permission-tags">
            <el-tag
              v-for="perm in menuPermissions"
              :key="perm.id"
              size="small"
              type="success"
            >
              {{ perm.name }}
            </el-tag>
          </div>
        </div>
        <div class="preview-section">
          <h5>操作权限</h5>
          <div class="permission-tags">
            <el-tag
              v-for="perm in actionPermissions"
              :key="perm.id"
              size="small"
              type="primary"
            >
              {{ perm.name }}
            </el-tag>
          </div>
        </div>
        <div class="preview-section">
          <h5>数据权限</h5>
          <div class="permission-tags">
            <el-tag
              v-for="perm in dataPermissions"
              :key="perm.id"
              size="small"
              type="warning"
            >
              {{ perm.name }}
            </el-tag>
          </div>
        </div>
      </div>
    </div>

    <!-- 批量操作 -->
    <div class="batch-operations">
      <h4>批量操作</h4>
      <div class="operation-buttons">
        <el-button size="small" @click="selectAllByType('menu')">
          全选菜单权限
        </el-button>
        <el-button size="small" @click="selectAllByType('action')">
          全选操作权限
        </el-button>
        <el-button size="small" @click="selectAllByType('data')">
          全选数据权限
        </el-button>
        <el-button size="small" type="danger" @click="clearAll">
          清空选择
        </el-button>
      </div>
    </div>

    <!-- 权限模板 -->
    <div class="permission-templates">
      <h4>权限模板</h4>
      <div class="template-buttons">
        <el-button size="small" @click="applyTemplate('admin')">
          管理员模板
        </el-button>
        <el-button size="small" @click="applyTemplate('manager')">
          项目管理员模板
        </el-button>
        <el-button size="small" @click="applyTemplate('tester')">
          测试工程师模板
        </el-button>
        <el-button size="small" @click="applyTemplate('viewer')">
          普通用户模板
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import {
  Menu,
  Operation,
  DataAnalysis,
  Setting,
  Document,
  User,
  Folder,
  View
} from '@element-plus/icons-vue'

// Props
const props = defineProps({
  roleList: {
    type: Array,
    default: () => []
  },
  permissionTree: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['role-permission-change'])

// 响应式数据
const permissionTreeRef = ref(null)
const selectedRoleId = ref('')
const checkedPermissions = ref([])
const saving = ref(false)
const showPreview = ref(false)

// 计算属性
const selectedRole = computed(() => {
  return props.roleList.find(role => role.id === selectedRoleId.value)
})

const menuPermissions = computed(() => {
  return getPermissionsByType('menu')
})

const actionPermissions = computed(() => {
  return getPermissionsByType('action')
})

const dataPermissions = computed(() => {
  return getPermissionsByType('data')
})

const treeProps = {
  children: 'children',
  label: 'name'
}

// 权限图标映射
const getPermissionIcon = (type) => {
  const iconMap = {
    menu: Menu,
    action: Operation,
    data: DataAnalysis,
    system: Setting,
    page: Document,
    user: User,
    folder: Folder,
    view: View
  }
  return iconMap[type] || View
}

const getPermissionIconClass = (type) => {
  const classMap = {
    menu: 'menu-icon',
    action: 'action-icon',
    data: 'data-icon',
    system: 'system-icon'
  }
  return classMap[type] || 'default-icon'
}

const getTypeText = (type) => {
  const typeMap = {
    menu: '菜单',
    action: '操作',
    data: '数据',
    system: '系统'
  }
  return typeMap[type] || type
}

const getTypeColor = (type) => {
  const colorMap = {
    menu: 'success',
    action: 'primary',
    data: 'warning',
    system: 'danger'
  }
  return colorMap[type] || ''
}

// 方法
const handleRoleChange = async () => {
  if (!selectedRoleId.value) {
    checkedPermissions.value = []
    return
  }

  // 加载角色的权限
  try {
    const role = selectedRole.value
    if (role && role.permissions) {
      checkedPermissions.value = role.permissions.map(p => p.id)
      await nextTick()
      if (permissionTreeRef.value) {
        permissionTreeRef.value.setCheckedKeys(checkedPermissions.value)
      }
    }
  } catch (error) {
    console.error('加载角色权限失败:', error)
    checkedPermissions.value = []
  }
}

const handlePermissionCheck = (data, checked) => {
  // 更新选中的权限
  const treeInstance = permissionTreeRef.value
  if (treeInstance) {
    checkedPermissions.value = treeInstance.getCheckedKeys()
  }
}

const getPermissionsByType = (type) => {
  if (!permissionTreeRef.value) return []

  const allNodes = getAllTreeNodes(props.permissionTree)
  const checkedKeys = permissionTreeRef.value.getCheckedKeys()
  return allNodes.filter(node => checkedKeys.includes(node.id) && node.type === type)
}

const getAllTreeNodes = (nodes) => {
  const result = []
  const traverse = (nodeList) => {
    nodeList.forEach(node => {
      result.push(node)
      if (node.children && node.children.length > 0) {
        traverse(node.children)
      }
    })
  }
  traverse(nodes)
  return result
}

const expandAll = () => {
  if (permissionTreeRef.value) {
    permissionTreeRef.value.expandAll(true)
  }
}

const collapseAll = () => {
  if (permissionTreeRef.value) {
    permissionTreeRef.value.expandAll(false)
  }
}

const savePermissions = async () => {
  if (!selectedRoleId.value) {
    ElMessage.warning('请先选择角色')
    return
  }

  saving.value = true
  try {
    const permissions = checkedPermissions.value
    await emit('role-permission-change', {
      roleId: selectedRoleId.value,
      permissions
    })
    ElMessage.success('权限保存成功')
  } catch (error) {
    console.error('保存权限失败:', error)
    ElMessage.error('权限保存失败')
  } finally {
    saving.value = false
  }
}

const togglePreview = () => {
  showPreview.value = !showPreview.value
}

const selectAllByType = (type) => {
  if (!permissionTreeRef.value) return

  const allNodes = getAllTreeNodes(props.permissionTree)
  const typeNodes = allNodes.filter(node => node.type === type)
  const typeKeys = typeNodes.map(node => node.id)

  const currentChecked = permissionTreeRef.value.getCheckedKeys()
  const newChecked = [...new Set([...currentChecked, ...typeKeys])]

  checkedPermissions.value = newChecked
  permissionTreeRef.value.setCheckedKeys(newChecked)
}

const clearAll = () => {
  checkedPermissions.value = []
  if (permissionTreeRef.value) {
    permissionTreeRef.value.setCheckedKeys([])
  }
}

const applyTemplate = (templateType) => {
  if (!permissionTreeRef.value) return

  const templates = {
    admin: ['system:*', 'user:*', 'project:*', 'case:*', 'report:*'],
    manager: ['project:read', 'project:write', 'case:*', 'report:read'],
    tester: ['case:*', 'project:read', 'report:read'],
    viewer: ['case:read', 'project:read', 'report:read']
  }

  const templatePermissions = templates[templateType] || []
  const allNodes = getAllTreeNodes(props.permissionTree)

  // 根据模板匹配权限
  const matchedKeys = allNodes
    .filter(node => {
      return templatePermissions.some(pattern => {
        if (pattern.endsWith(':*')) {
          const prefix = pattern.slice(0, -2)
          return node.code.startsWith(prefix + ':')
        }
        return node.code === pattern
      })
    })
    .map(node => node.id)

  checkedPermissions.value = matchedKeys
  permissionTreeRef.value.setCheckedKeys(matchedKeys)
}

// 监听角色变化
watch(selectedRoleId, handleRoleChange)

// 初始化
watch(() => props.roleList, (newList) => {
  if (newList.length > 0 && !selectedRoleId.value) {
    selectedRoleId.value = newList[0].id
  }
}, { immediate: true })
</script>

<style scoped>
.permission-assignment-tab {
  padding: 20px 0;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px;
  background: #f8fbff;
  border-radius: 8px;
  gap: 16px;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.role-info {
  color: #6b7280;
  font-size: 14px;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.permission-tree-container {
  background: #fff;
  border: 1px solid #e6eef8;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  max-height: 500px;
  overflow-y: auto;
}

.permission-node {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 0;
}

.permission-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.permission-details {
  flex: 1;
}

.permission-name {
  font-weight: 500;
  color: #182026;
}

.permission-code {
  font-size: 12px;
  color: #9aa4b2;
}

.permission-description {
  font-size: 13px;
  color: #6b7280;
  margin-left: 32px;
}

.permission-meta {
  display: flex;
  gap: 6px;
  margin-left: 32px;
  margin-top: 4px;
}

.menu-icon {
  color: #52c41a;
}

.action-icon {
  color: #1890ff;
}

.data-icon {
  color: #faad14;
}

.system-icon {
  color: #f5222d;
}

.permission-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.stat-item {
  background: #fff;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e6eef8;
  text-align: center;
}

.stat-title {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1890ff;
}

.permission-preview {
  background: #fff;
  border: 1px solid #e6eef8;
  border-radius: 8px;
  margin-bottom: 20px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e6eef8;
}

.preview-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #182026;
}

.preview-content {
  padding: 20px;
}

.preview-section {
  margin-bottom: 16px;
}

.preview-section h5 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #182026;
}

.permission-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.batch-operations,
.permission-templates {
  background: #fff;
  border: 1px solid #e6eef8;
  border-radius: 8px;
  padding: 16px 20px;
  margin-bottom: 20px;
}

.batch-operations h4,
.permission-templates h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #182026;
}

.operation-buttons,
.template-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* Tree样式覆盖 */
:deep(.el-tree-node__content) {
  height: auto;
  padding: 8px 0;
}

:deep(.el-tree-node__expand-icon) {
  margin-right: 8px;
}

:deep(.el-checkbox) {
  margin-right: 8px;
}
</style>
