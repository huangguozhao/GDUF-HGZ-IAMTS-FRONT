# 测试用例API路径修复说明

## 问题描述
前端请求测试用例的API路径与后端接口文档不匹配，导致请求失败。

## 问题分析

### 前端请求的URL
```
http://localhost:5173/api/apis/1/test-cases?page=1&page_size=100
```

### 后端接口文档规范
根据接口文档，测试用例的API路径应该是：
```
GET /testcases
```

## 修复方案

### 1. 更新API路径 (`src/api/testCase.js`)

#### 修改前
```javascript
export function getTestCasesByApi(apiId, params = {}) {
  return request({
    url: `/apis/${apiId}/test-cases`,
    method: 'get',
    params: {
      name: params.name,
      priority: params.priority,
      severity: params.severity,
      is_enabled: params.is_enabled,
      is_template: params.is_template,
      tags: params.tags,
      created_by: params.created_by,
      page: params.page || 1,
      page_size: params.pageSize || 10
    }
  })
}
```

#### 修改后
```javascript
export function getTestCasesByApi(apiId, params = {}) {
  return request({
    url: '/testcases',
    method: 'get',
    params: {
      api_id: apiId,
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
```

### 2. 更新其他相关API函数

#### 创建测试用例
```javascript
// 修改前
export function createTestCase(apiId, data) {
  return request({
    url: `/apis/${apiId}/test-cases`,
    method: 'post',
    data: { ... }
  })
}

// 修改后
export function createTestCase(apiId, data) {
  return request({
    url: '/testcases',
    method: 'post',
    data: {
      api_id: apiId,
      ...data
    }
  })
}
```

#### 更新测试用例
```javascript
// 修改前
export function updateTestCase(apiId, caseId, data) {
  return request({
    url: `/apis/${apiId}/test-cases/${caseId}`,
    method: 'put',
    data: { ... }
  })
}

// 修改后
export function updateTestCase(apiId, caseId, data) {
  return request({
    url: `/testcases/${caseId}`,
    method: 'put',
    data: {
      api_id: apiId,
      ...data
    }
  })
}
```

#### 删除测试用例
```javascript
// 修改前
export function deleteTestCase(apiId, caseId) {
  return request({
    url: `/apis/${apiId}/test-cases/${caseId}`,
    method: 'delete'
  })
}

// 修改后
export function deleteTestCase(apiId, caseId) {
  return request({
    url: `/testcases/${caseId}`,
    method: 'delete'
  })
}
```

### 3. 增强数据转换函数 (`src/utils/dataTransform.js`)

#### 更新测试用例数据转换
```javascript
export function transformTestCase(testCase) {
  return {
    id: testCase.caseId || testCase.case_id,
    case_id: testCase.caseId || testCase.case_id,
    case_code: testCase.caseCode || testCase.case_code,
    api_id: testCase.apiId || testCase.api_id,
    api_name: testCase.apiName || testCase.api_name,
    api_method: testCase.apiMethod || testCase.api_method,
    api_path: testCase.apiPath || testCase.api_path,
    module_id: testCase.moduleId || testCase.module_id,
    module_name: testCase.moduleName || testCase.module_name,
    project_id: testCase.projectId || testCase.project_id,
    project_name: testCase.projectName || testCase.project_name,
    name: testCase.name,
    description: testCase.description,
    priority: testCase.priority,
    severity: testCase.severity,
    tags: testCase.tags || [],
    is_enabled: testCase.isEnabled !== undefined ? testCase.isEnabled : testCase.is_enabled,
    is_template: testCase.isTemplate !== undefined ? testCase.isTemplate : testCase.is_template,
    template_id: testCase.templateId || testCase.template_id,
    version: testCase.version,
    creator_info: testCase.creatorInfo || testCase.creator_info,
    created_time: testCase.createdAt || testCase.created_at,
    updated_time: testCase.updatedAt || testCase.updated_at,
    is_deleted: testCase.isDeleted || testCase.is_deleted,
    // 测试相关字段
    pre_conditions: testCase.preConditions || testCase.pre_conditions,
    test_steps: testCase.testSteps || testCase.test_steps,
    request_override: testCase.requestOverride || testCase.request_override,
    expected_http_status: testCase.expectedHttpStatus || testCase.expected_http_status,
    expected_response_schema: testCase.expectedResponseSchema || testCase.expected_response_schema,
    expected_response_body: testCase.expectedResponseBody || testCase.expected_response_body,
    assertions: testCase.assertions,
    extractors: testCase.extractors,
    validators: testCase.validators,
    // 执行相关字段
    status: testCase.status || 'not_executed',
    last_executed_time: testCase.lastExecutedTime || testCase.last_executed_time,
    actual_status_code: testCase.actualStatusCode || testCase.actual_status_code,
    actual_result: testCase.actualResult || testCase.actual_result
  }
}
```

## 修复内容

### 1. API路径统一
- 所有测试用例相关API都使用 `/testcases` 作为基础路径
- 通过 `api_id` 参数来过滤特定接口的测试用例

### 2. 参数规范化
- 添加了完整的查询参数支持
- 支持排序、分页、过滤等功能
- 兼容后端接口文档的所有参数

### 3. 数据转换增强
- 支持更多字段的映射
- 兼容驼峰命名和下划线命名
- 添加了关联信息（项目、模块、接口）的映射

## 预期结果

修复后，测试用例API请求应该能够成功：

1. **✅ 正确的API路径**：`GET /testcases?api_id=1&page=1&page_size=100`
2. **✅ 完整的参数支持**：支持所有后端接口文档中的参数
3. **✅ 数据正确转换**：后端返回的数据能正确转换为前端格式
4. **✅ 测试用例列表显示**：接口下的测试用例列表正确显示

## 验证步骤

1. 重启前端开发服务器
2. 访问用例管理页面
3. 点击项目加载模块
4. 点击模块加载接口
5. 点击接口加载测试用例
6. 检查测试用例列表是否正确显示
7. 检查测试用例信息是否完整

## 相关文件

- `src/api/testCase.js` - 测试用例API接口定义
- `src/utils/dataTransform.js` - 数据转换函数
- `src/views/Cases.vue` - 用例管理页面

## 注意事项

1. **API路径一致性**：确保所有测试用例相关API都使用统一的路径规范
2. **参数传递**：确保 `api_id` 参数正确传递到后端
3. **数据格式**：确保后端返回的数据格式与前端期望一致
4. **错误处理**：添加适当的错误处理机制

## 后续优化建议

1. **API文档同步**：确保前端API调用与后端接口文档保持同步
2. **类型定义**：添加TypeScript类型定义
3. **参数验证**：添加前端参数验证
4. **缓存机制**：实现测试用例数据缓存
