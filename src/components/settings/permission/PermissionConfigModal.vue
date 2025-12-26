<template>
  <el-dialog
    :model-value="visible"
    title="权限配置"
    width="800px"
    :close-on-click-modal="false"
    @update:model-value="$emit('update:visible', $event)"
    @close="handleClose"
  >
    <div class="permission-config-content">
      <!-- 权限树 -->
      <div class="permission-tree-section">
        <div class="section-header">
          <h4>权限列表</h4>
          <div class="tree-actions">
            <el-button size="small" @click="expandAll">展开全部</el-button>
            <el-button size="small" @click="collapseAll">收起全部</el-button>
            <el-input
              v-model="searchKeyword"
              placeholder="搜索权限"
              size="small"
              prefix-icon="Search"
              style="width: 150px"
            />
          </div>
        </div>

        <div class="permission-tree">
          <el-tree
            ref="permissionTreeRef"
            :data="filteredPermissionTree"
            :props="treeProps"
            :default-expand-all="false"
            :expand-on-click-node="false"
            :check-on-click-node="true"
            :show-checkbox="true"
            :check-strictly="false"
            :default-checked-keys="selectedPermissions"
            node-key="id"
            @check="handlePermissionCheck"
            @node-click="handleNodeClick"
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
                <div class="permission-actions">
                  <el-button
                    v-if="data.type === 'menu'"
                    size="mini"
                    type="text"
                    @click.stop="editPermission(data)"
                  >
                    编辑
                  </el-button>
                  <el-tag
                    v-if="data.level"
                    size="mini"
                    :type="getLevelColor(data.level)"
                  >
                    L{{ data.level }}
                  </el-tag>
                </div>
              </div>
            </template>
          </el-tree>
        </div>
      </div>

      <!-- 权限详情 -->
      <div class="permission-detail-section">
        <div class="section-header">
          <h4>权限详情</h4>
          <div class="detail-actions">
            <el-button size="small" type="primary" @click="addPermission">
              新增权限
            </el-button>
          </div>
        </div>

        <div v-if="selectedPermission" class="permission-detail">
          <div class="detail-item">
            <label>权限名称：</label>
            <span>{{ selectedPermission.name }}</span>
          </div>
          <div class="detail-item">
            <label>权限编码：</label>
            <span>{{ selectedPermission.code }}</span>
          </div>
          <div class="detail-item">
            <label>权限类型：</label>
            <el-tag :type="getTypeColor(selectedPermission.type)">
              {{ getTypeText(selectedPermission.type) }}
            </el-tag>
          </div>
          <div class="detail-item">
            <label>权限级别：</label>
            <span>{{ selectedPermission.level || '未设置' }}</span>
          </div>
          <div class="detail-item full-width">
            <label>描述：</label>
            <span>{{ selectedPermission.description || '暂无描述' }}</span>
          </div>
          <div class="detail-item">
            <label>状态：</label>
            <el-tag :type="selectedPermission.status === 'active' ? 'success' : 'info'">
              {{ selectedPermission.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </div>
        </div>

        <div v-else class="no-selection">
          <el-empty description="请在左侧选择权限查看详情" />
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose" :disabled="isSubmitting">
          取消
        </el-button>
        <el-button
          type="primary"
          @click="handleSubmit"
          :loading="isSubmitting"
        >
          确定
        </el-button>
      </div>
    </template>

    <!-- 编辑权限对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      :title="editingPermission ? '编辑权限' : '新增权限'"
      width="500px"
      :close-on-click-modal="false"
    >
      <div class="edit-permission-form">
        <el-form
          ref="permissionFormRef"
          :model="permissionForm"
          :rules="permissionFormRules"
          label-width="100px"
        >
          <el-form-item label="权限名称" prop="name">
            <el-input
              v-model="permissionForm.name"
              placeholder="请输入权限名称"
              :maxlength="50"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="权限编码" prop="code">
            <el-input
              v-model="permissionForm.code"
              placeholder="请输入权限编码"
              :maxlength="100"
              show-word-limit
              :disabled="!!editingPermission"
            />
          </el-form-item>

          <el-form-item label="权限类型" prop="type">
            <el-select v-model="permissionForm.type" placeholder="请选择权限类型" style="width: 100%">
              <el-option label="菜单权限" value="menu" />
              <el-option label="操作权限" value="action" />
              <el-option label="数据权限" value="data" />
            </el-select>
          </el-form-item>

          <el-form-item label="上级权限">
            <el-tree-select
              v-model="permissionForm.parentId"
              :data="permissionTree"
              :props="treeSelectProps"
              placeholder="请选择上级权限"
              style="width: 100%"
              check-strictly
              :default-expand-all="false"
            />
          </el-form-item>

          <el-form-item label="权限级别">
            <el-input-number
              v-model="permissionForm.level"
              :min="1"
              :max="10"
              :precision="0"
              controls-position="right"
            />
          </el-form-item>

          <el-form-item label="排序">
            <el-input-number
              v-model="permissionForm.sortOrder"
              :min="0"
              :max="999"
              :precision="0"
              controls-position="right"
            />
          </el-form-item>

          <el-form-item label="状态">
            <el-radio-group v-model="permissionForm.status">
              <el-radio label="active">启用</el-radio>
              <el-radio label="inactive">禁用</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="描述">
            <el-input
              v-model="permissionForm.description"
              type="textarea"
              :rows="3"
              placeholder="请输入权限描述"
              :maxlength="200"
              show-word-limit
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="savePermission" :loading="savingPermission">
            保存
          </el-button>
        </div>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick } from 'vue'
import {
  Menu,
  Operation,
  DataAnalysis,
  Setting,
  Document,
  User,
  Folder,
  View,
  Search
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  permissionTree: {
    type: Array,
    default: () => []
  },
  selectedPermissions: {
    type: Array,
    default: () => []
  },
  isSubmitting: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['close', 'submit'])

// 响应式数据
const permissionTreeRef = ref(null)
const searchKeyword = ref('')
const selectedPermission = ref(null)
const editDialogVisible = ref(false)
const editingPermission = ref(null)
const savingPermission = ref(false)

const permissionForm = reactive({
  name: '',
  code: '',
  type: 'menu',
  parentId: '',
  level: 1,
  sortOrder: 0,
  status: 'active',
  description: ''
})

const permissionFormRules = {
  name: [
    { required: true, message: '请输入权限名称', trigger: 'blur' },
    { min: 2, max: 50, message: '权限名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入权限编码', trigger: 'blur' },
    { pattern: /^[a-zA-Z][a-zA-Z0-9_:.]*$/, message: '权限编码只能包含字母、数字、下划线、点号和冒号，且必须以字母开头', trigger: 'blur' },
    { min: 2, max: 100, message: '权限编码长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择权限类型', trigger: 'change' }
  ]
}

const treeProps = {
  children: 'children',
  label: 'name'
}

const treeSelectProps = {
  children: 'children',
  label: 'name',
  value: 'id'
}

// 计算属性
const filteredPermissionTree = computed(() => {
  if (!searchKeyword.value) return props.permissionTree

  const keyword = searchKeyword.value.toLowerCase()
  const filterNode = (nodes) => {
    return nodes.filter(node => {
      const matchSelf = node.name.toLowerCase().includes(keyword) ||
                       node.code.toLowerCase().includes(keyword) ||
                       (node.description && node.description.toLowerCase().includes(keyword))

      const matchChildren = node.children ? filterNode(node.children).length > 0 : false

      return matchSelf || matchChildren
    }).map(node => ({
      ...node,
      children: node.children ? filterNode(node.children) : undefined
    }))
  }

  return filterNode(props.permissionTree)
})

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
    menu: '菜单权限',
    action: '操作权限',
    data: '数据权限',
    system: '系统权限'
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
  return colorMap[type] || 'info'
}

