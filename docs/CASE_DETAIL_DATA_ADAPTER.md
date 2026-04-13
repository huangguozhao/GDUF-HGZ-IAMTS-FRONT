# 测试用例详情页面数据适配说明

## 功能更新
根据后端返回的实际数据格式，更新了测试用例详情页面（CaseDetail.vue），确保能正确展示后端数据。

## 后端数据格式

### 测试用例对象结构
```json
{
  "caseId": 1,
  "caseCode": "TC_AUTH001_001",
  "apiId": 1,
  "apiName": "用户登录",
  "apiMethod": "POST",
  "apiPath": "/api/auth/login",
  "moduleId": 1,
  "moduleName": "认证模块",
  "projectId": 1,
  "projectName": "PAMC Exchange Platform",
  "name": "正常登录测试",
  "description": "使用正确的用户名和密码登录",
  "priority": "P0",
  "severity": "critical",
  "preConditions": {
    "username": "johndoe",
    "password": "Test@123456"
  },
  "expectedHttpStatus": 200,
  "expectedResponseBody": "{\"code\": 200, \"message\": \"登录成功\", \"data\": {\"token\": \"*\", \"userId\": \"*\"}}",
  "isEnabled": true,
  "isTemplate": false,
  "version": "1.0",
  "creatorInfo": {
    "userId": 8,
    "name": "孙磊",
    "avatarUrl": "https://avatar.example.com/sun.jpg"
  },
  "createdAt": "2025-10-19T10:41:09",
  "updatedAt": "2025-10-19T10:41:09",
  "isDeleted": false
}
```

## 字段映射

### 1. 基本信息
| 前端字段 | 后端字段（驼峰） | 后端字段（下划线） | 说明 |
|---------|----------------|------------------|------|
| id | caseId | case_id | 用例ID |
| case_code | caseCode | case_code | 用例编码 |
| name | name | name | 用例名称 |
| description | description | description | 用例描述 |
| priority | priority | priority | 优先级 |
| severity | severity | severity | 严重程度 |
| version | version | version | 版本号 |
| created_time | createdAt | created_at | 创建时间 |
| updated_time | updatedAt | updated_at | 更新时间 |

### 2. 创建人信息
| 前端字段 | 后端字段 | 说明 |
|---------|---------|------|
| creator_name | creatorInfo.name | 创建人姓名 |
| creator_avatar | creatorInfo.avatarUrl | 创建人头像 |

### 3. 测试数据
| 前端字段 | 后端字段（驼峰） | 后端字段（下划线） | 说明 |
|---------|----------------|------------------|------|
| test_data | preConditions | pre_conditions | 测试数据对象 |

### 4. 预期响应
| 前端字段 | 后端字段（驼峰） | 后端字段（下划线） | 说明 |
|---------|----------------|------------------|------|
| expected_status_code | expectedHttpStatus | expected_http_status | 预期状态码 |
| expected_response_body | expectedResponseBody | expected_response_body | 预期响应体 |
| expected_response_schema | expectedResponseSchema | expected_response_schema | 预期响应Schema |

## 数据处理函数

### 1. 显示测试数据
```javascript
const displayTestData = computed(() => {
  // 优先使用 preConditions（驼峰命名）
  const data = props.testCase.preConditions 
    || props.testCase.pre_conditions 
    || props.testCase.request_override 
    || props.testCase.request_params
  
  if (data && typeof data === 'object') {
    return Object.entries(data).map(([key, value]) => ({
      label: key,
      value: typeof value === 'object' ? JSON.stringify(value) : String(value)
    }))
  }
  
  return []
})
```

### 2. 格式化预期响应
```javascript
const formatExpectedResponse = () => {
  const responseBody = props.testCase.expectedResponseBody 
    || props.testCase.expected_response_body
  
  if (responseBody) {
    try {
      const parsed = typeof responseBody === 'string' 
        ? JSON.parse(responseBody)
        : responseBody
      return JSON.stringify(parsed, null, 2)
    } catch (e) {
      return responseBody
    }
  }
  
  return JSON.stringify({ code: 200, message: '操作成功', data: null }, null, 2)
}
```

### 3. 获取创建人名称
```javascript
const getCreatorName = () => {
  if (props.testCase.creatorInfo && props.testCase.creatorInfo.name) {
    return props.testCase.creatorInfo.name
  }
  if (props.testCase.creator_info && props.testCase.creator_info.name) {
    return props.testCase.creator_info.name
  }
  return props.testCase.creator_name || '未知'
}
```

### 4. 格式化时间
```javascript
const formatTime = (time) => {
  if (!time) return '-'
  
  // ISO格式转换为本地时间
  if (typeof time === 'string' && time.includes('T')) {
    const date = new Date(time)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(/\//g, '-')
  }
  
  return time
}
```

### 5. 获取严重程度
```javascript
const getSeverityType = (severity) => {
  const typeMap = {
    'critical': 'danger',
    'high': 'warning',
    'medium': 'info',
    'low': ''
  }
  return typeMap[severity] || 'info'
}

const getSeverityText = (severity) => {
  const textMap = {
    'critical': '严重',
    'high': '高',
    'medium': '中',
    'low': '低'
  }
  return textMap[severity] || severity || '中'
}
```

