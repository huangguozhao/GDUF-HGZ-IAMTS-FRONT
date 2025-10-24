import request from './request'

/**
 * 项目管理相关API接口
 */

// 获取项目列表（包含完整的树形结构）
export function getProjectTree() {
  return request({
    url: '/projects/tree',
    method: 'get'
  })
}

// 获取项目列表（简单列表）
export function getProjects(params = {}) {
  return request({
    url: '/projects',
    method: 'get',
    params: {
      page: params.page || 1,
      page_size: params.pageSize || 100
    }
  })
}

// 创建项目
export function createProject(data) {
  return request({
    url: '/projects',
    method: 'post',
    data: {
      name: data.name,
      description: data.description
    }
  })
}

// 更新项目
export function updateProject(projectId, data) {
  return request({
    url: `/projects/${projectId}`,
    method: 'put',
    data: {
      name: data.name,
      description: data.description
    }
  })
}

// 删除项目
export function deleteProject(projectId) {
  return request({
    url: `/projects/${projectId}`,
    method: 'delete'
  })
}

// 获取项目下的模块列表
export function getModulesByProject(projectId, params = {}) {
  return request({
    url: `/projects/${projectId}/modules`,
    method: 'get',
    params: {
      structure: params.structure || 'tree',
      status: params.status || 'active',
      include_deleted: params.includeDeleted || false,
      include_statistics: params.includeStatistics || false,
      search_keyword: params.searchKeyword,
      sort_by: params.sortBy || 'sort_order',
      sort_order: params.sortOrder || 'asc'
    }
  })
}

// 创建模块
export function createModule(projectId, data) {
  return request({
    url: `/projects/${projectId}/modules`,
    method: 'post',
    data: {
      module_code: data.module_code,
      name: data.name,
      description: data.description,
      parent_module_id: data.parent_module_id || null
    }
  })
}

// 更新模块
export function updateModule(moduleId, data) {
  return request({
    url: `/modules/${moduleId}`,
    method: 'put',
    data: {
      name: data.name,
      description: data.description
    }
  })
}

// 删除模块
export function deleteModule(moduleId) {
  return request({
    url: `/modules/${moduleId}`,
    method: 'delete'
  })
}

// 获取模块下的接口列表
export function getApisByModule(moduleId) {
  return request({
    url: `/modules/${moduleId}/apis`,
    method: 'get'
  })
}

// 创建接口
export function createApi(moduleId, data) {
  return request({
    url: `/modules/${moduleId}/apis`,
    method: 'post',
    data: {
      api_code: data.api_code,
      name: data.name,
      method: data.method,
      path: data.path,
      base_url: data.base_url,
      description: data.description,
      request_parameters: data.request_parameters,
      request_headers: data.request_headers,
      request_body: data.request_body,
      request_body_type: data.request_body_type,
      tags: data.tags
    }
  })
}

// 获取接口详情
export function getApiById(apiId) {
  return request({
    url: `/apis/${apiId}`,
    method: 'get'
  })
}

// 更新接口
export function updateApi(apiId, data) {
  return request({
    url: `/apis/${apiId}`,
    method: 'put',
    data: {
      name: data.name,
      method: data.method,
      path: data.path,
      description: data.description,
      request_parameters: data.request_parameters,
      request_headers: data.request_headers,
      request_body: data.request_body,
      tags: data.tags
    }
  })
}

// 删除接口
export function deleteApi(apiId) {
  return request({
    url: `/apis/${apiId}`,
    method: 'delete'
  })
}

