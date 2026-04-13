# 测试用例编辑表单优化文档

## 修改概述

优化了 `Cases.vue` 中测试用例编辑表单的功能，实现以下改进：
1. **用例编码字段只读**：编辑时禁止修改用例编码
2. **完整数据加载**：编辑时正确加载并渲染所有标签页的真实数据

## 详细修改

### 1. 用例编码字段只读

**修改位置**：`src/views/Cases.vue` - 表单模板部分

**修改内容**：
```vue
<el-form-item label="用例编码" prop="case_code">
  <el-input 
    v-model="formData.case_code" 
    placeholder="留空则自动生成"
    :disabled="isEdit"  <!-- 新增：编辑时禁用 -->
  />
  <span class="form-tip" v-if="!isEdit">用例编码在接口内唯一，留空则自动生成</span>
  <span class="form-tip" v-else>用例编码创建后不可修改</span>  <!-- 新增：编辑时显示不同提示 -->
</el-form-item>
```

**功能说明**：
- 新建用例时：用例编码字段可编辑，留空自动生成
- 编辑用例时：用例编码字段禁用，不允许修改
- 动态提示文字根据编辑/新建状态显示不同的说明

### 2. 完整数据加载

**修改位置**：`src/views/Cases.vue` - `handleEditCase` 函数

#### 2.1 JSON 字段处理

处理需要在对象和字符串之间转换的字段：

```javascript
// 1. 前置条件（pre_conditions）
let preConditionsStr = ''
if (testCase.pre_conditions || testCase.preConditions) {
  const preConditions = testCase.pre_conditions || testCase.preConditions
  preConditionsStr = typeof preConditions === 'string' 
    ? preConditions 
    : JSON.stringify(preConditions, null, 2)
}

// 2. 请求参数覆盖（request_override）
let requestOverrideStr = ''
if (testCase.request_override || testCase.requestOverride) {
  const requestOverride = testCase.request_override || testCase.requestOverride
  requestOverrideStr = typeof requestOverride === 'string' 
    ? requestOverride 
    : JSON.stringify(requestOverride, null, 2)
}

// 3. 预期响应体（expected_response_body）
let expectedResponseBody = ''
if (testCase.expected_response_body || testCase.expectedResponseBody) {
  const responseBody = testCase.expected_response_body || testCase.expectedResponseBody
  expectedResponseBody = typeof responseBody === 'string' 
    ? responseBody 
    : JSON.stringify(responseBody, null, 2)
}

// 4. 响应Schema（expected_response_schema）
let expectedResponseSchemaStr = ''
if (testCase.expected_response_schema || testCase.expectedResponseSchema) {
  const responseSchema = testCase.expected_response_schema || testCase.expectedResponseSchema
  expectedResponseSchemaStr = typeof responseSchema === 'string' 
    ? responseSchema 
    : JSON.stringify(responseSchema, null, 2)
}
```

**处理逻辑**：
- 兼容驼峰命名和下划线命名两种字段名
- 如果字段已经是字符串，直接使用
- 如果字段是对象，使用 `JSON.stringify` 格式化为字符串（带缩进）

#### 2.2 数组字段深拷贝

对数组类型字段进行深拷贝，避免直接修改原始数据：

```javascript
// 深拷贝数组字段，避免直接修改原始数据
const testSteps = testCase.test_steps || testCase.testSteps || []
const tags = testCase.tags || []
const assertions = testCase.assertions || []
const extractors = testCase.extractors || []
const validators = testCase.validators || []

// 在表单数据中使用深拷贝
test_steps: JSON.parse(JSON.stringify(testSteps)),
tags: JSON.parse(JSON.stringify(tags)),
assertions: JSON.parse(JSON.stringify(assertions)),
extractors: JSON.parse(JSON.stringify(extractors)),
validators: JSON.parse(JSON.stringify(validators)),
```

**为什么需要深拷贝**：
- 防止表单编辑时直接修改原始用例数据
- 取消编辑时不会影响原始数据
- 保证数据的独立性和安全性

#### 2.3 完整字段映射

加载所有标签页的数据：

