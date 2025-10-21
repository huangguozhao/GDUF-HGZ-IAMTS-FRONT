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
  return request({
    url: `/testcases/${caseId}`,
    method: 'put',
    data: {
      apiId: data.api_id,  // 后端期望的是apiId字段
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
export function deleteTestCase(apiId, caseId) {
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
  return request({
    url: `/test-cases/${caseId}/execute`,
    method: 'post',
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
