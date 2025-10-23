import request from './request'

/**
 * 测试用例相关API接口
 */

// 获取接口的测试用例列表（分页）
export function getTestCasesByApi(apiId, params = {}) {
  return request({
    url: '/testcases',
    method: 'get',
    params: {
      apiId: apiId,
      name: params.name,
      case_code: params.case_code,
      priority: params.priority,
      severity: params.severity,
      status: params.status,
      is_template: params.is_template,
      tags: params.tags,
      created_by: params.created_by,
      include_deleted: params.include_deleted || false,
      search_keyword: params.search_keyword,
      sort_by: params.sort_by || 'created_at',
      sort_order: params.sort_order || 'desc',
      page: params.page || 1,
      page_size: params.pageSize || params.page_size || 100
    }
  })
}

// 创建测试用例
export function createTestCase(data) {
  return request({
    url: '/testcases',
    method: 'post',
    data: {
      apiId: data.api_id,  // 后端期望的是apiId字段
      caseCode: data.case_code,
      name: data.name,
      description: data.description,
      priority: data.priority || 'P2',
      severity: data.severity || 'medium',
      tags: data.tags || [],
      preConditions: data.pre_conditions,
      testSteps: data.test_steps,
      requestOverride: data.request_override,
      expectedHttpStatus: data.expected_http_status || 200,
      expectedResponseSchema: data.expected_response_schema,
      expectedResponseBody: data.expected_response_body,
      assertions: data.assertions,
      extractors: data.extractors,
      validators: data.validators,
      isEnabled: data.is_enabled !== undefined ? data.is_enabled : true,
      isTemplate: data.is_template || false,
      templateId: data.template_id,
      version: data.version || '1.0'
    }
  })
}

// 更新测试用例
export function updateTestCase(caseId, data) {
  // 注意：不包含 apiId，修改测试用例时 API 关联不能改变
  return request({
    url: `/testcases/${caseId}`,
    method: 'put',
    data: {
      caseCode: data.case_code,
      name: data.name,
      description: data.description,
      priority: data.priority,
      severity: data.severity,
      tags: data.tags,
      preConditions: data.pre_conditions,
      testSteps: data.test_steps,
      requestOverride: data.request_override,
      expectedHttpStatus: data.expected_http_status,
      expectedResponseSchema: data.expected_response_schema,
      expectedResponseBody: data.expected_response_body,
      assertions: data.assertions,
      extractors: data.extractors,
      validators: data.validators,
      isEnabled: data.is_enabled,
      isTemplate: data.is_template,
      templateId: data.template_id,
      version: data.version
    }
  })
}

// 删除测试用例
export function deleteTestCase(caseId) {
  return request({
    url: `/testcases/${caseId}`,
    method: 'delete'
  })
}

