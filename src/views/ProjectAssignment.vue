<template>
  <div class="project-assignment">
    <div class="toolbar">
      <div class="search-input-wrapper">
        <svg class="search-icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
          <path fill="currentColor" d="M909.6 854.1 646.1 590.6a360.6 360.6 0 1 0-23.5 23.5l263.5 263.5a16.9 16.9 0 0 0 23.5 0l23.5-23.5a16.9 16.9 0 0 0 0-23.5zM413.5 755.1a320.6 320.6 0 1 1 0-641.2 320.6 320.6 0 0 1 0 641.2z"></path>
        </svg>
        <input type="text" class="search-input" placeholder="搜索项目..." v-model="searchKeyword" @keyup.enter="handleSearch">
      </div>
    </div>

    <div class="table-wrapper">
      <table class="project-table">
        <thead>
          <tr>
            <th>项目名称</th>
            <th>描述</th>
            <th>成员数量</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody v-if="!loading">
          <tr v-for="project in projectList" :key="project.id">
            <td>{{ project.name }}</td>
            <td>{{ project.description || '-' }}</td>
            <td>{{ project.memberCount || 0 }}</td>
            <td>{{ project.createTime }}</td>
            <td>
              <div class="action-buttons">
                <button class="action-btn" title="管理成员" @click="openManageMembersModal(project)">
                  <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                    <path fill="currentColor" d="M824.2 699.9a301.55 301.55 0 0 0-86.4-60.4C783.1 602.8 812 546.8 812 484c0-110.8-92.4-201.7-203.2-200-109.1 1.7-197 90.6-197 200 0 62.8 29 118.8 74.2 155.5a300.95 300.95 0 0 0-86.4 60.4C345 754.6 314 826.8 312 903.8a8 8 0 0 0 8 8.2h56c4.3 0 7.9-3.4 8-7.7 1.9-58 25.4-112.3 66.7-153.5A226.62 226.62 0 0 1 612 684c60.9 0 118.2 23.7 161.3 66.8C814.5 792 838 846.3 840 904.3c.1 4.3 3.7 7.7 8 7.7h56a8 8 0 0 0 8-8.2c-2-77-33-149.2-87.8-203.9zM612 612c-34.2 0-66.4-13.3-90.5-37.5a126.86 126.86 0 0 1-37.5-91.8c.3-32.8 13.4-64.5 36.3-88 24-24.6 56.1-38.3 90.4-38.7 33.9-.3 66.8 12.9 91 36.6 24.8 24.3 38.4 56.8 38.4 91.4 0 34.2-13.3 66.3-37.5 90.5A127.3 127.3 0 0 1 612 612zM361.5 510.4c-.9-8.7-1.4-17.5-1.4-26.4 0-15.9 1.5-31.4 4.3-46.5.7-3.6-1.2-7.3-4.5-8.8-13.6-6.1-26.1-14.5-36.9-25.1a127.54 127.54 0 0 1-38.7-95.4c.9-32.1 13.8-62.6 36.3-85.6 24.7-25.3 57.9-39.1 93.2-38.7 31.9.3 62.7 12.6 86 34.4 7.9 7.4 14.7 15.6 20.4 24.4 2 3.1 5.9 4.4 9.3 3.2 17.6-6.1 36.2-10.4 55.3-12.4 5.6-.6 8.8-6.6 6.3-11.6-32.5-64.3-98.9-108.7-175.7-109.9-110.9-1.7-203.3 89.2-203.3 199.9 0 62.8 28.9 118.8 74.2 155.5-31.8 14.7-61.1 35-86.5 60.4-54.8 54.7-85.8 126.9-87.8 204a8 8 0 0 0 8 8.2h56.1c4.3 0 7.9-3.4 8-7.7 1.9-58 25.4-112.3 66.7-153.5 29.4-29.4 65.4-49.8 104.7-59.7 3.9-1 6.5-4.7 6-8.7z"></path>
                  </svg>
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

    <!-- Manage Members Modal -->
    <div v-if="isManageMembersModalVisible" class="modal-overlay" @click.self="closeManageMembersModal">
      <div class="modal-panel manage-members-modal">
        <h3 class="modal-title">管理项目成员 - {{ currentProject?.name }}</h3>
        
        <div class="members-section">
          <div class="section-header">
            <h4>当前成员</h4>
            <button class="btn btn-primary btn-sm" @click="openAddMemberModal">+ 添加成员</button>
          </div>
          
          <div class="members-list">
            <div v-if="loadingMembers" class="loading-placeholder">加载中...</div>
            <div v-else-if="projectMembers.length === 0" class="empty-state">
              暂无成员
            </div>
            <div v-else class="member-item" v-for="member in projectMembers" :key="member.userId">
              <div class="member-info">
                <div class="avatar-container">
                  <img v-if="member.avatarUrl && !member.avatarError" :src="member.avatarUrl" @error="member.avatarError = true" class="user-avatar" alt="avatar">
                  <div v-else class="user-avatar-fallback">
                    {{ getInitials(member.userName) }}
                  </div>
                </div>
                <div class="member-details">
                  <div class="member-name">{{ member.userName }}</div>
                  <div class="member-email">{{ member.email }}</div>
                </div>
              </div>
              <div class="member-actions">
                <select 
                  v-model="member.role" 
                  @change="handleUpdateMemberRole(member)"
                  class="role-select"
                  :disabled="updatingMemberIds.has(member.userId)"
                >
                  <option value="owner">所有者</option>
                  <option value="admin">管理员</option>
                  <option value="member">成员</option>
                  <option value="viewer">查看者</option>
                </select>
                <button 
                  class="btn btn-danger btn-sm" 
                  @click="handleRemoveMember(member)"
                  :disabled="removingMemberIds.has(member.userId)"
                >
                  {{ removingMemberIds.has(member.userId) ? '移除中...' : '移除' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" @click="closeManageMembersModal">关闭</button>
        </div>
      </div>
    </div>

    <!-- Add Member Modal -->
    <div v-if="isAddMemberModalVisible" class="modal-overlay" @click.self="closeAddMemberModal">
      <div class="modal-panel">
        <h3 class="modal-title">添加项目成员</h3>
        <form class="modal-form" @submit.prevent="handleAddMember">
          <div class="form-group">
            <label for="member-user">选择用户</label>
            <select id="member-user" v-model="addMemberForm.userId" required>
              <option value="">请选择用户</option>
              <option v-for="user in availableUsers" :key="user.id" :value="user.id">
                {{ user.name }} ({{ user.email }})
              </option>
            </select>
          </div>
          <div class="form-group">
            <label for="member-role">角色</label>
            <select id="member-role" v-model="addMemberForm.role" required>
              <option value="member">成员</option>
              <option value="admin">管理员</option>
              <option value="viewer">查看者</option>
              <option value="owner">所有者</option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="closeAddMemberModal">取消</button>
            <button type="submit" class="btn btn-primary" :disabled="isAddingMember">
              {{ isAddingMember ? '添加中...' : '添加' }}
            </button>
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
import { getProjects, getProjectMembers, addProjectMember, updateProjectMemberRole, removeProjectMember } from '@/api/project';
import { getUserList } from '@/api/user';

const searchKeyword = ref('');
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});
const projectList = ref([]);
const loading = ref(false);
const loadingMembers = ref(false);
const isManageMembersModalVisible = ref(false);
const isAddMemberModalVisible = ref(false);
const currentProject = ref(null);
const projectMembers = ref([]);
const availableUsers = ref([]);
const isAddingMember = ref(false);
const updatingMemberIds = ref(new Set());
const removingMemberIds = ref(new Set());
const addMemberForm = reactive({
  userId: '',
  role: 'member',
});
const toast = reactive({
  visible: false,
  message: '',
});

