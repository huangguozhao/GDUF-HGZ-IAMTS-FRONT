/**
 * 数据转换工具
 * 将后端返回的数据格式转换为前端需要的格式
 */

/**
 * 清理 request_override 中的 body 字段，移除不可见字符
 */
function cleanRequestOverride(requestOverride) {
  if (!requestOverride || typeof requestOverride !== 'object') {
    return requestOverride
  }
  
  // 深拷贝，避免修改原始对象
  const cleaned = JSON.parse(JSON.stringify(requestOverride))
  
  // 清理 body 字段
  if (cleaned.body) {
    if (typeof cleaned.body === 'string') {
      // 如果是字符串，清理后尝试重新解析为 JSON 对象
      const cleanedStr = cleaned.body.replace(/[\u200B-\u200D\uFEFF]/g, '').trim()
      try {
        cleaned.body = JSON.parse(cleanedStr)
      } catch (e) {
        // 如果不是有效 JSON，保持原样
        cleaned.body = cleanedStr
      }
    } else if (typeof cleaned.body === 'object') {
      // 如果是对象，递归清理其中的字符串值
      cleaned.body = cleanObjectStrings(cleaned.body)
    }
  }
  
  return cleaned
}

/**
 * 递归清理对象中的所有字符串值
 */
function cleanObjectStrings(obj) {
  if (!obj || typeof obj !== 'object') {
    return obj
  }
  
  const cleaned = Array.isArray(obj) ? [] : {}
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (typeof obj[key] === 'string') {
        cleaned[key] = obj[key].replace(/[\u200B-\u200D\uFEFF]/g, '').trim()
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        cleaned[key] = cleanObjectStrings(obj[key])
      } else {
        cleaned[key] = obj[key]
      }
    }
  }
  
  return cleaned
}

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
 * 转换模块数据（递归处理子模块）
 */
export function transformModule(module, projectName = null) {
  const transformed = {
    id: module.moduleId || module.module_id, // 兼容两种命名方式
    module_id: module.moduleId || module.module_id,
    name: module.name,
    description: module.description,
    module_code: module.moduleCode || module.module_code,
    project_id: module.projectId || module.project_id,
    project_name: module.projectName || module.project_name || projectName,
    projectName: module.projectName || module.project_name || projectName,
    parent_module_id: module.parentModuleId || module.parent_module_id,
    sort_order: module.sortOrder || module.sort_order,
    status: module.status,
    owner_info: module.ownerInfo || module.owner_info,
    creator_name: module.creatorName || module.creator_name,
    tags: module.tags || [],
    api_count: module.apiCount || module.api_count || 0,
    case_count: module.caseCount || module.case_count || 0,
    level: module.level || 1,
    path: module.path,
    created_time: module.createdAt || module.created_at,
    updated_time: module.updatedAt || module.updated_at,
    apis: [], // 默认为空，后续填充
    children: [] // 子模块，默认为空
  }
  
  // 递归处理子模块
  if (module.children && Array.isArray(module.children) && module.children.length > 0) {
    transformed.children = module.children.map(child => transformModule(child, transformed.project_name))
  }
  
  return transformed
}

/**
 * 转换接口数据
 */
