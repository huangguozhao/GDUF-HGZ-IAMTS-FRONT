import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '../router'

// 创建 axios 实例
const request = axios.create({
  baseURL: '/api', // 使用代理路径
  timeout: 10000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    // 直接返回响应数据
    return response.data
  },
  error => {
    console.error('响应错误:', error)
    
    // 处理不同的错误状态
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          // 未授权，清除 token 并跳转到登录页
          localStorage.removeItem('token')
          localStorage.removeItem('userInfo')
          ElMessage.error(data.msg || '认证失败，请重新登录')
          router.push('/login')
          break
        case 403:
          ElMessage.error(data.msg || '没有权限访问该资源')
          break
        case 404:
          ElMessage.error(data.msg || '请求的资源不存在')
          break
        case 500:
          ElMessage.error(data.msg || '服务器错误，请稍后重试')
          break
        default:
          ElMessage.error(data.msg || '请求失败，请稍后重试')
      }
      
      // 返回错误响应数据
      return Promise.reject(data)
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      ElMessage.error('网络错误，请检查您的网络连接')
      return Promise.reject({ code: -1, msg: '网络错误' })
          } else {
      // 请求配置出错
      ElMessage.error('请求配置错误')
      return Promise.reject({ code: -1, msg: '请求配置错误' })
    }
  }
)

export default request