const totalPages = computed(() => Math.ceil(pagination.total / pagination.pageSize));

const showToast = (message, duration = 2000) => {
  toast.message = message;
  toast.visible = true;
  setTimeout(() => {
    toast.visible = false;
  }, duration);
};

const getInitials = (name) => {
  if (!name) return '';
  return name.charAt(0).toUpperCase();
};

const fetchProjects = async () => {
  loading.value = true;
  try {
    const response = await getProjects({
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
    });
    if (response && response.data) {
      projectList.value = response.data.items.map(project => ({
        id: project.projectId,
        name: project.name,
        description: project.description,
        memberCount: project.memberCount || 0,
        createTime: project.createdAt ? new Date(project.createdAt).toLocaleDateString() : '',
      }));
      pagination.total = response.data.total || 0;
    } else {
      projectList.value = [];
      pagination.total = 0;
    }
  } catch (error) {
    console.error('获取项目列表失败:', error);
    projectList.value = [];
    pagination.total = 0;
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.currentPage = 1;
  fetchProjects();
};

const handlePageChange = (page) => {
  if (page > 0 && page <= totalPages.value) {
    pagination.currentPage = page;
    fetchProjects();
  }
};

const openManageMembersModal = async (project) => {
  currentProject.value = project;
  isManageMembersModalVisible.value = true;
  await fetchProjectMembers();
};

const closeManageMembersModal = () => {
  isManageMembersModalVisible.value = false;
  currentProject.value = null;
  projectMembers.value = [];
};

const fetchProjectMembers = async () => {
  if (!currentProject.value) return;
  loadingMembers.value = true;
  try {
    const response = await getProjectMembers(currentProject.value.id, {
      page: 1,
      pageSize: 100,
    });
    if (response && response.data) {
      projectMembers.value = response.data.items.map(member => ({
        userId: member.userId,
        userName: member.userName,
        email: member.email,
        avatarUrl: member.avatarUrl,
        role: member.role,
        avatarError: false,
      }));
    } else {
      projectMembers.value = [];
    }
  } catch (error) {
    console.error('获取项目成员失败:', error);
    showToast('获取项目成员失败');
    projectMembers.value = [];
  } finally {
    loadingMembers.value = false;
  }
};

const openAddMemberModal = async () => {
  isAddMemberModalVisible.value = true;
  await fetchAvailableUsers();
};

const closeAddMemberModal = () => {
  isAddMemberModalVisible.value = false;
  addMemberForm.userId = '';
  addMemberForm.role = 'member';
};

const fetchAvailableUsers = async () => {
  try {
    const response = await getUserList({
      page: 1,
      pageSize: 100,
    });
    if (response && response.data) {
      // 过滤掉已经是项目成员的用户
      const memberIds = new Set(projectMembers.value.map(m => m.userId));
      availableUsers.value = response.data.items
        .filter(user => !memberIds.has(user.userId))
        .map(user => ({
          id: user.userId,
          name: user.name,
          email: user.email,
        }));
    } else {
      availableUsers.value = [];
    }
  } catch (error) {
    console.error('获取用户列表失败:', error);
    availableUsers.value = [];
  }
};

const handleAddMember = async () => {
  if (!addMemberForm.userId || !currentProject.value) return;
  
  isAddingMember.value = true;
  try {
    await addProjectMember(currentProject.value.id, {
      userId: addMemberForm.userId,
      role: addMemberForm.role,
    });
    showToast('成员添加成功');
    closeAddMemberModal();
    await fetchProjectMembers();
    await fetchProjects(); // 更新成员数量
  } catch (error) {
    console.error('添加成员失败:', error);
    showToast('添加成员失败，请稍后重试');
  } finally {
    isAddingMember.value = false;
  }
};

const handleUpdateMemberRole = async (member) => {
  if (!currentProject.value || updatingMemberIds.value.has(member.userId)) return;
  
  updatingMemberIds.value.add(member.userId);
  try {
    await updateProjectMemberRole(currentProject.value.id, member.userId, {
      role: member.role,
    });
    showToast('角色更新成功');
  } catch (error) {
    console.error('更新角色失败:', error);
    showToast('更新角色失败，请稍后重试');
    await fetchProjectMembers(); // 重新加载以恢复原值
  } finally {
    updatingMemberIds.value.delete(member.userId);
  }
};

const handleRemoveMember = async (member) => {
  if (!currentProject.value || removingMemberIds.value.has(member.userId)) return;
  
  if (!confirm(`确定要将 "${member.userName}" 从项目中移除吗？`)) {
    return;
  }
  
  removingMemberIds.value.add(member.userId);
  try {
    await removeProjectMember(currentProject.value.id, member.userId);
    showToast('成员移除成功');
    await fetchProjectMembers();
    await fetchProjects(); // 更新成员数量
  } catch (error) {
    console.error('移除成员失败:', error);
    showToast('移除成员失败，请稍后重试');
  } finally {
    removingMemberIds.value.delete(member.userId);
  }
};

onMounted(() => {
  fetchProjects();
});
</script>

<style scoped>
.project-assignment {
  width: 100%;
}

.toolbar {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 24px;
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

.project-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 14px;
}

.project-table th,
.project-table td {
  padding: 16px;
  border-bottom: 1px solid #e8e8e8;
  vertical-align: middle;
}

.project-table th {
  background-color: #fafafa;
  font-weight: 500;
  color: #262626;
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

.action-btn:hover {
  color: #1890ff;
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
  width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.manage-members-modal {
  width: 700px;
}

.modal-title {
  margin: 0 0 24px 0;
  font-size: 18px;
  font-weight: 500;
}

.members-section {
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.members-list {
  max-height: 400px;
  overflow-y: auto;
}

.member-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  margin-bottom: 8px;
}

.member-info {
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

.member-details {
  display: flex;
  flex-direction: column;
}

.member-name {
  font-weight: 500;
  font-size: 14px;
}

.member-email {
  font-size: 12px;
  color: #8c8c8c;
}

.member-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.role-select {
  padding: 4px 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
}

.role-select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #8c8c8c;
}

.modal-form .form-group {
  margin-bottom: 16px;
}

.modal-form label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #595959;
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

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
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

.btn-danger {
  background-color: #ff4d4f;
  color: #fff;
  border-color: #ff4d4f;
}

.btn-sm {
  padding: 4px 12px;
  font-size: 13px;
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
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}
</style>