const getLevelColor = (level) => {
  if (level <= 2) return 'success'
  if (level <= 4) return 'primary'
  if (level <= 6) return 'warning'
  return 'danger'
}

// 方法
const handleClose = () => {
  if (props.isSubmitting) return
  emit('close')
}

const handleSubmit = () => {
  const treeInstance = permissionTreeRef.value
  if (treeInstance) {
    const checkedKeys = treeInstance.getCheckedKeys()
    emit('submit', checkedKeys)
  } else {
    emit('submit', [])
  }
}

const handlePermissionCheck = (data, checked) => {
  // 权限勾选处理逻辑
  console.log('Permission checked:', data, checked)
}

const handleNodeClick = (data) => {
  selectedPermission.value = data
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

const addPermission = () => {
  editingPermission.value = null
  Object.assign(permissionForm, {
    name: '',
    code: '',
    type: 'menu',
    parentId: '',
    level: 1,
    sortOrder: 0,
    status: 'active',
    description: ''
  })
  editDialogVisible.value = true
}

const editPermission = (permission) => {
  editingPermission.value = permission
  Object.assign(permissionForm, {
    name: permission.name || '',
    code: permission.code || '',
    type: permission.type || 'menu',
    parentId: permission.parentId || '',
    level: permission.level || 1,
    sortOrder: permission.sortOrder || 0,
    status: permission.status || 'active',
    description: permission.description || ''
  })
  editDialogVisible.value = true
}

const savePermission = async () => {
  if (!permissionFormRef.value) return

  try {
    await permissionFormRef.value.validate()
    savingPermission.value = true

    // 这里应该调用API保存权限
    // await savePermissionApi(permissionForm)

    ElMessage.success(editingPermission.value ? '权限更新成功' : '权限创建成功')
    editDialogVisible.value = false

    // 重新加载权限树
    // await loadPermissionTree()

  } catch (error) {
    console.error('保存权限失败:', error)
    ElMessage.error('保存权限失败')
  } finally {
    savingPermission.value = false
  }
}

// 初始化选中的权限
watch(() => props.visible, (newVisible) => {
  if (newVisible) {
    nextTick(() => {
      if (permissionTreeRef.value && props.selectedPermissions.length > 0) {
        permissionTreeRef.value.setCheckedKeys(props.selectedPermissions)
      }
    })
  }
})
</script>

<style scoped>
.permission-config-content {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;
  height: 600px;
}

.permission-tree-section,
.permission-detail-section {
  background: #fff;
  border: 1px solid #e6eef8;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e6eef8;
  background: #f8fbff;
  border-radius: 8px 8px 0 0;
}

.section-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #182026;
}

.tree-actions,
.detail-actions {
  display: flex;
  gap: 8px;
}

.permission-tree {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.permission-node {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.permission-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
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

.permission-actions {
  display: flex;
  align-items: center;
  gap: 8px;
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

.permission-detail {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-item.full-width {
  align-items: flex-start;
}

.detail-item label {
  font-weight: 500;
  color: #6b7280;
  white-space: nowrap;
  min-width: 80px;
}

.detail-item span {
  color: #182026;
}

.no-selection {
  padding: 40px 20px;
  text-align: center;
}

.edit-permission-form {
  padding: 20px 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
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

/* 响应式 */
@media (max-width: 1024px) {
  .permission-config-content {
    grid-template-columns: 1fr;
    height: auto;
  }

  .permission-detail-section {
    order: -1;
  }
}
</style>
