# 测试用例导出后端接口规范文档

## 概述

本文档详细定义了测试用例导出功能的后端接口规范，包括请求参数、响应格式和数据字段命名规范。

## 接口列表

### 1. 导出单个测试用例

**接口地址：** `GET /test-cases/{caseId}/export`

**描述：** 导出指定ID的单个测试用例

**路径参数：**
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| caseId | Integer | 是 | 测试用例ID |

**查询参数：**
| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| format | String | 是 | json | 导出格式：excel, json, yaml, csv |
| include_steps | Boolean | 否 | true | 是否包含测试步骤 |
| include_assertions | Boolean | 否 | true | 是否包含断言规则 |
| include_extractors | Boolean | 否 | true | 是否包含提取规则 |
| include_history | Boolean | 否 | false | 是否包含执行历史 |

**请求示例：**
```http
GET /test-cases/123/export?format=excel&include_steps=true&include_assertions=true&include_extractors=true&include_history=false
```

**响应格式：**
- Content-Type: `application/octet-stream`
- Content-Disposition: `attachment; filename="TC_AUTH001_001_2025-10-23.xlsx"`

**响应体：** 文件二进制流

---

### 2. 批量导出测试用例

**接口地址：** `POST /test-cases/export`

**描述：** 按条件批量导出测试用例

**请求头：**
```
Content-Type: application/json
```

**请求体结构：**
```json
{
  "format": "excel",
  "case_ids": [1, 2, 3],
  "filter": {
    "project_id": 1,
    "module_id": 2,
    "api_id": 3,
    "priority": "P0",
    "severity": "high",
    "tags": ["登录", "认证"],
    "is_enabled": true,
    "creator_id": 10,
    "start_date": "2025-01-01",
    "end_date": "2025-12-31"
  },
  "options": {
    "include_steps": true,
    "include_assertions": true,
    "include_extractors": true,
    "include_history": false
  }
}
```

**请求体字段说明：**

#### 基本配置
| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| format | String | 是 | 导出格式：excel, json, yaml, csv |

#### 用例选择（二选一）
| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| case_ids | Integer[] | 否 | 指定要导出的用例ID数组 |
| filter | Object | 否 | 按条件筛选要导出的用例 |

#### filter 过滤条件
| 字段名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| project_id | Integer | 否 | 项目ID |
| module_id | Integer | 否 | 模块ID |
| api_id | Integer | 否 | 接口ID |
| priority | String | 否 | 优先级：P0, P1, P2, P3 |
| severity | String | 否 | 严重程度：critical, high, medium, low |
| tags | String[] | 否 | 标签数组 |
| is_enabled | Boolean | 否 | 是否启用 |
| creator_id | Integer | 否 | 创建人ID |
| start_date | String | 否 | 创建开始日期 (YYYY-MM-DD) |
| end_date | String | 否 | 创建结束日期 (YYYY-MM-DD) |

#### options 导出选项
| 字段名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| include_steps | Boolean | 否 | true | 是否包含测试步骤 |
| include_assertions | Boolean | 否 | true | 是否包含断言规则 |
| include_extractors | Boolean | 否 | true | 是否包含提取规则 |
| include_history | Boolean | 否 | false | 是否包含执行历史 |

**响应格式：**
- Content-Type: `application/octet-stream`
- Content-Disposition: `attachment; filename="test_cases_export_2025-10-23.xlsx"`

**响应体：** 文件二进制流

---

## 数据字段命名规范

### 测试用例基本字段（必须导出）

| 前端字段名 | 后端字段名 | 类型 | 说明 | 示例值 |
|-----------|-----------|------|------|--------|
| caseId | case_id | Integer | 用例ID | 123 |
| caseCode | case_code | String | 用例编码 | TC_AUTH001_001 |
| name | name | String | 用例名称 | 正常登录测试 |
| description | description | String | 用例描述 | 测试用户正常登录流程 |
| priority | priority | String | 优先级 | P0, P1, P2, P3 |
| severity | severity | String | 严重程度 | critical, high, medium, low |
| tags | tags | String[] | 标签 | ["登录", "认证"] |
| version | version | String | 版本号 | 1.0 |
| isEnabled | is_enabled | Boolean | 是否启用 | true |
| isTemplate | is_template | Boolean | 是否为模板 | false |
| templateId | template_id | Integer | 模板ID | null |

### 关联信息字段

| 前端字段名 | 后端字段名 | 类型 | 说明 | 示例值 |
|-----------|-----------|------|------|--------|
| apiId | api_id | Integer | 关联接口ID | 10 |
| apiName | api_name | String | 接口名称 | 用户登录接口 |
| apiPath | api_path | String | 接口路径 | /api/auth/login |
| apiMethod | api_method | String | 请求方法 | POST |
| moduleName | module_name | String | 模块名称 | 用户认证模块 |
| projectName | project_name | String | 项目名称 | 电商系统 |

