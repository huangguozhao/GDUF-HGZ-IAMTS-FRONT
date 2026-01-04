<template>
  <div class="login-page" :class="{ 'keyboard-visible': keyboardVisible, 'low-end-device': isLowEndDevice }">
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
              :inputmode="isMobile ? 'email' : undefined"
              :autocomplete="isMobile ? 'username' : 'email'"
              @keyup.enter="handleLogin"
              @focus="handleMobileFocus('email')"
              @blur="handleMobileBlur"
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
              :inputmode="isMobile ? 'text' : undefined"
              :autocomplete="isMobile ? 'current-password' : undefined"
              @keyup.enter="handleLogin"
              @focus="handleMobileFocus('password')"
              @blur="handleMobileBlur"
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

    <!-- 登录成功加载动画 -->
    <LoadingTransition
      v-model:visible="showLoadingTransition"
      title="欢迎回来"
      subtitle="正在为您准备系统..."
      :duration="2500"
      @complete="handleLoadingComplete"
    />
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
import LoadingTransition from '../components/common/LoadingTransition.vue'

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
const showLoadingTransition = ref(false)

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

      // 显示加载动画，准备跳转到首页
      showLoadingTransition.value = true
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

/**
 * 处理加载动画完成
 */
const handleLoadingComplete = () => {
  showLoadingTransition.value = false
  // 跳转到首页
  router.push('/')
}

// 移动端交互和性能优化
const isMobile = ref(false)
const keyboardVisible = ref(false)
const viewportHeight = ref(window.innerHeight)
const isLowEndDevice = ref(false)

// 检测低端设备
const detectLowEndDevice = () => {
  // 检测内存、CPU等指标
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
  const isSlowConnection = connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g')

  // 检测硬件并发性
  const isLowCPU = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2

  // 检测设备内存
  const isLowMemory = navigator.deviceMemory && navigator.deviceMemory <= 2

  return isSlowConnection || isLowCPU || isLowMemory
}

// 防抖函数
const debounce = (func, delay) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(null, args), delay)
  }
}

// 节流函数
const throttle = (func, limit) => {
  let inThrottle
  return function() {
    const args = arguments
    const context = this
    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// 检测移动设备
const detectMobile = () => {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera
  return /android|avantgo|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(userAgent)
}

// 监听视口高度变化（检测虚拟键盘）- 节流优化
const handleViewportChange = throttle(() => {
  const currentHeight = window.innerHeight
  const heightDiff = viewportHeight.value - currentHeight

  // 如果高度减少超过150px，认为是键盘弹出
  keyboardVisible.value = heightDiff > 150
  viewportHeight.value = currentHeight
}, 100)

// 移动端优化的事件处理
const handleMobileFocus = (field) => {
  if (isMobile.value) {
    // 移动端聚焦时，延迟滚动确保键盘完全弹出
    setTimeout(() => {
      const element = document.querySelector(`[name="${field}"]`)
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        })
      }
    }, 300)
  }
}

const handleMobileBlur = () => {
  if (isMobile.value && keyboardVisible.value) {
    // 键盘隐藏时恢复滚动
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 200)
  }
}

// 触摸反馈优化
const addTouchFeedback = () => {
  if (isMobile.value) {
    // 为按钮添加触摸反馈
    const buttons = document.querySelectorAll('.login-button, .el-button')
    buttons.forEach(button => {
      // 使用防抖优化触摸事件
      const handleTouchStart = debounce(() => {
        if (!isLowEndDevice.value) {
          button.style.transform = 'scale(0.98)'
        }
      }, 10)

      const handleTouchEnd = debounce(() => {
        button.style.transform = ''
      }, 10)

      button.addEventListener('touchstart', handleTouchStart, { passive: true })
      button.addEventListener('touchend', handleTouchEnd, { passive: true })
    })
  }
}

// 性能监控
const performanceMonitor = () => {
  if ('performance' in window && 'getEntriesByType' in performance) {
    // 监控页面加载性能
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0]
        const paint = performance.getEntriesByType('paint')

        console.log('页面加载性能:', {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          firstPaint: paint.find(entry => entry.name === 'first-paint')?.startTime,
          firstContentfulPaint: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime
        })
      }, 0)
    })
  }
}

// 低端设备优化
const optimizeForLowEndDevice = () => {
  if (isLowEndDevice.value) {
    // 禁用复杂动画
    const style = document.createElement('style')
    style.textContent = `
      .login-page::before { animation: none !important; }
      .logo-icon { animation: none !important; }
      .login-button { animation: none !important; }
      .feature-item { transition: none !important; }
      * { animation-duration: 0.01ms !important; animation-delay: 0.01ms !important; }
    `
    document.head.appendChild(style)

    // 简化背景
    document.body.style.background = '#f5f7fa'
  }
}

