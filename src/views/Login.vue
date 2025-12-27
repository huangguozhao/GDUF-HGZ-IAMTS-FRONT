<template>
  <div class="login-page">
    <!-- 左侧信息面板 -->
    <div class="login-page__info-panel">
      <div class="info-panel__content">
        <h1 class="info-panel__title">接口自动化管理平台</h1>
        <p class="info-panel__subtitle">
          专业的企业级接口测试解决方案,提升测试效率,保障接口质量
        </p>
        
        <div class="info-panel__features">
          <div class="feature-item">
            <el-icon class="feature-item__icon">
              <Check />
            </el-icon>
            <span class="feature-item__text">可视化接口测试与管理</span>
          </div>
          <div class="feature-item">
            <el-icon class="feature-item__icon">
              <Check />
            </el-icon>
            <span class="feature-item__text">自动化测试与持续集成</span>
          </div>
          <div class="feature-item">
            <el-icon class="feature-item__icon">
              <Check />
            </el-icon>
            <span class="feature-item__text">团队协作与权限管理</span>
          </div>
          <div class="feature-item">
            <el-icon class="feature-item__icon">
              <Check />
            </el-icon>
            <span class="feature-item__text">详尽的测试报告与分析</span>
          </div>
        </div>
        
        <div class="info-panel__chart">
          <el-icon class="chart-icon">
            <TrendCharts />
          </el-icon>
        </div>
      </div>
    </div>

    <!-- 右侧登录表单 -->
    <div class="login-page__form-panel">
      <div class="form-panel__content">
        <!-- 头部 -->
        <div class="form-panel__header">
          <div class="header__logo">
            <div class="logo-icon">A</div>
          </div>
          <h2 class="header__title">接口自动化管理</h2>
        </div>

        <!-- 欢迎信息 -->
        <div class="form-panel__welcome">
          <h3 class="welcome__title">欢迎回来</h3>
          <p class="welcome__subtitle">请输入您的账号密码登录系统</p>
        </div>

        <!-- 登录表单 -->
        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          class="login-form"
          @submit.prevent="handleLogin"
        >
          <!-- 邮箱输入 -->
          <el-form-item prop="email">
            <el-input
              v-model="loginForm.email"
              type="email"
              placeholder="请输入公司邮箱"
              size="large"
              :prefix-icon="Message"
              :disabled="isLoading"
              @keyup.enter="handleLogin"
            />
          </el-form-item>

          <!-- 密码输入 -->
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="请输入密码"
              size="large"
              :prefix-icon="Lock"
              :disabled="isLoading"
              @keyup.enter="handleLogin"
            >
              <template #suffix>
                <el-icon 
                  class="password-toggle"
                  @click="togglePasswordVisibility"
                >
                  <View v-if="!showPassword" />
                  <Hide v-else />
                </el-icon>
              </template>
            </el-input>
          </el-form-item>

          <!-- 记住我和忘记密码 -->
          <div class="form-options">
            <el-checkbox 
              v-model="loginForm.rememberMe"
              :disabled="isLoading"
            >
              记住我
            </el-checkbox>
            <el-link 
              type="primary" 
              class="forgot-password"
              :disabled="isLoading"
              @click="handleForgotPassword"
            >
              忘记密码?
            </el-link>
          </div>

          <!-- 登录按钮 -->
          <el-form-item>
            <el-button
              type="primary"
              size="large"
              class="login-button"
              :loading="isLoading"
              :disabled="!isFormValid"
              @click="handleLogin"
            >
              {{ isLoading ? '登录中...' : '登录' }}
            </el-button>
          </el-form-item>
        </el-form>

        <!-- 版权信息 -->
        <div class="form-panel__footer">
          <p class="copyright">
            © 2024 接口自动化管理系统-企业版 v2.5.1
          </p>
        </div>
      </div>
    </div>

    <!-- 忘记密码对话框 -->
    <el-dialog
      v-model="forgotPasswordDialogVisible"
      title="重置密码"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="forgotPasswordFormRef"
        :model="forgotPasswordForm"
        :rules="forgotPasswordRules"
        label-width="100px"
      >
        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="forgotPasswordForm.email"
            placeholder="请输入注册邮箱"
            :prefix-icon="Message"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="forgotPasswordDialogVisible = false">
            取消
          </el-button>
          <el-button 
            type="primary" 
            :loading="isForgotPasswordLoading"
            @click="handleRequestPasswordReset"
          >
            {{ isForgotPasswordLoading ? '发送中...' : '发送重置邮件' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Check,
  TrendCharts,
  Message,
  Lock,
  View,
  Hide
} from '@element-plus/icons-vue'
import { useUserStore } from '../stores/useUserStore'
import { authApi } from '../api/auth'

// 路由和状态管理
const router = useRouter()
const userStore = useUserStore()

// 表单引用
const loginFormRef = ref(null)
const forgotPasswordFormRef = ref(null)

// 响应式数据
const isLoading = ref(false)
const showPassword = ref(false)
const forgotPasswordDialogVisible = ref(false)
const isForgotPasswordLoading = ref(false)

// 登录表单数据
const loginForm = reactive({
  email: '',
  password: '',
  rememberMe: false
})

// 忘记密码表单数据
const forgotPasswordForm = reactive({
  email: ''
})

// 表单验证规则
const loginRules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { 
      type: 'email', 
      message: '请输入正确的邮箱格式', 
      trigger: ['blur', 'change'] 
    }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

const forgotPasswordRules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { 
      type: 'email', 
      message: '请输入正确的邮箱格式', 
      trigger: ['blur', 'change'] 
    }
  ]
}

