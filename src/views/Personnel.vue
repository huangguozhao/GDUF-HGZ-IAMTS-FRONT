<template>
  <div class="personnel-page">
    <div class="personnel-content">
      <div class="tabs">
        <button 
          class="tab-button" 
          :class="{ active: activeTab === 'users' }" 
          @click="switchTab('users')"
        >
          用户管理
        </button>
        <button 
          class="tab-button" 
          :class="{ active: activeTab === 'projects' }" 
          @click="switchTab('projects')"
        >
          项目分配
        </button>
      </div>
    </div>

      <div class="toolbar">
        <button class="btn btn-primary" @click="openCreateUserModal">+ 创建新用户</button>
        <div class="toolbar-right">
          <div class="search-input-wrapper">
            <svg class="search-icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M909.6 854.1 646.1 590.6a360.6 360.6 0 1 0-23.5 23.5l263.5 263.5a16.9 16.9 0 0 0 23.5 0l23.5-23.5a16.9 16.9 0 0 0 0-23.5zM413.5 755.1a320.6 320.6 0 1 1 0-641.2 320.6 320.6 0 0 1 0 641.2z"></path></svg>
            <input type="text" class="search-input" placeholder="搜索用户..." v-model="searchKeyword" @keyup.enter="handleSearch">
            </div>
          <button class="btn btn-filter" @click="openFilterModal">筛选条件</button>
          </div>
                </div>

      <div v-if="activeTab === 'users'" class="tab-pane">
        <div class="table-wrapper">
          <table class="user-table">
            <thead>
              <tr>
                <th>姓名</th>
                <th>邮箱</th>
                <th>角色</th>
                <th>状态</th>
                <th>创建时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody v-if="!loading">
              <tr v-for="user in userList" :key="user.id">
                <td>
                  <div class="user-cell">
                    <div class="avatar-container">
                      <img v-if="user.avatar && !user.avatarError" :src="user.avatar" @error="user.avatarError = true" class="user-avatar" alt="avatar">
                      <div v-else class="user-avatar-fallback">
                        {{ getInitials(user.name) }}
                      </div>
                    </div>
                    <span>{{ user.name }}</span>
                  </div>
                </td>
                <td>{{ user.email }}</td>
                <td>{{ user.role }}</td>
                <td>
                  <span :class="['status-tag', getStatusClass(user.status)]">{{ user.status }}</span>
                </td>
                <td>{{ user.createTime }}</td>
                <td>
                  <div class="action-buttons">
                    <button class="action-btn" title="编辑" @click="openEditUserModal(user)">
                      <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M880 836H144c-17.7 0-32 14.3-32 32v36c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-36c0-17.7-14.3-32-32-32zm-622.3-84c2 0 4-.2 6-.5L431 712.3l109.9 110c2.6 2.6 6 4 9.5 4s6.9-1.3 9.5-4l45.2-45.2a13.2 13.2 0 0 0 0-18.7l-25.9-25.9a13.2 13.2 0 0 0-18.7 0l-18.4 18.4-93-93.1 18.4-18.4a13.2 13.2 0 0 0 0-18.7l-25.9-25.9a13.2 13.2 0 0 0-18.7 0l-45.2 45.2a13.2 13.2 0 0 0-4 9.5c0 3.5 1.3 6.9 4 9.5L381.2 752l-167.5-39.4c-3.6-.9-7.3.4-9.8 3.4L159 759.3a13.2 13.2 0 0 0-3.3 10.3c.1 3.9 2.1 7.5 5.2 9.8l45.1 33.1c2.1 1.5 4.7 2.3 7.3 2.3zM764.4 251.9l-252.1 252.1a13.2 13.2 0 0 0-3.7 9.4l-6.4 86.8c-.9 12.2 8.5 22.4 20.6 21.5l86.8-6.4a13.2 13.2 0 0 0 9.4-3.7l252.1-252.1c4.6-4.6 4.6-12.1 0-16.8l-69.8-69.8c-4.6-4.6-12.1-4.6-16.8 0z"></path></svg>
                    </button>
                    <button
                      class="action-btn"
                      :title="statusChangingIds.has(user.id) ? '状态更新中' : '更改状态'"
                      @click="handleToggleStatus(user)"
                      :disabled="statusChangingIds.has(user.id)"
                    >
                       <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896zm-55.8 536.3-203-203a30.1 30.1 0 0 0-42.5 42.5l224.2 224.2a30.1 30.1 0 0 0 42.5 0l424.2-424.2a30.1 30.1 0 1 0-42.5-42.5L456.2 600.3z"></path></svg>
                    </button>
                    <button 
                      class="action-btn" 
                      :title="deletingIds.has(user.id) ? '删除中...' : '删除'"
                      @click="handleDeleteUser(user)"
                      :disabled="deletingIds.has(user.id)"
                    >
                      <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M360 184h-8c4.4 0 8-3.6 8-8v8h304v-8c0 4.4 3.6 8 8 8h-8v-32h-8c-4.4 0-8 3.6-8 8v8H376v-8c0-4.4-3.6-8-8-8h-8v32zM464 288h112c4.4 0 8-3.6 8-8v-48H456v48c0 4.4 3.6 8 8 8zm328 0h-8c4.4 0 8-3.6 8-8v-48h104v48c0 4.4 3.6 8-8 8h-8zm-472-48H112v48c0 4.4 3.6 8 8 8h-8c4.4 0 8-3.6 8-8v-48h104v48c0 4.4 3.6 8 8 8zm184 560h256c4.4 0 8-3.6 8-8V448H448v400c0 4.4 3.6 8 8 8zm-112-400v400c0 4.4 3.6 8 8 8h80V448H336zm496-400H192c-17.7 0-32 14.3-32 32v64h736v-64c0-17.7-14.3-32-32-32z"></path></svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="loading" class="loading-placeholder">正在加载...</div>
        </div>

        <div class="pagination">
          <span class="pagination-summary">显示 {{ (pagination.currentPage - 1) * pagination.pageSize + 1 }}-{{ Math.min(pagination.currentPage * pagination.pageSize, pagination.total) }} 条, 共 {{ pagination.total }} 条</span>
          <div class="pagination-controls">
            <button class="pagination-btn" @click="handlePageChange(pagination.currentPage - 1)" :disabled="pagination.currentPage <= 1">上一页</button>
            <button 
              v-for="page in totalPages" 
              :key="page" 
              @click="handlePageChange(page)" 
              :class="['pagination-btn', { active: page === pagination.currentPage }]">{{ page }}</button>
            <button class="pagination-btn" @click="handlePageChange(pagination.currentPage + 1)" :disabled="pagination.currentPage >= totalPages">下一页</button>
              </div>
            </div>
          </div>

      <div v-else class="tab-pane project-assignment">
        <div class="table-wrapper">
          <table class="user-table">
            <thead>
              <tr>
                <th>姓名</th>
                <th>邮箱</th>
                <th>角色</th>
                <th>状态</th>
                <th>已分配项目</th>
                <th>创建时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody v-if="!loading">
              <tr v-for="user in userList" :key="user.id">
                <td>
                  <div class="user-cell">
                    <div class="avatar-container">
                      <img v-if="user.avatar && !user.avatarError" :src="user.avatar" @error="user.avatarError = true" class="user-avatar" alt="avatar">
                      <div v-else class="user-avatar-fallback">
                        {{ getInitials(user.name) }}
                      </div>
                    </div>
                    <span>{{ user.name }}</span>
                  </div>
                </td>
                <td>{{ user.email }}</td>
                <td>{{ user.role }}</td>
                <td>
                  <span :class="['status-tag', getStatusClass(user.status)]">{{ user.status }}</span>
                </td>
                <td>
                  <div class="project-tags">
                    <span 
                      v-if="user.assignedProjects && user.assignedProjects.length"
                      v-for="projectName in user.assignedProjects"
                      :key="projectName"
                      class="project-tag"
                    >
                      {{ projectName }}
                    </span>
                    <span v-else class="project-tag project-tag--empty">未分配</span>
                  </div>
                </td>
                <td>{{ user.createTime }}</td>
                <td>
                  <div class="action-buttons">
                    <button 
                      class="action-btn" 
                      title="分配项目" 
                      @click="openAssignModal(user)" 
                      :disabled="assignmentLoadingIds.has(user.id)"
                    >
                      <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M480 128h64v768h-64zM128 480h768v64H128z"></path></svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="loading" class="loading-placeholder">正在加载...</div>
        </div>

        <div class="pagination">
          <span class="pagination-summary">显示 {{ (pagination.currentPage - 1) * pagination.pageSize + 1 }}-{{ Math.min(pagination.currentPage * pagination.pageSize, pagination.total) }} 条, 共 {{ pagination.total }} 条</span>
          <div class="pagination-controls">
            <button class="pagination-btn" @click="handlePageChange(pagination.currentPage - 1)" :disabled="pagination.currentPage <= 1">上一页</button>
            <button 
              v-for="page in totalPages" 
              :key="page" 
              @click="handlePageChange(page)" 
              :class="['pagination-btn', { active: page === pagination.currentPage }]">{{ page }}</button>
            <button class="pagination-btn" @click="handlePageChange(pagination.currentPage + 1)" :disabled="pagination.currentPage >= totalPages">下一页</button>
          </div>
        </div>
      </div>

    <!-- Assign Projects Modal -->
    <div v-if="isAssignModalVisible" class="modal-overlay" @click.self="closeAssignModal">
      <div class="modal-panel">
        <h3 class="modal-title">项目分配 - {{ assignForm.userName }}</h3>
        <div v-if="assignModalLoading" class="loading-placeholder">加载项目数据...</div>
        <form v-else class="modal-form" @submit.prevent="handleAssignProjects">
          <div class="form-grid">
            <div class="form-group form-group--full-width">
              <label>选择项目</label>
              <div v-if="projectOptionsLoading" class="loading-placeholder">项目列表加载中...</div>
              <div v-else class="project-checkbox-list">
                <label v-for="project in projectOptions" :key="project.id" class="checkbox-item">
                  <input type="checkbox" :value="project.id" v-model="assignForm.projectIds">
                  <span>{{ project.name }}</span>
                </label>
                <div v-if="!projectOptions.length" class="empty-placeholder">暂无项目数据</div>
              </div>
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="closeAssignModal" :disabled="assignModalSubmitting">取消</button>
            <button type="submit" class="btn btn-primary" :disabled="assignModalSubmitting">
              {{ assignModalSubmitting ? '保存中...' : '保存' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Create User Modal -->
    <div v-if="isCreateUserModalVisible" class="modal-overlay" @click.self="closeCreateUserModal">
      <div class="modal-panel">
        <h3 class="modal-title">创建新用户</h3>
        <form class="modal-form" @submit.prevent="handleCreateUser">
          <div class="form-grid">
            <div class="form-group">
              <label for="name">姓名</label>
              <input type="text" id="name" v-model="createUserForm.name" required>
          </div>
            <div class="form-group">
              <label for="email">邮箱</label>
              <input type="email" id="email" v-model="createUserForm.email" required>
        </div>
            <div class="form-group">
              <label for="password">密码</label>
              <input type="password" id="password" v-model="createUserForm.password" required>
            </div>
            <div class="form-group">
              <label for="phone">手机号</label>
              <input type="text" id="phone" v-model="createUserForm.phone">
            </div>
            <div class="form-group">
              <label for="position">职位</label>
              <input type="text" id="position" v-model="createUserForm.position">
            </div>
            <div class="form-group">
              <label for="employeeId">工号</label>
              <input type="text" id="employeeId" v-model="createUserForm.employeeId">
            </div>
            <div class="form-group">
              <label for="departmentId">部门ID</label>
              <input type="number" id="departmentId" v-model.number="createUserForm.departmentId">
            </div>
            <div class="form-group">
              <label for="avatarUrl">头像URL</label>
              <input type="text" id="avatarUrl" v-model="createUserForm.avatarUrl">
            </div>
            <div class="form-group form-group--full-width">
              <label for="description">描述</label>
              <textarea id="description" v-model="createUserForm.description"></textarea>
            </div>
            <div class="form-group form-group--full-width">
              <label>状态</label>
              <div class="radio-group">
                <label><input type="radio" v-model="createUserForm.status" value="active"> 激活</label>
                <label><input type="radio" v-model="createUserForm.status" value="pending"> 待审核</label>
              </div>
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="closeCreateUserModal" :disabled="isSubmitting">取消</button>
            <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
              {{ isSubmitting ? '提交中...' : '确定' }}
            </button>
          </div>
        </form>
      </div>
                </div>

    <!-- Edit User Modal -->
    <div v-if="isEditUserModalVisible" class="modal-overlay" @click.self="closeEditUserModal">
      <div class="modal-panel">
        <h3 class="modal-title">编辑用户</h3>
        <form class="modal-form" @submit.prevent="handleUpdateUser">
          <div class="form-grid">
            <div class="form-group">
              <label for="edit-name">姓名</label>
              <input type="text" id="edit-name" v-model="editUserForm.name" required>
            </div>
            <div class="form-group">
              <label for="edit-email">邮箱</label>
              <input type="email" id="edit-email" v-model="editUserForm.email" required>
            </div>
            <div class="form-group">
              <label for="edit-phone">手机号</label>
              <input type="text" id="edit-phone" v-model="editUserForm.phone">
            </div>
            <div class="form-group">
              <label for="edit-position">职位</label>
              <input type="text" id="edit-position" v-model="editUserForm.position">
            </div>
            <div class="form-group">
              <label for="edit-employeeId">工号</label>
              <input type="text" id="edit-employeeId" v-model="editUserForm.employeeId">
            </div>
            <div class="form-group">
              <label for="edit-departmentId">部门ID</label>
              <input type="number" id="edit-departmentId" v-model.number="editUserForm.departmentId">
            </div>
            <div class="form-group form-group--full-width">
              <label for="edit-avatarUrl">头像URL</label>
              <input type="text" id="edit-avatarUrl" v-model="editUserForm.avatarUrl">
            </div>
            <div class="form-group form-group--full-width">
              <label for="edit-description">描述</label>
              <textarea id="edit-description" v-model="editUserForm.description"></textarea>
            </div>
            <div class="form-group form-group--full-width">
              <label>状态</label>
              <div class="radio-group">
                <label><input type="radio" v-model="editUserForm.status" value="active"> 激活</label>
                <label><input type="radio" v-model="editUserForm.status" value="pending"> 待审核</label>
                <label><input type="radio" v-model="editUserForm.status" value="disabled"> 禁用</label>
              </div>
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="closeEditUserModal">取消</button>
            <button type="submit" class="btn btn-primary" :disabled="isUpdating">
              {{ isUpdating ? '更新中...' : '更新' }}
            </button>
          </div>
        </form>
        </div>
        </div>

    <!-- Filter Modal -->
    <div v-if="isFilterModalVisible" class="modal-overlay" @click.self="closeFilterModal">
      <div class="modal-panel filter-modal">
        <h3 class="modal-title">筛选条件</h3>
        <form class="modal-form" @submit.prevent="handleApplyFilter">
          <div class="form-grid">
            <div class="form-group">
              <label for="filter-status">状态</label>
              <select id="filter-status" v-model="filterForm.status">
                <option value="">全部</option>
                <option value="active">激活</option>
                <option value="pending">待审核</option>
                <option value="inactive">禁用</option>
              </select>
            </div>
            <div class="form-group">
              <label for="filter-position">角色/职位</label>
              <input type="text" id="filter-position" v-model="filterForm.position" placeholder="请输入角色/职位">
            </div>
            <div class="form-group">
              <label for="filter-startDate">创建时间（开始）</label>
              <input type="date" id="filter-startDate" v-model="filterForm.startDate">
            </div>
            <div class="form-group">
              <label for="filter-endDate">创建时间（结束）</label>
              <input type="date" id="filter-endDate" v-model="filterForm.endDate">
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="handleResetFilter">重置</button>
            <button type="button" class="btn btn-secondary" @click="closeFilterModal">取消</button>
            <button type="submit" class="btn btn-primary">确定</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Toast -->
    <div v-if="toast.visible" class="toast">
      {{ toast.message }}
        </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { getUserList, createUser, updateUser, updateUserStatus, deleteUser } from '@/api/user';
import { getUserProjects, updateUserProjects } from '@/api/personnel';
import { getProjects } from '@/api/project';

const searchKeyword = ref('');
const activeTab = ref('users');
const pagination = reactive({
  currentPage: 1,
  pageSize: 6,
  total: 0,
});
const userList = ref([]);
const loading = ref(false);
const isCreateUserModalVisible = ref(false);
const isSubmitting = ref(false);
const isUpdating = ref(false);
const statusChangingIds = ref(new Set());
const deletingIds = ref(new Set());
const assignmentLoadingIds = ref(new Set());
const toast = reactive({
  visible: false,
  message: '',
});
const projectOptions = ref([]);
const projectOptionsLoading = ref(false);
const createUserForm = reactive({
  name: '',
  email: '',
  password: '',
  phone: '',
  avatarUrl: '',
  departmentId: null,
  employeeId: '',
  position: '',
  description: '',
  status: 'active',
});
const isAssignModalVisible = ref(false);
const assignModalLoading = ref(false);
const assignModalSubmitting = ref(false);
const assignForm = reactive({
  userId: null,
  userName: '',
  projectIds: [],
});

// Edit User Modal State
const isEditUserModalVisible = ref(false);
const editUserForm = reactive({
  id: null,
  name: '',
  email: '',
  phone: '',
  avatarUrl: '',
  departmentId: null,
  employeeId: '',
  position: '',
  description: '',
  status: '',
});

// Filter Modal State
const isFilterModalVisible = ref(false);
const filterForm = reactive({
  status: '',
  position: '',
  startDate: '',
  endDate: '',
});

const totalPages = computed(() => Math.ceil(pagination.total / pagination.pageSize));

const normalizeProjectList = (payload = []) => {
  const source =
    (payload && Array.isArray(payload.items) && payload.items) ||
    (payload && Array.isArray(payload.data) && payload.data) ||
    (Array.isArray(payload) ? payload : []);

  return source
    .map((item) => ({
      id: item?.id ?? item?.projectId ?? item?.project_id,
      name: item?.name ?? item?.projectName ?? item?.project_name ?? item?.code ?? '未命名项目',
    }))
    .filter((item) => item.id);
};

const fetchProjectOptions = async () => {
  if (projectOptions.value.length || projectOptionsLoading.value) return;
  projectOptionsLoading.value = true;
  try {
    const response = await getProjects({ page: 1, pageSize: 200 });
    projectOptions.value = normalizeProjectList(response?.data);
  } catch (error) {
    console.error('获取项目列表失败:', error);
    showToast('获取项目列表失败，请稍后重试');
  } finally {
    projectOptionsLoading.value = false;
  }
};

const hydrateUserProjects = async (users) => {
  if (!users || !users.length) return;
  const tasks = users.map(async (user) => {
    if (!user?.id) return;
    assignmentLoadingIds.value.add(user.id);
    try {
      const response = await getUserProjects(user.id);
      const projects = normalizeProjectList(response?.data);
      user.assignedProjectIds = projects.map((item) => item.id);
      user.assignedProjects = projects.map((item) => item.name).filter(Boolean);
    } catch (error) {
      console.error('获取用户项目失败:', error);
    } finally {
      assignmentLoadingIds.value.delete(user.id);
    }
  });
  await Promise.all(tasks);
};

const switchTab = async (tab) => {
  if (activeTab.value === tab) return;
  activeTab.value = tab;
  if (tab === 'projects') {
    await fetchProjectOptions();
    await fetchUsers({ withProjects: true });
  } else {
    await fetchUsers({ withProjects: false });
  }
};

// Create User Functions
const openCreateUserModal = () => {
  Object.assign(createUserForm, {
  name: '',
  email: '',
  password: '',
    phone: '',
    avatarUrl: '',
    departmentId: null,
    employeeId: '',
    position: '',
    description: '',
    status: 'active',
  });
  isCreateUserModalVisible.value = true;
};

const closeCreateUserModal = () => {
  isCreateUserModalVisible.value = false;
};

const handleCreateUser = async () => {
  if (!createUserForm.name || !createUserForm.email || !createUserForm.password) {
    alert('姓名、邮箱和密码为必填项');
    return;
  }

  isSubmitting.value = true;
  try {
    await createUser(createUserForm);
    alert('用户创建成功！');
    closeCreateUserModal();
    await fetchUsers();
  } catch (error) {
    console.error('创建用户失败:', error);
    alert('创建用户失败，请稍后重试');
  } finally {
    isSubmitting.value = false;
  }
};

// Edit User Functions
const openEditUserModal = (user) => {
  // Use backend position if available; fall back to displayed role text
  Object.assign(editUserForm, {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    departmentId: user.departmentId,
    employeeId: user.employeeId,
    position: user.position ?? user.role,
    description: user.description,
    status: user.status,
  });
  isEditUserModalVisible.value = true;
};

const closeEditUserModal = () => {
  isEditUserModalVisible.value = false;
};

const handleUpdateUser = async () => {
  if (!editUserForm.name || !editUserForm.email) {
    alert('姓名和邮箱为必填项');
    return;
  }

  isUpdating.value = true;
  try {
    await updateUser(editUserForm.id, {
      name: editUserForm.name,
      email: editUserForm.email,
      phone: editUserForm.phone,
      avatarUrl: editUserForm.avatarUrl,
      departmentId: editUserForm.departmentId,
      employeeId: editUserForm.employeeId,
      position: editUserForm.position,
      description: editUserForm.description,
      status: editUserForm.status,
      roleIds: [], // placeholder; UI暂未支持选择角色
    });
    alert('用户信息更新成功！');
    closeEditUserModal();
    await fetchUsers();
  } catch (error) {
    console.error('更新用户失败:', error);
    alert('更新用户失败，请稍后重试');
  } finally {
    isUpdating.value = false;
  }
};

const getNextStatus = (currentStatus) => {
  // 循环切换：active -> pending -> inactive -> active
  if (!currentStatus) return 'active';
  const lower = currentStatus.toLowerCase();
  if (lower.includes('active')) return 'pending';
  if (lower.includes('pending')) return 'inactive';
  if (lower.includes('inactive')) return 'active';
  return 'active';
};

const handleToggleStatus = async (user) => {
  if (!user?.id || statusChangingIds.value.has(user.id)) return;
  const nextStatus = getNextStatus(user.status);
  statusChangingIds.value.add(user.id);
  try {
    await updateUserStatus(user.id, { status: nextStatus });
    user.status = nextStatus; // 本地同步，避免全量刷新
    showToast('状态更新成功');
  } catch (error) {
    console.error('更新用户状态失败:', error);
    showToast('状态更新失败，请稍后重试');
  } finally {
    statusChangingIds.value.delete(user.id);
  }
};

const showToast = (message, duration = 2000) => {
  toast.message = message;
  toast.visible = true;
  setTimeout(() => {
    toast.visible = false;
  }, duration);
};

const handleDeleteUser = async (user) => {
  if (!user?.id || deletingIds.value.has(user.id)) return;
  
  // 确认删除
  if (!confirm(`确定要删除用户 "${user.name}" 吗？此操作不可恢复。`)) {
    return;
  }
  
  deletingIds.value.add(user.id);
  try {
    await deleteUser(user.id);
    showToast('用户删除成功');
    // 如果当前页删除后没有数据了，且不是第一页，则跳转到上一页
    if (userList.value.length === 1 && pagination.currentPage > 1) {
      pagination.currentPage--;
    }
    await fetchUsers();
  } catch (error) {
    console.error('删除用户失败:', error);
    showToast('删除用户失败，请稍后重试');
  } finally {
    deletingIds.value.delete(user.id);
  }
};


const fetchUsers = async (options = {}) => {
  const withProjects = options.withProjects ?? activeTab.value === 'projects';
  loading.value = true;
  try {
    const params = {
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      name: searchKeyword.value || undefined,
      status: filterForm.status || undefined,
      position: filterForm.position || undefined,
      startDate: filterForm.startDate || undefined,
      endDate: filterForm.endDate || undefined,
    };
    // Remove undefined values
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);
    const response = await getUserList(params);
    const list =
      (response && response.data && response.data.items) ||
      (response && Array.isArray(response.data) && response.data) ||
      [];
    userList.value = list.map(user => ({
      id: user.userId,
      name: user.name,
      email: user.email,
      avatar: user.avatarUrl,
      role: user.position || '暂无角色', // Frontend display role
      status: user.status,
      createTime: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '',
      avatarError: false,
      assignedProjectIds: [],
      assignedProjects: [],
      // Keep all original backend fields for editing
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      departmentId: user.departmentId,
      employeeId: user.employeeId,
      position: user.position,
      description: user.description,
    }));
    pagination.total = (response && response.data && response.data.total) || 0;
    if (withProjects) {
      await hydrateUserProjects(userList.value);
    }
  } catch (error) {
    console.error('获取用户列表失败:', error);
    userList.value = [];
    pagination.total = 0;
  } finally {
    loading.value = false;
  }
};

const openAssignModal = async (user) => {
  if (!user?.id) return;
  assignForm.userId = user.id;
  assignForm.userName = user.name || '';
  assignForm.projectIds = user.assignedProjectIds ? [...user.assignedProjectIds] : [];
  isAssignModalVisible.value = true;
  assignModalLoading.value = true;
  try {
    await fetchProjectOptions();
    const response = await getUserProjects(user.id);
    const projects = normalizeProjectList(response?.data);
    assignForm.projectIds = projects.map((item) => item.id);
    user.assignedProjectIds = [...assignForm.projectIds];
    user.assignedProjects = projects.map((item) => item.name).filter(Boolean);
  } catch (error) {
    console.error('加载用户项目失败:', error);
    showToast('加载用户项目失败，请稍后重试');
  } finally {
    assignModalLoading.value = false;
  }
};

const closeAssignModal = () => {
  isAssignModalVisible.value = false;
  assignForm.userId = null;
  assignForm.userName = '';
  assignForm.projectIds = [];
};

const handleAssignProjects = async () => {
  if (!assignForm.userId) return;
  assignModalSubmitting.value = true;
  try {
    await updateUserProjects(assignForm.userId, assignForm.projectIds);
    const target = userList.value.find((item) => item.id === assignForm.userId);
    if (target) {
      target.assignedProjectIds = [...assignForm.projectIds];
      target.assignedProjects = assignForm.projectIds
        .map((projectId) => projectOptions.value.find((p) => p.id === projectId)?.name)
        .filter(Boolean);
    }
    showToast('项目分配更新成功');
    closeAssignModal();
  } catch (error) {
    console.error('更新用户项目失败:', error);
    showToast('更新用户项目失败，请稍后重试');
  } finally {
    assignModalSubmitting.value = false;
  }
};

const getInitials = (name) => {
  if (!name) return '';
  return name.charAt(0).toUpperCase();
};

const getStatusClass = (status) => {
  if (!status) return 'status-tag--default';
  const lowerCaseStatus = status.toLowerCase();
  if (lowerCaseStatus.includes('inactive')) {
    return 'status-tag--disabled';
  }
  if (lowerCaseStatus.includes('active')) {
    return 'status-tag--active';
  }
  if (lowerCaseStatus.includes('pending')) {
    return 'status-tag--pending';
  }
  return 'status-tag--default';
};

const handleSearch = () => {
  pagination.currentPage = 1;
  fetchUsers();
};

const handlePageChange = (page) => {
  if (page > 0 && page <= totalPages.value) {
    pagination.currentPage = page;
    fetchUsers();
}
};

// Filter Functions
const openFilterModal = () => {
  isFilterModalVisible.value = true;
};

const closeFilterModal = () => {
  isFilterModalVisible.value = false;
};

const handleResetFilter = () => {
  Object.assign(filterForm, {
    status: '',
    position: '',
    startDate: '',
    endDate: '',
  });
};

const handleApplyFilter = () => {
  pagination.currentPage = 1;
  closeFilterModal();
  fetchUsers();
};

onMounted(() => {
  fetchUsers();
});
</script>

<style scoped>
.personnel-page {
  padding: 24px;
  background-color: #f0f2f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.personnel-content {
  background-color: #fff;
  border-radius: 4px;
  padding: 24px;
}

.tabs {
  border-bottom: 1px solid #e8e8e8;
  margin-bottom: 24px;
}

.tab-button {
  border: none;
  background: none;
  padding: 12px 16px;
  font-size: 14px;
  cursor: pointer;
  color: #595959;
  margin-bottom: -1px;
}

.tab-button.active {
  color: #1890ff;
  border-bottom: 2px solid #1890ff;
  font-weight: 500;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.btn {
  border-radius: 4px;
  padding: 8px 15px;
  font-size: 14px;
  cursor: pointer;
  border: 1px solid #d9d9d9;
  transition: opacity 0.2s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #1890ff;
  color: #fff;
  border-color: #1890ff;
}

.btn-secondary {
  background-color: #fff;
  color: #595959;
  border-color: #d9d9d9;
}

.btn-filter {
  background-color: #fff;
  color: #595959;
}

.search-input-wrapper {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 14px;
  height: 14px;
  color: #bfbfbf;
}

.search-input {
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  padding: 8px 12px 8px 32px;
  width: 200px;
}

.table-wrapper {
  overflow-x: auto;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 14px;
}

.user-table th, .user-table td {
  padding: 16px;
  border-bottom: 1px solid #e8e8e8;
  vertical-align: middle;
}

.user-table th {
  background-color: #fafafa;
  font-weight: 500;
  color: #262626;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar-container,
.user-avatar,
.user-avatar-fallback {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.user-avatar {
  object-fit: cover;
}

.user-avatar-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #1890ff;
  color: #fff;
  font-weight: 500;
  font-size: 14px;
}

.status-tag {
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  display: inline-block;
  border: 1px solid transparent;
}

.status-tag--active {
  background-color: #e6f7ff;
  color: #1890ff;
  border-color: #91d5ff;
}

.status-tag--disabled {
  background-color: #fff1f0;
  color: #f5222d;
  border-color: #ffa39e;
}

.status-tag--pending {
  background-color: #fffbe6;
  color: #faad14;
  border-color: #ffe58f;
}

.status-tag--default {
  background-color: #f5f5f5;
  color: #595959;
  border-color: #d9d9d9;
}

.action-buttons {
  display: flex;
  gap: 16px;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  color: #8c8c8c;
  width: 16px;
  height: 16px;
}

.action-btn:hover:not(:disabled) {
  color: #1890ff;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tab-pane {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.project-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.project-tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  background-color: #e6f7ff;
  color: #1890ff;
  border-radius: 12px;
  border: 1px solid #91d5ff;
  font-size: 12px;
}

.project-tag--empty {
  background-color: #f5f5f5;
  border-color: #d9d9d9;
  color: #8c8c8c;
}

.loading-placeholder {
  text-align: center;
  padding: 40px;
  color: #8c8c8c;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  font-size: 14px;
  color: #595959;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-btn {
  border: 1px solid #d9d9d9;
  background-color: #fff;
  border-radius: 4px;
  padding: 6px 12px;
  cursor: pointer;
}

.pagination-btn.active {
  background-color: #1890ff;
  color: #fff;
  border-color: #1890ff;
}

.pagination-btn:disabled {
  color: #bfbfbf;
  cursor: not-allowed;
}

.project-checkbox-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 260px;
  overflow-y: auto;
  padding: 8px 0;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #262626;
}

.empty-placeholder {
  color: #8c8c8c;
  font-size: 14px;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-panel {
  background-color: #fff;
  border-radius: 4px;
  padding: 24px;
  width: 600px; /* Increased width */
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.modal-title {
  margin: 0 0 24px 0;
  font-size: 18px;
  font-weight: 500;
}

.modal-form .form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 24px; /* row-gap column-gap */
}

.modal-form .form-group {
  margin-bottom: 0; /* Remove margin as gap is used */
}

.modal-form .form-group--full-width {
  grid-column: 1 / -1; /* Span across both columns */
}

.modal-form label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #595959;
}

.modal-form input,
.modal-form textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.modal-form textarea {
  resize: vertical;
  min-height: 60px;
}

.modal-form select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
  background-color: #fff;
  cursor: pointer;
}

.filter-modal {
  width: 500px;
}

.modal-form .radio-group {
  display: flex;
  gap: 16px;
  align-items: center;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.toast {
  position: fixed;
  top: 16px;
  right: 16px;
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  z-index: 1100;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
}
</style>