// 生命周期
onMounted(() => {
  // 检查是否已登录
  if (userStore.isLoggedIn) {
    router.push('/')
    return
  }

  // 检测设备类型和性能
  isMobile.value = detectMobile()
  isLowEndDevice.value = detectLowEndDevice()

  // 性能监控
  performanceMonitor()

  // 恢复记住的邮箱
  const rememberedEmail = localStorage.getItem('rememberedEmail')
  if (rememberedEmail) {
    loginForm.email = rememberedEmail
    loginForm.rememberMe = true
  }

  // 移动端优化
  if (isMobile.value) {
    // 监听视口变化
    window.addEventListener('resize', handleViewportChange, { passive: true })
    viewportHeight.value = window.innerHeight

    // 添加触摸反馈
    addTouchFeedback()

    // 低端设备优化
    optimizeForLowEndDevice()

    // 自动聚焦第一个输入框（延迟执行，避免影响性能）
    setTimeout(() => {
      const firstInput = document.querySelector('.login-form input')
      if (firstInput && !loginForm.email) {
        firstInput.focus()
      }
    }, 800) // 增加延迟时间
  }
})

// 组件卸载时清理事件监听
import { onUnmounted } from 'vue'

onUnmounted(() => {
  if (isMobile.value) {
    window.removeEventListener('resize', handleViewportChange)
  }
})
</script>

