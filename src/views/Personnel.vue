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

      <div v-if="activeTab === 'users'" class="toolbar">
        <div class="toolbar-left">
          <button class="btn btn-primary" @click="openCreateUserModal">+ 创建新用户</button>
        </div>
        <div class="toolbar-right">
          <div class="search-input-wrapper">
            <svg class="search-icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M909.6 854.1 646.1 590.6a360.6 360.6 0 1 0-23.5 23.5l263.5 263.5a16.9 16.9 0 0 0 23.5 0l23.5-23.5a16.9 16.9 0 0 0 0-23.5zM413.5 755.1a320.6 320.6 0 1 1 0-641.2 320.6 320.6 0 0 1 0 641.2z"></path></svg>
            <input type="text" class="search-input" placeholder="搜索用户..." v-model="searchKeyword" @keyup.enter="handleSearch">
          </div>
          <button class="btn btn-filter" @click="openFilterModal">筛选条件</button>
        </div>
      </div>

      <UserManagementTab
        v-if="activeTab === 'users'"
        :userList="userList"
        :loading="loading"
        :pagination="pagination"
        :statusChangingIds="statusChangingIds"
        :deletingIds="deletingIds"
        @edit="openEditUserModal"
        @toggle-status="handleToggleStatus"
        @delete="handleDeleteUser"
        @page-change="handlePageChange"
      />

      <ProjectAssignmentTab
        v-else
        :userList="userList"
        :loading="loading"
        :pagination="pagination"
        :projectOptions="projectOptions"
        @role-change="handleRoleChange"
        @remove-member="handleRemoveMember"
        @add-member="handleAddMemberToProject"
      />
    </div>

    <CreateUserModal
      :visible="isCreateUserModalVisible"
      :isSubmitting="isSubmitting"
      @close="closeCreateUserModal"
      @submit="handleCreateUser"
    />

    <EditUserModal
      :visible="isEditUserModalVisible"
      :isUpdating="isUpdating"
      :user="currentUser"
      @close="closeEditUserModal"
      @submit="handleUpdateUser"
    />

    <AssignProjectModal
      :visible="isAssignModalVisible"
      :loading="assignModalLoading"
      :isSubmitting="assignModalSubmitting"
      :userName="currentUser ? currentUser.name : ''"
      :initialProjectIds="currentUser ? currentUser.assignedProjectIds : []"
      :projectOptions="projectOptions"
      :projectOptionsLoading="projectOptionsLoading"
      @close="closeAssignModal"
      @submit="handleAssignProjects"
    />

    <FilterModal
      :visible="isFilterModalVisible"
      :initialFilters="filterForm"
      @close="closeFilterModal"
      @apply="handleApplyFilter"
      @reset="handleResetFilter"
    />

    <div v-if="toast.visible" class="toast">
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { getUserList, createUser, updateUser, updateUserStatus, deleteUser } from '@/api/user';
import { getUserProjects, updateUserProjects } from '@/api/personnel';
import { getProjects } from '@/api/project';

import UserManagementTab from '@/components/personnel/UserManagementTab.vue';
import ProjectAssignmentTab from '@/components/personnel/ProjectAssignmentTab.vue';
import CreateUserModal from '@/components/personnel/CreateUserModal.vue';
import EditUserModal from '@/components/personnel/EditUserModal.vue';
import AssignProjectModal from '@/components/personnel/AssignProjectModal.vue';
import FilterModal from '@/components/personnel/FilterModal.vue';

const searchKeyword = ref('');
const activeTab = ref('users');
const pagination = reactive({ currentPage: 1, pageSize: 6, total: 0 });
const userList = ref([]);
const loading = ref(false);
const isSubmitting = ref(false);
const isUpdating = ref(false);
const statusChangingIds = ref(new Set());
const deletingIds = ref(new Set());
const assignmentLoadingIds = ref(new Set());
const toast = reactive({ visible: false, message: '' });
// 项目列表：从 /projects 分页接口获取
const projectOptions = ref([]);
const projectOptionsLoading = ref(false);
const currentUser = ref(null);