// 计算属性
const isFormValid = computed(() => {
  return loginForm.email && loginForm.password && loginForm.email.includes('@')
})

// 方法
/**
 * 切换密码显示状态
 */
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

/**
 * 处理登录
 */
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    // 表单验证
    const valid = await loginFormRef.value.validate()
    if (!valid) return

    isLoading.value = true
    
    // 调用登录API
    const result = await userStore.login({
      email: loginForm.email,
      password: loginForm.password
    })

    if (result.success) {
      ElMessage.success(result.message || '登录成功')
      
      // 如果选择记住我，保存邮箱
      if (loginForm.rememberMe) {
        localStorage.setItem('rememberedEmail', loginForm.email)
      } else {
        localStorage.removeItem('rememberedEmail')
      }
      
      // 跳转到首页
      router.push('/')
    } else {
      ElMessage.error(result.message || '登录失败')
    }
  } catch (error) {
    console.error('登录错误:', error)
    ElMessage.error('登录失败，请稍后重试')
  } finally {
    isLoading.value = false
  }
}

/**
 * 处理忘记密码
 */
const handleForgotPassword = () => {
  forgotPasswordDialogVisible.value = true
}

/**
 * 请求密码重置
 */
const handleRequestPasswordReset = async () => {
  if (!forgotPasswordFormRef.value) return
  
  try {
    // 表单验证
    const valid = await forgotPasswordFormRef.value.validate()
    if (!valid) return

    isForgotPasswordLoading.value = true
    
    // 调用密码重置API
    const response = await authApi.requestPasswordReset({
      account: forgotPasswordForm.email,
      channel: 'email'
    })

    if (response.code === 1) {
      ElMessage.success(response.msg || '重置邮件已发送，请查收')
      forgotPasswordDialogVisible.value = false
      forgotPasswordForm.email = ''
    } else {
      ElMessage.error(response.msg || '发送失败，请稍后重试')
    }
  } catch (error) {
    console.error('密码重置请求错误:', error)
    ElMessage.error('发送失败，请稍后重试')
  } finally {
    isForgotPasswordLoading.value = false
  }
}

// 生命周期
onMounted(() => {
  // 检查是否已登录
  if (userStore.isLoggedIn) {
    router.push('/')
    return
  }
  
  // 恢复记住的邮箱
  const rememberedEmail = localStorage.getItem('rememberedEmail')
  if (rememberedEmail) {
    loginForm.email = rememberedEmail
    loginForm.rememberMe = true
  }
})
</script>

<style scoped>
.login-page {
  display: flex;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.login-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05) 0%, transparent 50%);
  animation: backgroundFloat 8s ease-in-out infinite;
  pointer-events: none;
}

@keyframes backgroundFloat {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(10px, -10px) scale(1.02);
  }
  66% {
    transform: translate(-10px, 10px) scale(0.98);
  }
}

/* 左侧信息面板 */
.login-page__info-panel {
  flex: 1;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
  position: relative;
  overflow: hidden;
}

