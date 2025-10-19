<template>
  <div class="personnel-container">
    <!-- 面包屑导航 -->
    <div class="breadcrumb">
      <span class="breadcrumb-item">首页</span>
      <span class="breadcrumb-separator">></span>
      <span class="breadcrumb-item active">人员管理</span>
    </div>

    <!-- 标签页 -->
    <el-tabs v-model="activeTab" class="personnel-tabs">
      <el-tab-pane label="用户管理" name="users">
        <!-- 用户管理内容 -->
        <div class="tab-content">
          <!-- 操作区域 -->
          <div class="action-section">
            <el-button type="primary" :icon="Plus" @click="showCreateUserDialog">
              创建新用户
            </el-button>
            
            <div class="search-section">
              <el-input
                v-model="searchKeyword"
                placeholder="搜索用户..."
                class="search-input"
                :prefix-icon="Search"
                @input="handleSearch"
              />
              <el-dropdown @command="handleFilterCommand">
                <el-button class="filter-btn">
                  <el-icon><Filter /></el-icon>
                  筛选条件
                  <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="all">全部状态</el-dropdown-item>
                    <el-dropdown-item command="active">活跃</el-dropdown-item>
                    <el-dropdown-item command="disabled">已禁用</el-dropdown-item>
                    <el-dropdown-item command="pending">待激活</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>

          <!-- 用户列表表格 -->
          <el-table 
            :data="userList" 
            class="user-table"
            v-loading="loading"
            style="width: 100%"
          >
            <el-table-column label="姓名" width="200">
              <template #default="scope">
                <div class="user-info">
                  <el-avatar :size="40" :src="scope.row.avatar">
                    {{ scope.row.name.charAt(0) }}
                  </el-avatar>
                  <span class="user-name">{{ scope.row.name }}</span>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column prop="email" label="邮箱" width="250" />
            
            <el-table-column prop="role" label="角色" width="120">
              <template #default="scope">
                <el-tag :type="getRoleType(scope.row.role)" size="small">
                  {{ scope.row.role }}
                </el-tag>
              </template>
            </el-table-column>
            
            <el-table-column label="状态" width="120">
              <template #default="scope">
                <el-tag 
                  :type="getStatusType(scope.row.status)" 
                  size="small"
                >
                  {{ getStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            
            <el-table-column prop="createTime" label="创建时间" width="180" />
            
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="scope">
                <el-button 
                  link 
                  type="primary" 
                  :icon="Edit"
                  @click="handleEditUser(scope.row)"
                >
                  编辑
                </el-button>
                <el-button 
                  v-if="scope.row.status === 'active'"
                  link 
                  type="warning" 
                  :icon="CircleClose"
                  @click="handleDisableUser(scope.row)"
                >
                  禁用
                </el-button>
                <el-button 
                  v-else-if="scope.row.status === 'disabled'"
                  link 
                  type="success" 
                  :icon="Check"
                  @click="handleEnableUser(scope.row)"
                >
                  启用
                </el-button>
                <el-button 
                  v-else-if="scope.row.status === 'pending'"
                  link 
                  type="success" 
                  :icon="Check"
                  @click="handleActivateUser(scope.row)"
                >
                  激活
                </el-button>
                <el-button 
                  link 
                  type="danger" 
                  :icon="Delete"
                  @click="handleDeleteUser(scope.row)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-container">
            <div class="pagination-info">
              显示 {{ (pagination.currentPage - 1) * pagination.pageSize + 1 }}-{{ Math.min(pagination.currentPage * pagination.pageSize, pagination.total) }} 条，共 {{ pagination.total }} 条
            </div>
            <el-pagination
              v-model:current-page="pagination.currentPage"
              v-model:page-size="pagination.pageSize"
              :page-sizes="[6, 10, 20, 50]"
              :total="pagination.total"
              layout="prev, pager, next"
              @size-change="handleSizeChange"
              @current-change="handlePageChange"
            />
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="项目分配" name="projects">
        <!-- 项目分配内容 -->
        <div class="tab-content">
          <div class="project-allocation">
            <h3>项目分配管理</h3>
            <p>这里将显示项目分配相关功能</p>
            <!-- TODO: 实现项目分配功能 -->
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 创建用户对话框 -->
    <el-dialog
      v-model="createUserDialogVisible"
      title="创建新用户"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="createUserFormRef"
        :model="createUserForm"
        :rules="createUserRules"
        label-width="100px"
      >
        <el-form-item label="姓名" prop="name">
          <el-input v-model="createUserForm.name" placeholder="请输入姓名" />
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="createUserForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        
        <el-form-item label="角色" prop="role">
          <el-select v-model="createUserForm.role" placeholder="请选择角色">
            <el-option label="管理员" value="管理员" />
            <el-option label="开发人员" value="开发人员" />
            <el-option label="测试人员" value="测试人员" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input 
            v-model="createUserForm.password" 
            type="password" 
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
        
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input 
            v-model="createUserForm.confirmPassword" 
            type="password" 
            placeholder="请确认密码"
            show-password
          />
        </el-form-item>
        
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="createUserForm.status">
            <el-radio label="active">活跃</el-radio>
            <el-radio label="pending">待激活</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="createUserDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleCreateUser">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 编辑用户对话框 -->
    <el-dialog
      v-model="editUserDialogVisible"
      title="编辑用户"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="editUserFormRef"
        :model="editUserForm"
        :rules="editUserRules"
        label-width="100px"
      >
        <el-form-item label="姓名" prop="name">
          <el-input v-model="editUserForm.name" placeholder="请输入姓名" />
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editUserForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        
        <el-form-item label="角色" prop="role">
          <el-select v-model="editUserForm.role" placeholder="请选择角色">
            <el-option label="管理员" value="管理员" />
            <el-option label="开发人员" value="开发人员" />
            <el-option label="测试人员" value="测试人员" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="editUserForm.status">
            <el-radio label="active">活跃</el-radio>
            <el-radio label="disabled">已禁用</el-radio>
            <el-radio label="pending">待激活</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editUserDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleUpdateUser">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Plus,
  Search,
  Filter,
  ArrowDown,
  Edit,
  CircleClose,
  Check,
  Delete
} from '@element-plus/icons-vue'
import { getUserList, createUser, updateUser, deleteUser, toggleUserStatus } from '../api/personnel'

// 当前标签页
const activeTab = ref('users')

// 搜索关键词
const searchKeyword = ref('')

// 分页信息
const pagination = reactive({
  currentPage: 1,
  pageSize: 6,
  total: 24
})

// 数据列表
const userList = ref([])
const loading = ref(false)

// 创建用户对话框
const createUserDialogVisible = ref(false)
const createUserFormRef = ref()
const createUserForm = reactive({
  name: '',
  email: '',
  role: '',
  password: '',
  confirmPassword: '',
  status: 'active'
})

const createUserRules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== createUserForm.password) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 编辑用户对话框
const editUserDialogVisible = ref(false)
const editUserFormRef = ref()
const editUserForm = reactive({
  id: '',
  name: '',
  email: '',
  role: '',
  status: ''
})

