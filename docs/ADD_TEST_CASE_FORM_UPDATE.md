# 添加测试用例表单重构说明

## 更新日期
2025-10-21

## 概述
根据测试用例数据库表结构，重新设计了添加/编辑测试用例的表单，提供了更完整、更专业的用例管理功能。

## 主要变更

### 1. 表单结构改进

#### 使用标签页（Tabs）组织表单
将原来单一的表单改为多标签页布局，更好地组织不同类别的信息：

- **基本信息**：用例的基础属性
- **测试步骤**：详细的测试操作步骤
- **请求参数**：前置条件和请求参数配置
- **预期响应**：预期结果配置
- **断言规则**：响应验证规则
- **提取规则**：响应数据提取配置

### 2. 新增字段

#### 基本信息标签页
| 字段 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| case_code | String | 用例编码（可选） | 自动生成 |
| name | String | 用例名称（必填） | - |
| description | Text | 用例描述 | - |
| priority | Enum | 优先级：P0/P1/P2/P3 | P2 |
| severity | Enum | 严重程度：critical/high/medium/low | medium |
| tags | Array | 标签（支持多选和自定义） | [] |
| version | String | 版本号 | 1.0 |
| is_enabled | Boolean | 是否启用 | true |
| is_template | Boolean | 是否为模板用例 | false |

#### 测试步骤标签页
- 支持添加多个测试步骤
- 每个步骤包含：
  - `operation`：操作步骤
  - `expected`：预期结果
- 可动态添加/删除步骤

#### 请求参数标签页
- **前置条件**（pre_conditions）：JSON格式，用于设置环境变量、登录状态等
- **请求参数覆盖**（request_override）：JSON格式，覆盖接口的默认请求参数

#### 预期响应标签页
- **预期状态码**（expected_http_status）：HTTP状态码
- **预期响应体**（expected_response_body）：预期的响应内容
- **响应Schema**（expected_response_schema）：JSON Schema格式，用于验证响应结构

#### 断言规则标签页
- 支持多种断言类型：
  - 状态码（status_code）
  - JSON路径（json_path）
  - JSON路径存在（json_path_exists）
  - 响应时间（response_time）
  - 包含文本（contains）
- 每个断言包含：
  - `type`：断言类型
  - `path`：JSON路径（适用于json_path类型）
  - `expected`：预期值
- 可动态添加/删除断言

#### 提取规则标签页
- 用于从响应中提取数据供后续用例使用
- 每个提取器包含：
  - `name`：变量名
  - `expression`：JSONPath表达式
  - `description`：描述
- 典型用途：提取登录token、订单ID等
- 可动态添加/删除提取器

### 3. UI/UX 改进

#### 表单布局
- 使用900px宽度的对话框（原600px），提供更多空间
- 标签页导航，清晰分类
- 每个标签页内容独立，避免信息过载

#### 交互优化
- **动态列表管理**：测试步骤、断言、提取器都支持动态添加/删除
- **智能提示**：每个字段都有placeholder和说明文字
- **标签输入**：支持从预设选项选择或自定义输入
- **空状态提示**：未添加项目时显示友好的空状态提示

#### 视觉设计
- 统一的卡片式设计
- 清晰的层次结构
- 适当的间距和圆角
- 淡蓝色提示框用于重要说明

### 4. 技术实现

#### 新增响应式变量
```javascript
const caseFormActiveTab = ref('basic') // 当前激活的标签页
```

#### 扩展formData字段
```javascript
const formData = reactive({
  // 基本信息
  case_code: '',
  priority: 'P2',
  severity: 'medium',
  tags: [],
  version: '1.0',
  is_enabled: true,
  is_template: false,
  
  // 测试步骤
  test_steps: [],
  
  // 请求参数
  pre_conditions_str: '',
  request_override_str: '',
  
  // 预期响应
  expected_http_status: 200,
  expected_response_body: '',
  expected_response_schema_str: '',
  
  // 断言和提取器
  assertions: [],
  extractors: [],
  validators: []
})
```

#### 新增处理函数
- `handleAddTestStep()`：添加测试步骤
- `handleRemoveTestStep(index)`：删除测试步骤
- `handleAddAssertion()`：添加断言
- `handleRemoveAssertion(index)`：删除断言
- `handleAddExtractor()`：添加提取器
- `handleRemoveExtractor(index)`：删除提取器

#### 数据转换增强
更新了 `transformTestCaseToBackend` 函数，支持：
- 新旧字段兼容
- JSON字符串解析
- 自动字段转换

### 5. 样式类

新增CSS类：
- `.case-form-tabs`：标签页容器
- `.form-tip`：表单提示文字
- `.test-steps-section`：测试步骤区域
- `.step-item-edit`：步骤编辑项
- `.assertions-section`：断言区域
- `.assertion-item-edit`：断言编辑项
- `.extractors-section`：提取器区域
- `.extractor-item-edit`：提取器编辑项
- `.extractor-tip`：提取器说明提示