### 创建信息字段

| 前端字段名 | 后端字段名 | 类型 | 说明 | 示例值 |
|-----------|-----------|------|------|--------|
| creatorInfo | creator_info | Object | 创建人信息 | {id: 1, name: "张三"} |
| createdAt | created_at | String | 创建时间 | 2025-10-23T10:30:00 |
| updatedAt | updated_at | String | 更新时间 | 2025-10-23T15:20:00 |
| updaterInfo | updater_info | Object | 更新人信息 | {id: 2, name: "李四"} |

### 测试配置字段

| 前端字段名 | 后端字段名 | 类型 | 说明 | 示例值 |
|-----------|-----------|------|------|--------|
| preConditions | pre_conditions | Object | 前置条件 | {"token": "xxx"} |
| requestOverride | request_override | Object | 请求参数覆盖 | {"username": "test"} |
| expectedHttpStatus | expected_http_status | Integer | 预期HTTP状态码 | 200 |
| expectedResponseBody | expected_response_body | Object | 预期响应体 | {"code": 1} |
| expectedResponseSchema | expected_response_schema | Object | 预期响应Schema | {...} |

### 测试步骤字段（可选）

**testSteps / test_steps (Array)**

| 前端字段名 | 后端字段名 | 类型 | 说明 | 示例值 |
|-----------|-----------|------|------|--------|
| stepNumber | step_number | Integer | 步骤序号 | 1 |
| operation | operation | String | 操作步骤 | 输入用户名和密码 |
| expected | expected | String | 预期结果 | 登录成功 |
| actual | actual | String | 实际结果 | 登录成功 |

**示例：**
```json
{
  "testSteps": [
    {
      "stepNumber": 1,
      "operation": "打开登录页面",
      "expected": "页面正常显示",
      "actual": ""
    },
    {
      "stepNumber": 2,
      "operation": "输入用户名和密码",
      "expected": "输入框正常接收",
      "actual": ""
    }
  ]
}
```

### 断言规则字段（可选）

**assertions (Array)**

| 前端字段名 | 后端字段名 | 类型 | 说明 | 示例值 |
|-----------|-----------|------|------|--------|
| type | type | String | 断言类型 | status_code, json_path, contains, response_time |
| path | path | String | JSON路径 | $.data.token |
| expression | expression | String | 表达式 | $.code |
| expected | expected | String | 预期值 | 1 |
| operator | operator | String | 操作符 | equals, contains, greater_than |

**示例：**
```json
{
  "assertions": [
    {
      "type": "status_code",
      "expected": "200",
      "operator": "equals"
    },
    {
      "type": "json_path",
      "expression": "$.code",
      "expected": "1",
      "operator": "equals"
    }
  ]
}
```

### 提取规则字段（可选）

**extractors (Array)**

| 前端字段名 | 后端字段名 | 类型 | 说明 | 示例值 |
|-----------|-----------|------|------|--------|
| name | name | String | 变量名 | user_token |
| expression | expression | String | 提取表达式 | $.data.token |
| description | description | String | 描述 | 提取用户登录Token |
| scope | scope | String | 作用域 | global, session |

**示例：**
```json
{
  "extractors": [
    {
      "name": "user_token",
      "expression": "$.data.token",
      "description": "提取用户登录Token",
      "scope": "global"
    }
  ]
}
```

### 执行历史字段（可选）

**executionHistory / execution_history (Array)**

| 前端字段名 | 后端字段名 | 类型 | 说明 | 示例值 |
|-----------|-----------|------|------|--------|
| recordId | record_id | Integer | 记录ID | 1001 |
| executionId | execution_id | String | 执行ID | EXE_20251023_001 |
| status | status | String | 执行状态 | passed, failed, skipped |
| startTime | start_time | String | 开始时间 | 2025-10-23T10:00:00 |
| endTime | end_time | String | 结束时间 | 2025-10-23T10:00:05 |
| duration | duration | Integer | 执行耗时(ms) | 5000 |
| executor | executor | String | 执行人 | 张三 |
| executorId | executor_id | Integer | 执行人ID | 1 |
| environment | environment | String | 执行环境 | dev, test, prod |
| errorMessage | error_message | String | 错误信息 | null |

**示例：**
```json
{
  "executionHistory": [
    {
      "recordId": 1001,
      "executionId": "EXE_20251023_001",
      "status": "passed",
      "startTime": "2025-10-23T10:00:00",
      "endTime": "2025-10-23T10:00:05",
      "duration": 5000,
      "executor": "张三",
      "executorId": 1,
      "environment": "dev",
      "errorMessage": null
    }
  ]
}
```

