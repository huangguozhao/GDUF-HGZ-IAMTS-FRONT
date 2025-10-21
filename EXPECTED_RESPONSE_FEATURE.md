# 测试用例预期响应功能说明

## 功能概述
在测试用例详情页面的"测试数据"部分下方添加了"预期响应"模块，用于展示测试用例期望得到的响应结果。

## 功能位置
```
测试用例详情页面
├── 面包屑导航
├── 用例标题
└── 内容区域
    ├── 左侧主要内容
    │   ├── 基本信息卡片
    │   ├── 测试步骤
    │   ├── 测试数据
    │   └── 预期响应 ← 新增模块
    └── 右侧辅助信息
```

## 预期响应内容

### 1. 状态码
- **显示方式**：绿色标签
- **数据来源**：
  - `testCase.expected_status_code`
  - `testCase.expected_http_status`
  - 默认值：200

### 2. 响应时间
- **显示方式**：文本显示
- **格式**：`< 2秒`
- **数据来源**：
  - `testCase.expected_response_time`
  - 默认值：`< 2秒`

### 3. 验证规则
- **显示方式**：蓝色标签组
- **数据来源**：
  - `testCase.assertions`（数组）
  - `testCase.validation_rules`（字符串）
  - 默认值：`['code = 0', 'msg = "success"', 'data != null']`
- **解析规则**：
  - status_code类型：`状态码 = 200`
  - json_path类型：`$.code = 0`
  - 字符串格式：`code=0, msg="success"`

### 4. 响应体
- **显示方式**：代码编辑器风格
- **数据来源**：
  - `testCase.expected_response_body`
  - `testCase.expected_response_schema`
  - 默认值：示例JSON对象
- **格式化**：自动格式化JSON

## 技术实现

### 数据结构
```javascript
{
  expected_status_code: 200,
  expected_response_time: '2秒',
  assertions: [
    {
      type: 'status_code',
      expected: 200
    },
    {
      type: 'json_path',
      expression: '$.code',
      expected: 0
    }
  ],
  validation_rules: 'code=0, msg="success"',
  expected_response_body: {
    code: 0,
    msg: 'success',
    data: {...}
  }
}
```

### 计算属性

#### 显示验证规则
```javascript
const displayValidationRules = computed(() => {
  // 从assertions解析
  if (testCase.assertions && Array.isArray(testCase.assertions)) {
    return testCase.assertions.map(assertion => {
      if (assertion.type === 'status_code') {
        return `状态码 = ${assertion.expected}`
      } else if (assertion.type === 'json_path') {
        return `${assertion.expression} = ${assertion.expected}`
      }
      return assertion.expression || assertion.field
    })
  }
  
  // 从validation_rules字符串解析
  if (testCase.validation_rules) {
    return testCase.validation_rules.split(',').map(r => r.trim())
  }
  
  // 默认值
  return ['code = 0', 'msg = "success"', 'data != null']
})
```

#### 格式化预期响应
```javascript
const formatExpectedResponse = () => {
  if (testCase.expected_response_body) {
    const parsed = typeof testCase.expected_response_body === 'string' 
      ? JSON.parse(testCase.expected_response_body)
      : testCase.expected_response_body
    return JSON.stringify(parsed, null, 2)
  }
  
  if (testCase.expected_response_schema) {
    const parsed = typeof testCase.expected_response_schema === 'string'
      ? JSON.parse(testCase.expected_response_schema)
      : testCase.expected_response_schema
    return JSON.stringify(parsed, null, 2)
  }
  
  // 默认响应
  return JSON.stringify({
    code: 0,
    msg: 'success',
    data: { userId: '12345', userName: '测试用户' }
  }, null, 2)
}
```

## 样式设计

### 整体布局
```css
.expected-response-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
```

### 响应项
```css
.response-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.response-item.full-width {
  flex-direction: column;  /* 响应体占满整行 */
}
```

### 验证规则标签
```css
.rule-tag {
  padding: 6px 12px;
  background: #f0f9ff;
  color: #409eff;
  border-radius: 4px;
  font-size: 13px;
  border: 1px solid #b3d8ff;
}
```

### 响应代码
```css
.response-code {
  width: 100%;
  background: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 12px;
  overflow-x: auto;
}

.response-code pre {
  margin: 0;
  font-family: 'Courier New', 'Monaco', 'Menlo', monospace;
  font-size: 13px;
  color: #303133;
  line-height: 1.6;
}
```

## 展示效果

### 预期响应卡片
```
┌─────────────────────────────────────────────┐
│ 预期响应                                    │
├─────────────────────────────────────────────┤
│ 状态码:    [200]                            │
│ 响应时间:  < 2秒                            │
│ 验证规则:  [code = 0] [msg = "success"]    │
│            [data != null]                   │
│ 响应体:                                     │
│ ┌─────────────────────────────────────────┐ │
│ │ {                                       │ │
│ │   "code": 0,                            │ │
│ │   "msg": "success",                     │ │
│ │   "data": {                             │ │
│ │     "userId": "12345",                  │ │
│ │     "userName": "测试用户"              │ │
│ │   }                                     │ │
│ │ }                                       │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

## 数据适配

### 支持的数据格式

#### 1. 状态码
- 字段：`expected_status_code` 或 `expected_http_status`
- 类型：Number
- 示例：`200`, `201`, `400`, `404`

#### 2. 验证规则（多种格式）

**格式1：assertions数组**
```json
{
  "assertions": [
    {
      "type": "status_code",
      "expected": 200
    },
    {
      "type": "json_path",
      "expression": "$.code",
      "expected": 0
    }
  ]
}
```

**格式2：validation_rules字符串**
```json
{
  "validation_rules": "code=0, msg=\"success\", data!=null"
}
```

#### 3. 响应体

**格式1：expected_response_body**
```json
{
  "expected_response_body": {
    "code": 0,
    "msg": "success",
    "data": {...}
  }
}
```

**格式2：expected_response_schema**
```json
{
  "expected_response_schema": {
    "type": "object",
    "properties": {...}
  }
}
```

## 使用场景

### 场景1：查看用例预期
```
点击测试用例 → 进入详情页 → 查看"预期响应"部分
```

### 场景2：对比实际响应
```
执行测试 → 查看实际响应 → 对比预期响应 → 分析差异
```

### 场景3：编辑预期响应
```
点击"编辑"按钮 → 修改预期响应 → 保存 → 重新测试
```

## 优势特点

### 1. 信息清晰
- 分项展示：状态码、响应时间、验证规则、响应体
- 可视化标签：不同类型使用不同颜色

### 2. 多格式支持
- 支持多种数据格式
- 自动解析和格式化
- 提供默认值

### 3. 代码展示
- 使用等宽字体
- JSON自动格式化
- 语法友好

### 4. 易于对比
- 清晰的结构
- 便于与实际结果对比
- 快速定位问题

## 后续优化建议

1. **响应对比**：添加预期vs实际的并排对比
2. **规则编辑**：在线编辑验证规则
3. **模板选择**：提供常用响应模板
4. **语法高亮**：JSON代码语法高亮
5. **折叠展开**：支持响应体的折叠展开
6. **复制功能**：一键复制预期响应
7. **Diff对比**：高亮显示差异部分

## 相关文件
- `src/components/cases/CaseDetail.vue` - 用例详情组件
- `src/views/Cases.vue` - 用例管理页面
- `src/utils/dataTransform.js` - 数据转换工具
