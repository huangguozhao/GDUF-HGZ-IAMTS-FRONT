<template>
  <div class="assignment-table-wrapper">
    <table class="assignment-table">
      <thead>
        <tr>
          <th class="col-name">姓名</th>
          <th class="col-email">邮箱</th>
          <th class="col-role">角色</th>
          <th class="col-date">加入时间</th>
          <th class="col-action">操作</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in userList" :key="user.id" class="user-row">
          <td class="col-name">
            <div class="user-cell">
              <img 
                v-if="user.avatar && !user.avatarError" 
                :src="user.avatar" 
                :alt="user.name" 
                class="user-avatar" 
                @error="user.avatarError = true" 
              />
              <div v-else class="avatar-placeholder">{{ user.name.charAt(0) }}</div>
              <span class="user-name">{{ user.name }}</span>
            </div>
          </td>
          <td class="col-email">{{ user.email }}</td>
          <td class="col-role">
            <div class="role-select-wrapper">
              <select 
                class="role-select" 
                :value="user.role"
                @change="handleRoleChange(user, $event)"
                :disabled="isRoleChanging(user.id)"
              >
                <option value="项目管理员">项目管理员</option>
                <option value="开发人员">开发人员</option>
                <option value="测试人员">测试人员</option>
                <option value="只读成员">只读成员</option>
              </select>
              <svg class="select-arrow" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                <path fill="currentColor" d="M840.4 300H183.6c-19.7 0-30.7 20.8-18.5 35l328.4 380.8c9.4 10.9 29.2 10.9 38.6 0L858.9 335c12.2-14.2 1.2-35-18.5-35z"></path>
              </svg>
            </div>
          </td>
          <td class="col-date">{{ user.createTime }}</td>
          <td class="col-action">
            <button 
              class="btn-delete" 
              @click="handleDelete(user)"
              :disabled="isDeletingId(user.id)"
              title="删除"
            >
              <svg class="icon-delete" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                <path fill="currentColor" d="M360 184h-8c4.4 0 8-3.6 8-8v8h304v-8c0 4.4 3.6 8 8 8h-8v72h72v-80c0-17.7-14.3-32-32-32H360c-17.7 0-32 14.3-32 32v80h72v-72zm504 72H160v60h60v506c0 35.3 28.7 64 64 64h529.2c35.3 0 64-28.7 64-64V316h60v-60zM166 316h652v506c0 17.7-14.3 32-32 32H198c-17.7 0-32-14.3-32-32V316zm192 88c0-4.4-3.6-8-8-8h-16c-4.4 0-8 3.6-8 8v250c0 4.4 3.6 8 8 8h16c4.4 0 8-3.6 8-8V404zm96 0c0-4.4-3.6-8-8-8h-16c-4.4 0-8 3.6-8 8v250c0 4.4 3.6 8 8 8h16c4.4 0 8-3.6 8-8V404zm96 0c0-4.4-3.6-8-8-8h-16c-4.4 0-8 3.6-8 8v250c0 4.4 3.6 8 8 8h16c4.4 0 8-3.6 8-8V404z"></path>
              </svg>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
const props = defineProps({
  userList: {
    type: Array,
    default: () => [],
  },
  roleChangingIds: {
    type: Set,
    default: () => new Set(),
  },
  deletingIds: {
    type: Set,
    default: () => new Set(),
  },
});

const emit = defineEmits(['role-change', 'remove-member']);

const isRoleChanging = (userId) => {
  return props.roleChangingIds.has(userId);
};

const isDeletingId = (userId) => {
  return props.deletingIds.has(userId);
};

const handleRoleChange = (user, event) => {
  const newRole = event.target.value;
  if (newRole !== user.role) {
    emit('role-change', user, newRole);
  }
};

const handleDelete = (user) => {
  emit('remove-member', user);
};
</script>

<style scoped>
.assignment-table-wrapper {
  overflow-x: auto;
  margin-bottom: 24px;
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
  white-space: nowrap;
}

.col-name {
  width: 20%;
  min-width: 180px;
}

.col-email {
  width: 25%;
  min-width: 200px;
}

.col-role {
  width: 20%;
  min-width: 150px;
}

.col-date {
  width: 20%;
  min-width: 120px;
}

.col-action {
  width: 15%;
  min-width: 80px;
  text-align: center;
}

.assignment-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #e8e8e8;
  color: #262626;
}

.user-row:hover {
  background-color: #fafafa;
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
  flex-shrink: 0;
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
  flex-shrink: 0;
}

.user-name {
  white-space: nowrap;
}

.role-select-wrapper {
  position: relative;
  display: inline-block;
  width: 100%;
}

.role-select {
  width: 100%;
  padding: 6px 28px 6px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background-color: #fff;
  color: #262626;
  font-size: 14px;
  cursor: pointer;
  appearance: none;
  transition: all 0.3s;
}

.role-select:hover:not(:disabled) {
  border-color: #40a9ff;
}

.role-select:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.role-select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.select-arrow {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 12px;
  height: 12px;
  pointer-events: none;
  color: #8c8c8c;
}

.btn-delete {
  padding: 6px 12px;
  border: 1px solid #ff4d4f;
  border-radius: 4px;
  background-color: #fff;
  color: #ff4d4f;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-delete:hover:not(:disabled) {
  background-color: #fff1f0;
}

.btn-delete:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.icon-delete {
  width: 16px;
  height: 16px;
}
</style>

