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

.info-panel__content {
  color: white;
  text-align: center;
  z-index: 2;
  position: relative;
}

.info-panel__title {
  font-size: 48px;
  font-weight: bold;
  margin: 0 0 20px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.info-panel__subtitle {
  font-size: 18px;
  margin: 0 0 40px 0;
  opacity: 0.9;
  line-height: 1.6;
}

.info-panel__features {
  text-align: left;
  max-width: 400px;
  margin: 0 auto 40px;
}

.feature-item {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  font-size: 16px;
}

.feature-item__icon {
  margin-right: 12px;
  font-size: 18px;
}

.feature-item__text {
  flex: 1;
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
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.form-panel__content {
  width: 100%;
  max-width: 400px;
}

/* 头部 */
.form-panel__header {
  display: flex;
  align-items: center;
  margin-bottom: 40px;
}

.header__logo {
  margin-right: 16px;
}

.logo-icon {
  width: 48px;
  height: 48px;
  background: #409eff;
  color: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
}

.header__title {
  font-size: 24px;
  font-weight: 600;
  color: #409eff;
  margin: 0;
}

/* 欢迎信息 */
.form-panel__welcome {
  margin-bottom: 32px;
}

.welcome__title {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.welcome__subtitle {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

/* 登录表单 */
.login-form {
  margin-bottom: 32px;
}

.login-form .el-form-item {
  margin-bottom: 24px;
}

.login-form .el-input {
  height: 48px;
}

.password-toggle {
  cursor: pointer;
  color: #c0c4cc;
  transition: color 0.3s;
}

.password-toggle:hover {
  color: #409eff;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.forgot-password {
  font-size: 14px;
}

.login-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
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
  }
  
  .chart-icon {
    font-size: 80px;
  }
  
  .login-page__form-panel {
    flex: none;
    height: 60vh;
    padding: 20px;
  }
  
  .form-panel__content {
    max-width: 100%;
  }
  
  .welcome__title {
    font-size: 24px;
  }
}

@media (max-width: 480px) {
  .login-page__info-panel {
    padding: 20px;
  }
  
  .info-panel__title {
    font-size: 28px;
  }
  
  .info-panel__subtitle {
    font-size: 14px;
  }
  
  .info-panel__features {
    max-width: 250px;
  }
  
  .login-page__form-panel {
    padding: 16px;
  }
  
  .form-panel__header {
    margin-bottom: 24px;
  }
  
  .header__title {
    font-size: 20px;
  }
  
  .welcome__title {
    font-size: 20px;
  }
}
</style>
