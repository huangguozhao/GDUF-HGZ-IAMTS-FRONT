# API 命名规范修复文档

## 问题描述

创建接口时，前端提示"模块ID不能为空"，但前端日志显示 `moduleId = 1` 已正确传递。

### 错误日志
```
模块ID (formData.parentId): 1
转换后的数据: {api_code: undefined, name: 'test', ...}
创建接口响应: {code: -3, msg: '模块ID不能为空'}
```

## 根本原因

**前端使用下划线命名（snake_case），而后端期望驼峰命名（camelCase）！**

Java Spring Boot 默认使用驼峰命名进行 JSON 序列化/反序列化。

## 修复方案

### 1. 修改 createApi 函数

#### 修改前（下划线命名）
```javascript
export function createApi(moduleId, data) {
  return request({
    url: `/apis`,
    method: 'post',
    data: {
      module_id: moduleId,  // ❌ 错误：使用下划线
      api_code: data.api_code,
      base_url: data.base_url,
      request_parameters: data.request_parameters,
      // ...
    }
  })
}
```

#### 修改后（驼峰命名）
```javascript
export function createApi(moduleId, data) {
  const requestData = {
    moduleId: moduleId,  // ✅ 正确：使用驼峰
    apiCode: data.api_code || data.apiCode,
    name: data.name,
    method: data.method,
    path: data.path,
    baseUrl: data.base_url || data.baseUrl,
    description: data.description,
    precondition: data.precondition,
    requestParameters: data.request_parameters || data.requestParameters,
    requestHeaders: data.request_headers || data.requestHeaders,
    requestBody: data.request_body || data.requestBody,
    requestBodyType: data.request_body_type || data.requestBodyType || 'json',
    tags: data.tags || []
  }
  
  return request({
    url: `/apis`,
    method: 'post',
    data: requestData
  })
}
```

### 2. 修改 updateApi 函数

#### 修改后（驼峰命名）
```javascript
export function updateApi(apiId, data) {
  const requestData = {
    moduleId: data.module_id || data.moduleId,
    apiCode: data.api_code || data.apiCode,
    name: data.name,
    method: data.method,
    path: data.path,
    baseUrl: data.base_url || data.baseUrl,
    description: data.description,
    precondition: data.precondition,
    requestParameters: data.request_parameters || data.requestParameters,
    requestHeaders: data.request_headers || data.requestHeaders,
    requestBody: data.request_body || data.requestBody,
    requestBodyType: data.request_body_type || data.requestBodyType,
    tags: data.tags || []
  }
  
  return request({
    url: `/apis/${apiId}`,
    method: 'put',
    data: requestData
  })
}
```

## 字段映射表

| 前端字段（snake_case） | 后端字段（camelCase） | 说明 |
|---------------------|-------------------|------|
| module_id | moduleId | 模块ID |
| api_code | apiCode | 接口编码 |
| base_url | baseUrl | 基础URL |
| request_parameters | requestParameters | 请求参数定义 |
| request_headers | requestHeaders | 请求头定义 |
| request_body | requestBody | 请求体定义 |
| request_body_type | requestBodyType | 请求体类型 |

## 兼容性处理

为了兼容前端内部可能使用的不同命名风格，使用了 **双重兼容**：

```javascript
moduleId: data.module_id || data.moduleId
apiCode: data.api_code || data.apiCode
baseUrl: data.base_url || data.baseUrl
// ...
```

这样无论前端传递的是 `module_id` 还是 `moduleId`，都能正确映射到后端期望的 `moduleId`。

## CreateApiDTO 请求体示例

```json
{
  "moduleId": 1,
  "apiCode": "USER_LOGIN",
  "name": "用户登录",
  "method": "POST",
  "path": "/api/auth/login",
  "baseUrl": "http://api.example.com",
  "description": "用户登录接口",
  "precondition": "用户未登录",
  "requestParameters": {
    "type": "object",
    "properties": {
      "username": {"type": "string"},
      "password": {"type": "string"}
    }
  },
  "requestHeaders": {},
  "requestBody": {},
  "requestBodyType": "json",
  "tags": ["认证", "登录"]
}
```