---

## 导出文件格式规范

### Excel 格式 (.xlsx)

**工作表结构：**

1. **基本信息** (Sheet 1)
   - 两列结构：字段名 | 值
   - 包含所有基本字段

2. **测试步骤** (Sheet 2, 可选)
   - 列：步骤序号 | 操作步骤 | 预期结果 | 实际结果

3. **断言规则** (Sheet 3, 可选)
   - 列：序号 | 断言类型 | JSON路径 | 表达式 | 预期值

4. **提取规则** (Sheet 4, 可选)
   - 列：序号 | 变量名 | 表达式 | 描述

5. **执行历史** (Sheet 5, 可选)
   - 列：序号 | 执行ID | 执行状态 | 开始时间 | 结束时间 | 执行耗时 | 执行人 | 执行环境

**文件命名：** `{caseCode}_{timestamp}.xlsx`  
**示例：** `TC_AUTH001_001_2025-10-23T16-30-45.xlsx`

### JSON 格式 (.json)

**结构：**
```json
{
  "caseCode": "TC_AUTH001_001",
  "caseName": "正常登录测试",
  "description": "测试用户正常登录流程",
  "priority": "P0",
  "severity": "high",
  "tags": ["登录", "认证"],
  "version": "1.0",
  "isEnabled": true,
  "apiInfo": {
    "apiId": 10,
    "apiName": "用户登录接口",
    "apiPath": "/api/auth/login",
    "apiMethod": "POST"
  },
  "creatorInfo": {
    "name": "张三",
    "id": 1
  },
  "createdAt": "2025-10-23T10:30:00",
  "updatedAt": "2025-10-23T15:20:00",
  "preConditions": {},
  "requestOverride": {},
  "expectedResponse": {
    "httpStatus": 200,
    "responseBody": {},
    "responseSchema": {}
  },
  "testSteps": [],
  "assertions": [],
  "extractors": [],
  "executionHistory": []
}
```

**文件命名：** `{caseCode}_{timestamp}.json`

### YAML 格式 (.yaml)

**结构：**
```yaml
# 测试用例导出
# 导出时间: 2025-10-23 16:30:45

# ==================== 基本信息 ====================
caseCode: TC_AUTH001_001
caseName: 正常登录测试
description: |
  测试用户正常登录流程
priority: P0
severity: high
version: 1.0
isEnabled: true
tags:
  - 登录
  - 认证

# ==================== 关联信息 ====================
api:
  id: 10
  name: 用户登录接口
  path: /api/auth/login
  method: POST

# ==================== 测试步骤 ====================
testSteps:
  - step: 1
    operation: 打开登录页面
    expected: 页面正常显示
```

**文件命名：** `{caseCode}_{timestamp}.yaml`

### CSV 格式 (.csv)

**结构：** 简化的二维表格，仅包含基本信息

```csv
"字段","值"
"用例编码","TC_AUTH001_001"
"用例名称","正常登录测试"
"用例描述","测试用户正常登录流程"
...
```

**文件命名：** `{caseCode}_{timestamp}.csv`

---

## 错误响应规范

当后端无法处理导出请求时，返回JSON错误信息：

**Content-Type:** `application/json`

```json
{
  "code": -5,
  "msg": "系统异常，请稍后重试",
  "data": null
}
```

**错误码说明：**

| 错误码 | 说明 | 示例消息 |
|--------|------|----------|
| -1 | 参数错误 | "导出格式不支持" |
| -2 | 用例不存在 | "测试用例不存在" |
| -3 | 权限不足 | "没有权限导出此用例" |
| -4 | 数据量过大 | "导出数据量超过限制" |
| -5 | 系统异常 | "系统异常，请稍后重试" |

---

## 实现建议

### 后端技术栈建议

**Java (Spring Boot):**
- Apache POI - Excel导出
- Jackson - JSON处理
- SnakeYAML - YAML处理
- OpenCSV - CSV导出

**Python (Django/Flask):**
- openpyxl - Excel导出
- json - JSON处理
- PyYAML - YAML处理
- csv - CSV导出

### 性能优化

1. **分页导出**：大量数据时使用分页
2. **异步处理**：超过1000条数据时使用异步任务
3. **压缩文件**：多个用例导出时使用ZIP压缩
4. **缓存**：相同条件的导出结果可以缓存5分钟

### 安全考虑

1. **权限验证**：验证用户是否有权限导出该用例
2. **数据脱敏**：导出时自动脱敏敏感信息
3. **文件大小限制**：单次导出不超过100MB
4. **频率限制**：同一用户每分钟最多导出10次

