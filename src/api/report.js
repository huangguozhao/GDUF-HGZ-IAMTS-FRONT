import request from './request'

/**
 * 获取报告列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.projectId - 项目ID
 * @param {string} params.startDate - 开始日期
 * @param {string} params.endDate - 结束日期
 * @param {string} params.status - 状态 (passed/failed)
 * @returns {Promise}
 */
export const getReportList = (params) => {
  return request({
    url: '/reports',
    method: 'get',
    params
  })
}

/**
 * 获取报告详情
 * @param {string} id - 报告ID
 * @returns {Promise}
 */
export const getReportDetail = (id) => {
  return request({
    url: `/reports/${id}`,
    method: 'get'
  })
}

/**
 * 导出报告
 * @param {Object} params - 筛选参数
 * @returns {Promise}
 */
export const exportReport = (params) => {
  return request({
    url: '/reports/export',
    method: 'post',
    data: params,
    responseType: 'blob'
  })
}

/**
 * 下载报告PDF
 * @param {string} id - 报告ID
 * @returns {Promise}
 */
export const downloadReportPDF = (id) => {
  return request({
    url: `/reports/${id}/pdf`,
    method: 'get',
    responseType: 'blob'
  })
}

/**
 * 删除报告
 * @param {string} id - 报告ID
 * @returns {Promise}
 */
export const deleteReport = (id) => {
  return request({
    url: `/reports/${id}`,
    method: 'delete'
  })
}

/**
 * 获取报告统计数据
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export const getReportStatistics = (params) => {
  return request({
    url: '/reports/statistics',
    method: 'get',
    params
  })
}

