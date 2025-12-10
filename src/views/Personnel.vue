<template>
  <div class="personnel-page">
    <div class="personnel-content">
      <div class="tabs">
        <button class="tab-button active">用户管理</button>
        <button class="tab-button">项目分配</button>
      </div>

      <div class="toolbar">
        <button class="btn btn-primary">+ 创建新用户</button>
        <div class="toolbar-right">
          <div class="search-input-wrapper">
            <svg class="search-icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M909.6 854.1 646.1 590.6a360.6 360.6 0 1 0-23.5 23.5l263.5 263.5a16.9 16.9 0 0 0 23.5 0l23.5-23.5a16.9 16.9 0 0 0 0-23.5zM413.5 755.1a320.6 320.6 0 1 1 0-641.2 320.6 320.6 0 0 1 0 641.2z"></path></svg>
            <input type="text" class="search-input" placeholder="搜索用户..." v-model="searchKeyword" @keyup.enter="handleSearch">
          </div>
          <button class="btn btn-filter">筛选条件</button>
        </div>
      </div>

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
                  <img :src="user.avatar || 'https://via.placeholder.com/32'" alt="avatar" class="user-avatar">
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
                  <button class="action-btn">
                    <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M880 836H144c-17.7 0-32 14.3-32 32v36c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-36c0-17.7-14.3-32-32-32zm-622.3-84c2 0 4-.2 6-.5L431 712.3l109.9 110c2.6 2.6 6 4 9.5 4s6.9-1.3 9.5-4l45.2-45.2a13.2 13.2 0 0 0 0-18.7l-25.9-25.9a13.2 13.2 0 0 0-18.7 0l-18.4 18.4-93-93.1 18.4-18.4a13.2 13.2 0 0 0 0-18.7l-25.9-25.9a13.2 13.2 0 0 0-18.7 0l-45.2 45.2a13.2 13.2 0 0 0-4 9.5c0 3.5 1.3 6.9 4 9.5L381.2 752l-167.5-39.4c-3.6-.9-7.3.4-9.8 3.4L159 759.3a13.2 13.2 0 0 0-3.3 10.3c.1 3.9 2.1 7.5 5.2 9.8l45.1 33.1c2.1 1.5 4.7 2.3 7.3 2.3zM764.4 251.9l-252.1 252.1a13.2 13.2 0 0 0-3.7 9.4l-6.4 86.8c-.9 12.2 8.5 22.4 20.6 21.5l86.8-6.4a13.2 13.2 0 0 0 9.4-3.7l252.1-252.1c4.6-4.6 4.6-12.1 0-16.8l-69.8-69.8c-4.6-4.6-12.1-4.6-16.8 0z"></path></svg>
                  </button>
                  <button class="action-btn">
                     <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896zm-55.8 536.3-203-203a30.1 30.1 0 0 0-42.5 42.5l224.2 224.2a30.1 30.1 0 0 0 42.5 0l424.2-424.2a30.1 30.1 0 1 0-42.5-42.5L456.2 600.3z"></path></svg>
                  </button>
                  <button class="action-btn">
                    <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M360 184h-8c4.4 0 8-3.6 8-8v8h304v-8c0 4.4 3.6 8 8 8h-8v-32h-8c-4.4 0-8 3.6-8 8v8H376v-8c0-4.4-3.6-8-8-8h-8v32zM464 288h112c4.4 0 8-3.6 8-8v-48H456v48c0 4.4 3.6 8 8 8zm328 0h-8c4.4 0 8-3.6 8-8v-48h104v48c0 4.4-3.6 8-8 8h-8zm-472-48H112v48c0 4.4 3.6 8 8 8h-8c4.4 0 8-3.6 8-8v-48h104v48c0 4.4 3.6 8 8 8zm184 560h256c4.4 0 8-3.6 8-8V448H448v400c0 4.4 3.6 8 8 8zm-112-400v400c0 4.4 3.6 8 8 8h80V448H336zm496-400H192c-17.7 0-32 14.3-32 32v64h736v-64c0-17.7-14.3-32-32-32z"></path></svg>
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
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { getUserList } from '@/api/user';

const searchKeyword = ref('');
const pagination = reactive({
  currentPage: 1,
  pageSize: 6,
  total: 0,
});
const userList = ref([]);
const loading = ref(false);

const totalPages = computed(() => Math.ceil(pagination.total / pagination.pageSize));

const fetchUsers = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      name: searchKeyword.value,
    };
    const response = await getUserList(params);
    if (response && response.data) {
      userList.value = response.data.items.map(user => ({
        id: user.userId,
        name: user.name,
        email: user.email,
        avatar: user.avatarUrl,
        role: user.position || '暂无角色',
        status: user.status,
        createTime: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '',
      }));
      pagination.total = response.data.total || 0;
    } else {
      userList.value = [];
      pagination.total = 0;
    }
  } catch (error) {
    console.error('获取用户列表失败:', error);
    userList.value = [];
    pagination.total = 0;
  } finally {
    loading.value = false;
  }
};

const getStatusClass = (status) => {
  const lowerCaseStatus = status.toLowerCase();
  if (lowerCaseStatus.includes('disable') || lowerCaseStatus.includes('禁用')) {
    return 'status-tag--disabled';
  }
  if (lowerCaseStatus.includes('active') || lowerCaseStatus.includes('激活') || lowerCaseStatus.includes('活跃')) {
    return 'status-tag--active';
  }
  if (lowerCaseStatus.includes('pending') || lowerCaseStatus.includes('待')) {
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
}

.btn-primary {
  background-color: #1890ff;
  color: #fff;
  border-color: #1890ff;
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

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
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
</style>