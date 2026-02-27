import request from './request'

/**
 * 首页/Dashboard 相关API接口
 */

/**
 * 获取Dashboard数据概览
 * @param {Object} params - 查询参数
 * @param {string} params.timeRange - 时间范围 (7d, 30d, 90d)
 * @param {boolean} params.includeRecentActivity - 是否包含最近活动
 * @param {boolean} params.includePendingTasks - 是否包含待办事项
 * @param {boolean} params.includeQuickActions - 是否包含快捷操作
 * @returns {Promise}
 */
export const getDashboardSummary = (params = {}) => {
  return request({
    url: '/test-executions/dashboard/summary',
    method: 'get',
    params: {
      time_range: params.timeRange || '7d',
      include_recent_activity: params.includeRecentActivity !== false,
      include_pending_tasks: params.includePendingTasks !== false,
      include_quick_actions: params.includeQuickActions !== false
    }
  })
}

/**
 * 获取测试执行统计
 * @param {Object} params - 查询参数
 * @param {string} params.timeRange - 时间范围 (7d, 30d, 90d)
 * @param {string} params.groupBy - 分组方式 (day, week, month)
 * @returns {Promise}
 */
export const getTestStatistics = (params = {}) => {
  return request({
    url: '/test-executions/test-results/statistics',
    method: 'get',
    params: {
      time_range: params.timeRange || '7d',
      group_by: params.groupBy || 'day',
      include_trend: params.includeTrend !== false,
      include_comparison: params.includeComparison !== false
    }
  })
}

/**
 * 获取项目统计数据
 * @param {number} projectId - 项目ID
 * @returns {Promise}
 */
export const getProjectStatistics = (projectId) => {
  return request({
    url: `/projects/${projectId}/statistics`,
    method: 'get'
  })
}

/**
 * 获取最近项目列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @returns {Promise}
 */
export const getRecentProjects = (params = {}) => {
  return request({
    url: '/projects/recent-projects',
    method: 'get',
    params: {
      page: params.page || 1,
      page_size: params.pageSize || 10
    }
  })
}

/**
 * 获取测试执行历史
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export const getExecutionHistory = (params = {}) => {
  return request({
    url: '/test-executions/test-results',
    method: 'get',
    params: {
      page: params.page || 1,
      page_size: params.pageSize || 10,
      sort_by: 'created_at',
      sort_order: 'desc'
    }
  })
}

