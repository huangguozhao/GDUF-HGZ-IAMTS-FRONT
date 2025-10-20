/**
 * 数据转换工具
 * 将后端返回的数据格式转换为前端需要的格式
 */

/**
 * 转换项目数据
 */
export function transformProject(project) {
  return {
    id: project.projectId || project.project_id, // 兼容两种命名方式
    project_id: project.projectId || project.project_id,
    name: project.name,
    description: project.description,
    created_time: project.createdAt || project.created_at,
    updated_time: project.updatedAt || project.updated_at,
    modules: [] // 默认为空，后续填充
  }
}

/**
 * 转换模块数据
 */
export function transformModule(module) {
  return {
    id: module.moduleId || module.module_id, // 兼容两种命名方式
    module_id: module.moduleId || module.module_id,
    name: module.name,
    description: module.description,
    module_code: module.moduleCode || module.module_code,
    project_id: module.projectId || module.project_id,
    parent_module_id: module.parentModuleId || module.parent_module_id,
    sort_order: module.sortOrder || module.sort_order,
    status: module.status,
    owner_info: module.ownerInfo || module.owner_info,
    tags: module.tags || [],
    api_count: module.apiCount || module.api_count || 0,
    case_count: module.caseCount || module.case_count || 0,
    level: module.level || 1,
    path: module.path,
    created_time: module.createdAt || module.created_at,
    updated_time: module.updatedAt || module.updated_at,
    apis: [] // 默认为空，后续填充
  }
}

/**
 * 转换接口数据
 */
export function transformApi(api) {
  return {
    id: api.apiId || api.api_id, // 兼容两种命名方式
    api_id: api.apiId || api.api_id, // 保留原始ID用于API调用
    module_id: api.moduleId || api.module_id,
    name: api.name,
    url: api.path,
    path: api.path,
    full_url: api.fullUrl || api.full_url,
    method: api.method,
    description: api.description,
    api_code: api.apiCode || api.api_code,
    status: api.status,
    version: api.version,
    auth_type: api.authType || api.auth_type,
    auth_config: api.authConfig || api.auth_config,
    request_parameters: api.requestParameters || api.request_parameters,
    request_headers: api.requestHeaders || api.request_headers,
    request_body: api.requestBody || api.request_body,
    request_body_type: api.requestBodyType || api.request_body_type,
    response_body_type: api.responseBodyType || api.response_body_type,
    timeout_seconds: api.timeoutSeconds || api.timeout_seconds,
    tags: api.tags || [],
    examples: api.examples || [],
    creator_info: api.creatorInfo || api.creator_info,
    created_time: api.createdAt || api.created_at,
    updated_time: api.updatedAt || api.updated_at,
    cases: [] // 默认为空，后续填充
  }
}

/**
 * 转换测试用例数据
 */
export function transformTestCase(testCase) {
  return {
    id: testCase.caseId || testCase.case_id, // 兼容两种命名方式
    case_id: testCase.caseId || testCase.case_id, // 保留原始ID用于API调用
    api_id: testCase.apiId || testCase.api_id,
    name: testCase.name,
    description: testCase.description,
    api_url: testCase.apiPath || testCase.api_path || '',
    request_params: testCase.requestOverride ? JSON.stringify(testCase.requestOverride) : (testCase.request_override ? JSON.stringify(testCase.request_override) : ''),
    expected_status_code: testCase.expectedHttpStatus || testCase.expected_http_status || 200,
    validation_rules: formatAssertions(testCase.assertions),
    priority: testCase.priority,
    severity: testCase.severity,
    tags: testCase.tags || [],
    is_enabled: testCase.isEnabled !== undefined ? testCase.isEnabled : testCase.is_enabled,
    is_template: testCase.isTemplate !== undefined ? testCase.isTemplate : testCase.is_template,
    version: testCase.version,
    status: testCase.lastExecutionStatus || testCase.last_execution_status || 'not_executed',
    last_executed_time: testCase.lastExecutedAt || testCase.last_executed_at || null,
    created_time: testCase.createdAt || testCase.created_at,
    updated_time: testCase.updatedAt || testCase.updated_at,
    creator_name: testCase.creatorName || testCase.creator_name,
    // 额外字段
    actual_status_code: testCase.actualHttpStatus || testCase.actual_http_status,
    actual_result: testCase.actualResponseBody || testCase.actual_response_body,
    pre_conditions: testCase.preConditions || testCase.pre_conditions,
    test_steps: testCase.testSteps || testCase.test_steps,
    assertions: testCase.assertions,
    extractors: testCase.extractors,
    validators: testCase.validators
  }
}

