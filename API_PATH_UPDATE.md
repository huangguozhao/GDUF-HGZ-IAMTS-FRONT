# API路径更新文档

## 更新概述

根据后端实际的API接口规范（`ApiController.java`），更新了前端API调用路径和参数格式。

## 更新时间
2025-01-24

## 变更内容

### 1. 创建接口API

#### 修改前
```javascript
// POST /modules/{moduleId}/apis
export function createApi(moduleId, data) {
  return request({
    url: `/modules/${moduleId}/apis`,
    method: 'post',
    data: {
      api_code: data.api_code,
      name: data.name,
      method: data.method,
      path: data.path,
      // ... 其他字段
    }
  })
}
```

#### 修改后
```javascript
// POST /apis
export function createApi(moduleId, data) {
  return request({
    url: `/apis`,  // ✅ 路径变更
    method: 'post',
    data: {
      module_id: moduleId,  // ✅ moduleId 作为请求体字段
      api_code: data.api_code,
      name: data.name,
      method: data.method,
      path: data.path,
      base_url: data.base_url,
      description: data.description,
      request_parameters: data.request_parameters,
      request_headers: data.request_headers,
      request_body: data.request_body,
      request_body_type: data.request_body_type,
      tags: data.tags
    }
  })
}
```

**变更说明**：
- URL从 `/modules/{moduleId}/apis` 改为 `/apis`
- `moduleId` 从URL路径参数改为请求体中的 `module_id` 字段

### 2. 更新接口API

#### 修改前
```javascript
export function updateApi(apiId, data) {
  return request({
    url: `/apis/${apiId}`,
    method: 'put',
    data: {
      name: data.name,
      method: data.method,
      path: data.path,
      description: data.description,
      request_parameters: data.request_parameters,
      request_headers: data.request_headers,
      request_body: data.request_body,
      tags: data.tags
    }
  })
}
```

#### 修改后
```javascript
export function updateApi(apiId, data) {
  return request({
    url: `/apis/${apiId}`,
    method: 'put',
    data: {
      module_id: data.module_id,  // ✅ 新增
      api_code: data.api_code,  // ✅ 新增
      name: data.name,
      method: data.method,
      path: data.path,
      base_url: data.base_url,  // ✅ 新增
      description: data.description,
      precondition: data.precondition,  // ✅ 新增
      request_parameters: data.request_parameters,
      request_headers: data.request_headers,
      request_body: data.request_body,
      request_body_type: data.request_body_type,  // ✅ 新增
      tags: data.tags
    }
  })
}
```

**变更说明**：
- URL保持不变：`PUT /apis/{apiId}`
- 新增字段：`module_id`, `api_code`, `base_url`, `precondition`, `request_body_type`
- 支持更完整的接口信息更新

### 3. 其他API（已匹配）

以下API已经与后端路径匹配，无需修改：

#### 查询接口详情
```javascript
// GET /apis/{apiId} ✅
export function getApiById(apiId) {
  return request({
    url: `/apis/${apiId}`,
    method: 'get'
  })
}
```

#### 删除接口
```javascript
// DELETE /apis/{apiId} ✅
export function deleteApi(apiId) {
  return request({
    url: `/apis/${apiId}`,
    method: 'delete'
  })
}
```

## 后端API规范对照

### ApiController 端点

| 功能 | 方法 | 路径 | 权限 | 状态 |
|------|------|------|------|------|
| 创建接口 | POST | `/apis` | `api:create` | ✅ 已更新 |
| 更新接口 | PUT | `/apis/{apiId}` | `api:update` | ✅ 已更新 |
| 查询接口 | GET | `/apis/{apiId}` | `api:view` | ✅ 已匹配 |
| 查询接口列表 | GET | `/apis` | `api:view` | ❌ 未使用 |
| 删除接口 | DELETE | `/apis/{apiId}` | `api:delete` | ✅ 已匹配 |

**注意**: 查询接口列表功能前端使用的是 `GET /modules/{moduleId}/apis`，而不是 `GET /apis`。这是因为前端按模块加载接口，而后端的 `GET /apis` 是用于跨模块查询的。

## 请求体结构