## UpdateApiDTO 请求体示例

```json
{
  "moduleId": 1,
  "apiCode": "USER_LOGIN_V2",
  "name": "用户登录V2",
  "method": "POST",
  "path": "/api/auth/login",
  "baseUrl": "http://api.example.com",
  "description": "更新后的用户登录接口",
  "precondition": "用户未登录",
  "requestParameters": {},
  "requestHeaders": {},
  "requestBody": {},
  "requestBodyType": "json",
  "tags": ["认证", "登录", "v2"]
}
```

## 后端 Java DTO 定义（推测）

```java
public class CreateApiDTO {
    private Integer moduleId;  // 驼峰命名
    private String apiCode;
    private String name;
    private String method;
    private String path;
    private String baseUrl;
    private String description;
    private String precondition;
    private Object requestParameters;
    private Object requestHeaders;
    private Object requestBody;
    private String requestBodyType;
    private List<String> tags;
    
    // getters and setters
}
```

## 测试验证

### 测试步骤
1. 刷新页面（F5）
2. 右键点击"认证模块"，选择"新建接口"
3. 填写表单：
   - 接口名称：`测试驼峰命名`
   - 接口URL：`/api/test/camelcase`
   - 请求方法：`POST`
   - 接口描述：`测试驼峰命名修复`
4. 点击"确定"
5. 查看控制台日志

### 预期结果
```
=== createApi 函数 ===
moduleId 参数: 1
最终请求体 (驼峰命名): {
  moduleId: 1,
  apiCode: undefined,
  name: "测试驼峰命名",
  method: "POST",
  path: "/api/test/camelcase",
  description: "测试驼峰命名修复",
  requestBodyType: "json",
  tags: []
}
```

### 成功响应
```json
{
  "code": 1,
  "msg": "创建接口成功",
  "data": {
    "apiId": 123,
    "name": "测试驼峰命名",
    // ...
  }
}
```

## 相关文件

- ✅ `src/api/project.js` - 修改了 `createApi` 和 `updateApi` 函数
- `src/views/Cases.vue` - 调用方（无需修改）
- `src/utils/dataTransform.js` - 数据转换（暂时保持不变）

## 注意事项

1. **命名规范**：前端发送给后端的数据应使用 **驼峰命名（camelCase）**
2. **兼容性**：内部使用 `||` 运算符兼容两种命名风格
3. **日志调试**：添加了详细的 console.log 以便调试
4. **默认值**：为 `requestBodyType` 和 `tags` 提供了默认值

## 后续优化建议

### 1. 统一前端内部命名
考虑在前端内部也统一使用驼峰命名，避免混用：

```javascript
// 推荐
const apiData = {
  moduleId: 1,
  apiCode: 'TEST',
  baseUrl: 'http://...'
}

// 不推荐（混用）
const apiData = {
  module_id: 1,
  api_code: 'TEST',
  base_url: 'http://...'
}
```

### 2. 创建统一的字段映射函数
```javascript
export function mapToBackendFields(data) {
  return {
    moduleId: data.module_id || data.moduleId,
    apiCode: data.api_code || data.apiCode,
    // ... 其他字段
  }
}
```

### 3. 清理调试日志
功能稳定后，可以删除或条件化 console.log 语句。

## 总结

本次修复解决了前后端命名规范不一致的问题：
- ✅ 前端发送的请求体使用驼峰命名
- ✅ 兼容内部可能使用的下划线命名
- ✅ 添加了详细的调试日志
- ✅ 提供了默认值和容错处理

**关键要点**：Java Spring Boot 默认使用 Jackson 进行 JSON 序列化，字段名采用驼峰命名！

## 更新时间
2025-01-24

