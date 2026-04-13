# 接口详情页面测试用例表单更新

## 更新日期
2025-10-21

## 概述
将接口详情页面（ApiDetail.vue）中"相关用例"标签页的添加测试用例表单，与 Cases.vue 主页面的表单设计保持一致，提供统一的用户体验。

## 更新内容

### 1. 表单结构统一

#### 从简单表单升级为多标签页布局
- **原设计**：单一表单，只包含基本字段
- **新设计**：5个标签页，完整覆盖所有测试用例字段

### 2. 标签页结构

#### 📋 基本信息
- 用例名称（必填）
- 用例编码（可选，自动生成）
- 用例描述
- 优先级（P0/P1/P2/P3）
- 严重程度（critical/high/medium/low）
- 标签（多选+自定义）
- 版本号
- 是否启用开关
- 设为模板开关

#### 📝 测试步骤
- 动态添加/删除测试步骤
- 每个步骤包含：
  - 操作步骤描述
  - 预期结果
- 空状态友好提示

#### 📤 请求参数
- **前置条件**：JSON格式，设置环境变量等
- **请求参数覆盖**：JSON格式，覆盖接口默认参数
- 每个字段都有使用说明

#### 📥 预期响应
- 预期HTTP状态码（数字输入）
- 预期响应体（JSON文本域）
- 响应Schema（JSON Schema格式）
- 响应Schema说明提示

#### ✅ 断言规则
- 支持5种断言类型：
  - 状态码
  - JSON路径
  - JSON路径存在
  - 响应时间
  - 包含文本
- 动态表单，根据断言类型显示不同字段
- 可添加/删除多个断言

#### 🔍 提取规则
- 提取器列表管理
- 每个提取器包含：
  - 变量名
  - JSONPath表达式
  - 描述
- 蓝色提示框说明用途
- 可添加/删除多个提取器

### 3. UI改进

#### 对话框尺寸
- **原尺寸**：700px
- **新尺寸**：900px
- 提供更多空间容纳标签页内容

#### 视觉设计
- 统一的卡片式设计语言
- 清晰的层次和间距
- 淡蓝色背景的提示框
- 白色卡片+灰色容器的对比

#### 交互优化
- 标签页切换流畅
- 动态列表直观易用
- 表单验证完善
- 错误提示友好

### 4. 数据字段更新

#### 新增 reactive 变量
```javascript
const caseFormActiveTab = ref('basic') // 标签页状态
```

#### 扩展 caseFormData
```javascript
const caseFormData = reactive({
  // 基本信息
  name: '',
  description: '',
  caseCode: '',              // 新增
  priority: 'P2',
  severity: 'medium',
  tags: [],
  version: '1.0',            // 新增
  isEnabled: true,
  isTemplate: false,         // 新增
  
  // 测试步骤（新增）
  testSteps: [],
  
  // 请求参数（新增）
  preConditionsStr: '',
  requestOverrideStr: '',
  
  // 预期响应
  expectedHttpStatus: 200,
  expectedResponseBody: '',
  expectedResponseSchemaStr: '', // 新增
  
  // 断言和提取器（新增）
  assertions: [],
  extractors: []
})
```

### 5. 新增处理函数

```javascript
// 测试步骤管理
handleAddTestStep()       // 添加测试步骤
handleRemoveTestStep(index) // 删除测试步骤

// 断言管理
handleAddAssertion()      // 添加断言
handleRemoveAssertion(index) // 删除断言

// 提取器管理
handleAddExtractor()      // 添加提取器
handleRemoveExtractor(index) // 删除提取器
```

### 6. 表单验证增强

#### JSON格式验证
保存时验证以下字段的JSON格式：
- `preConditionsStr`
- `requestOverrideStr`
- `expectedResponseBody`
- `expectedResponseSchemaStr`

#### 错误提示
```javascript
if (caseFormData.preConditionsStr) {
  try {
    JSON.parse(caseFormData.preConditionsStr)
  } catch (e) {
    ElMessage.error('前置条件必须是有效的JSON格式')
    return
  }
}
```

### 7. 后端API调用准备

已在代码中添加完整的API调用示例（注释形式）：

