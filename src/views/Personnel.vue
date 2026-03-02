<template>
  <div class="personnel-page">
    <!-- 面包屑导航 -->
    <div class="breadcrumb">
      <span class="breadcrumb-item">首页</span>
      <span class="breadcrumb-separator">/</span>
      <span class="breadcrumb-item">人员管理</span>
      <span class="breadcrumb-separator">/</span>
      <span class="breadcrumb-item active">{{ activeTab === 'users' ? '用户管理' : '项目分配' }}</span>
    </div>

    <!-- 页面标题区域 -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">人员管理</h1>
        <p class="page-subtitle">管理系统用户和项目成员分配</p>
      </div>
      <div class="header-right">
        <button class="btn btn-primary btn-lg" @click="openCreateUserModal">
          <svg class="btn-icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm192 408c0 4.4-3.6 8-8 8H328c-4.4 0-8-3.6-8-8v-48c0-4.4 3.6-8 8-8h168c1.3 0 2.5-.3 3.7-.9 1.1-.5 2.1-1.2 3-2.1 1.6-1.6 3.1-3.5 4.3-5.5.6-1 .6-2.3 0-3.3-.6-1-1.5-1.9-2.5-2.6-1.8-1.3-3.9-2-6.1-2H328c-17.7 0-32 14.3-32 32v48c0 17.7 14.3 32 32 32h368c17.7 0 32-14.3 32-32v-48z"/>
          </svg>
          创建新用户
        </button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards" v-if="activeTab === 'users'">
      <div class="stat-card">
        <div class="stat-icon stat-icon-primary">
          <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372zm112-216c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8v-48c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v48zm-48 272c-88.4 0-160-71.6-160-160s71.6-160 160-160 160 71.6 160 160-71.6 160-160 160z"/>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ pagination.total }}</span>
          <span class="stat-label">总用户数</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon-success">
          <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm193.5 301.7l-134.4 185.7c-7.3 10.1-22.3 10.1-29.7 0L333.7 470.9c-10.1-13.9-3.4-33.4 13.2-38.1 15.2-4.3 31.3-6.6 48-6.6 48.3 0 94.4 26.5 117.2 68.7l67.7 125.9c5.4 10 19.6 10.1 25 0l66.3-123.4c7.4-13.7.8-31.3-12.8-36.2-16.6-5.9-34.2-5.9-50.4 0z"/>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ activeCount }}</span>
          <span class="stat-label">活跃用户</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon-warning">
          <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372zm32-260c0 17.7-14.3 32-32 32s-32-14.3-32-32 14.3-32 32-32 32 14.3 32 32zM540 428h-56c-20.2 0-36.9-13.1-42.1-32.1c-1.1-3.9-5.6-6.4-9.7-5.4-29.2 7.3-59.7-11.3-67.2-40.9-9.2-36.1 15.7-71.1 52.5-73.8 17-1.2 33.1 2.4 46.9 9.9 3.6 2 8.2-.4 9.4-4.1 4.9-14.8 18.5-23.6 33.5-21.6 31.6 4.2 53.8 35.1 48.7 66.8-.9 5.6-5.6 9.7-11.2 9.7h-.8z"/>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ pendingCount }}</span>
          <span class="stat-label">待审核</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon-danger">
          <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm194.8 682.3l-51.6 51.7c-12.2 12.2-32.1 12.2-44.3 0L400 586.3 286.2 700.1c-12.2 12.2-32.1 12.2-44.3 0l-51.6-51.7c-12.2-12.2-12.2-32.1 0-44.3L310.3 400 197.5 287.3c-12.2-12.2-12.2-32.1 0-44.3l51.6-51.7c12.2-12.2 32.1-12.2 44.3 0L464 310.3l112.8-112.8c12.2-12.2 32.1-12.2 44.3 0l51.6 51.7c12.2 12.2 12.2 32.1 0 44.3L513.7 464l112.8 112.8c12.2 12.2 12.2 32.1 0 44.3z"/>
          </svg>
        </div>
        <div class="stat-content">
          <span class="stat-value">{{ inactiveCount }}</span>
          <span class="stat-label">已禁用</span>
        </div>
      </div>
    </div>

    <div class="personnel-content">
      <!-- 标签页 -->
      <div class="tabs-wrapper">
        <div class="tabs">
          <button
            class="tab-button"
            :class="{ active: activeTab === 'users' }"
            @click="switchTab('users')"
          >
            <svg class="tab-icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
              <path fill="currentColor" d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372zm0-560c-103.5 0-188 84.5-188 188s84.5 188 188 188 188-84.5 188-188-84.5-188-188-188zm0 320c-72.8 0-132-59.2-132-132s59.2-132 132-132 132 59.2 132 132-59.2 132-132 132z"/>
            </svg>
            用户管理
          </button>
          <button
            class="tab-button"
            :class="{ active: activeTab === 'projects' }"
            @click="switchTab('projects')"
          >
            <svg class="tab-icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
              <path fill="currentColor" d="M104 160c-17.7 0-32 14.3-32 32v640c0 17.7 14.3 32 32 32h272c17.7 0 32-14.3 32-32V320H272c-17.7 0-32-14.3-32-32V192H104zm520 0c-17.7 0-32 14.3-32 32v488c0 17.7 14.3 32 32 32h168V192H624zm-520 0H104v640h168V320h272v-128H104z"/>
            </svg>
            项目分配
          </button>
        </div>

        <!-- 搜索工具栏 -->
        <div v-if="activeTab === 'users'" class="toolbar">
          <div class="toolbar-left">
            <div class="search-input-wrapper">
              <svg class="search-icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                <path fill="currentColor" d="M909.6 854.1 646.1 590.6a360.6 360.6 0 1 0-23.5 23.5l263.5 263.5a16.9 16.9 0 0 0 23.5 0l23.5-23.5a16.9 16.9 0 0 0 0-23.5zM413.5 755.1a320.6 320.6 0 1 1 0-641.2 320.6 320.6 0 0 1 0 641.2z"/>
              </svg>
              <input
                type="text"
                class="search-input"
                placeholder="搜索用户姓名、邮箱..."
                v-model="searchKeyword"
                @keyup.enter="handleSearch"
              />
              <button v-if="searchKeyword" class="search-clear" @click="clearSearch">
                <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                  <path fill="currentColor" d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm194.8 690.8l-46.8 46.8c-12.2 12.2-32.1 12.2-44.3 0L400 585.4 286.2 699.1c-12.2 12.2-32.1 12.2-44.3 0l-46.8-46.8c-12.2-12.2-12.2-32.1 0-44.3L310.3 392.8 197.5 280c-12.2-12.2-12.2-32.1 0-44.3l46.8-46.8c12.2-12.2 32.1-12.2 44.3 0L464 305.1l112.8-112.8c12.2-12.2 32.1-12.2 44.3 0l46.8 46.8c12.2 12.2 12.2 32.1 0 44.3L513.7 458.6l112.8 112.8c12.2 12.2 12.2 32.1 0 44.3z"/>
                </svg>
              </button>
            </div>
          </div>
          <div class="toolbar-right">
            <button class="btn btn-filter" @click="openFilterModal">
              <svg class="btn-icon-small" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                <path fill="currentColor" d="M104 160c-17.7 0-32 14.3-32 32v640c0 17.7 14.3 32 32 32h272c17.7 0 32-14.3 32-32V320H272c-17.7 0-32-14.3-32-32V192H104z"/>
              </svg>
              筛选条件
              <span v-if="hasActiveFilters" class="filter-badge"></span>
            </button>
          </div>
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
import { ref, reactive, onMounted, defineAsyncComponent, computed } from 'vue';
import { getUserList, createUser, updateUser, updateUserStatus, deleteUser } from '@/api/user';
import { getUserProjects, updateUserProjects } from '@/api/personnel';
import { getProjects } from '@/api/project';