| 标签页 | 字段 | 类型 | 说明 |
|--------|------|------|------|
| **基本信息** | name | String | 用例名称 |
| | case_code | String | 用例编码（只读） |
| | description | String | 用例描述 |
| | priority | String | 优先级（P0/P1/P2/P3） |
| | severity | String | 严重程度 |
| | tags | Array | 标签（深拷贝） |
| | version | String | 版本号 |
| | is_enabled | Boolean | 是否启用 |
| | is_template | Boolean | 是否为模板 |
| **测试步骤** | test_steps | Array | 测试步骤列表（深拷贝） |
| **请求参数** | pre_conditions_str | String | 前置条件（JSON字符串） |
| | request_override_str | String | 请求参数覆盖（JSON字符串） |
| **预期响应** | expected_http_status | Number | 预期HTTP状态码 |
| | expected_response_body | String | 预期响应体（JSON字符串） |
| | expected_response_schema_str | String | 响应Schema（JSON字符串） |
| **断言规则** | assertions | Array | 断言列表（深拷贝） |
| **提取规则** | extractors | Array | 提取器列表（深拷贝） |

## 字段命名兼容性

为了兼容后端可能使用的不同命名风格，代码中同时支持：

### 驼峰命名（camelCase）
```javascript
testCase.caseId
testCase.apiId
testCase.caseCode
testCase.preConditions
testCase.requestOverride
testCase.expectedHttpStatus
testCase.expectedResponseBody
testCase.expectedResponseSchema
testCase.testSteps
testCase.isEnabled
testCase.isTemplate
testCase.templateId
```

### 下划线命名（snake_case）
```javascript
testCase.case_id
testCase.api_id
testCase.case_code
testCase.pre_conditions
testCase.request_override
testCase.expected_http_status
testCase.expected_response_body
testCase.expected_response_schema
testCase.test_steps
testCase.is_enabled
testCase.is_template
testCase.template_id
```

## 使用示例

### 编辑用例流程

1. **点击编辑按钮**
   ```javascript
   handleEditCase(testCase)
   ```

2. **数据加载**
   - 基本信息自动填充
   - 测试步骤列表正确显示
   - 前置条件和请求参数以格式化的JSON显示
   - 预期响应信息完整加载
   - 断言和提取器规则正确渲染

3. **编辑限制**
   - ✅ 可以修改：用例名称、描述、优先级等
   - ❌ 不可修改：用例编码（灰色禁用状态）

4. **保存修改**
   ```javascript
   handleSave() // 调用已有的保存逻辑
   ```

## 数据流示意图

```
┌─────────────────────┐
│  用例详情数据       │
│  (testCase)         │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  handleEditCase     │
│  - JSON对象→字符串   │
│  - 数组深拷贝       │
│  - 字段名兼容处理   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  formData           │
│  (表单响应式数据)    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  表单渲染           │
│  - 基本信息标签页   │
│  - 测试步骤标签页   │
│  - 请求参数标签页   │
│  - 预期响应标签页   │
│  - 断言规则标签页   │
│  - 提取规则标签页   │
└─────────────────────┘
```

## 注意事项

1. **用例编码不可修改**
   - 用例编码是用例的唯一标识，创建后不应修改
   - 编辑时该字段会被禁用（灰色显示）

2. **JSON格式验证**
   - 前置条件、请求参数、预期响应等JSON字段在保存时会验证格式
   - 如果JSON格式不正确，会提示错误

3. **数组字段修改**
   - 测试步骤、断言、提取器使用深拷贝，避免直接修改原始数据
   - 取消编辑时，原始数据不会被污染

4. **字段默认值**
   - 如果某些字段在原始数据中不存在，会使用合理的默认值
   - 例如：priority 默认为 'P2'，expected_http_status 默认为 200

## 相关文件

- `src/views/Cases.vue` - 主要修改文件
- `src/api/testCase.js` - 测试用例API接口
- `src/utils/dataTransform.js` - 数据转换工具

## 测试建议

### 功能测试
1. **新建用例**：验证用例编码字段可编辑
2. **编辑用例**：验证用例编码字段禁用
3. **数据加载**：验证所有标签页的数据正确显示
4. **JSON格式**：验证JSON字段的格式化显示
5. **数组编辑**：验证测试步骤、断言、提取器的编辑功能

### 边界测试
1. **空数据**：测试所有字段为空的用例
2. **完整数据**：测试所有字段都有值的用例
3. **特殊字符**：测试JSON中包含特殊字符的情况
4. **大数据量**：测试包含大量测试步骤、断言的用例

## 总结

此次优化主要解决了两个问题：

1. ✅ **安全性提升**：用例编码创建后不可修改，避免误操作
2. ✅ **用户体验优化**：编辑用例时所有数据正确显示，无需手动输入

修改后的表单更加健壮和易用，支持完整的用例数据编辑功能。

