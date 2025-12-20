<template>
  <div class="selected-users-list">
    <div v-if="selectedUsers.length === 0" class="empty-hint">
      暂无已选用户
    </div>
    <div v-else class="users-container">
      <div
        v-for="(user, index) in selectedUsers"
        :key="user.id"
        class="user-item"
      >
        <div class="user-info">
          <span class="user-name">{{ user.name }}</span>
          <span class="user-email">{{ user.email }}</span>
        </div>
        <div class="user-actions">
          <select
            v-model="user.projectRole"
            class="role-select"
            :disabled="disabled"
            @change="handleRoleChange(user, $event)"
          >
            <option value="owner">项目负责人</option>
            <option value="manager">项目管理员</option>
            <option value="developer">开发人员</option>
            <option value="tester">测试人员</option>
            <option value="viewer">只读成员</option>
          </select>
          <button
            type="button"
            class="remove-btn"
            :disabled="disabled"
            @click="handleRemove(user.id)"
            title="移除"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  selectedUsers: {
    type: Array,
    default: () => [],
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['remove', 'role-change']);

const handleRemove = (userId) => {
  emit('remove', userId);
};

const handleRoleChange = (user, event) => {
  emit('role-change', {
    userId: user.id,
    projectRole: event.target.value,
  });
};
</script>

<style scoped>
.selected-users-list {
  width: 100%;
}

.empty-hint {
  padding: 20px;
  text-align: center;
  color: #8c8c8c;
  font-size: 14px;
}

.users-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  background-color: #fafafa;
  transition: all 0.2s;
}

.user-item:hover {
  border-color: #d9d9d9;
  background-color: #fff;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.user-name {
  font-size: 14px;
  color: #262626;
  font-weight: 500;
}

.user-email {
  font-size: 12px;
  color: #8c8c8c;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.role-select {
  padding: 6px 28px 6px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background-color: #fff;
  color: #262626;
  font-size: 14px;
  cursor: pointer;
  appearance: none;
  transition: all 0.3s;
  min-width: 120px;
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

.remove-btn {
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  background-color: transparent;
  color: #ff4d4f;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-btn:hover:not(:disabled) {
  background-color: #fff1f0;
}

.remove-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>