// 懒加载人员管理组件
const UserManagementTab = defineAsyncComponent(() =>
  import('@/components/personnel/UserManagementTab.vue')
)
const ProjectAssignmentTab = defineAsyncComponent(() =>
  import('@/components/personnel/ProjectAssignmentTab.vue')
)
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

// 计算统计数据
const activeCount = computed(() => userList.value.filter(u => u.status === 'active').length);
const pendingCount = computed(() => userList.value.filter(u => u.status === 'pending').length);
const inactiveCount = computed(() => userList.value.filter(u => u.status === 'inactive').length);

// 判断是否有激活的筛选条件
const hasActiveFilters = computed(() => {
  return filterForm.status || filterForm.position || filterForm.startDate || filterForm.endDate;
});

// 清除搜索
const clearSearch = () => {
  searchKeyword.value = '';
  pagination.currentPage = 1;
  fetchUsers();
};

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
  padding: 24px 28px;
  background-color: #f0f2f5;
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}

.personnel-header {
  display: none;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  font-size: 13px;
}
.breadcrumb-item {
  color: #8c8c8c;
}
.breadcrumb-item.active {
  color: #1890ff;
  font-weight: 500;
}
.breadcrumb-separator {
  color: #d9d9d9;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.header-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1f1f1f;
  margin: 0;
}
.page-subtitle {
  font-size: 14px;
  color: #8c8c8c;
  margin: 0;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}
