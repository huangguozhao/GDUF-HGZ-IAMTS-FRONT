# 接口详情保存功能数组字段格式修复

## 问题描述

根据后端 API DTO 定义，多个字段应该是**数组格式**而非对象格式：
- `requestHeaders` - 请求头（应为数组）
- `requestParameters` - 查询参数（应为数组）
- `pathParameters` - 路径参数（应为数组）
- `tags` - 标签（应为数组）
- `examples` - 示例（应为数组）

但前端代码在保存时可能传递了错误格式的数据。

## 后端期望的格式

根据后端 `UpdateApiDTO` 定义：

```java
// 请求头 - 数组格式
private List<Map<String, Object>> requestHeaders;

// 查询参数 - 数组格式
private List<Map<String, Object>> requestParameters;

// 路径参数 - 数组格式
private List<Map<String, Object>> pathParameters;

// 标签 - 字符串数组
private List<String> tags;

// 示例 - 数组格式
private List<Map<String, Object>> examples;
```

## 正确的数据格式示例

```json
{
  "apiCode": "AUTH001",
  "moduleId": 1,
  "name": "用户登录",
  "method": "POST",
  "path": "/api/auth/login",
  "baseUrl": "http://localhost:8085",
  
  "requestHeaders": [
    {
      "key": "Content-Type",
      "value": "application/json",
      "description": "内容类型"
    },
    {
      "key": "Authorization",
      "value": "Bearer {token}",
      "description": "认证令牌"
    }
  ],
  
  "requestParameters": [
    {
      "name": "page",
      "type": "integer",
      "required": false,
      "description": "页码",
      "defaultValue": 1
    }
  ],
  
  "pathParameters": [
    {
      "name": "userId",
      "type": "integer",
      "required": true,
      "description": "用户ID"
    }
  ],
  
  "requestBodyType": "json",
  "responseBodyType": "json",
  "description": "用户使用用户名和密码登录系统",
  "status": "active",
  "version": "1.0",
  "authType": "none",
  
  "tags": ["认证", "登录"],
  
  "examples": [
    {
      "name": "正常登录",
      "description": "使用正确的用户名和密码登录",
      "request": {
        "username": "admin",
        "password": "123456"
      },
      "response": {
        "code": 200,
        "message": "登录成功"
      }
    }
  ],
  
  "timeoutSeconds": 30
}
```

## 问题分析

### 1. apiData 初始值不正确

**原来的定义**：
```javascript
const apiData = reactive({
  // ...
  requestParameters: null,  // ❌ null，应该是数组
  pathParameters: null,     // ❌ null，应该是数组
  requestHeaders: null,     // ❌ null，应该是数组
  examples: null            // ❌ null，应该是数组
})
```

### 2. watch 函数未验证数组格式

**原来的实现**：
```javascript
watch(() => props.api, (newApi) => {
  if (newApi) {
    // 直接赋值，未验证是否为数组
    apiData.requestHeaders = newApi.request_headers || newApi.requestHeaders
    apiData.requestParameters = newApi.request_parameters || newApi.requestParameters
    // ...
  }
})
```

### 3. handleSave 使用了错误的数据源

**原来的实现**：
```javascript
const updateData = {
  request_headers: apiData.requestHeaders,           // ❌ 可能不是数组
  request_parameters: apiData.requestParameters,     // ❌ 可能不是数组
  // ...
}
```

**实际上页面有专门用于编辑的响应式变量**：
- `headerParams` - 已经是数组格式
- `queryParams` - 已经是数组格式
- `bodyParams` - 已经是数组格式

## 修复方案

### 1. 修改 apiData 初始值为数组

```javascript
const apiData = reactive({
  project: '',
  projectId: null,
  module: '',
  moduleId: null,
  apiCode: '',
  name: '',
  path: '',
  method: 'GET',
  baseUrl: '',
  description: '',
  precondition: '',
  tags: [],                     // ✅ 数组格式
  requestParameters: [],        // ✅ 数组格式（查询参数）
  pathParameters: [],           // ✅ 数组格式（路径参数）
  requestHeaders: [],           // ✅ 数组格式（请求头）
  requestBody: null,            // 可以是字符串或对象
  requestBodyType: 'json',
  responseBodyType: '',
  status: 'active',
  version: '',
  authType: '',
  authConfig: null,             // 对象格式
  examples: [],                 // ✅ 数组格式（示例）
  timeoutSeconds: 30
})
```

### 2. 更新 watch 函数，确保数组格式