### 6. 获取状态码标签类型
```javascript
const getStatusCodeType = (code) => {
  if (!code) return 'success'
  if (code >= 200 && code < 300) return 'success'  // 2xx - 绿色
  if (code >= 400 && code < 500) return 'warning'  // 4xx - 橙色
  if (code >= 500) return 'danger'                 // 5xx - 红色
  return 'info'
}
```

## 数据展示示例

### 基本信息卡片
```
┌─────────────────────────────────────┐
│ 优先级: [P0]     严重程度: [严重]   │
│ 创建人: 孙磊      版本: 1.0         │
│ 创建时间: 2025-10-19 10:41         │
│ 最后修改: 2025-10-19 10:41         │
└─────────────────────────────────────┘
```

### 测试数据
```
┌─────────────────────────────────────┐
│ 测试数据                            │
├─────────────────────────────────────┤
│ username:  johndoe                  │
│ password:  Test@123456              │
└─────────────────────────────────────┘
```

### 预期响应
```
┌─────────────────────────────────────┐
│ 预期响应                            │
├─────────────────────────────────────┤
│ 状态码:    [200]                    │
│ 响应时间:  < 2秒                    │
│ 响应体:                             │
│ {                                   │
│   "code": 200,                      │
│   "message": "登录成功",            │
│   "data": {                         │
│     "token": "*",                   │
│     "userId": "*"                   │
│   }                                 │
│ }                                   │
└─────────────────────────────────────┘
```

## 字段兼容性处理

### 双向兼容
所有数据获取都支持驼峰命名和下划线命名两种格式：

```javascript
// 示例：获取用例编码
testCase.caseCode || testCase.case_code || testCase.id

// 示例：获取创建时间
testCase.createdAt || testCase.created_at

// 示例：获取测试数据
testCase.preConditions || testCase.pre_conditions
```

## 优先级映射

### 标签颜色
```javascript
const getPriorityType = (priority) => {
  const typeMap = {
    'P0': 'danger',      // 红色
    'P1': 'danger',      // 红色
    'P2': 'warning',     // 橙色
    'P3': 'info',        // 灰色
    '高': 'danger',
    '中': 'warning',
    '低': 'info'
  }
  return typeMap[priority] || 'warning'
}
```

## 严重程度映射

### 标签颜色和文本
```javascript
// 类型
critical → danger (红色) → '严重'
high → warning (橙色) → '高'
medium → info (灰色) → '中'
low → '' (默认) → '低'
```

## 状态码颜色映射

### HTTP状态码
```javascript
200-299 → success (绿色)
400-499 → warning (橙色)
500-599 → danger (红色)
其他    → info (灰色)
```

## 时间格式转换

### ISO 8601格式转换
```
输入: "2025-10-19T10:41:09"
输出: "2025-10-19 10:41"
```

### 转换逻辑
```javascript
const date = new Date(time)
return date.toLocaleString('zh-CN', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit'
}).replace(/\//g, '-')
```

## 数据示例对比

### 示例1：正常登录测试
```json
{
  "name": "正常登录测试",
  "priority": "P0",
  "severity": "critical",
  "preConditions": {
    "username": "johndoe",
    "password": "Test@123456"
  },
  "expectedHttpStatus": 200,
  "expectedResponseBody": "{\"code\": 200, \"message\": \"登录成功\", \"data\": {\"token\": \"*\", \"userId\": \"*\"}}"
}
```

**展示效果：**
- 优先级：红色标签 "P0"
- 严重程度：红色标签 "严重"
- 测试数据：username / password
- 预期状态码：绿色标签 "200"
- 预期响应：格式化的JSON

### 示例2：密码错误测试
```json
{
  "name": "密码错误登录测试",
  "priority": "P0",
  "severity": "critical",
  "preConditions": {
    "username": "johndoe",
    "password": "WrongPassword"
  },
  "expectedHttpStatus": 401,
  "expectedResponseBody": "{\"code\": 401, \"message\": \"用户名或密码错误\"}"
}
```

**展示效果：**
- 优先级：红色标签 "P0"
- 严重程度：红色标签 "严重"
- 测试数据：username / password (WrongPassword)
- 预期状态码：橙色标签 "401"
- 预期响应：格式化的JSON

## 注意事项

1. **字段兼容**：同时支持驼峰和下划线两种命名
2. **JSON解析**：`expectedResponseBody` 是字符串，需要解析为JSON
3. **时间格式**：ISO 8601格式需要转换为本地时间
4. **空值处理**：所有字段都有默认值或占位符
5. **对象展开**：`preConditions` 是对象，需要展开为键值对

## 测试建议

### 测试用例1：正常登录
- 验证 `preConditions` 对象正确展开
- 验证状态码 200 显示绿色
- 验证响应体JSON正确格式化

### 测试用例2：密码错误
- 验证状态码 401 显示橙色
- 验证错误响应正确展示

### 测试用例3：空用户名
- 验证状态码 400 显示橙色
- 验证空值正确处理

## 相关文件
- `src/components/cases/CaseDetail.vue` - 用例详情组件
- `src/utils/dataTransform.js` - 数据转换工具
- `src/api/testCase.js` - 测试用例API