const editUserRules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
}

// 获取用户列表
const fetchUsers = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      keyword: searchKeyword.value
    }
    
    const response = await getUserList(params)
    userList.value = response.data || []
    pagination.total = response.total || 0
  } catch (error) {
    console.error('获取用户列表失败:', error)
    // 使用模拟数据
    userList.value = getMockUserData()
  } finally {
    loading.value = false
  }
}

// 模拟用户数据
const getMockUserData = () => {
  return [
    {
      id: 1,
      name: '李明',
      email: 'liming@example.com',
      role: '管理员',
      status: 'active',
      createTime: '2023-12-05 14:30',
      avatar: ''
    },
    {
      id: 2,
      name: '张华',
      email: 'zhanghua@example.com',
      role: '开发人员',
      status: 'active',
      createTime: '2024-01-12 09:45',
      avatar: ''
    },
    {
      id: 3,
      name: '王芳',
      email: 'wangfang@example.com',
      role: '测试人员',
      status: 'disabled',
      createTime: '2023-11-20 11:15',
      avatar: ''
    },
    {
      id: 4,
      name: '刘伟',
      email: 'liuwei@example.com',
      role: '开发人员',
      status: 'active',
      createTime: '2024-02-03 16:20',
      avatar: ''
    },
    {
      id: 5,
      name: '赵敏',
      email: 'zhaomin@example.com',
      role: '测试人员',
      status: 'pending',
      createTime: '2024-02-25 10:05',
      avatar: ''
    },
    {
      id: 6,
      name: '陈晓',
      email: 'chenxiao@example.com',
      role: '开发人员',
      status: 'active',
      createTime: '2023-12-28 15:40',
      avatar: ''
    }
  ]
}

