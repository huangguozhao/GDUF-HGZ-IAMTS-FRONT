# 测试用例详情页字段更新说明

## 更新日期
2025-10-21

## 更新内容

### 新增展示字段

在测试用例详情页面（`CaseDetail.vue`）中新增了以下字段的展示：

#### 1. 用例描述（description）
- **位置**：基本信息卡片之后
- **展示条件**：当 `testCase.description` 有值时显示
- **样式**：独立的 section-card，带标题"用例描述"
- **字段来源**：后端返回的 `description` 字段

#### 2. 标签（tags）
- **位置**：用例描述之后
- **展示条件**：当有标签时显示
- **样式**：使用 Element Plus 的 `el-tag` 组件，灰色主题
- **字段来源**：后端返回的 `tags` 字段（JSON数组格式）
- **支持格式**：
  - 数组格式：`["tag1", "tag2"]`
  - JSON字符串格式：会自动解析

#### 3. 预期响应Schema（expected_response_schema）
- **位置**：预期响应部分的响应体之后
- **展示条件**：当 `expectedResponseSchema` 或 `expected_response_schema` 有值时显示
- **样式**：与响应体相同，使用代码块展示
- **格式化**：自动格式化JSON，缩进2个空格
- **字段来源**：后端返回的 `expectedResponseSchema` 字段

#### 4. 响应提取规则（extractors）
- **位置**：预期响应部分之后，独立的section
- **展示条件**：当有提取规则时显示
- **样式**：卡片列表形式，每个提取器包含：
  - 提取器名称（extractor.name）
  - 提取变量标签（绿色tag）
  - 表达式（extractor.expression）
  - 描述（extractor.description）
- **字段来源**：后端返回的 `extractors` 字段（JSON数组格式）
- **示例数据格式**：
  ```json
  [
    {
      "name": "order_id",
      "expression": "$.orderId",
      "description": "提取订单ID"
    },
    {
      "name": "order_amount", 
      "expression": "$.totalAmount",
      "description": "提取订单金额"
    }
  ]
  ```

#### 5. 请求参数覆盖（request_override）
- **处理方式**：已在"测试数据"部分展示
- **优先级**：`preConditions` > `pre_conditions` > `request_override` > `request_params`
- **字段来源**：后端返回的 `preConditions` 或 `requestOverride` 字段

## 技术实现

### 1. 新增计算属性

在 `CaseDetail.vue` 的 `<script setup>` 部分添加了以下计算属性：

```javascript
// 显示标签
const displayTags = computed(() => {
  const tags = props.testCase.tags
  
  if (tags && Array.isArray(tags)) {
    return tags
  }
  
  if (typeof tags === 'string') {
    try {
      const parsed = JSON.parse(tags)
      return Array.isArray(parsed) ? parsed : []
    } catch (e) {
      return []
    }
  }
  
  return []
})

// 显示提取器
const displayExtractors = computed(() => {
  const extractors = props.testCase.extractors
  
  if (extractors && Array.isArray(extractors)) {
    return extractors
  }
  
  if (typeof extractors === 'string') {
    try {
      const parsed = JSON.parse(extractors)
      return Array.isArray(parsed) ? parsed : []
    } catch (e) {
      return []
    }
  }
  
  return []
})

// 是否有预期响应Schema
const hasExpectedResponseSchema = computed(() => {
  return !!(props.testCase.expectedResponseSchema || props.testCase.expected_response_schema)
})
```

### 2. 新增方法

```javascript
// 格式化预期响应Schema
const formatExpectedResponseSchema = () => {
  const responseSchema = props.testCase.expectedResponseSchema 
    || props.testCase.expected_response_schema
  
  if (responseSchema) {
    try {
      const parsed = typeof responseSchema === 'string'
        ? JSON.parse(responseSchema)
        : responseSchema
      return JSON.stringify(parsed, null, 2)
    } catch (e) {
      return responseSchema
    }
  }
  
  return ''
}
```

### 3. 新增样式

添加了以下CSS样式类：

- `.description-text` - 用例描述文本样式
- `.tags-container` - 标签容器
- `.tag-item` - 标签项
- `.extractors-list` - 提取器列表
- `.extractor-item` - 提取器项
- `.extractor-header` - 提取器头部
- `.extractor-name` - 提取器名称
- `.extractor-expression` - 提取器表达式区域
- `.expression-label` - 表达式标签
- `.expression-code` - 表达式代码
- `.extractor-description` - 提取器描述

### 4. 数据转换更新

更新了 `src/utils/dataTransform.js` 中的 `transformTestCase` 函数，确保：
- 同时支持驼峰命名（camelCase）和下划线命名（snake_case）
- 所有新增字段都能正确转换
- 保留了向后兼容性

## 后端API响应示例

测试用例详情API应返回以下字段：

```json
{
  "caseId": 1,
  "name": "正常登录测试",
  "description": "使用正确的用户名和密码登录",
  "tags": ["登录", "认证", "P0"],
  "expectedResponseSchema": {
    "type": "object",
    "properties": {
      "code": { "type": "number" },
      "msg": { "type": "string" },
      "data": { "type": "object" }
    }
  },
  "extractors": [
    {
      "name": "token",
      "expression": "$.data.token",
      "description": "提取登录token"
    }
  ],
  "preConditions": {
    "username": "testuser",
    "password": "Test@123"
  },
  "expectedHttpStatus": 200,
  "expectedResponseBody": "{\"code\":1,\"msg\":\"登录成功\",\"data\":{\"*\"}}",
  "assertions": [
    {
      "type": "status_code",
      "expected": 200
    },
    {
      "path": "$.code",
      "type": "json_path",
      "expected": "1"
    }
  ],
  ...其他字段
}
```

## 兼容性说明

- 所有新增字段都是可选的，如果后端不返回相应字段，前端会优雅地隐藏对应的展示区域
- 支持驼峰命名和下划线命名两种格式
- 支持JSON对象和JSON字符串两种格式
- 向后兼容现有的所有功能

## 测试建议

1. 测试有description字段时的展示
2. 测试无description字段时的展示（应该隐藏）
3. 测试tags为数组格式时的展示
4. 测试tags为JSON字符串时的展示
5. 测试tags为空或不存在时的展示
6. 测试expectedResponseSchema的JSON格式化
7. 测试extractors数组的展示
8. 测试extractors中有/无description的情况

## 相关文件

- `src/components/cases/CaseDetail.vue` - 测试用例详情组件
- `src/utils/dataTransform.js` - 数据转换工具
- `src/api/testCase.js` - 测试用例API接口

