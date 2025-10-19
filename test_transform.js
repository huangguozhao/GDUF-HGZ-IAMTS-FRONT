// 测试数据转换函数
import { transformProject } from './src/utils/dataTransform.js'

// 模拟后端返回的数据
const backendData = {
  "projectId": 1,
  "name": "PAMC Exchange Platform",
  "description": "PAMC加密货币交易平台，提供现货交易、模拟交易等功能",
  "createdAt": "2025-10-19T10:38:36",
  "updatedAt": "2025-10-19T10:38:36"
}

// 测试转换
const transformedData = transformProject(backendData)
console.log('转换后的数据:', transformedData)
console.log('项目ID:', transformedData.id) // 应该输出: 1
console.log('项目ID类型:', typeof transformedData.id) // 应该输出: number

// 验证选中状态逻辑
const selectedNode = { id: 1 }
const project = transformedData
const isSelected = selectedNode?.id === project.id
console.log('选中状态:', isSelected) // 应该输出: true