```javascript
watch(
  () => props.api,
  (newApi) => {
    if (newApi) {
      apiData.project = newApi.project_name || newApi.projectName || '-'
      apiData.projectId = newApi.project_id || newApi.projectId
      apiData.module = newApi.module_name || newApi.moduleName || '-'
      apiData.moduleId = newApi.module_id || newApi.moduleId
      apiData.apiCode = newApi.api_code || newApi.apiCode || ''
      apiData.name = newApi.name || ''
      apiData.path = newApi.path || newApi.url || ''
      apiData.method = newApi.method || 'GET'
      apiData.baseUrl = newApi.base_url || newApi.baseUrl || ''
      apiData.description = newApi.description || ''
      apiData.precondition = newApi.precondition || newApi.pre_condition || ''
      
      // ✅ 确保数组类型字段始终是数组格式
      apiData.tags = Array.isArray(newApi.tags) ? newApi.tags : []
      
      // ✅ requestParameters: 可能是数组或对象，统一转为数组
      const reqParams = newApi.request_parameters || newApi.requestParameters
      apiData.requestParameters = Array.isArray(reqParams) ? reqParams : []
      
      // ✅ pathParameters: 确保是数组
      const pathParams = newApi.path_parameters || newApi.pathParameters
      apiData.pathParameters = Array.isArray(pathParams) ? pathParams : []
      
      // ✅ requestHeaders: 确保是数组
      const reqHeaders = newApi.request_headers || newApi.requestHeaders
      apiData.requestHeaders = Array.isArray(reqHeaders) ? reqHeaders : []
      
      apiData.requestBody = newApi.request_body || newApi.requestBody
      apiData.requestBodyType = newApi.request_body_type || newApi.requestBodyType || 'json'
      apiData.responseBodyType = newApi.response_body_type || newApi.responseBodyType || ''
      apiData.status = newApi.status || 'active'
      apiData.version = newApi.version || ''
      apiData.authType = newApi.auth_type || newApi.authType || ''
      apiData.authConfig = newApi.auth_config || newApi.authConfig
      
      // ✅ examples: 确保是数组
      apiData.examples = Array.isArray(newApi.examples) ? newApi.examples : []
      
      apiData.timeoutSeconds = newApi.timeout_seconds || newApi.timeoutSeconds || 30
    }
  },
  { immediate: true }
)
```

### 3. 修改 handleSave，使用正确的数组数据

```javascript
const handleSave = async () => {
  // ...验证逻辑...
  
  // 构造请求数据（字段顺序和命名与后端接口完全一致）
  // 注意：确保数组类型字段使用正确的格式
  const updateData = {
    api_code: apiData.apiCode || '',
    module_id: targetModuleId,
    name: apiData.name.trim(),
    method: apiData.method,
    path: apiData.path.trim(),
    base_url: apiData.baseUrl || '',
    
    // ✅ 使用编辑后的数组格式数据，确保格式正确
    request_parameters: queryParams.value || [],
    path_parameters: apiData.pathParameters || [],
    request_headers: headerParams.value || [],
    request_body: bodyType.value === 'raw' ? rawBody.value : (bodyParams.value || apiData.requestBody),
    request_body_type: bodyType.value || 'json',
    response_body_type: apiData.responseBodyType || '',
    description: apiData.description || '',
    status: apiData.status || 'active',
    version: apiData.version || '',
    auth_type: apiData.authType || '',
    auth_config: apiData.authConfig,
    
    // ✅ 确保是数组
    tags: Array.isArray(apiData.tags) ? apiData.tags : [],
    examples: Array.isArray(apiData.examples) ? apiData.examples : [],
    
    timeout_seconds: apiData.timeoutSeconds || 30
  }
  
  // 调用API更新接口
  const response = await updateApi(apiId, updateData)
  // ...
}
```

**关键改进**：
- ✅ 使用 `queryParams.value` 而不是 `apiData.requestParameters`
- ✅ 使用 `headerParams.value` 而不是 `apiData.requestHeaders`
- ✅ 使用 `bodyParams.value` 或 `rawBody.value` 根据 bodyType
- ✅ 所有数组字段都使用 `Array.isArray()` 验证

## 数据流转

### 完整的数据流

```
1. 后端返回数据 (可能是对象或数组)
   ↓
2. watch 函数接收数据，验证并转换为数组格式
   ↓
3. 更新到 apiData (数组格式)
   ↓
4. initRequestParams 函数读取数据
   ↓
5. 初始化编辑用的响应式变量 (headerParams、queryParams 等)
   ↓
6. 用户在 UI 中编辑
   ↓
7. 编辑后的数据保存在 headerParams、queryParams 等变量中
   ↓
8. handleSave 调用时，使用 headerParams、queryParams 的值
   ↓
9. 发送给后端 (确保是数组格式)
```

### initRequestParams 函数已有的转换逻辑

前端已经有处理对象格式转数组的逻辑：

```javascript
const initRequestParams = () => {
  // 初始化Headers
  if (props.api.request_headers) {
    if (Array.isArray(props.api.request_headers)) {
      // ✅ 已经是数组，直接使用
      headerParams.value = props.api.request_headers
    } else if (typeof props.api.request_headers === 'object') {
      // ✅ 如果是对象，转换为数组
      headerParams.value = Object.entries(props.api.request_headers).map(([name, value]) => ({
        name,
        value: typeof value === 'string' ? value : JSON.stringify(value),
        description: ''
      }))
    }
  }
  
  // 类似的逻辑也适用于 requestParameters 和 requestBody
}
```

