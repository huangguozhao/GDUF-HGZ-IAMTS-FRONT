<template>
  <div v-if="visible" class="modal-overlay" @click.self="handleClose">
    <div class="modal-content">
      <div class="modal-header">
        <h2>创建新用户</h2>
        <button class="close-btn" @click="handleClose">×</button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="handleSubmit" novalidate>
          <div class="form-grid">
            <div class="left-column">
              <div class="form-group">
                <label>用户名 *</label>
                <input v-model="formData.name" type="text" placeholder="请输入用户名" :class="{ invalid: validation.name }" autofocus />
                <div v-if="validation.name" class="field-error">{{ validation.name }}</div>
              </div>

              <div class="form-group">
                <label>邮箱 *</label>
                <input v-model="formData.email" type="email" placeholder="请输入邮箱" :class="{ invalid: validation.email }" />
                <div v-if="validation.email" class="field-error">{{ validation.email }}</div>
              </div>

              <div class="form-group">
                <label>密码 *</label>
                <input v-model="formData.password" type="password" placeholder="请输入密码" :class="{ invalid: validation.password }" />
                <div v-if="validation.password" class="field-error">{{ validation.password }}</div>
              </div>

              <div class="form-group">
                <label>描述</label>
                <textarea v-model="formData.description" placeholder="请输入描述" rows="4"></textarea>
              </div>
            </div>

            <div class="right-column">
              <div class="avatar-area">
                <div
                  class="avatar-preview"
                  v-if="avatarPreview"
                  :style="{ backgroundImage: 'url(' + avatarPreview + ')' }"
                  role="img"
                  :aria-label="'头像预览 ' + (formData.name || '')"
                ></div>
                <div v-else class="avatar-placeholder-lg">{{ avatarInitials }}</div>
                <div class="avatar-actions">
                  <label class="upload-btn">
                    上传头像
                    <input type="file" accept="image/*" @change="handleFileChange" />
                  </label>
                  <button type="button" class="btn btn-secondary" @click="clearAvatar" v-if="avatarPreview">移除</button>
                </div>
              </div>

              <div class="form-group">
                <label>电话</label>
                <input v-model="formData.phone" type="tel" placeholder="请输入电话" />
              </div>

              <div class="form-group">
                <label>职位</label>
                <input v-model="formData.position" type="text" placeholder="请输入职位" />
              </div>

              <div class="form-group two-columns">
                <div>
                  <label>部门ID</label>
                  <input v-model="formData.departmentId" type="text" placeholder="部门ID" />
                </div>
                <div>
                  <label>员工ID</label>
                  <input v-model="formData.employeeId" type="text" placeholder="员工ID" />
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="handleClose">取消</button>
            <button type="submit" class="btn btn-primary" :disabled="isSubmitting">{{ isSubmitting ? '创建中...' : '创建' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

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

// avatar support
const avatarPreview = ref(null);
const avatarFile = ref(null);

const avatarInitials = computed(() => {
  const n = formData.value.name || '';
  if (!n) return '';
  return n.length <= 2 ? n : n.slice(0,2);
});

const validation = ref({ name: '', email: '', password: '' });

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
  avatarPreview.value = null;
  avatarFile.value = null;
  validation.value = { name: '', email: '', password: '' };
  emit('close');
};

const handleSubmit = () => {
  validation.value = { name: '', email: '', password: '' };
  let ok = true;
  if (!formData.value.name) { validation.value.name = '用户名为必填项'; ok = false; }
  if (!formData.value.email || !/^\S+@\S+\.\S+$/.test(formData.value.email)) { validation.value.email = '请输入有效邮箱'; ok = false; }
  if (!formData.value.password || formData.value.password.length < 6) { validation.value.password = '密码长度至少6位'; ok = false; }
  if (!ok) return;

  const payload = { ...formData.value };
  if (avatarFile.value) payload.avatarFile = avatarFile.value;
  emit('submit', payload);
};

function handleFileChange(e) {
  const f = e.target.files && e.target.files[0];
  if (!f) return;
  avatarFile.value = f;
  const reader = new FileReader();
  reader.onload = () => {
    avatarPreview.value = reader.result;
  };
  reader.readAsDataURL(f);
}

function clearAvatar() {
  avatarFile.value = null;
  avatarPreview.value = null;
}
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

/* Layout improvements (shared with EditUserModal) */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 18px;
}
.left-column { min-width: 0; }
.right-column { display: flex; flex-direction: column; gap: 12px; align-items: stretch; }

.avatar-area { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 12px; border: 1px dashed #eef3fb; border-radius: 8px; background: #fbfdff; }
.avatar-preview { width: 96px; height: 96px; border-radius: 8px; background-size: cover; background-position: center; box-shadow: 0 6px 18px rgba(15,23,42,0.06); }
.avatar-placeholder-lg { width: 96px; height: 96px; border-radius: 8px; background: linear-gradient(90deg,#e9eefb,#f3f6fb); display:flex; align-items:center; justify-content:center; color:#1f2d3d; font-weight:700; font-size:20px; }
.avatar-actions { display:flex; gap:8px; align-items:center; }
.upload-btn { background:#fff; border:1px solid #e6eef8; padding:6px 10px; border-radius:8px; cursor:pointer; display:inline-block; }
.upload-btn input[type=file]{ display:none; }

.field-error { color: #ff4d4f; font-size: 12px; margin-top: 6px; }
.two-columns { display:flex; gap:8px; }
.two-columns input { width:100%; }

@media (max-width: 800px) {
  .form-grid { grid-template-columns: 1fr; }
  .right-column { order: -1; }
  .modal-content { width: 96%; max-width: 720px; }
}
</style>

