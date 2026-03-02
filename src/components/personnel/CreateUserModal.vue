<template>
  <Transition name="modal">
    <div v-if="visible" class="modal-overlay" @click.self="handleClose">
      <div class="modal-content">
        <div class="modal-header">
          <div class="header-title">
            <svg class="header-icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
              <path fill="currentColor" d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm192 408c0 4.4-3.6 8-8 8H328c-4.4 0-8-3.6-8-8v-48c0-4.4 3.6-8 8-8h168c1.3 0 2.5-.3 3.7-.9 1.1-.5 2.1-1.2 3-2.1 1.6-1.6 3.1-3.5 4.3-5.5.6-1 .6-2.3 0-3.3-.6-1-1.5-1.9-2.5-2.6-1.8-1.3-3.9-2-6.1-2H328c-17.7 0-32 14.3-32 32v48c0 17.7 14.3 32 32 32h368c17.7 0 32-14.3 32-32v-48z"/>
            </svg>
            <h2>创建新用户</h2>
          </div>
          <button class="close-btn" @click="handleClose" aria-label="关闭">
            <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
              <path fill="currentColor" d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm194.8 690.8l-46.8 46.8c-12.2 12.2-32.1 12.2-44.3 0L400 585.4 286.2 699.1c-12.2 12.2-32.1 12.2-44.3 0l-46.8-46.8c-12.2-12.2-12.2-32.1 0-44.3L310.3 392.8 197.5 280c-12.2-12.2-12.2-32.1 0-44.3l46.8-46.8c12.2-12.2 32.1-12.2 44.3 0L464 305.1l112.8-112.8c12.2-12.2 32.1-12.2 44.3 0l46.8 46.8c12.2 12.2 12.2 32.1 0 44.3L513.7 458.6l112.8 112.8c12.2 12.2 12.2 32.1 0 44.3z"/>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="handleSubmit" novalidate>
            <div class="form-grid">
              <div class="left-column">
                <div class="form-group">
                  <label>用户名 <span class="required">*</span></label>
                  <input v-model="formData.name" type="text" placeholder="请输入用户名" :class="{ invalid: validation.name }" autofocus />
                  <div v-if="validation.name" class="field-error">{{ validation.name }}</div>
                </div>

                <div class="form-group">
                  <label>邮箱 <span class="required">*</span></label>
                  <input v-model="formData.email" type="email" placeholder="请输入邮箱地址" :class="{ invalid: validation.email }" />
                  <div v-if="validation.email" class="field-error">{{ validation.email }}</div>
                </div>

                <div class="form-group">
                  <label>密码 <span class="required">*</span></label>
                  <div class="password-input">
                    <input v-model="formData.password" :type="showPassword ? 'text' : 'password'" placeholder="请输入密码（至少6位）" :class="{ invalid: validation.password }" />
                    <button type="button" class="toggle-password" @click="showPassword = !showPassword">
                      <svg v-if="showPassword" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                        <path fill="currentColor" d="M512 128c-212.1 0-384 171.9-384 384s171.9 384 384 384 384-171.9 384-384-171.9-384-384-384zm0 704c-176.7 0-320-143.3-320-320S335.3 192 512 192s320 143.3 320 320-143.3 320-320 320zm96-416c-17.7 0-32 14.3-32 32s14.3 32 32 32 32-14.3 32-32-14.3-32-32-32zm-192 0c-17.7 0-32 14.3-32 32s14.3 32 32 32 32-14.3 32-32-14.3-32-32-32z"/>
                      </svg>
                      <svg v-else viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                        <path fill="currentColor" d="M512 128c-212.1 0-384 171.9-384 384s171.9 384 384 384 384-171.9 384-384-171.9-384-384-384zm0 704c-176.7 0-320-143.3-320-320S335.3 192 512 192s320 143.3 320 320-143.3 320-320 320zm-32-192c0-17.7 14.3-32 32-32s32 14.3 32 32-14.3 32-32 32-32-14.3-32-32z"/>
                      </svg>
                    </button>
                  </div>
                  <div v-if="validation.password" class="field-error">{{ validation.password }}</div>
                </div>

                <div class="form-group">
                  <label>描述</label>
                  <textarea v-model="formData.description" placeholder="请输入用户描述（可选）" rows="3"></textarea>
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
                  <div v-else class="avatar-placeholder-lg" :style="{ background: getAvatarGradient() }">
                    {{ avatarInitials }}
                  </div>
                  <div class="avatar-actions">
                    <label class="upload-btn">
                      <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                        <path fill="currentColor" d="M480 128c-17.7 0-32 14.3-32 32v158.1L333.1 205.2c-11.5-13.6-31.2-15.2-44.8-3.7-13.6 11.5-15.2 31.2-3.7 44.8l139 166.3c7.1 8.5 17.8 12.8 28.6 12.8h5.9c13.1-9.6 29.5-15.4 47.1-15.4 41 0 74.3 33.3 74.3 74.3s-33.3 74.3-74.3 74.3S405.7 613 405.7 572c0-5.3.7-10.5 2.1-15.4L293.9 437.8c-11.5-13.6-9.9-33.2 3.7-44.8 13.6-11.5 33.2-9.9 44.8 3.7l114.9 137.9V160c0-17.7 14.3-32 32-32z"/>
                      </svg>
                      上传头像
                      <input type="file" accept="image/*" @change="handleFileChange" />
                    </label>
                    <button type="button" class="btn-remove" @click="clearAvatar" v-if="avatarPreview">
                      <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                        <path fill="currentColor" d="M862.5 156.9L667.1 315.2c-7.3 5.9-19.3 5.5-26.2-1L437.6 135.5c-6.3-6-16.3-6.3-23.1-0.8l-76.7 61.8c-7.7 6.2-9.5 16.8-4.3 25.1l57.6 92.5c5.2 8.3 0.3 18.8-9.8 21.1L208 372.5c-10.1 2.2-18.9 10.5-20.5 20.6l-27.8 177.2c-2.4 15.5 10.6 29.1 26.1 27.3l248-28c9.7-1.1 17.6-8.9 18.7-18.6l27.8-177.2c1.6-10.1-2.8-20.1-11.1-25.7l-133.2-89.2c-8.6-5.8-10.3-17.1-3.7-25.3l76.7-95.7c6-7.5 16.9-9.1 24.8-3.7l203.1 138.4c7.9 5.4 9.7 15.9 4.3 23.9l-57.6 85.8c-5.2 7.8-2.1 18.2 6.7 22.3l248 28c15.5 1.8 28.5-11.8 26.1-27.3L838 206c-1.4-9.1-8.6-16.6-17.8-18.2l-244-27.8c-10.1-1.2-18.5-9.7-20-19.6z"/>
                      </svg>
                      移除
                    </button>
                  </div>
                </div>

                <div class="form-group">
                  <label>电话</label>
                  <input v-model="formData.phone" type="tel" placeholder="请输入电话号码（可选）" />
                </div>

                <div class="form-group">
                  <label>职位</label>
                  <input v-model="formData.position" type="text" placeholder="请输入用户职位" />
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
              <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                <svg v-if="isSubmitting" class="loading-icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                  <path fill="currentColor" d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-176.7 0-320-143.3-320-320S335.3 192 512 192s320 143.3 320 320-143.3 320-320 320z"/>
                </svg>
                {{ isSubmitting ? '创建中...' : '创建用户' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </Transition>
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
const showPassword = ref(false);

// 生成头像渐变背景色
const getAvatarGradient = () => {
  const name = formData.value.name || 'U';
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
  const index = (name.charCodeAt(0) || 0) % gradients.length;
  return gradients[index];
};

const avatarInitials = computed(() => {
  const n = formData.value.name || '';
  if (!n) return 'U';
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
/* Modal Animation */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: translateY(-20px) scale(0.95);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background-color: #fff;
  border-radius: 16px;
  width: 100%;
  max-width: 560px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  width: 24px;
  height: 24px;
  color: #1890ff;
}

.modal-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f1f1f;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #8c8c8c;
  padding: 4px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.close-btn svg {
  width: 18px;
  height: 18px;
}

.close-btn:hover {
  background: #f5f5f5;
  color: #1f1f1f;
}

.modal-body {
  padding: 24px;
  max-height: calc(90vh - 140px);
  overflow-y: auto;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #595959;
}

.required {
  color: #ff4d4f;
  margin-left: 2px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #e8e8e8;
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  box-sizing: border-box;
  transition: all 0.2s ease;
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: #bfbfbf;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #40a9ff;
  box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.1);
}

.form-group input.invalid,
.form-group textarea.invalid {
  border-color: #ff4d4f;
}

.form-group input.invalid:focus,
.form-group textarea.invalid:focus {
  box-shadow: 0 0 0 3px rgba(255, 77, 79, 0.1);
}

/* Password Input */
.password-input {
  position: relative;
}

.password-input input {
  padding-right: 44px;
}

.toggle-password {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #8c8c8c;
  transition: color 0.2s;
}

.toggle-password:hover {
  color: #1890ff;
}

.toggle-password svg {
  width: 18px;
  height: 18px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
}

.btn {
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 14px;
  cursor: pointer;
  border: 1px solid #d9d9d9;
  transition: all 0.2s ease;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
  color: #fff;
  border-color: #1890ff;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.25);
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #40a9ff 0%, #69c0ff 100%);
  box-shadow: 0 6px 16px rgba(24, 144, 255, 0.35);
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-icon {
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.btn-secondary {
  background-color: #fff;
  color: #595959;
  border-color: #d9d9d9;
}

.btn-secondary:hover {
  border-color: #40a9ff;
  color: #40a9ff;
}

/* Layout improvements (shared with EditUserModal) */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 24px;
}
.left-column { min-width: 0; }
.right-column { display: flex; flex-direction: column; gap: 16px; align-items: stretch; }

.avatar-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px;
  border: 2px dashed #e8e8e8;
  border-radius: 12px;
  background: #fafafa;
  transition: all 0.2s ease;
}

.avatar-area:hover {
  border-color: #91d5ff;
  background: #f0f7ff;
}

.avatar-preview {
  width: 100px;
  height: 100px;
  border-radius: 12px;
  background-size: cover;
  background-position: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.avatar-placeholder-lg {
  width: 100px;
  height: 100px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  font-size: 28px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.avatar-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.upload-btn {
  background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.upload-btn:hover {
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.35);
  transform: translateY(-1px);
}

.upload-btn svg {
  width: 14px;
  height: 14px;
}

.upload-btn input[type="file"] {
  display: none;
}

.btn-remove {
  background: #fff1f0;
  color: #ff4d4f;
  border: 1px solid #ffccc7;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  transition: all 0.2s ease;
}

.btn-remove:hover {
  background: #ff4d4f;
  color: #fff;
  border-color: #ff4d4f;
}

.btn-remove svg {
  width: 14px;
  height: 14px;
}

.field-error {
  color: #ff4d4f;
  font-size: 12px;
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.two-columns {
  display: flex;
  gap: 12px;
}
.two-columns > div {
  flex: 1;
}
.two-columns input {
  width: 100%;
}

@media (max-width: 800px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  .right-column {
    order: -1;
  }
  .modal-content {
    max-width: 100%;
  }
}
</style>

