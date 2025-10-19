import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '../api/auth'

export const useUserStore = defineStore('user', () => {
  // State
  const userInfo = ref(null)
  const token = ref('')
  const isLoading = ref(false)

  // Getters
  const isLoggedIn = computed(() => !!token.value && !!userInfo.value)
  const userName = computed(() => userInfo.value?.name || '未知用户')
  const userEmail = computed(() => userInfo.value?.email || '')
  const userAvatar = computed(() => userInfo.value?.avatar_url || '')
  const userDepartment = computed(() => userInfo.value?.department_id || null)
  const userPosition = computed(() => userInfo.value?.position || '')
  const userStatus = computed(() => userInfo.value?.status || 'inactive')

  // Actions
  /**
   * 用户登录
   * @param {Object} credentials - 登录凭据
   * @param {string} credentials.email - 用户邮箱
   * @param {string} credentials.password - 用户密码
   * @returns {Promise} 登录结果
   */
  const login = async (credentials) => {
    try {
      isLoading.value = true
      const response = await authApi.login(credentials)
      
      if (response.code === 1) {
        userInfo.value = response.data.user
        token.value = response.data.token
        
        // 保存到本地存储
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('userInfo', JSON.stringify(response.data.user))
        
        return { success: true, message: response.msg }
      } else {
        return { success: false, message: response.msg }
      }
    } catch (error) {
      console.error('登录失败:', error)
      return { 
        success: false, 
        message: error.response?.data?.msg || error.message || '登录失败，请稍后重试' 
      }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 用户登出
   */
  const logout = async () => {
    try {
      // 调用登出接口
      await authApi.logout()
    } catch (error) {
      console.error('登出接口调用失败:', error)
    } finally {
      // 清除本地状态
      userInfo.value = null
      token.value = ''
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
    }
  }

  /**
   * 初始化用户状态（从本地存储恢复）
   */
  const initializeAuth = () => {
    const savedToken = localStorage.getItem('token')
    const savedUserInfo = localStorage.getItem('userInfo')
    
    if (savedToken && savedUserInfo) {
      try {
        token.value = savedToken
        userInfo.value = JSON.parse(savedUserInfo)
      } catch (error) {
        console.error('恢复用户状态失败:', error)
        // 清除无效的本地存储
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
      }
    }
  }

  /**
   * 获取当前用户信息
   * @returns {Promise} 用户信息
   */
  const fetchCurrentUser = async () => {
    try {
      const response = await authApi.getCurrentUser()
      
      if (response.code === 1) {
        userInfo.value = response.data
        localStorage.setItem('userInfo', JSON.stringify(response.data))
        return { success: true, data: response.data }
      } else {
        return { success: false, message: response.msg }
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      return { 
        success: false, 
        message: error.response?.data?.msg || error.message || '获取用户信息失败' 
      }
    }
  }

  /**
   * 更新用户信息
   * @param {Object} newUserInfo - 新的用户信息
   */
  const updateUserInfo = (newUserInfo) => {
    userInfo.value = { ...userInfo.value, ...newUserInfo }
    localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
  }

  /**
   * 检查用户是否已登录
   * @returns {boolean} 是否已登录
   */
  const checkAuthStatus = () => {
    return isLoggedIn.value
  }

  /**
   * 清除认证状态
   */
  const clearAuth = () => {
    userInfo.value = null
    token.value = ''
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  return {
    // State
    userInfo,
    token,
    isLoading,
    
    // Getters
    isLoggedIn,
    userName,
    userEmail,
    userAvatar,
    userDepartment,
    userPosition,
    userStatus,
    
    // Actions
    login,
    logout,
    initializeAuth,
    fetchCurrentUser,
    updateUserInfo,
    checkAuthStatus,
    clearAuth
  }
})
