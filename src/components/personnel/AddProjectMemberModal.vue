<template>
  <div v-if="visible" class="modal-overlay" @click.self="handleClose">
    <div class="modal-content">
      <div class="modal-header">
        <h2>添加项目成员</h2>
        <button class="close-btn" @click="handleClose">×</button>
      </div>

      <div class="modal-body">
        <div class="modal-grid">
          <div class="left-panel">
            <div class="panel-card">
              <div class="panel-header">
                <div class="panel-title">搜索并选择用户</div>
                <div class="panel-sub">从组织中选择要添加到项目的成员</div>
              </div>
              <div class="panel-body">
                <UserSearchSelector
                  :selected-user-ids="selectedUserIds"
                  :disabled="isSubmitting"
                  @select="handleUserSelect"
                />
              </div>
            </div>
          </div>

          <div class="right-panel">
            <div class="panel-card selected-card">
              <div class="panel-header between">
                <div>
                  <div class="panel-title">已选用户</div>
                  <div class="panel-sub">{{ selectedUsers.length }} 人</div>
                </div>
                <button class="btn-clear" type="button" @click="selectedUsers = []" :disabled="isSubmitting">清空</button>
              </div>
              <div class="panel-body">
                <SelectedUsersList
                  :selected-users="selectedUsers"
                  :disabled="isSubmitting"
                  @remove="handleUserRemove"
                  @role-change="handleRoleChange"
                />
              </div>
            </div>
          </div>
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
  border-radius: 12px;
  width: 95%;
  max-width: 900px;
  box-shadow: 0 12px 36px rgba(15, 23, 42, 0.08);
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

/* modal grid for selector + selected list */
.modal-grid {
  display: grid;
  grid-template-columns: 1fr 420px;
  gap: 18px;
}
.panel-card {
  background: linear-gradient(180deg,#fff,#fbfdff);
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 8px 28px rgba(15,23,42,0.06);
  display: flex;
  flex-direction: column;
  height: 100%;
}
.panel-header {
  margin-bottom: 10px;
  display:flex;
  align-items:center;
  justify-content:space-between;
}
.panel-header.between { justify-content: space-between; }
.panel-title { font-size: 15px; font-weight: 600; color:#1f2937; }
.panel-sub { font-size: 13px; color:#6b7280; }
.panel-body { flex: 1; overflow: auto; padding-top: 6px; }
.selected-card .panel-body { max-height: 440px; }
.btn-clear { background:none; border:1px solid #e6eef8; padding:6px 10px; border-radius:8px; cursor:pointer; color:#475569; }
.btn-clear:hover { background:#f8fbff; border-color:#cfeeff; }

@media (max-width: 900px) {
  .modal-grid { grid-template-columns: 1fr; }
  .selected-card .panel-body { max-height: 300px; }
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