// Modal visibility state
const isCreateUserModalVisible = ref(false);
const isEditUserModalVisible = ref(false);
const isAssignModalVisible = ref(false);
const isFilterModalVisible = ref(false);

// Assign Project Modal state
const assignModalLoading = ref(false);
const assignModalSubmitting = ref(false);

// Filter state
const filterForm = reactive({ status: '', position: '', startDate: '', endDate: '' });

// ===== 项目列表：对接后端 /projects 分页接口 =====
const normalizeProjectList = (payload = {}) => {
  // 后端 ProjectPageResultDTO: { total, items, page, pageSize }
  const items =
    (payload && Array.isArray(payload.items) && payload.items) ||
    (Array.isArray(payload) ? payload : []);

  return items
    .map((p) => ({
      id: p.id ?? p.projectId,
      name: p.name,
      description: p.description,
    }))
    .filter(item => item.id);
};

const fetchProjectOptions = async () => {
  projectOptionsLoading.value = true;
  try {
    const resp = await getProjects({
      page: 1,
      pageSize: 20,
      includeDeleted: false,
      sortBy: 'created_at',
      sortOrder: 'desc',
    });
    projectOptions.value = normalizeProjectList(resp?.data);
  } catch (e) {
    console.error('获取项目列表失败:', e);
    projectOptions.value = [];
    showToast('获取项目列表失败');
  } finally {
    projectOptionsLoading.value = false;
  }
};

const fetchUsers = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      name: searchKeyword.value || undefined,
      ...filterForm,
    };
    Object.keys(params).forEach(key => !params[key] && delete params[key]);
    const response = await getUserList(params);
    const list = (response?.data?.items) || [];
    userList.value = list.map(user => ({
      id: user.userId,
      name: user.name,
      email: user.email,
      avatar: user.avatarUrl,
      role: user.position || '暂无角色',
      status: user.status,
      createTime: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '',
      avatarError: false,
      assignedProjectIds: [],
      assignedProjects: [],
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      departmentId: user.departmentId,
      employeeId: user.employeeId,
      position: user.position,
      description: user.description,
    }));
    pagination.total = response?.data?.total || 0;
  } catch (error) {
    console.error('获取用户列表失败:', error);
    userList.value = [];
    pagination.total = 0;
  } finally {
    loading.value = false;
  }
};

const switchTab = async (tab) => {
  if (activeTab.value === tab) return;
  activeTab.value = tab;
  pagination.currentPage = 1;

  if (tab === 'projects') {
    await fetchProjectOptions();
  }

  await fetchUsers();
};

const showToast = (message, duration = 2000) => {
  toast.message = message;
  toast.visible = true;
  setTimeout(() => { toast.visible = false; }, duration);
};

// Event Handlers
const handlePageChange = (page) => {
  if (page > 0 && page <= Math.ceil(pagination.total / pagination.pageSize)) {
    pagination.currentPage = page;
    fetchUsers();
  }
};

const handleSearch = () => {
  pagination.currentPage = 1;
  fetchUsers();
};

// Create User Modal
const openCreateUserModal = () => { isCreateUserModalVisible.value = true; };
const closeCreateUserModal = () => { isCreateUserModalVisible.value = false; };
const handleCreateUser = async (formData) => {
  isSubmitting.value = true;
  try {
    await createUser(formData);
    showToast('用户创建成功！');
    closeCreateUserModal();
    await fetchUsers();
  } catch (error) {
    console.error('创建用户失败:', error);
    showToast('创建用户失败');
  } finally {
    isSubmitting.value = false;
  }
};

// Edit User Modal
const openEditUserModal = (user) => {
  currentUser.value = user;
  isEditUserModalVisible.value = true;
};
const closeEditUserModal = () => { isEditUserModalVisible.value = false; currentUser.value = null; };
const handleUpdateUser = async (userId, userData) => {
  isUpdating.value = true;
  try {
    await updateUser(userId, userData);
    showToast('用户信息更新成功！');
    closeEditUserModal();
    await fetchUsers();
  } catch (error) {
    console.error('更新用户失败:', error);
    showToast('更新用户失败');
  } finally {
    isUpdating.value = false;
  }
};

