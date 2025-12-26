import request from './request'

/**
 * 系统设置相关API接口
 */

/**
 * 获取基本设置
 * @returns {Promise}
 */
export const getBasicSettings = () => {
  return request({
    url: '/settings/basic',
    method: 'get'
  })
}

/**
 * 更新基本设置
 * @param {Object} data - 设置数据
 * @returns {Promise}
 */
export const updateBasicSettings = (data) => {
  return request({
    url: '/settings/basic',
    method: 'put',
    data
  })
}

/**
 * 获取系统配置列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.keyword - 搜索关键词
 * @returns {Promise}
 */
export const getSystemConfigs = (params) => {
  return request({
    url: '/settings/configs',
    method: 'get',
    params
  })
}

/**
 * 添加系统配置
 * @param {Object} data - 配置数据
 * @param {string} data.name - 配置项名称
 * @param {string} data.value - 配置值
 * @param {string} data.description - 配置描述
 * @returns {Promise}
 */
export const addSystemConfig = (data) => {
  return request({
    url: '/settings/configs',
    method: 'post',
    data
  })
}

/**
 * 更新系统配置
 * @param {string} id - 配置ID
 * @param {Object} data - 更新数据
 * @returns {Promise}
 */
export const updateSystemConfig = (id, data) => {
  return request({
    url: `/settings/configs/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除系统配置
 * @param {string} id - 配置ID
 * @returns {Promise}
 */
export const deleteSystemConfig = (id) => {
  return request({
    url: `/settings/configs/${id}`,
    method: 'delete'
  })
}

/**
 * 获取角色列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export const getRoles = (params) => {
  return request({
    url: '/settings/roles',
    method: 'get',
    params
  })
}

/**
 * 创建角色
 * @param {Object} data - 角色数据
 * @returns {Promise}
 */
export const createRole = (data) => {
  return request({
    url: '/settings/roles',
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
    url: `/settings/roles/${id}`,
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
    url: `/settings/roles/${id}`,
    method: 'delete'
  })
}

/**
 * 分配角色权限
 * @param {string} roleId - 角色ID
 * @param {Array} permissions - 权限列表
 * @returns {Promise}
 */
export const assignRolePermissions = (roleId, permissions) => {
  return request({
    url: `/settings/roles/${roleId}/permissions`,
    method: 'put',
    data: { permissions }
  })
}

/**
 * 分配用户角色
 * @param {string} userId - 用户ID
 * @param {Array} roleIds - 角色ID列表
 * @returns {Promise}
 */
export const assignUserRoles = (userId, roleIds) => {
  return request({
    url: `/settings/users/${userId}/roles`,
    method: 'put',
    data: { roleIds }
  })
}

/**
 * 获取权限日志
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export const getPermissionLogs = (params) => {
  return request({
    url: '/settings/permission-logs',
    method: 'get',
    params
  })
}

/**
 * 获取权限设置
 * @returns {Promise}
 */
export const getPermissionSettings = () => {
  return request({
    url: '/settings/permissions',
    method: 'get'
  })
}

/**
 * 更新权限设置
 * @param {Object} data - 权限设置数据
 * @returns {Promise}
 */
export const updatePermissionSettings = (data) => {
  return request({
    url: '/settings/permissions',
    method: 'put',
    data
  })
}

/**
 * 导出权限配置
 * @returns {Promise}
 */
export const exportPermissions = () => {
  return request({
    url: '/settings/permissions/export',
    method: 'get',
    responseType: 'blob'
  })
}

/**
 * 获取通知设置
 * @returns {Promise}
 */
export const getNotificationSettings = () => {
  return request({
    url: '/settings/notifications',
    method: 'get'
  })
}

/**
 * 更新通知设置
 * @param {Object} data - 通知设置数据
 * @returns {Promise}
 */
export const updateNotificationSettings = (data) => {
  return request({
    url: '/settings/notifications',
    method: 'put',
    data
  })
}

/**
 * 获取集成管理设置
 * @returns {Promise}
 */
export const getIntegrationSettings = () => {
  return request({
    url: '/settings/integrations',
    method: 'get'
  })
}

/**
 * 更新集成管理设置
 * @param {Object} data - 集成设置数据
 * @returns {Promise}
 */
export const updateIntegrationSettings = (data) => {
  return request({
    url: '/settings/integrations',
    method: 'put',
    data
  })
}

/**
 * 测试邮件配置
 * @param {Object} data - 邮件配置数据
 * @returns {Promise}
 */
export const testEmailConfig = (data) => {
  return request({
    url: '/settings/test-email',
    method: 'post',
    data
  })
}

/**
 * 测试短信配置
 * @param {Object} data - 短信配置数据
 * @returns {Promise}
 */
export const testSmsConfig = (data) => {
  return request({
    url: '/settings/test-sms',
    method: 'post',
    data
  })
}

/**
 * 获取系统信息
 * @returns {Promise}
 */
export const getSystemInfo = () => {
  return request({
    url: '/settings/system-info',
    method: 'get'
  })
}

/**
 * 检查系统更新
 * @returns {Promise}
 */
export const checkSystemUpdate = () => {
  return request({
    url: '/settings/check-update',
    method: 'get'
  })
}

/**
 * 更新系统信息
 * @param {Object} data - 系统信息数据
 * @returns {Promise}
 */
export const updateSystemInfo = (data) => {
  return request({
    url: '/settings/system-info',
    method: 'put',
    data
  })
}

/**
 * 执行系统更新
 * @param {string} version - 目标版本
 * @returns {Promise}
 */
export const executeSystemUpdate = (version) => {
  return request({
    url: '/settings/update',
    method: 'post',
    data: { version }
  })
}

/**
 * 备份系统数据
 * @param {Object} data - 备份配置
 * @returns {Promise}
 */
export const backupSystemData = (data) => {
  return request({
    url: '/settings/backup',
    method: 'post',
    data
  })
}

/**
 * 恢复系统数据
 * @param {string} backupId - 备份ID
 * @returns {Promise}
 */
export const restoreSystemData = (backupId) => {
  return request({
    url: '/settings/restore',
    method: 'post',
    data: { backupId }
  })
}

/**
 * 获取备份列表
 * @returns {Promise}
 */
export const getBackupList = () => {
  return request({
    url: '/settings/backups',
    method: 'get'
  })
}

/**
 * 删除备份
 * @param {string} backupId - 备份ID
 * @returns {Promise}
 */
export const deleteBackup = (backupId) => {
  return request({
    url: `/settings/backups/${backupId}`,
    method: 'delete'
  })
}

/**
 * 导出系统配置
 * @returns {Promise}
 */
export const exportSystemConfig = () => {
  return request({
    url: '/settings/export',
    method: 'get',
    responseType: 'blob'
  })
}

/**
 * 导入系统配置
 * @param {FormData} formData - 配置文件
 * @returns {Promise}
 */
export const importSystemConfig = (formData) => {
  return request({
    url: '/settings/import',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 重置系统设置
 * @returns {Promise}
 */
export const resetSystemSettings = () => {
  return request({
    url: '/settings/reset',
    method: 'post'
  })
}

/**
 * 获取系统日志
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.level - 日志级别
 * @param {string} params.startDate - 开始日期
 * @param {string} params.endDate - 结束日期
 * @returns {Promise}
 */
export const getSystemLogs = (params) => {
  return request({
    url: '/settings/logs',
    method: 'get',
    params
  })
}

/**
 * 清理系统日志
 * @param {Object} data - 清理配置
 * @returns {Promise}
 */
export const clearSystemLogs = (data) => {
  return request({
    url: '/settings/logs/clear',
    method: 'post',
    data
  })
}

/**
 * 获取系统性能监控
 * @returns {Promise}
 */
export const getSystemPerformance = () => {
  return request({
    url: '/settings/performance',
    method: 'get'
  })
}

/**
 * 获取系统统计信息
 * @returns {Promise}
 */
export const getSystemStatistics = () => {
  return request({
    url: '/settings/statistics',
    method: 'get'
  })
}
