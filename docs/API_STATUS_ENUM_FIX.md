# API Status ENUM 字段修复文档

## 问题描述

创建接口时报错：数据库 `Apis` 表的 `status` 字段是 ENUM 类型，只支持特定的值，但代码中可能使用了不支持的值（如 `'draft'`）。

### 错误类型
- 数据库约束违反
- ENUM 值不匹配
- 可能的错误信息：`Data truncated for column 'status'` 或 `Invalid enum value`

## 数据库表定义

### Apis 表的 status 字段
```sql
CREATE TABLE Apis (
  ...
  status ENUM('active', 'inactive', 'deprecated') NOT NULL DEFAULT 'active',
  ...
);
```

**支持的值**：
- ✅ `'active'` - 活跃状态
- ✅ `'inactive'` - 非活跃状态
- ✅ `'deprecated'` - 已废弃
- ❌ `'draft'` - **不支持**（会导致错误）

## 修复方案

### 1. 修改 createApi 函数

在创建接口时，显式设置 `status` 为 `'active'`：

```javascript
// src/api/project.js
export function createApi(moduleId, data) {
  const requestData = {
    moduleId: moduleId,
    apiCode: data.api_code || data.apiCode,
    name: data.name,
    method: data.method,
    path: data.path,
    baseUrl: data.base_url || data.baseUrl,
    description: data.description,
    precondition: data.precondition,
    status: 'active',  // ✅ 显式设置为 active
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

在更新接口时，如果没有提供 `status`，默认使用 `'active'`：

```javascript
// src/api/project.js
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
    status: data.status || 'active',  // ✅ 默认为 active
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

## Status 字段说明

### 各状态的含义

| 状态值 | 中文名称 | 说明 | 使用场景 |
|--------|---------|------|---------|
| `active` | 活跃 | 接口正常使用中 | 新建接口默认状态 |
| `inactive` | 非活跃 | 接口暂时停用 | 临时停用接口 |
| `deprecated` | 已废弃 | 接口已过时，不建议使用 | 接口版本升级时 |

### 状态流转

```
创建接口 ──> active
            │
            ├──> inactive (临时停用)
            │      │
            │      └──> active (重新启用)
            │
            └──> deprecated (废弃)
```

## 前端状态管理建议

### 1. 如果需要添加状态选择功能

在创建/编辑接口表单中添加状态选择：

```vue
<el-form-item label="接口状态">
  <el-select v-model="formData.status" placeholder="请选择状态">
    <el-option label="活跃" value="active" />
    <el-option label="非活跃" value="inactive" />
    <el-option label="已废弃" value="deprecated" />
  </el-select>
</el-form-item>
```

### 2. 状态标签显示

在列表中显示状态标签：

```vue
<el-tag
  :type="getStatusTagType(api.status)"
  size="small"
>
  {{ getStatusText(api.status) }}
</el-tag>
```

```javascript
const getStatusTagType = (status) => {
  const typeMap = {
    'active': 'success',
    'inactive': 'info',
    'deprecated': 'warning'
  }
  return typeMap[status] || ''
}

const getStatusText = (status) => {
  const textMap = {
    'active': '活跃',
    'inactive': '非活跃',
    'deprecated': '已废弃'
  }
  return textMap[status] || status
}
```

### 3. 状态过滤

在接口列表中添加状态过滤：

```vue
<el-radio-group v-model="statusFilter">
  <el-radio-button label="">全部</el-radio-button>
  <el-radio-button label="active">活跃</el-radio-button>
  <el-radio-button label="inactive">非活跃</el-radio-button>
  <el-radio-button label="deprecated">已废弃</el-radio-button>
</el-radio-group>
```

## 后端建议（如适用）

### 1. 使用枚举类

```java
public enum ApiStatus {
    ACTIVE("active", "活跃"),
    INACTIVE("inactive", "非活跃"),
    DEPRECATED("deprecated", "已废弃");
    
    private final String code;
    private final String desc;
    
    // constructor, getters...
}
```

### 2. 默认值设置

在创建接口时，如果前端没有传递 `status`，后端应设置默认值：

```java
public ApiDTO createApi(CreateApiDTO dto, Integer userId) {
    Api api = new Api();
    // ... 设置其他字段
    api.setStatus(dto.getStatus() != null ? dto.getStatus() : "active");
    // ...
}
```

## 测试验证

### 测试步骤

1. **刷新页面**（F5）
2. **创建新接口**
   - 右键点击模块，选择"新建接口"
   - 填写表单并提交
3. **检查控制台日志**
   ```
   最终请求体 (驼峰命名): {
     moduleId: 1,
     status: "active",  // ✅ 应该看到这个
     // ... 其他字段
   }
   ```
4. **验证创建成功**
   - 应该收到成功响应
   - 新接口出现在列表中

### 预期结果

#### 成功的请求体
```json
{
  "moduleId": 1,
  "apiCode": "USER_LOGIN",
  "name": "用户登录",
  "method": "POST",
  "path": "/api/auth/login",
  "status": "active",
  "description": "用户登录接口",
  // ...其他字段
}
```

#### 成功的响应
```json
{
  "code": 1,
  "msg": "创建接口成功",
  "data": {
    "apiId": 123,
    "status": "active",
    // ...
  }
}
```

## 常见问题

### Q1: 如果后端返回的接口数据没有 status 字段怎么办？

**A**: 在数据转换函数中添加默认值：

```javascript
export function transformApi(api) {
  return {
    api_id: api.apiId || api.api_id,
    name: api.name,
    status: api.status || 'active',  // 添加默认值
    // ... 其他字段
  }
}
```

### Q2: 可以在前端自定义更多状态吗？

**A**: 不可以。必须先在数据库表定义中添加 ENUM 值：

```sql
ALTER TABLE Apis 
MODIFY COLUMN status 
ENUM('active', 'inactive', 'deprecated', 'draft') 
NOT NULL DEFAULT 'active';
```

然后才能在前端使用。

### Q3: 如何批量修改接口状态？

**A**: 实现批量更新功能：

```javascript
export function batchUpdateApiStatus(apiIds, status) {
  return request({
    url: `/apis/batch/status`,
    method: 'put',
    data: {
      apiIds: apiIds,
      status: status  // 必须是 'active', 'inactive', 或 'deprecated'
    }
  })
}
```

## 相关文件

- ✅ `src/api/project.js` - 添加了 `status` 字段
  - `createApi` - 默认设置为 `'active'`
  - `updateApi` - 支持传递或默认 `'active'`
- `src/utils/dataTransform.js` - 数据转换（如需要，可添加默认值）
- `src/components/cases/ApiDetail.vue` - 接口详情展示（可添加状态标签）
- `src/views/Cases.vue` - 接口列表（可添加状态过滤）

## 注意事项

1. **数据库约束**：`status` 字段只能是 `'active'`, `'inactive'`, `'deprecated'` 之一
2. **默认值**：新建接口默认使用 `'active'` 状态
3. **状态转换**：应该有业务逻辑控制状态转换（如已废弃的接口不能恢复为活跃）
4. **权限控制**：修改接口状态可能需要特定权限
5. **影响范围**：修改接口状态可能影响相关的测试用例执行

## 总结

本次修复解决了接口 status 字段 ENUM 值不匹配的问题：

- ✅ 创建接口时显式设置 `status: 'active'`
- ✅ 更新接口时支持传递状态或使用默认值
- ✅ 确保所有状态值都在数据库 ENUM 定义范围内
- ✅ 提供了完整的状态管理建议和最佳实践

**关键要点**：始终使用数据库支持的 ENUM 值！

## 更新时间
2025-01-24