/**
 * 格式化断言规则为易读的字符串
 */
function formatAssertions(assertions) {
  if (!assertions || !Array.isArray(assertions)) return ''
  
  return assertions.map(assertion => {
    if (assertion.type === 'status_code') {
      return `status=${assertion.expected}`
    } else if (assertion.type === 'json_path') {
      return `${assertion.expression}=${assertion.expected}`
    }
    return ''
  }).filter(Boolean).join(', ')
}

/**
 * 反向转换 - 将前端数据转换为后端格式
 */

export function transformProjectToBackend(project) {
  return {
    name: project.name,
    description: project.description
  }
}

export function transformModuleToBackend(module) {
  return {
    module_code: module.module_code,
    name: module.name,
    description: module.description,
    parent_module_id: module.parent_module_id || null
  }
}

export function transformApiToBackend(api) {
  return {
    api_code: api.api_code,
    name: api.name,
    method: api.method,
    path: api.url || api.path,
    description: api.description,
    tags: api.tags || []
  }
}

export function transformTestCaseToBackend(testCase) {
  const data = {
    name: testCase.name,
    description: testCase.description,
    priority: testCase.priority || 'P2',
    severity: testCase.severity || 'medium',
    tags: testCase.tags || []
  }
  
  // 处理请求参数
  if (testCase.request_params) {
    try {
      data.request_override = typeof testCase.request_params === 'string' 
        ? JSON.parse(testCase.request_params)
        : testCase.request_params
    } catch (e) {
      console.error('解析请求参数失败:', e)
    }
  }
  
  // 处理预期状态码
  if (testCase.expected_status_code) {
    data.expected_http_status = testCase.expected_status_code
  }
  
  // 处理验证规则 - 转换为断言数组
  if (testCase.validation_rules) {
    data.assertions = parseValidationRules(testCase.validation_rules)
  } else if (testCase.assertions) {
    data.assertions = testCase.assertions
  }
  
  // 其他字段
  if (testCase.is_enabled !== undefined) data.is_enabled = testCase.is_enabled
  if (testCase.is_template !== undefined) data.is_template = testCase.is_template
  if (testCase.version) data.version = testCase.version
  if (testCase.pre_conditions) data.pre_conditions = testCase.pre_conditions
  if (testCase.test_steps) data.test_steps = testCase.test_steps
  if (testCase.extractors) data.extractors = testCase.extractors
  if (testCase.validators) data.validators = testCase.validators
  
  return data
}

/**
 * 解析验证规则字符串为断言数组
 * 例如: "code=0, msg="success"" => [{ type: 'json_path', expression: '$.code', expected: 0 }, ...]
 */
function parseValidationRules(rules) {
  if (!rules) return []
  
  const assertions = []
  const parts = rules.split(',').map(p => p.trim())
  
  parts.forEach(part => {
    const match = part.match(/^(.+?)=(.+)$/)
    if (match) {
      const [, key, value] = match
      assertions.push({
        type: 'json_path',
        expression: `$.${key.trim()}`,
        expected: isNaN(value.trim()) ? value.trim().replace(/"/g, '') : Number(value.trim())
      })
    }
  })
  
  return assertions
}

/**
 * 构建项目树形结构
 * 将扁平的数据组装成树形结构
 */
export function buildProjectTree(projects, modules, apis, testCases) {
  // 先将模块按项目分组
  const modulesByProject = {}
  modules.forEach(module => {
    if (!modulesByProject[module.project_id]) {
      modulesByProject[module.project_id] = []
    }
    modulesByProject[module.project_id].push(transformModule(module))
  })
  
  // 将接口按模块分组
  const apisByModule = {}
  apis.forEach(api => {
    if (!apisByModule[api.module_id]) {
      apisByModule[api.module_id] = []
    }
    apisByModule[api.module_id].push(transformApi(api))
  })
  
  // 将测试用例按接口分组
  const casesByApi = {}
  testCases.forEach(testCase => {
    if (!casesByApi[testCase.api_id]) {
      casesByApi[testCase.api_id] = []
    }
    casesByApi[testCase.api_id].push(transformTestCase(testCase))
  })
  
  // 组装树形结构
  return projects.map(project => {
    const transformedProject = transformProject(project)
    transformedProject.modules = (modulesByProject[project.project_id] || []).map(module => {
      module.apis = (apisByModule[module.module_id] || []).map(api => {
        api.cases = casesByApi[api.api_id] || []
        return api
      })
      return module
    })
    return transformedProject
  })
}

