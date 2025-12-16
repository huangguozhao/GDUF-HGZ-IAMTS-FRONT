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

const normalizeProjectList = (payload = []) => {
  // 兼容多种后端返回结构：
  // - 纯数组
  // - { items: [] }
  // - { data: [] }
  // - { list: [] } / { records: [] }
  const source =
    (payload && Array.isArray(payload.items) && payload.items) ||
    (payload && Array.isArray(payload.list) && payload.list) ||
    (payload && Array.isArray(payload.records) && payload.records) ||
    (payload && Array.isArray(payload.data) && payload.data) ||
    (Array.isArray(payload) ? payload : []);

  return source
    .map(item => {
      const projectId = item?.id ?? item?.projectId ?? item?.projectInfo?.projectId;
      const projectName = item?.name ?? item?.projectName ?? item?.projectInfo?.name;
      return { id: projectId, name: projectName };
    })
    .filter(item => item.id);
};

const fetchProjectOptions = async () => {
  if (projectOptions.value.length || projectOptionsLoading.value) return;
  projectOptionsLoading.value = true;
  try {
    const response = await getProjects({ page: 1, pageSize: 200 });
    projectOptions.value = normalizeProjectList(response?.data);
  } catch (error) {
    console.error('获取项目列表失败:', error);
    showToast('获取项目列表失败');
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
      const response = await getUserProjects(user.id, { page: 1, pageSize: 20 });
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

const fetchUsers = async () => {
  const withProjects = activeTab.value === 'projects';
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
    await fetchProjectOptions();
    const response = await getUserProjects(user.id, { page: 1, pageSize: 20 });
    const projects = normalizeProjectList(response?.data);
    user.assignedProjectIds = projects.map((item) => item.id);
  } catch (error) {
    console.error('加载用户项目失败:', error);
    showToast('加载用户项目失败');
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

const handleRoleChange = async (user, newRole) => {
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

const handleRemoveMember = async ({ user, projectId }) => {
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
.personnel-page { padding: 24px; background-color: #f0f2f5; }
.tabs { border-bottom: 1px solid #e8e8e8; margin-bottom: 24px; }
.tab-button { border: none; background: none; padding: 12px 16px; font-size: 14px; cursor: pointer; color: #595959; margin-bottom: -1px; }
.tab-button.active { color: #1890ff; border-bottom: 2px solid #1890ff; font-weight: 500; }
.personnel-content { background-color: #fff; border-radius: 4px; padding: 24px; }
.toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.toolbar-left { display: flex; align-items: center; gap: 16px; }
.toolbar-right { display: flex; align-items: center; gap: 16px; }
.toolbar-projects { margin-bottom: 0; }
.btn { border-radius: 4px; padding: 8px 15px; font-size: 14px; cursor: pointer; border: 1px solid #d9d9d9; transition: opacity 0.2s; }
.btn:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-primary { background-color: #1890ff; color: #fff; border-color: #1890ff; }
.btn-filter { background-color: #fff; color: #595959; }
.search-input-wrapper { position: relative; }
.search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 14px; height: 14px; color: #bfbfbf; }
.search-input { border: 1px solid #d9d9d9; border-radius: 4px; padding: 8px 12px 8px 32px; width: 200px; }
.toast { position: fixed; top: 16px; right: 16px; background: rgba(0, 0, 0, 0.75); color: #fff; padding: 10px 16px; border-radius: 6px; font-size: 14px; z-index: 1100; box-shadow: 0 4px 10px rgba(0,0,0,0.2); }
</style>