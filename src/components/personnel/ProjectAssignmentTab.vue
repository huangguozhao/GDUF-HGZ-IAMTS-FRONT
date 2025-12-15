<template>
  <div class="project-assignment-tab">
    <div v-if="loading" class="loading">加载中...</div>
    
    <div v-else-if="userList.length === 0" class="empty-state">
      <p>暂无用户数据</p>
    </div>

    <div v-else class="table-wrapper">
      <table class="assignment-table">
        <thead>
          <tr>
            <th>用户名</th>
            <th>邮箱</th>
            <th>已分配项目</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in userList" :key="user.id">
            <td>
              <div class="user-info">
                <img v-if="user.avatar && !user.avatarError" :src="user.avatar" :alt="user.name" class="avatar" @error="user.avatarError = true" />
                <div v-else class="avatar-placeholder">{{ user.name.charAt(0) }}</div>
                <span>{{ user.name }}</span>
              </div>
            </td>
            <td>{{ user.email }}</td>
            <td>
              <div v-if="assignmentLoadingIds.has(user.id)" class="loading-text">加载中...</div>
              <div v-else-if="user.assignedProjects && user.assignedProjects.length > 0" class="projects-list">
                <span v-for="project in user.assignedProjects" :key="project" class="project-tag">
                  {{ project }}
                </span>
              </div>
              <span v-else class="no-projects">未分配</span>
            </td>
            <td class="actions">
              <button 
                class="action-btn assign-btn" 
                @click="handleOpenAssignModal(user)"
                :disabled="assignmentLoadingIds.has(user.id)"
              >
                {{ assignmentLoadingIds.has(user.id) ? '加载中...' : '分配项目' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="userList.length > 0" class="pagination">
      <button 
        class="page-btn" 
        @click="goToPreviousPage"
        :disabled="pagination.currentPage === 1"
      >
        上一页
      </button>
      <span class="page-info">
        第 {{ pagination.currentPage }} / {{ Math.ceil(pagination.total / pagination.pageSize) }} 页
      </span>
      <button 
        class="page-btn" 
        @click="goToNextPage"
        :disabled="pagination.currentPage >= Math.ceil(pagination.total / pagination.pageSize)"
      >
        下一页
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  userList: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  pagination: {
    type: Object,
    default: () => ({ currentPage: 1, pageSize: 10, total: 0 }),
  },
  assignmentLoadingIds: {
    type: Set,
    default: () => new Set(),
  },
});

const emit = defineEmits(['open-assign-modal', 'page-change']);

const handleOpenAssignModal = (user) => {
  emit('open-assign-modal', user);
};

const goToPreviousPage = () => {
  if (props.pagination.currentPage > 1) {
    emit('page-change', props.pagination.currentPage - 1);
  }
};

const goToNextPage = () => {
  const maxPage = Math.ceil(props.pagination.total / props.pagination.pageSize);
  if (props.pagination.currentPage < maxPage) {
    emit('page-change', props.pagination.currentPage + 1);
  }
};
</script>

<style scoped>
.project-assignment-tab {
  width: 100%;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #8c8c8c;
}

.loading-text {
  color: #8c8c8c;
  font-size: 12px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #8c8c8c;
}

.table-wrapper {
  overflow-x: auto;
}

.assignment-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.assignment-table thead {
  background-color: #fafafa;
  border-bottom: 1px solid #e8e8e8;
}

.assignment-table th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 500;
  color: #262626;
}

.assignment-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #e8e8e8;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #1890ff;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  font-size: 12px;
}

.projects-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.project-tag {
  display: inline-block;
  padding: 4px 12px;
  background-color: #e6f7ff;
  color: #1890ff;
  border-radius: 4px;
  font-size: 12px;
}

.no-projects {
  color: #8c8c8c;
  font-size: 12px;
}

.actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 6px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background-color: #fff;
  color: #262626;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.action-btn:hover:not(:disabled) {
  border-color: #1890ff;
  color: #1890ff;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.assign-btn {
  color: #1890ff;
  border-color: #1890ff;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e8e8e8;
}

.page-btn {
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background-color: #fff;
  color: #262626;
  cursor: pointer;
  transition: all 0.3s;
}

.page-btn:hover:not(:disabled) {
  border-color: #1890ff;
  color: #1890ff;
}

.page-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.page-info {
  color: #8c8c8c;
  font-size: 14px;
}
</style>