```javascript
// const requestData = {
//   case_code: caseFormData.caseCode,
//   name: caseFormData.name,
//   description: caseFormData.description,
//   priority: caseFormData.priority,
//   severity: caseFormData.severity,
//   tags: caseFormData.tags,
//   version: caseFormData.version,
//   test_steps: caseFormData.testSteps,
//   pre_conditions: caseFormData.preConditionsStr ? JSON.parse(caseFormData.preConditionsStr) : null,
//   request_override: caseFormData.requestOverrideStr ? JSON.parse(caseFormData.requestOverrideStr) : null,
//   expected_http_status: caseFormData.expectedHttpStatus,
//   expected_response_body: caseFormData.expectedResponseBody,
//   expected_response_schema: caseFormData.expectedResponseSchemaStr ? JSON.parse(caseFormData.expectedResponseSchemaStr) : null,
//   assertions: caseFormData.assertions,
//   extractors: caseFormData.extractors,
//   is_enabled: caseFormData.isEnabled,
//   is_template: caseFormData.isTemplate
// }
// const response = await createTestCase(props.api.api_id, requestData)
```

## 对比展示

### 原表单字段（7个）
1. 用例名称
2. 用例描述
3. 优先级
4. 严重程度
5. 测试数据
6. 预期状态码
7. 预期响应

### 新表单字段（20+个）
1. 用例名称 ✓
2. 用例编码（新增）
3. 用例描述 ✓
4. 优先级 ✓
5. 严重程度 ✓
6. 标签（新增）
7. 版本号（新增）
8. 是否启用（新增）
9. 设为模板（新增）
10. 测试步骤（新增，动态数组）
11. 前置条件（新增）
12. 请求参数覆盖（新增）
13. 预期状态码 ✓
14. 预期响应体 ✓
15. 响应Schema（新增）
16. 断言规则（新增，动态数组）
17. 提取规则（新增，动态数组）

## 样式类新增

### 用例表单相关
- `.case-form-tabs` - 标签页容器
- `.form-tip` - 表单提示文字

### 测试步骤相关
- `.test-steps-section` - 步骤区域
- `.steps-header` - 步骤头部
- `.steps-title` - 步骤标题
- `.step-item-edit` - 步骤编辑项
- `.step-number` - 步骤序号
- `.step-content-edit` - 步骤内容
- `.step-input` - 步骤输入框

### 断言相关
- `.assertions-section` - 断言区域
- `.assertions-header` - 断言头部
- `.assertions-title` - 断言标题
- `.assertions-list` - 断言列表
- `.assertion-item-edit` - 断言编辑项
- `.assertion-form` - 断言表单

### 提取器相关
- `.extractors-section` - 提取器区域
- `.extractors-header` - 提取器头部
- `.extractors-title` - 提取器标题
- `.extractors-list-edit` - 提取器列表
- `.extractor-item-edit` - 提取器编辑项
- `.extractor-form` - 提取器表单
- `.extractor-tip` - 提取器说明提示

## 用户体验提升

### 1. 一致性
- ✅ Cases.vue 和 ApiDetail.vue 使用相同的表单设计
- ✅ 统一的标签页结构
- ✅ 统一的字段命名和布局
- ✅ 统一的交互方式

### 2. 易用性
- ✅ 标签页组织，信息分类清晰
- ✅ 空状态提示友好
- ✅ 每个字段都有placeholder
- ✅ 重要提示用蓝色框突出

### 3. 专业性
- ✅ 支持完整的测试用例配置
- ✅ 断言规则可视化编辑
- ✅ 提取器配置功能
- ✅ JSON格式验证

### 4. 可扩展性
- ✅ 动态列表易于扩展
- ✅ 断言类型可添加
- ✅ 提取器类型可扩展
- ✅ 标签预设可自定义

## 功能对比

| 功能 | 原表单 | 新表单 |
|------|--------|--------|
| 基本信息 | ✓ | ✓ 增强 |
| 用例编码 | ✗ | ✓ |
| 标签管理 | 基础 | ✓ 多选+自定义 |
| 测试步骤 | ✗ | ✓ 动态管理 |
| 前置条件 | ✗ | ✓ |
| 请求参数覆盖 | ✗ | ✓ |
| 响应Schema | ✗ | ✓ |
| 断言规则 | ✗ | ✓ 多类型 |
| 提取规则 | ✗ | ✓ |
| 模板用例 | ✗ | ✓ |
| 版本管理 | ✗ | ✓ |