.login-page__info-panel::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 30%, transparent 70%);
  animation: infoPanelRotate 20s linear infinite;
  pointer-events: none;
}

@keyframes infoPanelRotate {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

.info-panel__content {
  color: white;
  text-align: center;
  z-index: 2;
  position: relative;
  animation: contentFadeIn 1s ease-out;
}

@keyframes contentFadeIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.info-panel__title {
  font-size: 48px;
  font-weight: bold;
  margin: 0 0 20px 0;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  animation: titleGlow 3s ease-in-out infinite alternate;
}

@keyframes titleGlow {
  from {
    text-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  to {
    text-shadow: 0 4px 8px rgba(0, 0, 0, 0.2), 0 0 20px rgba(255,255,255,0.3);
  }
}

.info-panel__subtitle {
  font-size: 18px;
  margin: 0 0 40px 0;
  opacity: 0.9;
  line-height: 1.6;
  animation: subtitleSlideIn 0.8s ease-out 0.3s both;
}

@keyframes subtitleSlideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.info-panel__features {
  text-align: left;
  max-width: 400px;
  margin: 0 auto 40px;
  animation: featuresFadeIn 0.8s ease-out 0.6s both;
}

@keyframes featuresFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.feature-item {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  font-size: 16px;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: featureItemSlideIn 0.6s ease-out calc(0.8s + var(--delay, 0)) both;
}

.feature-item:hover {
  transform: translateY(-2px) scale(1.02);
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.feature-item:nth-child(1) { --delay: 0s; }
.feature-item:nth-child(2) { --delay: 0.1s; }
.feature-item:nth-child(3) { --delay: 0.2s; }
.feature-item:nth-child(4) { --delay: 0.3s; }

@keyframes featureItemSlideIn {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.feature-item__icon {
  margin-right: 16px;
  font-size: 20px;
  transition: transform 0.3s ease;
}

.feature-item:hover .feature-item__icon {
  transform: scale(1.1) rotate(5deg);
}

.feature-item__text {
  flex: 1;
  font-weight: 400;
}

.info-panel__chart {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
}

.chart-icon {
  font-size: 120px;
  opacity: 0.3;
}

/* 右侧表单面板 */
.login-page__form-panel {
  flex: 1;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  position: relative;
}

.login-page__form-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
  border-radius: 0;
  pointer-events: none;
}

.form-panel__content {
  width: 100%;
  max-width: 420px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 24px;
  padding: 40px;
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
  position: relative;
  animation: formSlideIn 0.8s ease-out 0.4s both;
}

@keyframes formSlideIn {
  from {
    opacity: 0;
    transform: translateY(40px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 头部 */
.form-panel__header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32px;
  animation: headerFadeIn 0.6s ease-out 0.6s both;
}

@keyframes headerFadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.header__logo {
  margin-right: 16px;
}

.logo-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  color: white;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: bold;
  box-shadow: 0 8px 24px rgba(64, 158, 255, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: logoFloat 4s ease-in-out infinite;
}

.logo-icon:hover {
  transform: scale(1.05) rotate(5deg);
  box-shadow: 0 12px 32px rgba(64, 158, 255, 0.4);
}

@keyframes logoFloat {
  0%, 100% {
    transform: translateY(0px);
    box-shadow: 0 8px 24px rgba(64, 158, 255, 0.3);
  }
  50% {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(64, 158, 255, 0.4);
  }
}

.header__title {
  font-size: 24px;
  font-weight: 600;
  color: #409eff;
  margin: 0;
  letter-spacing: -0.5px;
  /* 忽略 */
}

/* 欢迎信息 */
.form-panel__welcome {
  margin-bottom: 32px;
  text-align: center;
  animation: welcomeFadeIn 0.8s ease-out 0.8s both;
}

@keyframes welcomeFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.welcome__title {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
}

.welcome__subtitle {
  font-size: 14px;
  color: #909399;
  margin: 0;
  font-weight: 400;
}

/* 登录表单 */
.login-form {
  margin-bottom: 32px;
  animation: formFadeIn 0.8s ease-out 1s both;
}

@keyframes formFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-form .el-form-item {
  margin-bottom: 24px;
}

.login-form .el-input {
  height: 52px;
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.login-form .el-input__wrapper {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(193, 194, 197, 0.4);
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.login-form .el-input__wrapper:hover {
  border-color: rgba(64, 158, 255, 0.5);
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.1);
}

.login-form .el-input__wrapper.is-focus {
  border-color: #409eff;
  box-shadow:
    0 0 0 3px rgba(64, 158, 255, 0.1),
    0 4px 16px rgba(64, 158, 255, 0.15);
  background: rgba(255, 255, 255, 0.95);
}

.password-toggle {
  cursor: pointer;
  color: #c0c4cc;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.password-toggle:hover {
  color: #409eff;
  transform: scale(1.1);
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  animation: optionsFadeIn 0.6s ease-out 1.2s both;
}

@keyframes optionsFadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.forgot-password {
  font-size: 14px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.forgot-password:hover {
  color: #409eff !important;
  transform: translateY(-1px);
}

.login-button {
  width: 100%;
  height: 52px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 16px;
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  border: none;
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: buttonPulse 2s ease-in-out infinite;
}

.login-button:hover:not(.is-disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(64, 158, 255, 0.4);
  background: linear-gradient(135deg, #66b1ff 0%, #99d6ff 100%);
}

.login-button:active:not(.is-disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

@keyframes buttonPulse {
  0%, 100% {
    box-shadow: 0 4px 16px rgba(64, 158, 255, 0.3);
  }
  50% {
    box-shadow: 0 6px 20px rgba(64, 158, 255, 0.4);
  }
}

/* 版权信息 */
.form-panel__footer {
  text-align: center;
}

.copyright {
  font-size: 12px;
  color: #c0c4cc;
  margin: 0;
}

/* 对话框 */
.dialog-footer {
  text-align: right;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-page {
    flex-direction: column;
  }

  .login-page__info-panel {
    flex: none;
    height: 40vh;
    padding: 40px 20px;
  }

  .info-panel__title {
    font-size: 32px;
  }

  .info-panel__subtitle {
    font-size: 16px;
  }

  .info-panel__features {
    max-width: 300px;
  }

  .feature-item {
    font-size: 14px;
    padding: 12px 16px;
    margin-bottom: 16px;
    border-radius: 12px;
  }

  .chart-icon {
    font-size: 80px;
  }

  .login-page__form-panel {
    flex: none;
    height: 60vh;
    padding: 20px;
    background: rgba(255, 255, 255, 0.98);
  }

  .form-panel__content {
    max-width: 100%;
    padding: 32px 24px;
    border-radius: 20px;
    box-shadow: 0 16px 32px rgba(0, 0, 0, 0.08);
  }

  .header__logo {
    margin-right: 12px;
  }

  .logo-icon {
    width: 48px;
    height: 48px;
    font-size: 24px;
    border-radius: 12px;
  }

  .header__title {
    font-size: 20px;
  }

  .welcome__title {
    font-size: 24px;
  }

  .login-form .el-input {
    height: 48px;
  }

  .login-button {
    height: 48px;
    font-size: 15px;
  }
}

@media (max-width: 480px) {
  .login-page {
    overflow-y: auto;
  }

  .login-page__info-panel {
    padding: 20px;
    height: 35vh;
  }

  .info-panel__title {
    font-size: 28px;
    margin-bottom: 16px;
  }

  .info-panel__subtitle {
    font-size: 14px;
    margin-bottom: 24px;
  }

  .info-panel__features {
    max-width: 250px;
  }

  .feature-item {
    padding: 10px 14px;
    margin-bottom: 12px;
    font-size: 13px;
  }

  .login-page__form-panel {
    padding: 16px;
    height: 65vh;
  }

  .form-panel__content {
    padding: 24px 20px;
    border-radius: 16px;
  }

  .form-panel__header {
    margin-bottom: 20px;
  }

  .header__title {
    font-size: 18px;
  }

  .logo-icon {
    width: 44px;
    height: 44px;
    font-size: 22px;
  }

  .welcome__title {
    font-size: 20px;
    margin-bottom: 6px;
  }

  .welcome__subtitle {
    font-size: 13px;
  }

  .login-form .el-form-item {
    margin-bottom: 20px;
  }

  .login-form .el-input {
    height: 46px;
  }

  .form-options {
    margin-bottom: 20px;
  }

  .login-button {
    height: 46px;
    font-size: 14px;
  }

  .form-panel__footer {
    margin-top: 16px;
  }

  .copyright {
    font-size: 11px;
  }
}
</style>