export function transformApi(api) {
  return {
    id: api.apiId || api.api_id, // 兼容两种命名方式
    api_id: api.apiId || api.api_id, // 保留原始ID用于API调用
    module_id: api.moduleId || api.module_id,
    project_id: api.projectId || api.project_id,
    api_code: api.apiCode || api.api_code,
    name: api.name,
    url: api.path,
    path: api.path,
    full_url: api.fullUrl || api.full_url,
    base_url: api.baseUrl || api.base_url,
    baseUrl: api.baseUrl || api.base_url,
    method: api.method,
    description: api.description,
    status: api.status,
    version: api.version,
    auth_type: api.authType || api.auth_type,
    authType: api.authType || api.auth_type,
    auth_config: api.authConfig || api.auth_config,
    authConfig: api.authConfig || api.auth_config,
    request_parameters: api.requestParameters || api.request_parameters,
    requestParameters: api.requestParameters || api.request_parameters,
    path_parameters: api.pathParameters || api.path_parameters,
    pathParameters: api.pathParameters || api.path_parameters,
    request_headers: api.requestHeaders || api.request_headers,
    requestHeaders: api.requestHeaders || api.request_headers,
    request_body: api.requestBody || api.request_body,
    requestBody: api.requestBody || api.request_body,
    request_body_type: api.requestBodyType || api.request_body_type,
    requestBodyType: api.requestBodyType || api.request_body_type,
    response_body_type: api.responseBodyType || api.response_body_type,
    responseBodyType: api.responseBodyType || api.response_body_type,
    timeout_seconds: api.timeoutSeconds || api.timeout_seconds,
    timeoutSeconds: api.timeoutSeconds || api.timeout_seconds,
    tags: api.tags || [],
    examples: api.examples || [],
    creator_info: api.creatorInfo || api.creator_info,
    created_time: api.createdAt || api.created_at,
    updated_time: api.updatedAt || api.updated_at,
    // 添加项目名称和模块名称（如果后端返回）
    project_name: api.projectName || api.project_name,
    projectName: api.projectName || api.project_name,
    module_name: api.moduleName || api.module_name,
    moduleName: api.moduleName || api.module_name,
    precondition: api.precondition || api.pre_condition,
    pre_condition: api.precondition || api.pre_condition,
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
    caseId: testCase.caseId || testCase.case_id, // 保留驼峰命名
    case_code: testCase.caseCode || testCase.case_code,
    caseCode: testCase.caseCode || testCase.case_code,
    api_id: testCase.apiId || testCase.api_id,
    apiId: testCase.apiId || testCase.api_id,
    api_name: testCase.apiName || testCase.api_name,
    apiName: testCase.apiName || testCase.api_name,
    api_method: testCase.apiMethod || testCase.api_method,
    apiMethod: testCase.apiMethod || testCase.api_method,
    api_path: testCase.apiPath || testCase.api_path,
    apiPath: testCase.apiPath || testCase.api_path,
    module_id: testCase.moduleId || testCase.module_id,
    moduleId: testCase.moduleId || testCase.module_id,
    module_name: testCase.moduleName || testCase.module_name,
    moduleName: testCase.moduleName || testCase.module_name,
    project_id: testCase.projectId || testCase.project_id,
    projectId: testCase.projectId || testCase.project_id,
    project_name: testCase.projectName || testCase.project_name,
    projectName: testCase.projectName || testCase.project_name,
    name: testCase.name,
    description: testCase.description,
    priority: testCase.priority,
    severity: testCase.severity,
    test_type: testCase.testType || testCase.test_type,
    testType: testCase.testType || testCase.test_type,
    tags: testCase.tags || [],
    is_enabled: testCase.isEnabled !== undefined ? testCase.isEnabled : testCase.is_enabled,
    isEnabled: testCase.isEnabled !== undefined ? testCase.isEnabled : testCase.is_enabled,
    is_template: testCase.isTemplate !== undefined ? testCase.isTemplate : testCase.is_template,
    isTemplate: testCase.isTemplate !== undefined ? testCase.isTemplate : testCase.is_template,
    template_id: testCase.templateId || testCase.template_id,
    templateId: testCase.templateId || testCase.template_id,
    version: testCase.version,
    creator_info: testCase.creatorInfo || testCase.creator_info,
    creatorInfo: testCase.creatorInfo || testCase.creator_info,
    created_time: testCase.createdAt || testCase.created_at,
    createdAt: testCase.createdAt || testCase.created_at,
    updated_time: testCase.updatedAt || testCase.updated_at,
    updatedAt: testCase.updatedAt || testCase.updated_at,
    is_deleted: testCase.isDeleted || testCase.is_deleted,
    isDeleted: testCase.isDeleted || testCase.is_deleted,
    // 测试相关字段
    pre_conditions: testCase.preConditions || testCase.pre_conditions,
    preConditions: testCase.preConditions || testCase.pre_conditions,
    test_steps: testCase.testSteps || testCase.test_steps,
    testSteps: testCase.testSteps || testCase.test_steps,
    request_override: testCase.requestOverride || testCase.request_override,
    requestOverride: testCase.requestOverride || testCase.request_override,
    expected_http_status: testCase.expectedHttpStatus || testCase.expected_http_status,
    expectedHttpStatus: testCase.expectedHttpStatus || testCase.expected_http_status,
    expected_response_schema: testCase.expectedResponseSchema || testCase.expected_response_schema,
    expectedResponseSchema: testCase.expectedResponseSchema || testCase.expected_response_schema,
    expected_response_body: testCase.expectedResponseBody || testCase.expected_response_body,
    expectedResponseBody: testCase.expectedResponseBody || testCase.expected_response_body,
    assertions: testCase.assertions,
    extractors: testCase.extractors,
    validators: testCase.validators,
    // 执行相关字段
    status: testCase.status || 'not_executed',
    last_executed_time: testCase.lastExecutedTime || testCase.last_executed_time,
    lastExecutedTime: testCase.lastExecutedTime || testCase.last_executed_time,
    actual_status_code: testCase.actualStatusCode || testCase.actual_status_code,
    actualStatusCode: testCase.actualStatusCode || testCase.actual_status_code,
    actual_result: testCase.actualResult || testCase.actual_result,
    actualResult: testCase.actualResult || testCase.actual_result
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
  const data = {
    name: module.name,
    description: module.description,
    parent_module_id: module.parent_module_id || module.parentModuleId || null,
    sort_order: module.sort_order || module.sortOrder || 0,
    status: module.status || 'active',
    tags: module.tags || []
  }
  
  // 模块编码（如果有）
  if (module.module_code || module.moduleCode) {
    data.module_code = module.module_code || module.moduleCode
  }
  
  // 负责人ID（如果有）
  if (module.owner_id || module.ownerId) {
    data.owner_id = module.owner_id || module.ownerId
  }
  
  return data
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
    test_type: testCase.test_type || testCase.testType || 'functional',
    tags: testCase.tags || []
  }
  
  // 用例编码 - 支持驼峰和snake_case两种格式
  if (testCase.case_code) {
    data.case_code = testCase.case_code
  } else if (testCase.caseCode) {
    data.case_code = testCase.caseCode
  }
  
  // 处理请求参数 - 支持新旧两种方式
  // 优先使用可视化编辑器字段：override_query_params, override_path_params, override_headers, override_body
  if (testCase.override_query_params || testCase.override_path_params || testCase.override_headers || testCase.override_body) {
    const override = buildRequestOverrideFromForm(testCase)
    if (override) {
      data.request_override = override
    }
  } else if (testCase.request_override_str) {
    try {
      // 如果是字符串，解析为对象
      if (typeof testCase.request_override_str === 'string') {
        data.request_override = JSON.parse(testCase.request_override_str)
      } else {
        // 如果是对象（已被错误设置），直接使用
        data.request_override = testCase.request_override_str
      }
    } catch (e) {
      console.error('解析请求参数覆盖失败:', e)
    }
  } else if (testCase.request_override) {
    // 清理 request_override 中的 body 字段，移除不可见字符
    const cleanedOverride = cleanRequestOverride(testCase.request_override)
    if (cleanedOverride) {
      data.request_override = cleanedOverride
    }
  } else if (testCase.requestOverride) {
    // 清理 request_override 中的 body 字段
    const cleanedOverride = cleanRequestOverride(testCase.requestOverride)
    if (cleanedOverride) {
      data.request_override = cleanedOverride
    }
  }
  
  // 处理前置条件
  if (testCase.pre_conditions_str) {
    try {
      data.pre_conditions = JSON.parse(testCase.pre_conditions_str)
    } catch (e) {
      console.error('解析前置条件失败:', e)
    }
  } else if (testCase.pre_conditions) {
    data.pre_conditions = testCase.pre_conditions
  } else if (testCase.preConditions) {
    data.pre_conditions = testCase.preConditions
  }
  
  // 处理预期状态码 - 支持驼峰和snake_case
  if (testCase.expected_http_status) {
    data.expected_http_status = testCase.expected_http_status
  } else if (testCase.expectedHttpStatus) {
    data.expected_http_status = testCase.expectedHttpStatus
  } else if (testCase.expected_status_code) {
    data.expected_http_status = testCase.expected_status_code
  }
  
  // 处理预期响应 - 支持驼峰和snake_case
  if (testCase.expected_response_body) {
    data.expected_response_body = testCase.expected_response_body
  } else if (testCase.expectedResponseBody) {
    data.expected_response_body = testCase.expectedResponseBody
  }
  
  // 处理响应Schema
  if (testCase.expected_response_schema_str) {
    try {
      data.expected_response_schema = JSON.parse(testCase.expected_response_schema_str)
    } catch (e) {
      console.error('解析响应Schema失败:', e)
    }
  } else if (testCase.expected_response_schema) {
    data.expected_response_schema = testCase.expected_response_schema
  } else if (testCase.expectedResponseSchema) {
    data.expected_response_schema = testCase.expectedResponseSchema
  }
  
  // 处理验证规则 - 转换为断言数组
  if (testCase.validation_rules) {
    data.assertions = parseValidationRules(testCase.validation_rules)
  } else if (testCase.assertions) {
    data.assertions = testCase.assertions
  }
  
  // 测试步骤 - 支持驼峰和snake_case
  if (testCase.test_steps) {
    data.test_steps = testCase.test_steps
  } else if (testCase.testSteps) {
    data.test_steps = testCase.testSteps
  }
  
  // 提取器 - 支持驼峰和snake_case
  if (testCase.extractors) {
    data.extractors = testCase.extractors
  }
  
  // 验证器 - 支持驼峰和snake_case
  if (testCase.validators) {
    data.validators = testCase.validators
  }
  
  // 其他字段 - 支持驼峰和snake_case
  if (testCase.is_enabled !== undefined) {
    data.is_enabled = testCase.is_enabled
  } else if (testCase.isEnabled !== undefined) {
    data.is_enabled = testCase.isEnabled
  }
  
  if (testCase.is_template !== undefined) {
    data.is_template = testCase.is_template
  } else if (testCase.isTemplate !== undefined) {
    data.is_template = testCase.isTemplate
  }
  
  if (testCase.template_id) {
    data.template_id = testCase.template_id
  } else if (testCase.templateId) {
    data.template_id = testCase.templateId
  }
  
  if (testCase.version) {
    data.version = testCase.version
  }
  
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
  const projectNameMap = {}
  
  // 先建立项目名称映射
  projects.forEach(project => {
    projectNameMap[project.project_id] = project.name
  })
  
  modules.forEach(module => {
    if (!modulesByProject[module.project_id]) {
      modulesByProject[module.project_id] = []
    }
    const projectName = projectNameMap[module.project_id]
    modulesByProject[module.project_id].push(transformModule(module, projectName))
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

/**
 * 从表单数据构建请求参数覆盖对象（可视化编辑器用）
 */
export function buildRequestOverrideFromForm(formData) {
  const override = {}
  
  // 添加查询参数覆盖
  if (formData.override_query_params && formData.override_query_params.length > 0) {
    const validParams = formData.override_query_params.filter(p => p.name && p.name.trim())
    if (validParams.length > 0) {
      override.queryParams = validParams.map(p => ({
        name: p.name,
        value: p.value || '',
        description: p.description || ''
      }))
    }
  }
  
  // 添加路径参数覆盖
  if (formData.override_path_params && formData.override_path_params.length > 0) {
    const validParams = formData.override_path_params.filter(p => p.name && p.name.trim())
    if (validParams.length > 0) {
      override.pathParams = validParams.map(p => ({
        name: p.name,
        value: p.value || '',
        description: p.description || ''
      }))
    }
  }
  
  // 添加请求头覆盖
  if (formData.override_headers && formData.override_headers.length > 0) {
    const headers = {}
    formData.override_headers.forEach(h => {
      if (h.name && h.name.trim()) {
        headers[h.name] = h.value || ''
      }
    })
    if (Object.keys(headers).length > 0) {
      override.headers = headers
    }
  }
  
  // 添加请求体覆盖
  if (formData.override_body && formData.override_body.trim()) {
    try {
      // 清理输入内容，移除不可见字符
      const cleanedBody = formData.override_body.replace(/[\u200B-\u200D\uFEFF]/g, '').trim()
      override.body = JSON.parse(cleanedBody)
    } catch (e) {
      // 如果不是JSON，直接作为字符串
      override.body = formData.override_body
    }
  }
  
  // 如果没有覆盖内容，返回 null
  return Object.keys(override).length > 0 ? override : null
}

