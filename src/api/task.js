import request from './request'

/**
 * 任务管理相关API接口
 */

/**
 * 获取任务列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.projectId - 项目ID
 * @param {string} params.status - 状态 (enabled/disabled)
 * @param {string} params.timeType - 时间类型 (all/daily/weekly/monthly/created)
 * @returns {Promise}
 */
export const getTaskList = (params) => {
  return request({
    url: '/tasks',
    method: 'get',
    params
  })
}

/**
 * 获取任务详情
 * @param {string} id - 任务ID
 * @returns {Promise}
 */
export const getTaskDetail = (id) => {
  return request({
    url: `/tasks/${id}`,
    method: 'get'
  })
}

/**
 * 创建任务
 * @param {Object} data - 任务数据
 * @param {string} data.name - 任务名称
 * @param {string} data.frequency - 执行频率 (daily/weekly/monthly)
 * @param {Array} data.selectedDays - 选择的日期
 * @param {string} data.startTime - 开始时间
 * @param {string} data.endTime - 结束时间
 * @param {number} data.timeout - 超时时间(分钟)
 * @param {number} data.retryCount - 重试次数
 * @param {boolean} data.emailNotification - 邮件通知
 * @param {boolean} data.wechatNotification - 微信通知
 * @param {Array} data.caseIds - 关联用例ID列表
 * @returns {Promise}
 */
export const createTask = (data) => {
  return request({
    url: '/tasks',
    method: 'post',
    data
  })
}

/**
 * 更新任务
 * @param {string} id - 任务ID
 * @param {Object} data - 更新数据
 * @returns {Promise}
 */
export const updateTask = (id, data) => {
  return request({
    url: `/tasks/${id}`,
    method: 'put',
    data
  })
}

/**
 * 删除任务
 * @param {string} id - 任务ID
 * @returns {Promise}
 */
export const deleteTask = (id) => {
  return request({
    url: `/tasks/${id}`,
    method: 'delete'
  })
}

/**
 * 启用/禁用任务
 * @param {string} id - 任务ID
 * @param {boolean} enabled - 是否启用
 * @returns {Promise}
 */
export const toggleTaskStatus = (id, enabled) => {
  return request({
    url: `/tasks/${id}/status`,
    method: 'put',
    data: { enabled }
  })
}

/**
 * 立即执行任务
 * @param {string} id - 任务ID
 * @returns {Promise}
 */
export const executeTask = (id) => {
  return request({
    url: `/tasks/${id}/execute`,
    method: 'post'
  })
}

/**
 * 获取任务执行历史
 * @param {string} id - 任务ID
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.startDate - 开始日期
 * @param {string} params.endDate - 结束日期
 * @returns {Promise}
 */
export const getTaskExecutionHistory = (id, params) => {
  return request({
    url: `/tasks/${id}/executions`,
    method: 'get',
    params
  })
}

/**
 * 获取任务执行结果详情
 * @param {string} taskId - 任务ID
 * @param {string} executionId - 执行ID
 * @returns {Promise}
 */
export const getTaskExecutionDetail = (taskId, executionId) => {
  return request({
    url: `/tasks/${taskId}/executions/${executionId}`,
    method: 'get'
  })
}

/**
 * 获取任务统计信息
 * @param {Object} params - 查询参数
 * @param {string} params.projectId - 项目ID
 * @param {string} params.startDate - 开始日期
 * @param {string} params.endDate - 结束日期
 * @returns {Promise}
 */
export const getTaskStatistics = (params) => {
  return request({
    url: '/tasks/statistics',
    method: 'get',
    params
  })
}

/**
 * 批量操作任务
 * @param {Object} data - 操作数据
 * @param {Array} data.taskIds - 任务ID列表
 * @param {string} data.action - 操作类型 (enable/disable/delete)
 * @returns {Promise}
 */
export const batchOperateTasks = (data) => {
  return request({
    url: '/tasks/batch',
    method: 'post',
    data
  })
}

/**
 * 复制任务
 * @param {string} id - 任务ID
 * @param {Object} data - 复制数据
 * @param {string} data.name - 新任务名称
 * @returns {Promise}
 */
export const copyTask = (id, data) => {
  return request({
    url: `/tasks/${id}/copy`,
    method: 'post',
    data
  })
}

/**
 * 导出任务列表
 * @param {Object} params - 导出参数
 * @returns {Promise}
 */
export const exportTasks = (params) => {
  return request({
    url: '/tasks/export',
    method: 'post',
    data: params,
    responseType: 'blob'
  })
}

/**
 * 获取任务模板列表
 * @returns {Promise}
 */
export const getTaskTemplates = () => {
  return request({
    url: '/tasks/templates',
    method: 'get'
  })
}

/**
 * 从模板创建任务
 * @param {string} templateId - 模板ID
 * @param {Object} data - 任务数据
 * @returns {Promise}
 */
export const createTaskFromTemplate = (templateId, data) => {
  return request({
    url: `/tasks/templates/${templateId}/create`,
    method: 'post',
    data
  })
}