// 获取角色类型
const getRoleType = (role) => {
  const roleMap = {
    '管理员': 'danger',
    '开发人员': 'primary',
    '测试人员': 'success'
  }
  return roleMap[role] || 'info'
}

// 获取状态类型
const getStatusType = (status) => {
  const statusMap = {
    'active': 'success',
    'disabled': 'danger',
    'pending': 'warning'
  }
  return statusMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    'active': '活跃',
    'disabled': '已禁用',
    'pending': '待激活'
  }
  return statusMap[status] || status
}

// 搜索处理
const handleSearch = () => {
  pagination.currentPage = 1
  fetchUsers()
}

// 筛选处理
const handleFilterCommand = (command) => {
  // TODO: 实现筛选逻辑
  ElMessage.info(`筛选条件: ${command}`)
}

// 显示创建用户对话框
const showCreateUserDialog = () => {
  createUserDialogVisible.value = true
  // 重置表单
  Object.assign(createUserForm, {
    name: '',
    email: '',
    role: '',
    password: '',
    confirmPassword: '',
    status: 'active'
  })
}

// 创建用户
const handleCreateUser = async () => {
  try {
    await createUserFormRef.value.validate()
    
    await createUser(createUserForm)
    ElMessage.success('用户创建成功')
    createUserDialogVisible.value = false
    fetchUsers()
  } catch (error) {
    console.error('创建用户失败:', error)
    ElMessage.error('创建用户失败，请稍后重试')
  }
}

// 编辑用户
const handleEditUser = (user) => {
  editUserDialogVisible.value = true
  Object.assign(editUserForm, {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status
  })
}

// 更新用户
const handleUpdateUser = async () => {
  try {
    await editUserFormRef.value.validate()
    
    await updateUser(editUserForm.id, editUserForm)
    ElMessage.success('用户更新成功')
    editUserDialogVisible.value = false
    fetchUsers()
  } catch (error) {
    console.error('更新用户失败:', error)
    ElMessage.error('更新用户失败，请稍后重试')
  }
}

// 禁用用户
const handleDisableUser = async (user) => {
  try {
    await ElMessageBox.confirm(
      `确定要禁用用户"${user.name}"吗？`,
      '禁用确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await toggleUserStatus(user.id, false)
    ElMessage.success('用户已禁用')
    fetchUsers()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('禁用用户失败:', error)
      ElMessage.error('禁用用户失败，请稍后重试')
    }
  }
}

// 启用用户
const handleEnableUser = async (user) => {
  try {
    await toggleUserStatus(user.id, true)
    ElMessage.success('用户已启用')
    fetchUsers()
  } catch (error) {
    console.error('启用用户失败:', error)
    ElMessage.error('启用用户失败，请稍后重试')
  }
}

// 激活用户
const handleActivateUser = async (user) => {
  try {
    await toggleUserStatus(user.id, true)
    ElMessage.success('用户已激活')
    fetchUsers()
  } catch (error) {
    console.error('激活用户失败:', error)
    ElMessage.error('激活用户失败，请稍后重试')
  }
}

// 删除用户
const handleDeleteUser = async (user) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户"${user.name}"吗？此操作不可恢复！`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await deleteUser(user.id)
    ElMessage.success('用户删除成功')
    fetchUsers()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除用户失败:', error)
      ElMessage.error('删除用户失败，请稍后重试')
    }
  }
}

// 分页大小改变
const handleSizeChange = (size) => {
  pagination.pageSize = size
  fetchUsers()
}

// 当前页改变
const handlePageChange = (page) => {
  pagination.currentPage = page
  fetchUsers()
}

// 组件挂载时加载数据
onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.personnel-container {
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

.personnel-tabs {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.tab-content {
  padding: 20px;
}

.action-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-input {
  width: 200px;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 4px;
}

.user-table {
  margin-bottom: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-info {
  font-size: 14px;
  color: #606266;
}

.project-allocation {
  padding: 40px;
  text-align: center;
  color: #909399;
}

.project-allocation h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  color: #606266;
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

:deep(.el-avatar) {
  background-color: #409eff;
  color: white;
  font-weight: 600;
}
</style>