---

## 测试用例

### 测试场景1：导出单个用例（Excel）

**请求：**
```
GET /test-cases/123/export?format=excel&include_steps=true
```

**预期结果：**
- 返回Excel文件
- 包含基本信息和测试步骤工作表
- 文件名符合命名规范

### 测试场景2：批量导出（JSON）

**请求：**
```json
POST /test-cases/export
{
  "format": "json",
  "case_ids": [1, 2, 3],
  "options": {
    "include_steps": true,
    "include_assertions": true
  }
}
```

**预期结果：**
- 返回JSON文件
- 包含3个测试用例的完整信息
- JSON格式正确

### 测试场景3：错误处理

**请求：**
```
GET /test-cases/9999/export?format=excel
```

**预期结果：**
```json
{
  "code": -2,
  "msg": "测试用例不存在",
  "data": null
}
```

---

## 附录

### 完整的测试用例数据示例（JSON格式）

```json
{
  "caseId": 123,
  "caseCode": "TC_AUTH001_001",
  "caseName": "正常登录测试",
  "description": "测试用户使用正确的用户名和密码登录系统",
  "priority": "P0",
  "severity": "high",
  "tags": ["登录", "认证", "冒烟测试"],
  "version": "1.0",
  "isEnabled": true,
  "isTemplate": false,
  "templateId": null,
  
  "apiInfo": {
    "apiId": 10,
    "apiName": "用户登录接口",
    "apiPath": "/api/auth/login",
    "apiMethod": "POST",
    "moduleName": "用户认证模块",
    "projectName": "电商系统"
  },
  
  "creatorInfo": {
    "id": 1,
    "name": "张三",
    "email": "zhangsan@example.com"
  },
  "createdAt": "2025-10-23T10:30:00",
  "updatedAt": "2025-10-23T15:20:00",
  
  "preConditions": {
    "database_ready": true,
    "test_user_exists": true
  },
  
  "requestOverride": {
    "username": "testuser",
    "password": "Test@123"
  },
  
  "expectedResponse": {
    "httpStatus": 200,
    "responseBody": {
      "code": 1,
      "msg": "登录成功",
      "data": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "userId": 123,
        "username": "testuser"
      }
    },
    "responseSchema": {
      "type": "object",
      "properties": {
        "code": {"type": "number"},
        "msg": {"type": "string"},
        "data": {
          "type": "object",
          "required": ["token", "userId", "username"]
        }
      }
    }
  },
  
  "testSteps": [
    {
      "stepNumber": 1,
      "operation": "发送POST请求到/api/auth/login",
      "expected": "服务器正常响应",
      "actual": ""
    },
    {
      "stepNumber": 2,
      "operation": "验证响应状态码",
      "expected": "状态码为200",
      "actual": ""
    },
    {
      "stepNumber": 3,
      "operation": "验证响应数据",
      "expected": "返回token和用户信息",
      "actual": ""
    }
  ],
  
  "assertions": [
    {
      "type": "status_code",
      "expected": "200",
      "operator": "equals"
    },
    {
      "type": "json_path",
      "expression": "$.code",
      "expected": "1",
      "operator": "equals"
    },
    {
      "type": "json_path_exists",
      "path": "$.data.token"
    },
    {
      "type": "response_time",
      "expected": "2000",
      "operator": "less_than"
    }
  ],
  
  "extractors": [
    {
      "name": "user_token",
      "expression": "$.data.token",
      "description": "提取用户登录Token供后续用例使用",
      "scope": "global"
    },
    {
      "name": "user_id",
      "expression": "$.data.userId",
      "description": "提取用户ID",
      "scope": "session"
    }
  ],
  
  "executionHistory": [
    {
      "recordId": 1001,
      "executionId": "EXE_20251023_001",
      "status": "passed",
      "startTime": "2025-10-23T10:00:00",
      "endTime": "2025-10-23T10:00:05",
      "duration": 5000,
      "executor": "张三",
      "executorId": 1,
      "environment": "dev",
      "errorMessage": null
    },
    {
      "recordId": 1000,
      "executionId": "EXE_20251022_099",
      "status": "passed",
      "startTime": "2025-10-22T16:30:00",
      "endTime": "2025-10-22T16:30:04",
      "duration": 4500,
      "executor": "李四",
      "executorId": 2,
      "environment": "test",
      "errorMessage": null
    }
  ]
}
```

---

## 更新日志

| 版本 | 日期 | 说明 |
|------|------|------|
| 1.0 | 2025-10-23 | 初始版本，定义完整的导出接口规范 |

---

**文档维护者：** 前端开发团队  
**最后更新：** 2025-10-23

