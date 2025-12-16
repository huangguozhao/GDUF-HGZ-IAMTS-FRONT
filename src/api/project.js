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

// 获取项目统计数据
export function getProjectStatistics(projectId) {
  return request({
    url: `/projects/${projectId}/statistics`,
    method: 'get'
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
  const requestData = {
    projectId: projectId,
    moduleCode: data.module_code || data.moduleCode,
    name: data.name,
    description: data.description,
    parentModuleId: data.parent_module_id || data.parentModuleId || null,
    sortOrder: data.sort_order || data.sortOrder || 0,
    status: data.status || 'active',
    ownerId: data.owner_id || data.ownerId || null,
    tags: data.tags || []
  }
  
  console.log('=== createModule 函数 ===')
  console.log('projectId 参数:', projectId)
  console.log('data 参数:', data)
  console.log('最终请求体 (驼峰命名):', requestData)
  
  return request({
    url: `/modules`,
    method: 'post',
    data: requestData
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

// 获取模块统计数据
export function getModuleStatistics(moduleId) {
  return request({
    url: `/modules/${moduleId}/statistics`,
    method: 'get'
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
  const requestData = {
    apiCode: data.api_code || data.apiCode || '',
    moduleId: moduleId,  // 使用驼峰命名
    name: data.name,
    method: data.method,
    path: data.path,
    baseUrl: data.base_url || data.baseUrl || '',
    requestParameters: data.request_parameters || data.requestParameters,
    pathParameters: data.path_parameters || data.pathParameters,
    requestHeaders: data.request_headers || data.requestHeaders,
    requestBody: data.request_body || data.requestBody,
    requestBodyType: data.request_body_type || data.requestBodyType || 'json',
    responseBodyType: data.response_body_type || data.responseBodyType || '',
    description: data.description || '',
    status: data.status || 'active',  // 显式设置为 active（数据库只支持 active/inactive/deprecated）
    version: data.version || '',
    authType: data.auth_type || data.authType || '',
    authConfig: data.auth_config || data.authConfig,
    tags: data.tags || [],
    examples: data.examples,
    timeoutSeconds: data.timeout_seconds || data.timeoutSeconds || 30
  }
  
  console.log('=== createApi 函数 ===')
  console.log('moduleId 参数:', moduleId)
  console.log('data 参数:', data)
  console.log('最终请求体 (驼峰命名):', requestData)
  
  return request({
    url: `/apis`,
    method: 'post',
    data: requestData
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
  const requestData = {
    apiCode: data.api_code || data.apiCode || '',
    moduleId: data.module_id || data.moduleId,
    name: data.name,
    method: data.method,
    path: data.path,
    baseUrl: data.base_url || data.baseUrl || '',
    requestParameters: data.request_parameters || data.requestParameters,
    pathParameters: data.path_parameters || data.pathParameters,
    requestHeaders: data.request_headers || data.requestHeaders,
    requestBody: data.request_body || data.requestBody,
    requestBodyType: data.request_body_type || data.requestBodyType || 'json',
    responseBodyType: data.response_body_type || data.responseBodyType || '',
    description: data.description || '',
    status: data.status || 'active',  // 默认为 active（数据库只支持 active/inactive/deprecated）
    version: data.version || '',
    authType: data.auth_type || data.authType || '',
    authConfig: data.auth_config || data.authConfig,
    tags: data.tags || [],
    examples: data.examples,
    timeoutSeconds: data.timeout_seconds || data.timeoutSeconds || 30
  }
  
  console.log('=== updateApi 函数 ===')
  console.log('apiId:', apiId)
  console.log('最终请求体 (驼峰命名):', requestData)
  
  return request({
    url: `/apis/${apiId}`,
    method: 'put',
    data: requestData
  })
}

// 删除接口
export function deleteApi(apiId) {
  return request({
    url: `/apis/${apiId}`,
    method: 'delete'
  })
}

// ========== 项目成员相关 API ==========

/**
 * 分页获取项目成员列表
 * 对应后端 GET /projects/{projectId}/members 接口
 *
 * @param {number} projectId - 项目ID
 * @param {object} params - 查询参数
 * @param {string} [params.status] - 成员状态过滤
 * @param {string} [params.permissionLevel] - 权限级别过滤
 * @param {string} [params.projectRole] - 项目角色过滤
 * @param {string} [params.searchKeyword] - 关键字搜索
 * @param {string} [params.sortBy] - 排序字段
 * @param {string} [params.sortOrder] - 排序顺序
 * @param {number} [params.page=1] - 页码
 * @param {number} [params.pageSize=10] - 每页数量
 */
export function getProjectMembers(projectId, params = {}) {
  const {
    status,
    permissionLevel,
    projectRole,
    searchKeyword,
    sortBy,
    sortOrder,
    page = 1,
    pageSize = 10,
    ...rest
  } = params || {};

  // 将前端驼峰命名参数转换为后端下划线命名
  const query = {
    status,
    permission_level: permissionLevel,
    project_role: projectRole,
    search_keyword: searchKeyword,
    sort_by: sortBy,
    sort_order: sortOrder,
    page,
    page_size: pageSize,
    ...rest,
  };

  return request({
    url: `/projects/${projectId}/members`,
    method: 'get',
    params: query,
  })
}

/**
 * 添加项目成员
 * @param {number} projectId - 项目ID
 * @param {object} data - 成员数据
 * @param {number} data.userId - 用户ID
 * @param {string} data.role - 角色
 */
export function addProjectMember(projectId, data) {
  return request({
    url: `/projects/${projectId}/members`,
    method: 'post',
    data: {
      userId: data.userId,
      role: data.role
    }
  })
}

/**
 * 更新项目成员角色
 * @param {number} projectId - 项目ID
 * @param {number} userId - 用户ID
 * @param {object} data - 更新数据
 * @param {string} data.role - 新角色
 */
export function updateProjectMemberRole(projectId, userId, data) {
  return request({
    url: `/projects/${projectId}/members/${userId}`,
    method: 'put',
    data: {
      role: data.role
    }
  })
}

/**
 * 删除项目成员
 * @param {number} projectId - 项目ID
 * @param {number} userId - 用户ID
 */
export function removeProjectMember(projectId, userId) {
  return request({
    url: `/projects/${projectId}/members/${userId}`,
    method: 'delete'
  })
}