<style scoped>
.login-page {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: visible;
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
  min-height: fit-content;
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

/* PC端完整显示优化 */
@media (min-width: 769px) {
  .login-page {
    height: auto;
    min-height: 100vh;
    overflow: visible;
  }

  .login-page__form-panel {
    min-height: 600px;
    align-items: flex-start;
    padding-top: 80px;
  }

  .form-panel__content {
    margin-top: 40px;
  }
}

/* 移动端适配 - 移动优先设计 */
@media (max-width: 768px) {
  /* 基础移动端布局 */
  .login-page {
    flex-direction: column;
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* 简化信息面板 - 只保留核心信息 */
  .login-page__info-panel {
    flex: none;
    height: 25vh;
    min-height: 200px;
    padding: 24px 20px;
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    position: relative;
  }

  /* 信息面板内容优化 */
  .info-panel__content {
    text-align: center;
    position: relative;
    z-index: 2;
  }

  .info-panel__title {
    font-size: 24px;
    font-weight: 700;
    margin: 0 0 12px 0;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    line-height: 1.2;
  }

  .info-panel__subtitle {
    font-size: 14px;
    margin: 0 0 16px 0;
    opacity: 0.9;
    line-height: 1.4;
    display: none; /* 移动端隐藏详细描述 */
  }

  .info-panel__features {
    display: none; /* 移动端隐藏特性列表 */
  }

  .info-panel__chart {
    display: none; /* 移动端隐藏图表图标 */
  }

  /* 表单面板优化 */
  .login-page__form-panel {
    flex: 1;
    min-height: 75vh;
    padding: 20px 16px;
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    display: flex;
    align-items: flex-start;
    justify-content: center;
  }

  .form-panel__content {
    width: 100%;
    max-width: 380px;
    padding: 28px 24px;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
    margin-top: 20px;
  }

  /* 头部优化 */
  .form-panel__header {
    margin-bottom: 24px;
    text-align: center;
  }

  .header__logo {
    margin-right: 8px;
  }

  .logo-icon {
    width: 48px;
    height: 48px;
    font-size: 24px;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(64, 158, 255, 0.25);
  }

  .header__title {
    font-size: 20px;
    font-weight: 600;
  }

  /* 欢迎信息优化 */
  .form-panel__welcome {
    margin-bottom: 24px;
    text-align: center;
  }

  .welcome__title {
    font-size: 22px;
    margin: 0 0 6px 0;
    line-height: 1.3;
  }

  .welcome__subtitle {
    font-size: 14px;
    line-height: 1.4;
  }

  /* 表单优化 */
  .login-form {
    margin-bottom: 24px;
  }

  .login-form .el-form-item {
    margin-bottom: 20px;
  }

  .login-form .el-input {
    height: 52px; /* 触摸友好尺寸 */
    border-radius: 12px;
  }

  .login-form .el-input__wrapper {
    border-radius: 12px;
    min-height: 52px;
  }

  /* 选项区域优化 */
  .form-options {
    margin-bottom: 20px;
    flex-wrap: wrap;
    gap: 8px;
  }

  .forgot-password {
    font-size: 14px;
  }

  /* 登录按钮优化 */
  .login-button {
    height: 52px;
    font-size: 16px;
    font-weight: 600;
    border-radius: 12px;
    margin-top: 8px;
  }

  /* 页脚优化 */
  .form-panel__footer {
    margin-top: 20px;
    text-align: center;
  }

  .copyright {
    font-size: 12px;
    color: #a8abb2;
  }
}

/* 小屏手机优化 (375px以下) */
@media (max-width: 480px) {
  .login-page {
    padding: 0;
  }

  .login-page__info-panel {
    height: 22vh;
    min-height: 160px;
    padding: 20px 16px;
  }

  .info-panel__title {
    font-size: 20px;
    margin-bottom: 8px;
  }

  .login-page__form-panel {
    padding: 16px;
    min-height: 78vh;
  }

  .form-panel__content {
    padding: 24px 20px;
    border-radius: 16px;
    margin-top: 16px;
  }

  .form-panel__header {
    margin-bottom: 20px;
  }

  .logo-icon {
    width: 44px;
    height: 44px;
    font-size: 22px;
    border-radius: 10px;
  }

  .header__title {
    font-size: 18px;
  }

  .welcome__title {
    font-size: 20px;
    margin-bottom: 4px;
  }

  .welcome__subtitle {
    font-size: 13px;
  }

  .login-form .el-form-item {
    margin-bottom: 18px;
  }

  .login-form .el-input {
    height: 50px;
  }

  .login-form .el-input__wrapper {
    min-height: 50px;
  }

  .form-options {
    margin-bottom: 18px;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .login-button {
    height: 50px;
    font-size: 15px;
    margin-top: 4px;
  }

  .form-panel__footer {
    margin-top: 16px;
  }

  .copyright {
    font-size: 11px;
  }
}

/* 超小屏设备优化 (360px以下) */
@media (max-width: 360px) {
  .login-page__form-panel {
    padding: 12px;
  }

  .form-panel__content {
    padding: 20px 16px;
    margin-top: 12px;
  }

  .info-panel__title {
    font-size: 18px;
  }

  .welcome__title {
    font-size: 18px;
  }

  .header__title {
    font-size: 16px;
  }

  .login-form .el-input {
    height: 48px;
  }

  .login-form .el-input__wrapper {
    min-height: 48px;
  }

  .login-button {
    height: 48px;
  }
}

/* 移动端触摸优化 */
@media (hover: none) and (pointer: coarse) {
  /* 触摸设备样式 */
  .login-form .el-input__wrapper {
    transition: all 0.15s ease;
  }

  .login-form .el-input__wrapper:hover {
    border-color: rgba(193, 194, 197, 0.6);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  .login-form .el-input__wrapper:active {
    transform: scale(0.99);
    border-color: #409eff;
  }

  .login-button {
    transition: all 0.15s ease;
    -webkit-tap-highlight-color: transparent;
  }

  .login-button:active {
    transform: scale(0.98);
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.25);
  }

  .password-toggle {
    transition: all 0.15s ease;
    min-width: 44px;
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .password-toggle:active {
    transform: scale(1.1);
    background-color: rgba(64, 158, 255, 0.1);
    border-radius: 6px;
  }

  /* 触摸友好的复选框 */
  .el-checkbox {
    min-height: 44px;
    padding: 8px 0;
  }

  .el-checkbox__input {
    margin-right: 12px;
  }

  /* 链接触摸优化 */
  .forgot-password {
    min-height: 44px;
    display: flex;
    align-items: center;
    padding: 8px 0;
    margin-left: auto;
  }
}

/* 虚拟键盘处理 */
.keyboard-visible .login-page {
  height: auto;
  min-height: 100vh;
}

.keyboard-visible .login-page__form-panel {
  padding-bottom: 120px; /* 为键盘留出空间 */
}

.keyboard-visible .form-panel__content {
  margin-top: 10px;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

/* 移动端性能优化 */
@media (max-width: 768px) {
  /* 减少动画复杂度 */
  .logo-icon {
    animation: none; /* 移动端禁用复杂动画 */
  }

  .login-page::before {
    animation-duration: 15s; /* 减慢背景动画 */
  }

  /* 优化滚动性能 */
  .form-panel__content {
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
  }

  /* 禁用不必要的变换 */
  .feature-item:hover {
    transform: none;
  }

  .login-button:hover:not(.is-disabled) {
    transform: none;
  }
}

/* 低端设备性能优化 */
@media (max-width: 768px) {
  .low-end-device .login-page::before,
  .low-end-device .logo-icon,
  .low-end-device .login-button,
  .low-end-device .feature-item {
    animation: none !important;
    transition: none !important;
  }

  .low-end-device * {
    animation-duration: 0.01ms !important;
    animation-delay: 0.01ms !important;
    transition-duration: 0.01ms !important;
    transition-delay: 0.01ms !important;
  }

  .low-end-device {
    background: #f5f7fa !important;
  }

  .low-end-device .login-page__info-panel {
    background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%) !important;
  }

  .low-end-device .form-panel__content {
    background: rgba(255, 255, 255, 0.95) !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }

  .low-end-device .login-page__form-panel {
    background: rgba(255, 255, 255, 0.98) !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }
}
</style>