// Assign Project Modal
const openAssignModal = async (user) => {
  currentUser.value = user;
  isAssignModalVisible.value = true;
  assignModalLoading.value = true;
  try {
    // 确保项目列表已加载
    if (!projectOptions.value.length) {
      await fetchProjectOptions();
    }
    // 如后续需要，这里可以再补充按用户加载项目关系的逻辑
  } finally {
    assignModalLoading.value = false;
  }
};
const closeAssignModal = () => { isAssignModalVisible.value = false; currentUser.value = null; };
const handleAssignProjects = async (projectIds) => {
  if (!currentUser.value) return;
  assignModalSubmitting.value = true;
  try {
    await updateUserProjects(currentUser.value.id, projectIds);
    const target = userList.value.find((item) => item.id === currentUser.value.id);
    if (target) {
      target.assignedProjectIds = [...projectIds];
      target.assignedProjects = projectIds.map(id => projectOptions.value.find(p => p.id === id)?.name).filter(Boolean);
    }
    showToast('项目分配更新成功');
    closeAssignModal();
  } catch (error) {
    console.error('更新用户项目失败:', error);
    showToast('更新用户项目失败');
  } finally {
    assignModalSubmitting.value = false;
  }
};

// Filter Modal
const openFilterModal = () => { isFilterModalVisible.value = true; };
const closeFilterModal = () => { isFilterModalVisible.value = false; };
const handleApplyFilter = (filters) => {
  Object.assign(filterForm, filters);
  pagination.currentPage = 1;
  closeFilterModal();
  fetchUsers();
};
const handleResetFilter = (filters) => {
  Object.assign(filterForm, filters);
  pagination.currentPage = 1;
  fetchUsers();
};

// User Actions
const getNextStatus = (currentStatus) => {
  const lower = currentStatus?.toLowerCase() || '';
  if (lower.includes('active')) return 'pending';
  if (lower.includes('pending')) return 'inactive';
  return 'active';
};

const handleToggleStatus = async (user) => {
  if (!user?.id || statusChangingIds.value.has(user.id)) return;
  const nextStatus = getNextStatus(user.status);
  statusChangingIds.value.add(user.id);
  try {
    await updateUserStatus(user.id, { status: nextStatus });
    user.status = nextStatus;
    showToast('状态更新成功');
  } catch (error) {
    console.error('更新用户状态失败:', error);
    showToast('状态更新失败');
  } finally {
    statusChangingIds.value.delete(user.id);
  }
};

const handleDeleteUser = async (user) => {
  if (!user?.id || deletingIds.value.has(user.id) || !confirm(`确定要删除用户 "${user.name}" 吗？`)) return;
  deletingIds.value.add(user.id);
  try {
    await deleteUser(user.id);
    showToast('用户删除成功');
    if (userList.value.length === 1 && pagination.currentPage > 1) {
      pagination.currentPage--;
    }
    await fetchUsers();
  } catch (error) {
    console.error('删除用户失败:', error);
    showToast('删除用户失败');
  } finally {
    deletingIds.value.delete(user.id);
  }
};

const handleRoleChange = async ({ user, newRole, success, error }) => {
  // 如果是项目分配页面传来的角色更新结果（包含 success 字段），直接显示提示
  if (typeof success === 'boolean') {
    if (success) {
      showToast('用户项目成员信息更新成功');
    } else {
      showToast(error?.message || '更新项目成员角色失败');
    }
    return;
  }

  // 原有的用户管理页面逻辑（更新用户职位）
  if (!user?.id) return;
  const oldRole = user.role;
  user.role = newRole;
  try {
    await updateUser(user.id, { position: newRole });
    showToast('角色更新成功');
  } catch (error) {
    console.error('更新用户角色失败:', error);
    user.role = oldRole;
    showToast('角色更新失败');
  }
};

const handleAddMemberToProject = ({ success, error, count, failCount, message }) => {
  if (success) {
    if (message) {
      showToast(message);
    } else {
      showToast(`成功添加 ${count || 0} 名项目成员`);
    }
  } else {
    showToast(error?.message || '添加项目成员失败');
  }
};

