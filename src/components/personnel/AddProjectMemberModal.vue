<template>
  <div v-if="visible" class="modal-overlay" @click.self="handleClose">
    <div class="modal-content">
      <div class="modal-header">
        <h2>添加项目成员</h2>
        <button class="close-btn" @click="handleClose">×</button>
      </div>

      <div class="modal-body">
        <!-- 用户搜索选择器 -->
        <div class="form-group">
          <label class="form-label">搜索并选择用户</label>
          <UserSearchSelector
            :selected-user-ids="selectedUserIds"
            :disabled="isSubmitting"
            @select="handleUserSelect"
          />
        </div>

        <!-- 已选用户列表 -->
        <div class="form-group">
          <label class="form-label">已选用户 ({{ selectedUsers.length }})</label>
          <SelectedUsersList
            :selected-users="selectedUsers"
            :disabled="isSubmitting"
            @remove="handleUserRemove"
            @role-change="handleRoleChange"
          />
        </div>
      </div>

      <div class="modal-footer">
        <button
          type="button"
          class="btn btn-secondary"
          @click="handleClose"
          :disabled="isSubmitting"
        >
          取消
        </button>
        <button
          type="button"
          class="btn btn-primary"
          @click="handleSubmit"
          :disabled="isSubmitting || selectedUsers.length === 0"
        >
          {{ isSubmitting ? '添加中...' : `添加 ${selectedUsers.length} 名成员` }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import UserSearchSelector from './UserSearchSelector.vue';
import SelectedUsersList from './SelectedUsersList.vue';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  isSubmitting: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['close', 'submit']);

// 已选用户列表，每个用户包含 id, name, email, projectRole
const selectedUsers = ref([]);

// 已选用户ID列表（用于过滤）
const selectedUserIds = computed(() => {
  return selectedUsers.value.map(user => user.id);
});

const handleUserSelect = (user) => {
  // 检查是否已选择
  if (selectedUsers.value.find(u => u.id === user.id)) {
    return;
  }
  
  // 添加到已选列表，默认角色为 developer
  selectedUsers.value.push({
    id: user.id,
    name: user.name,
    email: user.email,
    projectRole: 'developer',
  });
};

const handleUserRemove = (userId) => {
  selectedUsers.value = selectedUsers.value.filter(user => user.id !== userId);
};

const handleRoleChange = ({ userId, projectRole }) => {
  const user = selectedUsers.value.find(u => u.id === userId);
  if (user) {
    user.projectRole = projectRole;
  }
};

const handleClose = () => {
  selectedUsers.value = [];
  emit('close');
};

const handleSubmit = () => {
  if (selectedUsers.value.length === 0) return;
  
  // 将已选用户转换为提交格式
  const members = selectedUsers.value.map(user => ({
    userId: user.id,
    projectRole: user.projectRole,
  }));
  
  emit('submit', { members });
};

// 当弹窗打开时重置表单
watch(
  () => props.visible,
  (newVal) => {
    if (!newVal) {
      selectedUsers.value = [];
    }
  }
);
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: #fff;
  border-radius: 4px;
  width: 90%;
  max-width: 600px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e8e8e8;
  flex-shrink: 0;
}

.modal-header h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #8c8c8c;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #000;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.loading {
  text-align: center;
  padding: 40px 20px;
  color: #8c8c8c;
}

.form-group {
  margin-bottom: 24px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #262626;
  margin-bottom: 8px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e8e8e8;
  flex-shrink: 0;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid #d9d9d9;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #fff;
  color: #262626;
}

.btn-secondary:hover:not(:disabled) {
  border-color: #40a9ff;
  color: #40a9ff;
}

.btn-primary {
  background-color: #1890ff;
  color: #fff;
  border-color: #1890ff;
}

.btn-primary:hover:not(:disabled) {
  background-color: #40a9ff;
  border-color: #40a9ff;
}
</style>
