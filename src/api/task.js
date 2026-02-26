import request from './request'

/**
 * 任务管理相关API接口
 * 对接后端 /scheduled-tasks 接口
 */

/**
 * 获取任务列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.projectId - 项目ID (对应后端的 target_id)
 * @param {string} params.taskType - 任务类型 (single_case, module, project, test_suite, api)
 * @param {string} params.triggerType - 触发器类型 (cron, simple, daily, weekly, monthly)
 * @param {boolean} params.isEnabled - 是否启用
 * @param {string} params.executionEnvironment - 执行环境 (dev, test, prod, staging)
 * @returns {Promise}
 */
export const getTaskList = (params) => {
  return request({
    url: '/scheduled-tasks',
    method: 'get',
    params
  })
}

/**
 * 获取任务详情
 * @param {string} id - 任务ID (对应后端的 taskId)
 * @returns {Promise}
 */
export const getTaskDetail = (id) => {
  return request({
    url: `/scheduled-tasks/${id}`,
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
    url: '/scheduled-tasks',
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
    url: `/scheduled-tasks/${id}`,
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
    url: `/scheduled-tasks/${id}`,
    method: 'delete'
  })
}

/**
 * 启用任务
 * @param {string} id - 任务ID (对应后端的 taskId)
 * @returns {Promise}
 */
export const enableTask = (id) => {
  return request({
    url: `/scheduled-tasks/${id}/enable`,
    method: 'post'
  })
}

/**
 * 禁用任务
 * @param {string} id - 任务ID (对应后端的 taskId)
 * @returns {Promise}
 */
export const disableTask = (id) => {
  return request({
    url: `/scheduled-tasks/${id}/disable`,
    method: 'post'
  })
}

/**
 * 立即执行任务
 * @param {string} id - 任务ID (对应后端的 taskId)
 * @returns {Promise}
 */
export const executeTask = (id) => {
  return request({
    url: `/scheduled-tasks/${id}/execute`,
    method: 'post'
  })
}

/**
 * 获取任务执行历史
 * @param {string} id - 任务ID (对应后端的 taskId)
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @returns {Promise}
 */
export const getTaskExecutionHistory = (id, params) => {
  return request({
    url: `/scheduled-tasks/${id}/history`,
    method: 'get',
    params
  })
}

/**
 * 获取任务执行统计
 * @param {string} id - 任务ID (对应后端的 taskId)
 * @returns {Promise}
 */
export const getTaskStatistics = (id) => {
  return request({
    url: `/scheduled-tasks/${id}/statistics`,
    method: 'get'
  })
}

/**
 * 获取执行记录详情
 * @param {string} executionId - 执行记录ID
 * @returns {Promise}
 */
export const getExecutionDetail = (executionId) => {
  return request({
    url: `/scheduled-tasks/executions/${executionId}`,
    method: 'get'
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
    url: '/scheduled-tasks/batch',
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
    url: `/scheduled-tasks/${id}/copy`,
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
    url: '/scheduled-tasks/export',
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
    url: '/scheduled-tasks/templates',
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
    url: `/scheduled-tasks/templates/${templateId}/create`,
    method: 'post',
    data
  })
}

/**
 * ==================== 任务管理相关API ====================
 * 对接后端 /tasks 接口（待处理任务管理）
 */

/**
 * 获取当前用户的待处理任务列表
 * @returns {Promise}
 */
export const getUserPendingTasks = () => {
  return request({
    url: '/tasks/pending',
    method: 'get'
  })
}

/**
 * 获取所有待处理任务（管理员用）
 * @returns {Promise}
 */
export const getAllPendingTasks = () => {
  return request({
    url: '/tasks/pending/all',
    method: 'get'
  })
}

/**
 * 根据项目ID获取任务列表
 * @param {number} projectId - 项目ID
 * @returns {Promise}
 */
export const getTasksByProjectId = (projectId) => {
  return request({
    url: `/tasks/project/${projectId}`,
    method: 'get'
  })
}

/**
 * 获取任务详情
 * @param {number} taskId - 任务ID
 * @returns {Promise}
 */
export const getTaskById = (taskId) => {
  return request({
    url: `/tasks/${taskId}`,
    method: 'get'
  })
}

/**
 * 创建任务
 * @param {Object} data - 任务数据
 * @returns {Promise}
 */
export const createNewTask = (data) => {
  return request({
    url: '/tasks',
    method: 'post',
    data
  })
}

/**
 * 更新任务
 * @param {number} taskId - 任务ID
 * @param {Object} data - 任务数据
 * @returns {Promise}
 */
export const updateTaskDetail = (taskId, data) => {
  return request({
    url: `/tasks/${taskId}`,
    method: 'put',
    data
  })
}

/**
 * 删除任务
 * @param {number} taskId - 任务ID
 * @returns {Promise}
 */
export const deleteTaskById = (taskId) => {
  return request({
    url: `/tasks/${taskId}`,
    method: 'delete'
  })
}

/**
 * 更新任务状态
 * @param {number} taskId - 任务ID
 * @param {string} status - 状态 (pending, in_progress, completed, cancelled)
 * @returns {Promise}
 */
export const updateTaskStatus = (taskId, status) => {
  return request({
    url: `/tasks/${taskId}/status`,
    method: 'patch',
    params: { status }
  })
}

/**
 * 更新任务进度
 * @param {number} taskId - 任务ID
 * @param {number} progress - 进度 (0-100)
 * @returns {Promise}
 */
export const updateTaskProgress = (taskId, progress) => {
  return request({
    url: `/tasks/${taskId}/progress`,
    method: 'patch',
    params: { progress }
  })
}

/**
 * 根据测试失败自动创建任务
 * @param {number} executionId - 执行记录ID
 * @param {string} failureMessage - 失败消息
 * @param {number} projectId - 项目ID
 * @param {string} projectName - 项目名称
 * @returns {Promise}
 */
export const createTaskFromFailure = (executionId, failureMessage, projectId, projectName) => {
  return request({
    url: '/tasks/from-failure',
    method: 'post',
    params: { executionId, failureMessage, projectId, projectName }
  })
}