const handleRemoveMember = async ({ user, projectId, success, error }) => {
  // 如果是项目分配页面传来的移除结果（包含 success 字段），直接显示提示
  if (typeof success === 'boolean') {
    if (success) {
      showToast('用户已从项目中成功移除');
    } else {
      showToast(error?.message || '移除项目成员失败');
    }
    return;
  }

  // 原有的用户管理页面逻辑（从用户的项目列表中移除项目）
  if (!user?.id || !projectId) return;
  const prev = Array.isArray(user.assignedProjectIds) ? [...user.assignedProjectIds] : [];
  const next = prev.filter(id => id !== projectId);
  assignmentLoadingIds.value.add(user.id);
  // 乐观更新
  user.assignedProjectIds = next;
  user.assignedProjects = next.map(id => projectOptions.value.find(p => p.id === id)?.name).filter(Boolean);
  try {
    await updateUserProjects(user.id, next);
    showToast('已从项目移除该成员');
  } catch (e) {
    // 回滚
    user.assignedProjectIds = prev;
    user.assignedProjects = prev.map(id => projectOptions.value.find(p => p.id === id)?.name).filter(Boolean);
    console.error('从项目移除成员失败:', e);
    showToast('移除失败');
  } finally {
    assignmentLoadingIds.value.delete(user.id);
  }
};

onMounted(fetchUsers);
</script>

<style scoped>
.personnel-page {
  padding: 28px;
  background-color: #f5f7fa;
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}

.personnel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}
.personnel-title {
  font-size: 20px;
  font-weight: 700;
  color: #182026;
}
.personnel-sub {
  color: #6b7280;
  font-size: 13px;
  margin-top: 6px;
}

.personnel-content {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 18px;
  box-shadow: 0 8px 28px rgba(15, 23, 42, 0.06);
  transition: box-shadow 0.18s ease, transform 0.18s ease;
}
.personnel-content:hover {
  box-shadow: 0 12px 36px rgba(15, 23, 42, 0.08);
}

.tabs {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid #eef2f6;
  margin-bottom: 18px;
  padding-bottom: 8px;
}
.tab-button {
  border: none;
  background: transparent;
  padding: 10px 14px;
  font-size: 14px;
  cursor: pointer;
  color: #4b5563;
  border-radius: 8px;
  transition: background 0.18s, color 0.18s, transform 0.12s;
}
.tab-button:hover {
  background: rgba(24, 144, 255, 0.06);
  transform: translateY(-1px);
}
.tab-button.active {
  color: #1890ff;
  background: linear-gradient(90deg, rgba(24,144,255,0.08), rgba(24,144,255,0.02));
  box-shadow: inset 0 -2px 0 rgba(24,144,255,0.1);
  font-weight: 600;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 18px 0;
  gap: 12px;
}
.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn {
  border-radius: 10px;
  padding: 8px 14px;
  font-size: 14px;
  cursor: pointer;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}
.btn:active { transform: translateY(0); }
.btn:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-primary {
  background: linear-gradient(90deg, #1890ff 0%, #40a9ff 100%);
  color: #fff;
  box-shadow: 0 6px 18px rgba(24,144,255,0.12);
}
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 26px rgba(24,144,255,0.14); }

.btn-filter {
  background: #fff;
  color: #475569;
  border: 1px solid #e6eef8;
  padding: 6px 12px;
  border-radius: 8px;
}
.btn-filter:hover { background: #f8fbff; }

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
  transition: box-shadow 0.12s ease, border-color 0.12s ease;
}
.search-input:focus {
  outline: none;
  border-color: #40a9ff;
  box-shadow: 0 6px 18px rgba(24,144,255,0.08);
}

.personnel-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
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

/* Responsive */
@media (max-width: 900px) {
  .personnel-header { flex-direction: column; align-items: flex-start; gap: 8px; }
  .toolbar { flex-direction: column; align-items: stretch; gap: 10px; }
  .search-input { width: 100%; }
}

</style>