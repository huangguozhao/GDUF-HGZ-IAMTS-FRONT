import request from './request'

/**
 * 人员管理相关API接口
 */

/**
 * 获取用户列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.keyword - 搜索关键词
 * @param {string} params.status - 状态筛选
 * @param {string} params.role - 角色筛选
 * @returns {Promise}
 */
export const getUserList = (params) => {
  return request({
    url: '/users',
    method: 'get',
    params
  })
}

/**
 * 获取用户详情
 * @param {string} id - 用户ID
 * @returns {Promise}
 */
export const getUserDetail = (id) => {
  return request({
    url: `/users/${id}`,
    method: 'get'
  })
}

/**
 * 创建用户
 * @param {Object} data - 用户数据
 * @param {string} data.name - 姓名
 * @param {string} data.email - 邮箱
 * @param {string} data.role - 角色
 * @param {string} data.password - 密码
 * @param {string} data.status - 状态
 * @returns {Promise}
 */
export const createUser = (data) => {
  return request({
    url: '/users',
    method: 'post',
    data
  })
}

/**
 * 更新用户
 * @param {string} id - 用户ID
 * @param {Object} data - 更新数据
 * @returns {Promise}
 */
export const updateUser = (id, data) => {
  return request({
    url: `/users/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除用户
 * @param {string} id - 用户ID
 * @returns {Promise}
 */
export const deleteUser = (id) => {
  return request({
    url: `/users/${id}`,
    method: 'delete'
  })
}

/**
 * 切换用户状态
 * @param {string} id - 用户ID
 * @param {boolean} enabled - 是否启用
 * @returns {Promise}
 */
export const toggleUserStatus = (id, enabled) => {
  return request({
    url: `/users/${id}/status`,
    method: 'put',
    data: { enabled }
  })
}

/**
 * 重置用户密码
 * @param {string} id - 用户ID
 * @param {string} newPassword - 新密码
 * @returns {Promise}
 */
export const resetUserPassword = (id, newPassword) => {
  return request({
    url: `/users/${id}/password`,
    method: 'put',
    data: { password: newPassword }
  })
}

/**
 * 获取用户权限
 * @param {string} id - 用户ID
 * @returns {Promise}
 */
export const getUserPermissions = (id) => {
  return request({
    url: `/users/${id}/permissions`,
    method: 'get'
  })
}

/**
 * 更新用户权限
 * @param {string} id - 用户ID
 * @param {Array} permissions - 权限列表
 * @returns {Promise}
 */
export const updateUserPermissions = (id, permissions) => {
  return request({
    url: `/users/${id}/permissions`,
    method: 'put',
    data: { permissions }
  })
}

/**
 * 分页获取用户项目列表
 * @param {string|number} id - 用户ID
 * @param {Object} params - 查询参数
 * @param {string} [params.status] - 成员状态 (active, inactive, removed)
 * @param {string} [params.projectRole] - 项目角色 (owner, manager, developer, tester, viewer)
 * @param {number} [params.page] - 页码
 * @param {number} [params.pageSize] - 每页数量
 * @returns {Promise}
 */
export const getUserProjects = (id, params = {}) => {
  const { pageSize, projectRole, ...rest } = params || {};
  // 后端参数为 page_size / project_role，这里做一次命名转换
  const query = {
    ...rest,
    ...(typeof pageSize === 'number' ? { page_size: pageSize } : {}),
    ...(projectRole ? { project_role: projectRole } : {}),
  };

  return request({
    url: `/users/${id}/projects`,
    method: 'get',
    params: query,
  })
}

/**
 * 更新用户项目分配
 * @param {string} id - 用户ID
 * @param {Array} projectIds - 项目ID列表
 * @returns {Promise}
 */
export const updateUserProjects = (id, projectIds) => {
  return request({
    url: `/users/${id}/projects`,
    method: 'put',
    data: { projectIds }
  })
}

/**
 * 移除用户项目分配（软删除）
 * @param {number} userId - 用户ID
 * @param {number} projectId - 项目ID
 * @returns {Promise}
 */
export const removeUserFromProject = (userId, projectId) => {
  return request({
    url: `/users/${userId}/projects/${projectId}`,
    method: 'delete'
  })
}

/**
 * 批量操作用户
 * @param {Object} data - 操作数据
 * @param {Array} data.userIds - 用户ID列表
 * @param {string} data.action - 操作类型 (enable/disable/delete)
 * @returns {Promise}
 */
export const batchOperateUsers = (data) => {
  return request({
    url: '/users/batch',
    method: 'post',
    data
  })
}

/**
 * 导出用户列表
 * @param {Object} params - 导出参数
 * @returns {Promise}
 */
export const exportUsers = (params) => {
  return request({
    url: '/users/export',
    method: 'post',
    data: params,
    responseType: 'blob'
  })
}

/**
 * 导入用户
 * @param {FormData} formData - 文件数据
 * @returns {Promise}
 */
export const importUsers = (formData) => {
  return request({
    url: '/users/import',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 获取角色列表
 * @returns {Promise}
 */
export const getRoleList = () => {
  return request({
    url: '/roles',
    method: 'get'
  })
}

/**
 * 创建角色
 * @param {Object} data - 角色数据
 * @param {string} data.name - 角色名称
 * @param {string} data.description - 角色描述
 * @param {Array} data.permissions - 权限列表
 * @returns {Promise}
 */
export const createRole = (data) => {
  return request({
    url: '/roles',
    method: 'post',
    data
  })
}

/**
 * 更新角色
 * @param {string} id - 角色ID
 * @param {Object} data - 更新数据
 * @returns {Promise}
 */
export const updateRole = (id, data) => {
  return request({
    url: `/roles/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除角色
 * @param {string} id - 角色ID
 * @returns {Promise}
 */
export const deleteRole = (id) => {
  return request({
    url: `/roles/${id}`,
    method: 'delete'
  })
}

/**
 * 获取权限列表
 * @returns {Promise}
 */
export const getPermissionList = () => {
  return request({
    url: '/permissions',
    method: 'get'
  })
}

/**
 * 获取用户统计信息
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export const getUserStatistics = (params) => {
  return request({
    url: '/users/statistics',
    method: 'get',
    params
  })
}

/**
 * 获取用户活动日志
 * @param {string} id - 用户ID
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.startDate - 开始日期
 * @param {string} params.endDate - 结束日期
 * @returns {Promise}
 */
export const getUserActivityLog = (id, params) => {
  return request({
    url: `/users/${id}/activity-log`,
    method: 'get',
    params
  })
}

/**
 * 发送激活邮件
 * @param {string} id - 用户ID
 * @returns {Promise}
 */
export const sendActivationEmail = (id) => {
  return request({
    url: `/users/${id}/send-activation`,
    method: 'post'
  })
}

/**
 * 获取用户登录历史
 * @param {string} id - 用户ID
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export const getUserLoginHistory = (id, params) => {
  return request({
    url: `/users/${id}/login-history`,
    method: 'get',
    params
  })
}