// 导入测试用例
export function importTestCases(apiId, formData, params = {}) {
  return request({
    url: `/apis/${apiId}/test-cases/import`,
    method: 'post',
    data: formData,
    params: {
      import_mode: params.import_mode || 'insert',
      conflict_strategy: params.conflict_strategy || 'skip'
    },
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 导出测试用例
export function exportTestCases(apiId, params = {}) {
  return request({
    url: `/apis/${apiId}/test-cases/export`,
    method: 'get',
    params: {
      format: params.format || 'excel',
      include_disabled: params.include_disabled || false,
      include_templates: params.include_templates || false,
      fields: params.fields,
      filename: params.filename
    },
    responseType: 'blob'
  })
}

// 执行测试用例
export function executeTestCase(apiId, caseId, executeData = {}) {
  // 根据执行模式设置不同的超时时间
  const requestTimeout = executeData.async ? 10000 : 60000  // 异步10秒，同步1分钟
  
  return request({
    url: `/test-cases/${caseId}/execute`,
    method: 'post',
    timeout: requestTimeout,  // 覆盖全局超时设置
    data: {
      environment: executeData.environment,
      base_url: executeData.base_url,
      timeout: executeData.timeout,
      auth_override: executeData.auth_override,
      variables: executeData.variables,
      async: executeData.async || false,
      callback_url: executeData.callback_url
    }
  })
}

// 批量执行测试用例
export function batchExecuteTestCases(apiId, caseIds) {
  return request({
    url: '/testcases/batch-execute',
    method: 'post',
    data: {
      api_id: apiId,
      case_ids: caseIds
    }
  })
}

// 获取测试用例执行历史
export function getTestCaseHistory(caseId, params = {}) {
  return request({
    url: `/test-cases/${caseId}/execution-history`,
    method: 'get',
    params: {
      page: params.page || 1,
      page_size: params.pageSize || 10
    }
  })
}

// 获取测试用例详情
export function getTestCaseDetail(apiId, caseId) {
  return request({
    url: `/testcases/${caseId}`,
    method: 'get'
  })
}

// 复制测试用例
export function copyTestCase(caseId, data) {
  return request({
    url: `/testcases/${caseId}/copy`,
    method: 'post',
    data: {
      caseCode: data.caseCode,
      name: data.name,
      description: data.description
    }
  })
}

// 获取测试用例详情用于复制
export function getTestCaseForCopy(caseId) {
  return request({
    url: `/testcases/${caseId}`,
    method: 'get'
  })
}

// 生成测试用例分享链接
export function createTestCaseShare(caseId, data) {
  return request({
    url: `/testcases/${caseId}/share`,
    method: 'post',
    data: {
      title: data.title,
      expireDays: data.expireDays,
      password: data.password,
      permissions: data.permissions
    }
  })
}

// 获取分享链接信息
export function getTestCaseShareInfo(shareId) {
  return request({
    url: `/testcases/share/${shareId}`,
    method: 'get'
  })
}

// 撤销分享链接
export function revokeTestCaseShare(shareId) {
  return request({
    url: `/testcases/share/${shareId}`,
    method: 'delete'
  })
}

// 通过分享链接获取测试用例详情
export function getTestCaseByShare(shareId, password) {
  return request({
    url: `/testcases/share/${shareId}/view`,
    method: 'post',
    data: {
      password: password
    }
  })
}

// ==================== 执行历史相关接口 ====================

/**
 * 分页查询测试执行记录
 * @param {Object} params - 查询参数
 * @param {String} params.execution_scope - 执行范围类型 (api/module/project/test_suite/test_case)
 * @param {Number} params.ref_id - 关联ID
 * @param {Number} params.executed_by - 执行人ID
 * @param {String} params.execution_type - 执行类型 (manual/scheduled/triggered)
 * @param {String} params.environment - 执行环境
 * @param {String} params.status - 执行状态 (running/completed/failed/cancelled)
 * @param {String} params.start_time_begin - 开始时间范围起始
 * @param {String} params.start_time_end - 开始时间范围结束
 * @param {String} params.search_keyword - 搜索关键词
 * @param {String} params.browser - 浏览器类型
 * @param {String} params.app_version - 应用版本
 * @param {String} params.sort_by - 排序字段
 * @param {String} params.sort_order - 排序方向 (asc/desc)
 * @param {Number} params.page - 页码
 * @param {Number} params.page_size - 每页条数
 */
export function getExecutionRecords(params = {}) {
  return request({
    url: '/execution-records',
    method: 'get',
    params: {
      execution_scope: params.execution_scope,
      ref_id: params.ref_id,
      executed_by: params.executed_by,
      execution_type: params.execution_type,
      environment: params.environment,
      status: params.status,
      start_time_begin: params.start_time_begin,
      start_time_end: params.start_time_end,
      search_keyword: params.search_keyword,
      browser: params.browser,
      app_version: params.app_version,
      sort_by: params.sort_by || 'start_time',
      sort_order: params.sort_order || 'desc',
      page: params.page || 1,
      page_size: params.page_size || 10
    }
  })
}

/**
 * 根据ID查询执行记录详情
 * @param {Number} recordId - 执行记录ID
 */
export function getExecutionRecordById(recordId) {
  return request({
    url: `/execution-records/${recordId}`,
    method: 'get'
  })
}

/**
 * 根据执行范围查询最近的执行记录
 * @param {String} executionScope - 执行范围类型 (api/module/project/test_suite/test_case)
 * @param {Number} refId - 关联ID
 * @param {Number} limit - 返回记录数量
 */
export function getRecentExecutionRecords(executionScope, refId, limit = 10) {
  return request({
    url: `/execution-records/scope/${executionScope}/${refId}`,
    method: 'get',
    params: {
      limit: limit
    }
  })
}

/**
 * 更新执行记录
 * @param {Number} recordId - 执行记录ID
 * @param {Object} data - 更新数据
 */
export function updateExecutionRecord(recordId, data) {
  return request({
    url: `/execution-records/${recordId}`,
    method: 'put',
    data: {
      status: data.status,
      end_time: data.end_time,
      duration_seconds: data.duration_seconds,
      total_cases: data.total_cases,
      executed_cases: data.executed_cases,
      passed_cases: data.passed_cases,
      failed_cases: data.failed_cases,
      skipped_cases: data.skipped_cases,
      success_rate: data.success_rate,
      report_url: data.report_url,
      log_file_path: data.log_file_path,
      error_message: data.error_message
    }
  })
}

/**
 * 删除执行记录（软删除）
 * @param {Number} recordId - 执行记录ID
 */
export function deleteExecutionRecord(recordId) {
  return request({
    url: `/execution-records/${recordId}`,
    method: 'delete'
  })
}

/**
 * 批量删除执行记录
 * @param {Array} recordIds - 执行记录ID数组
 */
export function batchDeleteExecutionRecords(recordIds) {
  return request({
    url: '/execution-records/batch',
    method: 'delete',
    data: recordIds
  })
}

/**
 * 获取执行记录统计信息
 * @param {Object} params - 查询参数（同getExecutionRecords）
 */
export function getExecutionStatistics(params = {}) {
  return request({
    url: '/execution-records/statistics',
    method: 'get',
    params: {
      execution_scope: params.execution_scope,
      ref_id: params.ref_id,
      executed_by: params.executed_by,
      environment: params.environment,
      status: params.status,
      start_time_begin: params.start_time_begin,
      start_time_end: params.start_time_end
    }
  })
}

/**
 * 根据执行人查询执行记录
 * @param {Number} executedBy - 执行人ID
 * @param {Number} limit - 返回记录数量
 */
export function getExecutionRecordsByExecutor(executedBy, limit = 10) {
  return request({
    url: `/execution-records/executor/${executedBy}`,
    method: 'get',
    params: {
      limit: limit
    }
  })
}

// ==================== 接口测试执行相关接口 ====================

/**
 * 执行接口测试（同步或异步）
 * @param {Number} apiId - 接口ID
 * @param {Object} executeData - 执行配置
 * @param {String} executeData.environment - 执行环境标识（如: dev, test, prod）
 * @param {String} executeData.base_url - 覆盖接口的基础URL
 * @param {Number} executeData.timeout - 全局超时时间（秒）
 * @param {Object} executeData.auth_override - 认证信息覆盖配置
 * @param {Object} executeData.variables - 执行变量，用于参数化测试
 * @param {Boolean} executeData.async - 是否异步执行，默认: false
 * @param {String} executeData.callback_url - 异步执行完成后的回调URL
 * @param {Number} executeData.concurrency - 并发执行数，默认: 3
 * @param {Object} executeData.case_filter - 用例过滤条件
 * @param {String[]} executeData.case_filter.priority - 优先级过滤
 * @param {String[]} executeData.case_filter.tags - 标签过滤
 * @param {Boolean} executeData.case_filter.enabled_only - 是否只执行启用的用例，默认: true
 * @param {String} executeData.execution_order - 执行顺序（priority_desc/priority_asc/name_asc/name_desc）
 */
export function executeApiTest(apiId, executeData = {}) {
  // 根据执行模式设置不同的超时时间
  // 同步执行：需要等待所有用例执行完成，设置为5分钟
  // 异步执行：只是提交任务，使用默认超时即可
  const requestTimeout = executeData.async ? 10000 : 300000  // 异步10秒，同步5分钟
  
  return request({
    url: `/apis/${apiId}/execute`,
    method: 'post',
    timeout: requestTimeout,  // 覆盖全局超时设置
    data: {
      environment: executeData.environment,
      base_url: executeData.base_url,
      timeout: executeData.timeout,
      auth_override: executeData.auth_override,
      variables: executeData.variables,
      async: executeData.async || false,
      callback_url: executeData.callback_url,
      concurrency: executeData.concurrency || 3,
      case_filter: executeData.case_filter,
      execution_order: executeData.execution_order || 'priority_desc'
    }
  })
}

/**
 * 异步执行接口测试
 * @param {Number} apiId - 接口ID
 * @param {Object} executeData - 执行配置（同executeApiTest）
 */
export function executeApiTestAsync(apiId, executeData = {}) {
  return request({
    url: `/apis/${apiId}/execute-async`,
    method: 'post',
    timeout: 10000,  // 异步执行只是提交任务，使用默认超时即可
    data: {
      environment: executeData.environment,
      base_url: executeData.base_url,
      timeout: executeData.timeout,
      auth_override: executeData.auth_override,
      variables: executeData.variables,
      async: true,  // 强制异步
      callback_url: executeData.callback_url,
      concurrency: executeData.concurrency || 3,
      case_filter: executeData.case_filter,
      execution_order: executeData.execution_order || 'priority_desc'
    }
  })
}