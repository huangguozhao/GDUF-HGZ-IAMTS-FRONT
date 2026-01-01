import request from './request'
import { API_PATHS } from '@/utils/constants'

/**
 * 认证相关API接口
 */
export const authApi = {
  /**
   * 用户登录
   * @param {Object} credentials - 登录凭据
   * @param {string} credentials.email - 用户邮箱
   * @param {string} credentials.password - 用户密码
   * @returns {Promise} 登录响应
   */
  login(credentials) {
    return request({
      url: API_PATHS.LOGIN,
      method: 'post',
      data: credentials
    })
  },

  /**
   * 请求密码重置
   * @param {Object} resetData - 重置数据
   * @param {string} resetData.account - 用户邮箱或手机号
   * @param {string} resetData.channel - 发送渠道 (email/sms)
   * @returns {Promise} 重置请求响应
   */
  requestPasswordReset(resetData) {
    return request({
      url: '/auth/password/reset-request',
      method: 'post',
      data: resetData
    })
  },

  /**
   * 执行密码重置
   * @param {Object} resetData - 重置数据
   * @param {string} resetData.account - 用户邮箱或手机号
   * @param {string} resetData.verification_code - 验证码
   * @param {string} resetData.new_password - 新密码
   * @returns {Promise} 重置执行响应
   */
  executePasswordReset(resetData) {
    return request({
      url: '/auth/password/reset',
      method: 'post',
      data: resetData
    })
  },

  /**
   * 获取当前用户信息
   * @returns {Promise} 用户信息响应
   */
  getCurrentUser() {
    return request({
      url: '/auth/me',
      method: 'get'
    })
  },

  /**
   * 用户登出
   * @returns {Promise} 登出响应
   */
  logout() {
    return request({
      url: API_PATHS.LOGOUT,
      method: 'post'
    })
  }
}

export default authApi
