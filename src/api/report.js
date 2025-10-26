import request from './request'

/**
 * 分页查询测试报告列表
 */
export function getReportList(params = {}) {
  console.log('=== 查询报告列表 API ===')
  console.log('查询参数:', params)
  
  return request({
    url: '/reports',
    method: 'get',
    params: {
      project_id: params.projectId,
      report_type: params.reportType,
      environment: params.environment,
      report_status: params.reportStatus,
      file_format: params.fileFormat,
      start_time_begin: params.startTimeBegin,
      start_time_end: params.startTimeEnd,
      success_rate_min: params.successRateMin,
      success_rate_max: params.successRateMax,
      tags: params.tags,
      search_keyword: params.searchKeyword,
      sort_by: params.sortBy,
      sort_order: params.sortOrder,
      include_deleted: params.includeDeleted,
      page: params.page || 1,
      page_size: params.pageSize || 20
    }
  })
}

/**
 * 根据ID查询报告详情
 */
export function getReportById(reportId) {
  console.log('=== 查询报告详情 API ===')
  console.log('报告ID:', reportId)
  
  return request({
    url: `/reports/${reportId}`,
    method: 'get'
  })
}

/**
 * 根据项目ID查询报告列表
 */
export function getReportsByProjectId(projectId) {
  console.log('=== 查询项目报告列表 API ===')
  console.log('项目ID:', projectId)
  
  return request({
    url: `/reports/project/${projectId}`,
    method: 'get'
  })
}

/**
 * 根据执行ID查询报告
 */
export function getReportByExecutionId(executionId) {
  console.log('=== 查询执行报告 API ===')
  console.log('执行ID:', executionId)
  
  return request({
    url: `/reports/execution/${executionId}`,
    method: 'get'
  })
}

/**
 * 创建报告
 */
export function createReport(data) {
  console.log('=== 创建报告 API ===')
  console.log('报告数据:', data)
  
  return request({
    url: '/reports',
    method: 'post',
    data
  })
}

/**
 * 更新报告
 */
export function updateReport(reportId, data) {
  console.log('=== 更新报告 API ===')
  console.log('报告ID:', reportId)
  console.log('报告数据:', data)
  
  return request({
    url: `/reports/${reportId}`,
    method: 'put',
    data
  })
}

/**
 * 删除测试报告
 */
export function deleteReport(reportId, force = false) {
  console.log('=== 删除报告 API ===')
  console.log('报告ID:', reportId)
  console.log('强制删除:', force)
  
  return request({
    url: `/reports/${reportId}`,
    method: 'delete',
    params: {
      force
    }
  })
}

/**
 * 批量删除报告
 */
export function batchDeleteReports(reportIds) {
  console.log('=== 批量删除报告 API ===')
  console.log('报告ID列表:', reportIds)
  
  return request({
    url: '/reports/batch',
    method: 'delete',
    data: reportIds
  })
}

/**
 * 根据项目ID删除报告
 */
export function deleteReportsByProjectId(projectId) {
  console.log('=== 删除项目报告 API ===')
  console.log('项目ID:', projectId)
  
  return request({
    url: `/reports/project/${projectId}`,
    method: 'delete'
  })
}

/**
 * 更新报告状态
 */
export function updateReportStatus(reportId, reportStatus) {
  console.log('=== 更新报告状态 API ===')
  console.log('报告ID:', reportId)
  console.log('报告状态:', reportStatus)
  
  return request({
    url: `/reports/${reportId}/status`,
    method: 'patch',
    params: {
      report_status: reportStatus
    }
  })
}

/**
 * 更新报告文件信息
 */
export function updateReportFileInfo(reportId, fileInfo) {
  console.log('=== 更新报告文件信息 API ===')
  console.log('报告ID:', reportId)
  console.log('文件信息:', fileInfo)
  
  return request({
    url: `/reports/${reportId}/file`,
    method: 'patch',
    params: {
      file_path: fileInfo.filePath,
      file_size: fileInfo.fileSize,
      download_url: fileInfo.downloadUrl
    }
  })
}

/**
 * 导出测试报告
 */
export function exportReport(reportId, options = {}) {
  console.log('=== 导出报告 API ===')
  console.log('报告ID:', reportId)
  console.log('导出选项:', options)
  
  return request({
    url: `/reports/${reportId}/export/enterprise`,
    method: 'get',
    params: {
      export_format: options.exportFormat || 'html',
      include_details: options.includeDetails !== undefined ? options.includeDetails : true,
      include_attachments: options.includeAttachments !== undefined ? options.includeAttachments : false,
      include_failure_details: options.includeFailureDetails !== undefined ? options.includeFailureDetails : true,
      timezone: options.timezone || 'Asia/Shanghai'
    },
    responseType: 'blob' // 重要：告诉axios返回blob对象
  })
}
