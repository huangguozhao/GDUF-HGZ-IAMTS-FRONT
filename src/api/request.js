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
    let data = response.data
    
    // 如果响应数据是字符串，尝试解析JSON
    if (typeof data === 'string') {
      console.log('[request.js] 响应是字符串，尝试解析JSON')
      console.log('[request.js] 原始字符串长度:', data.length)
      
      try {
        // 先尝试直接解析整个字符串
        data = JSON.parse(data)
        console.log('[request.js] 直接解析成功')
      } catch (e) {
        console.log('[request.js] 直接解析失败，尝试提取第一个有效JSON对象')
        
        // 使用深度追踪算法提取第一个完整的JSON对象
        let depth = 0
        let startIndex = -1
        let endIndex = -1
        
        for (let i = 0; i < data.length; i++) {
          if (data[i] === '{') {
            if (depth === 0) startIndex = i
            depth++
          } else if (data[i] === '}') {
            depth--
            if (depth === 0 && startIndex !== -1) {
              endIndex = i + 1
              break
            }
          }
        }
        
        if (startIndex !== -1 && endIndex !== -1) {
          let jsonStr = data.substring(startIndex, endIndex)
          console.log('[request.js] 提取的JSON长度:', jsonStr.length)
          console.log('[request.js] JSON末尾200字符:', jsonStr.substring(jsonStr.length - 200))
          
          // 先尝试直接解析
          try {
            data = JSON.parse(jsonStr)
            console.log('[request.js] 直接解析成功')
          } catch (parseError) {
            console.error('[request.js] 直接解析失败:', parseError.message)
            
            // 尝试修复策略1: 移除 summary 字段（这个字段经常有问题）
            try {
              console.log('[request.js] 尝试移除 summary 字段')
              // 匹配并移除 "summary":{...} 直到找到正确的结束
              let fixedStr = jsonStr.replace(/,\s*"summary"\s*:\s*\{[^}]*(?:\{[^}]*\}[^}]*)*\}/g, '')
              console.log('[request.js] 修复后JSON末尾200字符:', fixedStr.substring(fixedStr.length - 200))
              data = JSON.parse(fixedStr)
              console.log('[request.js] 移除 summary 后解析成功')
            } catch (secondError) {
              console.error('[request.js] 移除 summary 失败:', secondError.message)
              
              // 尝试修复策略2: 直接截取到 pageSize 之后
              try {
                console.log('[request.js] 尝试截取到 pageSize 结束')
                const pageSizeIndex = jsonStr.lastIndexOf('"pageSize"')
                if (pageSizeIndex !== -1) {
                  // 找到 pageSize 后的数字值和逗号
                  const afterPageSize = jsonStr.substring(pageSizeIndex)
                  const match = afterPageSize.match(/"pageSize"\s*:\s*(\d+)/)
                  if (match) {
                    const endPos = pageSizeIndex + match[0].length
                    const truncatedStr = jsonStr.substring(0, endPos) + '}}}'
                    console.log('[request.js] 截取后JSON末尾:', truncatedStr.substring(truncatedStr.length - 100))
                    data = JSON.parse(truncatedStr)
                    console.log('[request.js] 截取后解析成功')
                  } else {
                    throw new Error('无法找到 pageSize 的值')
                  }
                } else {
                  throw new Error('无法找到 pageSize 字段')
                }
              } catch (finalError) {
                console.error('[request.js] 所有修复尝试均失败:', finalError.message)
                console.error('[request.js] 原始JSON末尾500字符:', jsonStr.substring(jsonStr.length - 500))
                // 返回错误响应
                return { code: -1, msg: '响应数据格式错误' }
              }
            }
          }
        } else {
          console.error('[request.js] 无法找到有效的JSON对象')
          return { code: -1, msg: '响应数据格式错误' }
        }
      }
    }
    
    // 返回解析后的数据对象
    return data
  },
  error => {
    console.error('响应错误:', error)
    
    // 处理超时错误
    if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
      ElMessage.error('请求超时，请稍后重试或选择异步执行模式')
      return Promise.reject({ code: -1, msg: '请求超时' })
    }
    
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