## 数据库字段映射

| 前端字段 | 后端字段 | 类型 | 说明 |
|---------|---------|------|------|
| case_code | case_code | VARCHAR | 用例编码 |
| name | name | VARCHAR | 用例名称 |
| description | description | TEXT | 用例描述 |
| priority | priority | ENUM | 优先级 |
| severity | severity | ENUM | 严重程度 |
| tags | tags | JSON | 标签数组 |
| test_steps | test_steps | JSON | 测试步骤 |
| pre_conditions_str → | pre_conditions | JSON | 前置条件 |
| request_override_str → | request_override | JSON | 请求参数覆盖 |
| expected_http_status | expected_http_status | INT | 预期状态码 |
| expected_response_body | expected_response_body | TEXT | 预期响应体 |
| expected_response_schema_str → | expected_response_schema | JSON | 响应Schema |
| assertions | assertions | JSON | 断言规则 |
| extractors | extractors | JSON | 提取规则 |
| validators | validators | JSON | 验证器配置 |
| is_enabled | is_enabled | BOOLEAN | 是否启用 |
| is_template | is_template | BOOLEAN | 是否为模板 |
| template_id | template_id | INT | 模板ID |
| version | version | VARCHAR | 版本号 |

## 使用示例

### 创建一个完整的测试用例

#### 1. 基本信息
```
用例名称：正常登录测试
用例编码：留空（自动生成）
用例描述：使用正确的用户名和密码登录系统
优先级：P0
严重程度：critical
标签：登录, 认证, P0
版本号：1.0
是否启用：✓
设为模板：✗
```

#### 2. 测试步骤
```
步骤1：
  操作：打开登录页面
  预期：显示登录表单

步骤2：
  操作：输入用户名和密码
  预期：输入框正常显示

步骤3：
  操作：点击登录按钮
  预期：跳转到首页
```

#### 3. 请求参数
```json
前置条件：
{
  "baseUrl": "https://api.example.com"
}

请求参数覆盖：
{
  "username": "testuser",
  "password": "Test@123"
}
```

#### 4. 预期响应
```
预期状态码：200

预期响应体：
{
  "code": 1,
  "msg": "登录成功",
  "data": {
    "token": "xxx",
    "userId": 123
  }
}

响应Schema：
{
  "type": "object",
  "properties": {
    "code": {"type": "number"},
    "msg": {"type": "string"},
    "data": {
      "type": "object",
      "properties": {
        "token": {"type": "string"},
        "userId": {"type": "number"}
      }
    }
  }
}
```

#### 5. 断言规则
```
断言1：
  类型：状态码
  预期值：200

断言2：
  类型：JSON路径
  路径：$.code
  预期值：1

断言3：
  类型：JSON路径
  路径：$.msg
  预期值：登录成功

断言4：
  类型：JSON路径存在
  路径：$.data.token
```

#### 6. 提取规则
```
提取器1：
  变量名：token
  表达式：$.data.token
  描述：提取登录token供后续接口使用

提取器2：
  变量名：userId
  表达式：$.data.userId
  描述：提取用户ID
```

## 向后兼容性

- 保留了所有旧字段（如 `request_params`、`expected_status_code`、`validation_rules`）
- 数据转换函数支持新旧两种格式
- 如果编辑旧用例，会自动适配新表单
- 保存时会转换为标准的后端格式

## 优势

1. **功能完整**：覆盖数据库表的所有字段
2. **结构清晰**：标签页组织，逻辑分明
3. **易于使用**：直观的UI，友好的交互
4. **专业性强**：支持复杂的断言和提取规则
5. **可扩展性**：易于添加新的断言类型或提取器类型

## 后续优化建议

1. 添加表单验证规则
2. 支持导入导出用例
3. 支持从模板创建用例
4. 添加预览功能
5. 支持用例复制时自动生成新的case_code
6. 添加JSONSchema编辑器
7. 支持更多断言类型

## 相关文件

- `src/views/Cases.vue` - 主视图文件（包含新表单）
- `src/components/cases/ApiDetail.vue` - 接口详情组件（包含新表单）
- `src/utils/dataTransform.js` - 数据转换工具（已更新）
- `src/api/testCase.js` - 测试用例API接口

## 已同步更新的页面

1. **Cases.vue**（用例管理主页面）
   - 左侧树形结构中的添加用例功能
   - 使用标签页布局的完整表单

2. **ApiDetail.vue**（接口详情页面）
   - "相关用例"标签页中的添加测试用例功能
   - 与 Cases.vue 保持一致的表单设计
   - 相同的字段配置和交互体验

## 测试建议

1. 测试所有标签页的字段填写和验证
2. 测试动态添加/删除步骤、断言、提取器
3. 测试JSON格式验证
4. 测试新建和编辑用例
5. 测试数据保存和加载
6. 测试标签的多选和自定义输入
7. 测试向后兼容性（编辑旧用例）

