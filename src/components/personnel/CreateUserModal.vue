<template>
  <div v-if="visible" class="modal-overlay" @click.self="handleClose">
    <div class="modal-content">
      <div class="modal-header">
        <h2>创建新用户</h2>
        <button class="close-btn" @click="handleClose">×</button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>用户名 *</label>
            <input 
              v-model="formData.name" 
              type="text" 
              placeholder="请输入用户名"
              required
            />
          </div>

          <div class="form-group">
            <label>邮箱 *</label>
            <input 
              v-model="formData.email" 
              type="email" 
              placeholder="请输入邮箱"
              required
            />
          </div>

          <div class="form-group">
            <label>密码 *</label>
            <input 
              v-model="formData.password" 
              type="password" 
              placeholder="请输入密码"
              required
            />
          </div>

          <div class="form-group">
            <label>电话</label>
            <input 
              v-model="formData.phone" 
              type="tel" 
              placeholder="请输入电话"
            />
          </div>

          <div class="form-group">
            <label>职位</label>
            <input 
              v-model="formData.position" 
              type="text" 
              placeholder="请输入职位"
            />
          </div>

          <div class="form-group">
            <label>部门ID</label>
            <input 
              v-model="formData.departmentId" 
              type="text" 
              placeholder="请输入部门ID"
            />
          </div>

          <div class="form-group">
            <label>员工ID</label>
            <input 
              v-model="formData.employeeId" 
              type="text" 
              placeholder="请输入员工ID"
            />
          </div>

          <div class="form-group">
            <label>描述</label>
            <textarea 
              v-model="formData.description" 
              placeholder="请输入描述"
              rows="3"
            ></textarea>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="handleClose">
              取消
            </button>
            <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
              {{ isSubmitting ? '创建中...' : '创建' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

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

const formData = ref({
  name: '',
  email: '',
  password: '',
  phone: '',
  position: '',
  departmentId: '',
  employeeId: '',
  description: '',
});

const handleClose = () => {
  // Reset form
  formData.value = {
    name: '',
    email: '',
    password: '',
    phone: '',
    position: '',
    departmentId: '',
    employeeId: '',
    description: '',
  };
  emit('close');
};

const handleSubmit = () => {
  if (!formData.value.name || !formData.value.email || !formData.value.password) {
    alert('用户名、邮箱和密码为必填项');
    return;
  }
  emit('submit', formData.value);
};
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
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e8e8e8;
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
  max-height: 60vh;
  overflow-y: auto;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #262626;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e8e8e8;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  border: 1px solid #d9d9d9;
  transition: all 0.3s;
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

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #fff;
  color: #262626;
  border-color: #d9d9d9;
}

.btn-secondary:hover {
  border-color: #40a9ff;
  color: #40a9ff;
}
</style>