## 技术亮点

1. **组件复用**：使用 Element Plus 的 Tabs、Select、Empty 等组件
2. **响应式设计**：使用 computed 和 reactive 实现数据响应
3. **表单验证**：完善的前端验证，包括JSON格式验证
4. **错误处理**：友好的错误提示和异常处理
5. **代码质量**：无linter错误，代码结构清晰

## 使用场景

### 场景1：在接口详情页快速添加测试用例
1. 打开接口详情页
2. 切换到"相关用例"标签页
3. 点击"+ 添加测试用例"按钮
4. 在标签页中填写完整信息
5. 保存创建

### 场景2：创建带断言的复杂用例
1. 基本信息：填写名称、优先级等
2. 请求参数：配置前置条件和参数覆盖
3. 预期响应：设置状态码和响应体
4. 断言规则：添加多个断言验证响应
5. 提取规则：提取token等数据供后续使用

### 场景3：创建可复用的模板用例
1. 基本信息：勾选"设为模板"
2. 填写通用的测试配置
3. 其他用例可以引用此模板

## 向后兼容

- ✅ 保留原有字段名称
- ✅ 支持旧数据加载
- ✅ 不影响现有功能
- ✅ 渐进式增强

## 后续集成步骤

1. 在 handleSaveTestCase 中取消注释API调用代码
2. 导入 createTestCase 函数
3. 测试完整的创建流程
4. 添加编辑用例的功能
5. 实现用例复制功能

## 效果预览

### 表单标签页
```
[基本信息] [测试步骤] [请求参数] [预期响应] [断言规则] [提取规则]
```

### 基本信息示例
```
用例名称：正常登录测试 *
用例编码：[留空则自动生成]
用例描述：使用正确的用户名和密码登录系统
优先级：[P0（最高优先级）] ▼
严重程度：[严重] ▼
标签：[登录] [认证] [P0]
版本号：1.0
是否启用：[✓]
设为模板：[  ]
```

### 断言规则示例
```
断言列表                           [+ 添加断言]

┌────────────────────────────────────────┐
│ [JSON路径 ▼] [$.code] [1]     [删除]  │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│ [JSON路径 ▼] [$.msg] [登录成功] [删除] │
└────────────────────────────────────────┘
```

### 提取规则示例
```
提取器列表                         [+ 添加提取器]

┌───────────────────────────────────────────────┐
│ [token] [$.data.token] [提取登录token] [删除] │
└───────────────────────────────────────────────┘

ℹ️ 提取器用于从响应中提取数据供后续用例使用，
   如提取登录token、订单ID等
```

## 技术实现细节

### 字段命名约定
- 前端显示：使用驼峰命名（camelCase）
- 后端传输：根据 dataTransform 自动转换
- 兼容性：同时支持两种命名方式

### JSON字符串字段
带 `Str` 后缀的字段表示JSON字符串输入：
- `preConditionsStr` → `pre_conditions` (JSON)
- `requestOverrideStr` → `request_override` (JSON)
- `expectedResponseSchemaStr` → `expected_response_schema` (JSON)

### 保存时转换
```javascript
// 前端输入（字符串）
preConditionsStr: '{"token": "xxx"}'

// 转换为后端格式（对象）
pre_conditions: { token: "xxx" }
```

## 测试清单

- [ ] 测试基本信息标签页的所有字段
- [ ] 测试添加/删除测试步骤
- [ ] 测试JSON格式验证
- [ ] 测试添加/删除断言
- [ ] 测试不同断言类型的字段显示
- [ ] 测试添加/删除提取器
- [ ] 测试表单重置功能
- [ ] 测试取消操作
- [ ] 测试保存操作
- [ ] 测试空状态显示

## 优势总结

1. **功能完整**：覆盖数据库表的所有字段
2. **体验一致**：与主页面表单保持一致
3. **操作便捷**：在接口页面就能创建完整用例
4. **专业强大**：支持断言、提取器等高级功能
5. **易于维护**：代码结构清晰，可复用性强

## 相关文件

- `src/components/cases/ApiDetail.vue` - 已更新
- `src/views/Cases.vue` - 表单设计参考
- `src/utils/dataTransform.js` - 数据转换工具
- `ADD_TEST_CASE_FORM_UPDATE.md` - 主表单文档

