// 调试数据转换函数
import { transformApi } from './src/utils/dataTransform.js'

// 模拟后端返回的数据
const backendApiData = {
  "apiId": 6,
  "apiCode": "USER001",
  "moduleId": 2,
  "name": "获取用户信息",
  "method": "GET",
  "path": "/api/user/info",
  "fullUrl": "http://localhost:8080/api/user/info",
  "description": "获取当前登录用户信息",
  "status": "active",
  "version": "1.0",
  "authType": "bearer",
  "responseBodyType": "json",
  "timeoutSeconds": 30,
  "creatorInfo": {
    "userId": 8,
    "name": "孙磊",
    "avatarUrl": "https://avatar.example.com/sun.jpg"
  },
  "createdAt": "2025-10-19T10:40:06",
  "updatedAt": "2025-10-19T10:40:06"
}

// 测试转换
const transformedApi = transformApi(backendApiData)
console.log('原始数据:', backendApiData)
console.log('转换后数据:', transformedApi)
console.log('接口ID:', transformedApi.id) // 应该输出: 6
console.log('接口名称:', transformedApi.name) // 应该输出: 获取用户信息
console.log('请求方法:', transformedApi.method) // 应该输出: GET
console.log('接口路径:', transformedApi.path) // 应该输出: /api/user/info
