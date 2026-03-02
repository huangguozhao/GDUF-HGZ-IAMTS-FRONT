<template>
  <div class="user-management-tab">
    <!-- Loading State -->
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

    <!-- Empty State -->
    <div v-else-if="userList.length === 0" class="empty-state">
      <div class="empty-illustration">
        <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="45" r="25" fill="none" stroke="#d9d9d9" stroke-width="3"/>
          <path d="M35 95c0-17.7 14.3-32 32-32s32 14.3 32 32" fill="none" stroke="#d9d9d9" stroke-width="3"/>
          <circle cx="42" cy="40" r="4" fill="#bfbfbf"/>
          <circle cx="78" cy="40" r="4" fill="#bfbfbf"/>
          <path d="M52 55c0 0 8 8 16 0" fill="none" stroke="#bfbfbf" stroke-width="2"/>
        </svg>
      </div>
      <p class="empty-title">暂无用户数据</p>
      <p class="empty-desc">点击右上角的"创建新用户"按钮添加用户</p>
    </div>

    <!-- User Table -->
    <div v-else class="table-container">
      <div class="table-wrapper">
        <table class="user-table">
          <thead>
            <tr>
              <th>用户</th>
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
              <td data-label="用户">
                <div class="user-info">
                  <div class="avatar-container">
                    <img
                      v-if="user.avatar && !user.avatarError"
                      :src="user.avatar"
                      :alt="user.name"
                      class="user-avatar"
                      @error="user.avatarError = true"
                    />
                    <div v-else class="user-avatar-fallback">
                      {{ getNameInitials(user.name) }}
                    </div>
                  </div>
                  <div class="user-details">
                    <span class="user-name">{{ user.name }}</span>
                    <span class="user-id">ID: {{ user.id }}</span>
                  </div>
                </div>
              </td>
              <td data-label="邮箱">
                <span class="email-cell">{{ user.email }}</span>
              </td>
              <td data-label="电话">{{ user.phone || '-' }}</td>
              <td data-label="职位">
                <span class="position-badge">{{ user.role }}</span>
              </td>
              <td data-label="状态">
                <span :class="['status-badge', `status-${user.status?.toLowerCase()}`]">
                  <span class="status-dot"></span>
                  {{ formatStatus(user.status) }}
                </span>
              </td>
              <td data-label="创建时间">
                <span class="time-cell">{{ user.createTime }}</span>
              </td>
              <td class="actions" data-label="操作" role="cell">
                <div class="action-buttons">
                  <button class="action-btn edit-btn" @click="handleEdit(user)" title="编辑" aria-label="编辑">
                    <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                      <path fill="currentColor" d="M811.4 273.6c17.9-19.4 17.5-49.5-1.1-68.3-17.8-18-46.8-19.3-65.6-3l-6.3 5.4-126.8 133.2-56.8-56.8 133.1-136.6 5.5-6.1c16.2-17.8 14.9-45.9-2.9-62.1l-150.2-137.3c-17.8-16.3-46.9-15.6-64.4 1.4-17.2 16.8-16.8 44.3 1.4 60.9l5.6 5.1L233.4 415.2l-56.8 56.8-138-138.1 5.6-5.5c16.6-16.5 16.3-43.5-1.4-60.9-17.5-17.1-45.7-18-63.6-1.6L2.4 309.6C-6.9 327.9-6 356.1 11.3 374.4l150.2 160.8c17.3 18.5 45.5 20.3 63.2 3.5l125.9-132.4 56.8 56.8-132.3 125.7c-16.8 15.9-18.7 41.8-4.5 58.3 14.3 16.6 39.9 18.4 57.3 4l150.2-137.3c17.6-16.1 18.5-43.1 2.3-60.5z"/>
                    </svg>
                    <span>编辑</span>
                  </button>
                  <button
                    class="action-btn status-btn"
                    @click="handleToggleStatus(user)"
                    :disabled="statusChangingIds.has(user.id)"
                    title="切换状态"
                    aria-label="切换状态"
                  >
                    <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                      <path fill="currentColor" d="M752 120c-124.6 0-226.8 93.4-248 213.5-2.1 11.9-16.3 15.4-24.4 6.2l-62-70.2c-6.7-7.6-18.2-5.8-22.7 3.6-23.5 48.8-73.4 82.9-129.5 82.9-82.5 0-149.3-66.8-149.3-149.3s66.8-149.3 149.3-149.3c36.7 0 69.8 13.3 95.4 35.3l68.1-68.1c3.6-3.6 9.4-3.9 13.4 0l23.3 23.3c3.7 3.7 3.6 9.4 0 13.4L548 185.9c-22 25.6-35.3 58.7-35.3 95.4 0 82.5 66.8 149.3 149.3 149.3 56.1 0 106-34.1 129.5-82.9 4.5-9.4 16-11.2 22.7-3.6l62 70.2c8.1 9.2 22.5 5.7 24.4-6.2C978.8 213.4 876.6 120 752 120zM336 640c-44.2 0-80-35.8-80-80s35.8-80 80-80 80 35.8 80 80-35.8 80-80 80z"/>
                    </svg>
                    <span>{{ statusChangingIds.has(user.id) ? '更新中' : '状态' }}</span>
                  </button>
                  <button
                    class="action-btn delete-btn"
                    @click="handleDelete(user)"
                    :disabled="deletingIds.has(user.id)"
                    title="删除"
                    aria-label="删除"
                  >
                    <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                      <path fill="currentColor" d="M862.5 156.9L667.1 315.2c-7.3 5.9-19.3 5.5-26.2-1L437.6 135.5c-6.3-6-16.3-6.3-23.1-0.8l-76.7 61.8c-7.7 6.2-9.5 16.8-4.3 25.1l57.6 92.5c5.2 8.3 0.3 18.8-9.8 21.1L208 372.5c-10.1 2.2-18.9 10.5-20.5 20.6l-27.8 177.2c-2.4 15.5 10.6 29.1 26.1 27.3l248-28c9.7-1.1 17.6-8.9 18.7-18.6l27.8-177.2c1.6-10.1-2.8-20.1-11.1-25.7l-133.2-89.2c-8.6-5.8-10.3-17.1-3.7-25.3l76.7-95.7c6-7.5 16.9-9.1 24.8-3.7l203.1 138.4c7.9 5.4 9.7 15.9 4.3 23.9l-57.6 85.8c-5.2 7.8-2.1 18.2 6.7 22.3l248 28c15.5 1.8 28.5-11.8 26.1-27.3L838 206c-1.4-9.1-8.6-16.6-17.8-18.2l-244-27.8c-10.1-1.2-18.5-9.7-20-19.6z"/>
                    </svg>
                    <span>{{ deletingIds.has(user.id) ? '删除中' : '删除' }}</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="userList.length > 0" class="pagination">
      <div class="pagination-info">
        共 <span class="pagination-total">{{ pagination.total }}</span> 条记录，
        第 <span class="pagination-current">{{ pagination.currentPage }}</span> / <span class="pagination-max">{{ Math.ceil(pagination.total / pagination.pageSize) }}</span> 页
      </div>
      <div class="pagination-controls">
        <button
          class="page-btn"
          @click="goToPreviousPage"
          :disabled="pagination.currentPage === 1"
        >
          <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M672 224l-158.4 160 158.4 160-44.8 44.8-203.2-203.2 203.2-203.2z"/>
          </svg>
          上一页
        </button>
        <div class="page-numbers">
          <button
            v-for="page in visiblePages"
            :key="page"
            :class="['page-num', { active: page === pagination.currentPage }]"
            @click="handlePageChange(page)"
          >
            {{ page }}
          </button>
        </div>
        <button
          class="page-btn"
          @click="goToNextPage"
          :disabled="pagination.currentPage >= Math.ceil(pagination.total / pagination.pageSize)"
        >
          下一页
          <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M352 224l158.4 160-158.4 160 44.8 44.8 203.2-203.2-203.2-203.2z"/>
          </svg>
        </button>
      </div>
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