### CreateApiDTO (创建接口)
```typescript
interface CreateApiDTO {
  module_id: number        // 所属模块ID
  api_code?: string        // 接口编码（可选）
  name: string            // 接口名称
  method: string          // 请求方法（GET/POST/PUT/DELETE）
  path: string            // 接口路径
  base_url?: string       // 基础URL
  description?: string    // 接口描述
  precondition?: string   // 前置条件
  request_parameters?: object  // 请求参数定义
  request_headers?: object     // 请求头定义
  request_body?: object        // 请求体定义
  request_body_type?: string   // 请求体类型（json/form/xml等）
  tags?: string[]         // 标签
}
```

### UpdateApiDTO (更新接口)
```typescript
interface UpdateApiDTO {
  module_id?: number      // 所属模块ID（支持移动接口）
  api_code?: string       // 接口编码
  name?: string          // 接口名称
  method?: string        // 请求方法
  path?: string          // 接口路径
  base_url?: string      // 基础URL
  description?: string   // 接口描述
  precondition?: string  // 前置条件
  request_parameters?: object
  request_headers?: object
  request_body?: object
  request_body_type?: string
  tags?: string[]
}
```

### ApiDTO (响应)
```typescript
interface ApiDTO {
  apiId: number
  moduleId: number
  projectId: number
  apiCode: string
  name: string
  method: string
  path: string
  baseUrl: string
  description: string
  precondition: string
  requestParameters: object
  requestHeaders: object
  requestBody: object
  requestBodyType: string
  tags: string[]
  status: string
  version: string
  creatorId: number
  creatorName: string
  createdAt: string
  updatedAt: string
}
```

## 错误响应码

根据后端 `ApiController` 的异常处理：

| 错误类型 | HTTP状态 | code | 示例消息 |
|---------|----------|------|---------|
| 参数错误 | 400 | -2 | "接口名称不能为空" |
| 参数错误 | 400 | -2 | "接口路径已存在" |
| 权限不足 | 403 | -4 | "权限不足" |
| 资源不存在 | 404 | -3 | "接口不存在" |
| 业务错误 | 400 | -5 | "接口存在测试用例，无法删除" |
| 服务器错误 | 500 | -5 | "系统异常，请稍后重试" |

## 影响范围

### 修改的文件
- ✅ `src/api/project.js` - 更新 `createApi` 和 `updateApi` 函数
- ✅ `CREATE_API_FEATURE.md` - 更新文档
- ✅ `API_DETAIL_SAVE_FEATURE.md` - 更新文档

### 不受影响的功能
- ✅ 删除接口（路径已匹配）
- ✅ 查询接口详情（路径已匹配）
- ✅ 按模块查询接口列表（使用独立路径）
- ✅ 所有其他模块和项目相关功能

## 测试清单

### 创建接口
- ✅ 正常创建接口
- ✅ 验证 `module_id` 正确传递
- ✅ 验证所有字段正确保存
- ✅ 错误处理：接口名称为空
- ✅ 错误处理：接口路径已存在

### 更新接口
- ✅ 正常更新接口信息
- ✅ 更新接口所属模块（修改 `module_id`）
- ✅ 验证 `precondition` 字段保存
- ✅ 错误处理：接口不存在
- ✅ 错误处理：权限不足

### 查询和删除
- ✅ 查询接口详情
- ✅ 删除接口
- ✅ 错误处理：接口存在测试用例时删除失败

## 兼容性说明

### 向后兼容
- ✅ 所有现有功能继续正常工作
- ✅ 数据转换逻辑保持不变
- ✅ 字段映射（url → path）继续有效

### 破坏性变更
无。本次更新只是调整了API调用方式，对用户和其他模块无影响。

## 相关文档

- `CREATE_API_FEATURE.md` - 新建接口功能文档
- `API_DETAIL_SAVE_FEATURE.md` - 接口详情保存功能文档
- `src/api/project.js` - API函数定义

## 注意事项

1. **模块ID传递方式**：创建接口时，`moduleId` 现在作为请求体字段 `module_id` 传递，而不是URL参数
2. **字段完整性**：更新接口时包含了更多字段，支持更完整的接口信息更新
3. **错误处理**：前端需要处理后端返回的各种错误类型，提供友好的用户提示
4. **权限检查**：后端进行权限验证，前端需要正确处理 403 错误

## 总结

本次更新确保了前端API调用与后端 `ApiController` 完全匹配，提供了更完整的接口管理功能，同时保持了良好的向后兼容性和用户体验。