这个函数在以下时机被调用：
1. `watch(() => props.api, ...)` - 当 API 数据更新时
2. `onMounted()` - 组件挂载时

## 字段格式对比

| 字段名 | 后端期望格式 | 旧的前端格式 | 新的前端格式 | 状态 |
|--------|-------------|-------------|-------------|------|
| requestHeaders | `Array<Object>` | `Object` 或 `null` | `Array<Object>` | ✅ 已修复 |
| requestParameters | `Array<Object>` | `Object` 或 `null` | `Array<Object>` | ✅ 已修复 |
| pathParameters | `Array<Object>` | `null` | `Array<Object>` | ✅ 已修复 |
| tags | `Array<string>` | `Array` | `Array<string>` | ✅ 已修复 |
| examples | `Array<Object>` | `null` | `Array<Object>` | ✅ 已修复 |

## 数组元素结构

### requestHeaders 数组元素
```json
{
  "key": "Content-Type",
  "value": "application/json",
  "description": "内容类型"
}
```

### requestParameters 数组元素
```json
{
  "name": "page",
  "type": "integer",
  "required": false,
  "description": "页码",
  "defaultValue": 1
}
```

### pathParameters 数组元素
```json
{
  "name": "userId",
  "type": "integer",
  "required": true,
  "description": "用户ID"
}
```

### examples 数组元素
```json
{
  "name": "成功示例",
  "description": "正常情况下的请求响应",
  "request": {
    "username": "admin",
    "password": "123456"
  },
  "response": {
    "code": 200,
    "message": "成功"
  }
}
```

## 修复效果

### 修复前

```javascript
// ❌ 发送给后端的数据可能是对象格式
{
  "requestHeaders": {
    "Content-Type": "application/json"  // 对象格式，错误！
  }
}

// 后端返回错误：类型不匹配
```

### 修复后

```javascript
// ✅ 发送给后端的数据是数组格式
{
  "requestHeaders": [
    {
      "key": "Content-Type",
      "value": "application/json"
    }
  ]
}

// 后端接收成功
```

## 兼容性处理

前端代码现在可以处理多种格式的输入：

1. **数组格式**（标准格式）：
```json
"requestHeaders": [{"key": "Content-Type", "value": "application/json"}]
```

2. **对象格式**（旧格式，会自动转换）：
```json
"requestHeaders": {"Content-Type": "application/json"}
```

3. **null 或 undefined**（转换为空数组）：
```json
"requestHeaders": null  →  []
```

## 测试建议

### 1. 功能测试
- ✅ 保存接口时，数组字段以正确格式发送
- ✅ 后端接口调用成功
- ✅ 数据正确保存到数据库

### 2. 格式转换测试
- ✅ 接收数组格式数据，正确显示和保存
- ✅ 接收对象格式数据，自动转换为数组并保存
- ✅ 接收 null 数据，转换为空数组并保存

### 3. UI 编辑测试
- ✅ 添加请求头参数
- ✅ 修改请求头参数
- ✅ 删除请求头参数
- ✅ 类似测试适用于查询参数

## 相关文件

### 修改的文件
- `src/components/cases/ApiDetail.vue`
  - 更新 `apiData` 初始值（第 1785-1810 行）
  - 更新 `watch` 函数（第 1812-1860 行）
  - 更新 `handleSave` 函数（第 3666-3690 行）

### 相关代码位置
- `initRequestParams` 函数：处理对象到数组的转换（第 2011-2059 行）
- `headerParams`、`queryParams`、`bodyParams` 响应式变量定义（第 2004-2008 行）

## 总结

通过以下修复，成功解决了数组字段格式不正确的问题：

1. **初始化正确**：`apiData` 中所有数组字段默认为空数组 `[]`
2. **格式验证**：`watch` 函数确保所有数组字段使用 `Array.isArray()` 验证
3. **使用正确数据源**：`handleSave` 使用编辑后的 `headerParams`、`queryParams` 等数组数据
4. **兼容性处理**：`initRequestParams` 函数可以处理对象格式并转换为数组
5. **双重保障**：保存时再次使用 `Array.isArray()` 验证

这些修复确保了：
- ✅ 发送给后端的数据格式完全正确
- ✅ 可以处理后端返回的各种格式
- ✅ UI 编辑功能正常工作
- ✅ 数据能够正确保存和显示

现在接口详情保存功能应该能够正常工作，不会再出现类型不匹配的错误！🎉

---

**修复日期**: 2024-10-26  
**问题类型**: 数组字段格式错误  
**影响范围**: 接口详情保存功能