// 生成头像渐变背景色
const getAvatarGradient = (name) => {
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
    'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
  ];
  const index = (name?.charCodeAt(0) || 0) % gradients.length;
  return gradients[index];
};

// 计算可见的页码
const visiblePages = computed(() => {
  const totalPages = Math.ceil((props.pagination.total || 0) / (props.pagination.pageSize || 1));
  if (totalPages <= 0) return [];
  
  const current = props.pagination.currentPage;
  const pages = [];
  
  let start = Math.max(1, current - 2);
  let end = Math.min(totalPages, current + 2);
  
  if (end - start < 4) {
    if (start === 1) {
      end = Math.min(totalPages, start + 4);
    } else {
      start = Math.max(1, end - 4);
    }
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  
  return pages;
});

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

/* Loading State */
.loading {
  text-align: center;
  padding: 40px;
  color: #8c8c8c;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: #fafafa;
  border-radius: 12px;
  margin-top: 16px;
}

.empty-illustration {
  width: 120px;
  height: 120px;
  margin: 0 auto 24px;
}

.empty-illustration svg {
  width: 100%;
  height: 100%;
}

.empty-title {
  font-size: 18px;
  font-weight: 500;
  color: #595959;
  margin: 0 0 8px;
}

.empty-desc {
  font-size: 14px;
  color: #8c8c8c;
  margin: 0;
}

/* Table Container */
.table-container {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #f0f0f0;
}

.table-wrapper {
  overflow-x: auto;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  background: #fff;
}

.user-table thead {
  background: linear-gradient(90deg, #fafafa 0%, #f5f5f5 100%);
  border-bottom: 2px solid #f0f0f0;
}

.user-table th {
  padding: 16px;
  text-align: left;
  font-weight: 600;
  color: #595959;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.user-table td {
  padding: 16px;
  border-bottom: 1px solid #f5f5f5;
  vertical-align: middle;
}

.user-row {
  transition: all 0.2s ease;
}

.user-row:hover {
  background: #fafbfc;
}

.user-row:focus {
  outline: none;
  background: #f0f7ff;
}

/* User Info */
.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar-container,
.user-avatar,
.user-avatar-fallback {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  flex-shrink: 0;
}

.user-avatar {
  object-fit: cover;
}

.user-avatar-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
  color: #fff;
  font-weight: 600;
  font-size: 13px;
  box-shadow: 0 2px 6px rgba(24, 144, 255, 0.3);
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-weight: 500;
  color: #1f1f1f;
}

.user-id {
  font-size: 12px;
  color: #bfbfbf;
}

/* Email */
.email-cell {
  color: #1890ff;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 13px;
}

/* Position Badge */
.position-badge {
  display: inline-block;
  padding: 4px 12px;
  background: linear-gradient(135deg, #f0f5ff 0%, #e6f0ff 100%);
  color: #1890ff;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

/* Status Badge */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.status-active {
  background: linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%);
  color: #52c41a;
}

.status-active .status-dot {
  background: #52c41a;
  box-shadow: 0 0 6px #52c41a;
}

.status-pending {
  background: linear-gradient(135deg, #fffbe6 0%, #ffe58f 100%);
  color: #faad14;
}

.status-pending .status-dot {
  background: #faad14;
  box-shadow: 0 0 6px #faad14;
}

.status-inactive {
  background: linear-gradient(135deg, #fff1f0 0%, #ffccc7 100%);
  color: #ff4d4f;
}

.status-inactive .status-dot {
  background: #ff4d4f;
  box-shadow: 0 0 6px #ff4d4f;
}

/* Time Cell */
.time-cell {
  color: #8c8c8c;
  font-size: 13px;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 8px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn svg {
  width: 14px;
  height: 14px;
}

.action-btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.edit-btn {
  color: #1890ff;
  background: #e6f7ff;
  border-color: #91d5ff;
}

.edit-btn:hover:not(:disabled) {
  background: #1890ff;
  color: #fff;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

.status-btn {
  color: #faad14;
  background: #fffbe6;
  border-color: #ffe58f;
}

.status-btn:hover:not(:disabled) {
  background: #faad14;
  color: #fff;
  box-shadow: 0 4px 12px rgba(250, 173, 20, 0.3);
}

.delete-btn {
  color: #ff4d4f;
  background: #fff1f0;
  border-color: #ffccc7;
}

.delete-btn:hover:not(:disabled) {
  background: #ff4d4f;
  color: #fff;
  box-shadow: 0 4px 12px rgba(255, 77, 79, 0.3);
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
  gap: 16px;
}

.pagination-info {
  color: #8c8c8c;
  font-size: 14px;
  white-space: nowrap;
}

.pagination-total,
.pagination-current,
.pagination-max {
  color: #1890ff;
  font-weight: 500;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.page-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  background: #fff;
  color: #595959;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.page-btn svg {
  width: 14px;
  height: 14px;
}

.page-btn:hover:not(:disabled) {
  border-color: #1890ff;
  color: #1890ff;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 4px;
}

.page-num {
  min-width: 36px;
  height: 36px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  background: #fff;
  color: #595959;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-num:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.page-num.active {
  background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
  border-color: #1890ff;
  color: #fff;
  font-weight: 500;
}

/* Responsive: stacked card view on small screens */
@media (max-width: 768px) {
  .user-table thead { display: none; }
  .user-table, .user-table tbody, .user-table tr, .user-table td { display: block; width: 100%; }
  .user-table tr { margin-bottom: 12px; border-radius: 12px; background: #fff; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); padding: 16px; border: 1px solid #f0f0f0; }
  .user-table td { padding: 8px 0; border: none; display: flex; justify-content: space-between; align-items: center; }
  .user-table td[data-label]::before { content: attr(data-label); color: #8c8c8c; margin-right: 8px; font-size: 12px; font-weight: 500; }
  .actions { justify-content: flex-end; }
  .action-buttons { flex-wrap: wrap; }
  .pagination { flex-direction: row; flex-wrap: wrap; justify-content: center; }
  .pagination-info { width: 100%; text-align: center; margin-bottom: 8px; }
  .pagination-controls { width: 100%; justify-content: center; }
}

/* Skeleton styles */
.loading-skeleton { padding: 8px 4px; }
.skeleton-table { display: flex; flex-direction: column; gap: 12px; }
.skeleton-row { display: flex; gap: 12px; align-items: center; padding: 16px; border-radius: 12px; background: #fff; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04); }
.skeleton-cell { flex: 1; min-width: 0; }
.skeleton-cell.avatar-cell { flex: 0 0 48px; }
.skeleton-avatar { width: 42px; height: 42px; border-radius: 12px; background: linear-gradient(90deg, #e9eefb, #f3f6fb); animation: shimmer 1.2s infinite; }
.skeleton-line { height: 14px; background: linear-gradient(90deg, #eef3fb, #f7f9fe); border-radius: 7px; animation: shimmer 1.2s infinite; }
.skeleton-line.short { width: 60%; }
.skeleton-line.medium { width: 80%; }
.skeleton-chip { width: 80px; height: 24px; border-radius: 20px; background: linear-gradient(90deg, #eef3fb, #f7f9fe); animation: shimmer 1.2s infinite; }
.skeleton-btn { width: 60px; height: 32px; border-radius: 8px; background: linear-gradient(90deg, #eef3fb, #f7f9fe); animation: shimmer 1.2s infinite; display: inline-block; margin-right: 8px; }
.skeleton-btn.small { width: 40px; height: 32px; }

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
</style>

