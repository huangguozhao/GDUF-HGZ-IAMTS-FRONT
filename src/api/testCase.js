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
export function createTestCase(apiId, data) {
  return request({
    url: '/testcases',
    method: 'post',
    data: {
      api_id: apiId,
      case_code: data.case_code,
      name: data.name,
      description: data.description,
      priority: data.priority || 'P2',
      severity: data.severity || 'medium',
      tags: data.tags || [],
      pre_conditions: data.pre_conditions,
      test_steps: data.test_steps,
      request_override: data.request_override,
      expected_http_status: data.expected_http_status || 200,
      expected_response_schema: data.expected_response_schema,
      expected_response_body: data.expected_response_body,
      assertions: data.assertions,
      extractors: data.extractors,
      validators: data.validators,
      is_enabled: data.is_enabled !== undefined ? data.is_enabled : true,
      is_template: data.is_template || false,
      template_id: data.template_id
    }
  })
}

// 更新测试用例
export function updateTestCase(apiId, caseId, data) {
  return request({
    url: `/testcases/${caseId}`,
    method: 'put',
    data: {
      api_id: apiId,
      case_code: data.case_code,
      name: data.name,
      description: data.description,
      priority: data.priority,
      severity: data.severity,
      tags: data.tags,
      pre_conditions: data.pre_conditions,
      test_steps: data.test_steps,
      request_override: data.request_override,
      expected_http_status: data.expected_http_status,
      expected_response_schema: data.expected_response_schema,
      expected_response_body: data.expected_response_body,
      assertions: data.assertions,
      extractors: data.extractors,
      validators: data.validators,
      is_enabled: data.is_enabled,
      is_template: data.is_template,
      template_id: data.template_id,
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
