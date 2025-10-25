import request from './request'

/**
 * 环境配置相关API接口
 */

/**
 * 创建环境配置
 * 对应后端 CreateEnvironmentConfigDTO
 */
export function createEnvironmentConfig(data) {
  console.log('=== 创建环境配置 API ===')
  console.log('请求数据:', data)
  console.log('请求URL:', '/api/environments')
  console.log('请求方法:', 'POST')
  
  return request({
    url: '/api/environments',
    method: 'post',
    data: data
  }).catch(error => {
    console.error('创建环境配置API调用失败:', error)
    console.error('错误详情:', {
      message: error.message,
      response: error.response,
      request: error.request,
      config: error.config
    })
    throw error
  })
}

/**
 * 根据ID获取环境配置详情
 */
export function getEnvironmentConfigById(envId) {
  console.log('=== 查询环境配置详情 API ===')
  console.log('环境ID:', envId)
  
  return request({
    url: `/api/environments/${envId}`,
    method: 'get'
  })
}

/**
 * 更新环境配置
 * 对应后端 UpdateEnvironmentConfigDTO
 */
export function updateEnvironmentConfig(envId, data) {
  console.log('=== 更新环境配置 API ===')
  console.log('环境ID:', envId)
  console.log('请求数据:', data)
  
  return request({
    url: `/api/environments/${envId}`,
    method: 'put',
    data: data
  })
}

/**
 * 删除环境配置
 */
export function deleteEnvironmentConfig(envId) {
  console.log('=== 删除环境配置 API ===')
  console.log('环境ID:', envId)
  
  return request({
    url: `/api/environments/${envId}`,
    method: 'delete'
  })
}

/**
 * 获取环境配置列表
 */
export function getEnvironmentConfigList(params = {}) {
  console.log('=== 查询环境配置列表 API ===')
  console.log('查询参数:', params)
  
  return request({
    url: '/api/environments',
    method: 'get',
    params: {
      envType: params.envType,
      status: params.status,
      searchKeyword: params.searchKeyword,
      isDefault: params.isDefault,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
      page: params.page || 1,
      pageSize: params.pageSize || 100
    }
  })
}

/**
 * 获取项目的环境配置列表
 * 注意：后端接口没有直接支持按项目查询，这里通过前端过滤或者后端需要扩展
 */
export function getProjectEnvironments(projectId) {
  // 如果后端支持按项目查询，可以这样调用
  return request({
    url: '/api/environments',
    method: 'get',
    params: {
      project_id: projectId,
      page_size: 100
    }
  })
}

