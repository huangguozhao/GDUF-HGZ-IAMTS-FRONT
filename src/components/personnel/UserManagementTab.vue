<template>
  <div class="user-management-tab">
    <div v-if="loading" class="loading">加载中...</div>
    
    <div v-else-if="userList.length === 0" class="empty-state">
      <p>暂无用户数据</p>
    </div>

    <div v-else class="table-wrapper">
      <table class="user-table">
        <thead>
          <tr>
            <th>用户名</th>
            <th>邮箱</th>
            <th>电话</th>
            <th>职位</th>
            <th>状态</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in userList" :key="user.id">
            <td>
              <div class="user-info">
                <img v-if="user.avatar" :src="user.avatar" :alt="user.name" class="avatar" @error="user.avatarError = true" />
                <div v-else class="avatar-placeholder">{{ user.name.charAt(0) }}</div>
                <span>{{ user.name }}</span>
              </div>
            </td>
            <td>{{ user.email }}</td>
            <td>{{ user.phone || '-' }}</td>
            <td>{{ user.role }}</td>
            <td>
              <span :class="['status-badge', `status-${user.status?.toLowerCase()}`]">
                {{ formatStatus(user.status) }}
              </span>
            </td>
            <td>{{ user.createTime }}</td>
            <td class="actions">
              <button class="action-btn edit-btn" @click="handleEdit(user)" title="编辑">
                编辑
              </button>
              <button 
                class="action-btn status-btn" 
                @click="handleToggleStatus(user)"
                :disabled="statusChangingIds.has(user.id)"
                title="切换状态"
              >
                {{ statusChangingIds.has(user.id) ? '更新中...' : '切换状态' }}
              </button>
              <button 
                class="action-btn delete-btn" 
                @click="handleDelete(user)"
                :disabled="deletingIds.has(user.id)"
                title="删除"
              >
                {{ deletingIds.has(user.id) ? '删除中...' : '删除' }}
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
import { computed } from 'vue';

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
  statusChangingIds: {
    type: Set,
    default: () => new Set(),
  },
  deletingIds: {
    type: Set,
    default: () => new Set(),
  },
});

const emit = defineEmits(['edit', 'toggle-status', 'delete', 'page-change']);

const formatStatus = (status) => {
  const statusMap = {
    'active': '活跃',
    'pending': '待审核',
    'inactive': '已禁用',
  };
  return statusMap[status?.toLowerCase()] || status || '未知';
};

const handleEdit = (user) => {
  emit('edit', user);
};

const handleToggleStatus = (user) => {
  emit('toggle-status', user);
};

const handleDelete = (user) => {
  emit('delete', user);
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
.user-management-tab {
  width: 100%;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #8c8c8c;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #8c8c8c;
}

.table-wrapper {
  overflow-x: auto;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.user-table thead {
  background-color: #fafafa;
  border-bottom: 1px solid #e8e8e8;
}

.user-table th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 500;
  color: #262626;
}

.user-table td {
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

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-active {
  background-color: #f6ffed;
  color: #52c41a;
}

.status-pending {
  background-color: #fffbe6;
  color: #faad14;
}

.status-inactive {
  background-color: #fff1f0;
  color: #ff4d4f;
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

.edit-btn {
  color: #1890ff;
  border-color: #1890ff;
}

.delete-btn {
  color: #ff4d4f;
  border-color: #ff4d4f;
}

.status-btn {
  color: #faad14;
  border-color: #faad14;
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