.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}
.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}
.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.stat-icon svg {
  width: 24px;
  height: 24px;
}
.stat-icon-primary {
  background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);
  color: #1890ff;
}
.stat-icon-success {
  background: linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%);
  color: #52c41a;
}
.stat-icon-warning {
  background: linear-gradient(135deg, #fffbe6 0%, #ffe58f 100%);
  color: #faad14;
}
.stat-icon-danger {
  background: linear-gradient(135deg, #fff1f0 0%, #ffccc7 100%);
  color: #ff4d4f;
}
.stat-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #1f1f1f;
  line-height: 1.2;
}
.stat-label {
  font-size: 13px;
  color: #8c8c8c;
}

.personnel-content {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.tabs-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.tabs {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 0;
}
.tab-button {
  border: none;
  background: transparent;
  padding: 12px 20px;
  font-size: 14px;
  cursor: pointer;
  color: #595959;
  border-radius: 8px 8px 0 0;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}
.tab-button::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: transparent;
  transition: all 0.2s ease;
}
.tab-icon {
  width: 18px;
  height: 18px;
}
.tab-button:hover {
  background: #f5f5f5;
  color: #1890ff;
}
.tab-button.active {
  color: #1890ff;
  background: #e6f7ff;
  font-weight: 600;
}
.tab-button.active::after {
  background: #1890ff;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  padding: 10px 18px;
  font-size: 14px;
  cursor: pointer;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  font-weight: 500;
}
.btn:active { transform: translateY(0); }
.btn:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-lg {
  padding: 12px 24px;
  font-size: 15px;
}

.btn-primary {
  background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
  color: #fff;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.25);
}
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(24, 144, 255, 0.35);
}

.btn-filter {
  background: #fff;
  color: #595959;
  border: 1px solid #d9d9d9;
  padding: 8px 16px;
  border-radius: 8px;
  position: relative;
}
.btn-filter:hover {
  background: #fafafa;
  border-color: #1890ff;
  color: #1890ff;
}

.filter-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 8px;
  height: 8px;
  background: #ff4d4f;
  border-radius: 50%;
}

.btn-icon {
  width: 18px;
  height: 18px;
}
.btn-icon-small {
  width: 14px;
  height: 14px;
}

.search-input-wrapper {
  position: relative;
}
.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: #bfbfbf;
}
.search-input {
  border: 1px solid #e8e8e8;
  border-radius: 10px;
  padding: 10px 36px 10px 42px;
  width: 280px;
  background: #fafafa;
  font-size: 14px;
  transition: all 0.2s ease;
}
.search-input:focus {
  outline: none;
  border-color: #40a9ff;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.1);
}
.search-input::placeholder {
  color: #bfbfbf;
}
.search-clear {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #bfbfbf;
  transition: color 0.2s;
}
.search-clear:hover {
  color: #8c8c8c;
}
.search-clear svg {
  width: 14px;
  height: 14px;
}

.personnel-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  padding: 12px 20px;
  border-radius: 10px;
  font-size: 14px;
  z-index: 1100;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  animation: toast-slide-in 0.3s ease;
}

/* Responsive */
@media (max-width: 1200px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .personnel-page {
    padding: 16px;
  }
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  .toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  .search-input {
    width: 100%;
  }
  .stats-cards {
    grid-template-columns: 1fr;
  }
  .tabs {
    flex-wrap: wrap;
  }
}

</style>