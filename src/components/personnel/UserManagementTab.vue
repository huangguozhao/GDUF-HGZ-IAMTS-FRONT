<template>
  <div class="user-management-tab">
  <div v-if="loading" class="loading-skeleton" aria-busy="true" aria-live="polite">
    <div class="skeleton-table">
      <div v-for="n in 6" :key="n" class="skeleton-row" role="row">
        <div class="skeleton-cell avatar-cell">
          <div class="skeleton-avatar"></div>
        </div>
        <div class="skeleton-cell">
          <div class="skeleton-line short"></div>
        </div>
        <div class="skeleton-cell">
          <div class="skeleton-line medium"></div>
        </div>
        <div class="skeleton-cell">
          <div class="skeleton-line medium"></div>
        </div>
        <div class="skeleton-cell">
          <div class="skeleton-chip"></div>
        </div>
        <div class="skeleton-cell">
          <div class="skeleton-line short"></div>
        </div>
        <div class="skeleton-cell actions-cell">
          <div class="skeleton-btn"></div>
          <div class="skeleton-btn small"></div>
        </div>
      </div>
    </div>
  </div>
  
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
          <tr v-for="user in userList" :key="user.id" class="user-row" role="row" tabindex="0">
            <td data-label="用户名">
              <div class="user-info">
                <img 
                  v-if="user.avatar && !user.avatarError" 
                  :src="user.avatar" 
                  :alt="user.name" 
                  class="avatar" 
                  @error="user.avatarError = true" 
                />
                <div v-else class="avatar-placeholder">{{ getNameInitials(user.name) }}</div>
                <span>{{ user.name }}</span>
              </div>
            </td>
            <td data-label="邮箱">{{ user.email }}</td>
            <td data-label="电话">{{ user.phone || '-' }}</td>
            <td data-label="职位">{{ user.role }}</td>
            <td data-label="状态">
              <span :class="['status-badge', `status-${user.status?.toLowerCase()}`]">
                {{ formatStatus(user.status) }}
              </span>
            </td>
            <td data-label="创建时间">{{ user.createTime }}</td>
            <td class="actions" data-label="操作" role="cell">
              <button class="action-btn icon-btn edit-btn" @click="handleEdit(user)" title="编辑" aria-label="编辑">
                ✏️
                <span class="btn-text">编辑</span>
              </button>
              <button 
                class="action-btn icon-btn status-btn" 
                @click="handleToggleStatus(user)"
                :disabled="statusChangingIds.has(user.id)"
                title="切换状态"
                aria-label="切换状态"
              >
                🔁
                <span class="btn-text">{{ statusChangingIds.has(user.id) ? '更新中...' : '切换' }}</span>
              </button>
              <button 
                class="action-btn icon-btn delete-btn" 
                @click="handleDelete(user)"
                :disabled="deletingIds.has(user.id)"
                title="删除"
                aria-label="删除"
              >
                🗑️
                <span class="btn-text">{{ deletingIds.has(user.id) ? '删除中...' : '删除' }}</span>
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

/**
 * 获取用户名的简写
 * - 中文名：取最后两个字符（不足两位则全取）
 * - 含空格的英文名：取首尾单词首字母并转大写，如 "Li Ming" -> "LM"
 * - 其他情况：取第一个字符并转大写
 */
const getNameInitials = (name) => {
  const raw = (name || '').trim();
  if (!raw) return '';

  // 如果包含英文字符，按英文名规则处理
  if (/[a-zA-Z]/.test(raw)) {
    const parts = raw.split(/\s+/).filter(Boolean);
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  // 主要针对中文名：取后两位
  if (raw.length <= 2) return raw;
  return raw.slice(-2);
};

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

/* icon style for action buttons (compact) */
.icon-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-radius: 8px;
  font-size: 13px;
  background: #fff;
}
.icon-btn .btn-text {
  display: inline-block;
}

/* row hover and focus */
.user-row {
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}
.user-row:hover, .user-row:focus {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(15,23,42,0.06);
}

/* Responsive: stacked card view on small screens */
@media (max-width: 768px) {
  .user-table thead { display: none; }
  .user-table, .user-table tbody, .user-table tr, .user-table td { display: block; width: 100%; }
  .user-table tr { margin-bottom: 12px; border-radius: 10px; background: #fff; box-shadow: 0 6px 18px rgba(15,23,42,0.04); padding: 12px; }
  .user-table td { padding: 8px 0; border: none; display: flex; justify-content: space-between; align-items: center; }
  .user-table td[data-label]::before { content: attr(data-label); color: #8c8c8c; margin-right: 8px; font-size: 12px; }
  .actions { justify-content: flex-end; }
  .icon-btn .btn-text { display: none; } /* hide text on very small screens */
}

/* Skeleton styles */
.loading-skeleton { padding: 8px 4px; }
.skeleton-table { display: flex; flex-direction: column; gap: 12px; }
.skeleton-row { display: flex; gap: 12px; align-items: center; padding: 12px; border-radius: 8px; background: #fff; box-shadow: 0 4px 12px rgba(15,23,42,0.04); }
.skeleton-cell { flex: 1; min-width: 0; }
.skeleton-cell.avatar-cell { flex: 0 0 48px; }
.skeleton-avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(90deg,#e9eefb,#f3f6fb); animation: shimmer 1.2s infinite; }
.skeleton-line { height: 12px; background: linear-gradient(90deg,#eef3fb,#f7f9fe); border-radius: 6px; animation: shimmer 1.2s infinite; }
.skeleton-line.short { width: 60%; }
.skeleton-line.medium { width: 80%; }
.skeleton-chip { width: 70px; height: 20px; border-radius: 12px; background: linear-gradient(90deg,#eef3fb,#f7f9fe); animation: shimmer 1.2s infinite; }
.skeleton-btn { width: 60px; height: 28px; border-radius: 8px; background: linear-gradient(90deg,#eef3fb,#f7f9fe); animation: shimmer 1.2s infinite; display: inline-block; margin-right: 8px; }
.skeleton-btn.small { width: 40px; height: 28px; }

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
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

