# 添加测试用例功能说明

## 功能概述
在接口详情页面的"相关用例"标签页中，实现了完整的添加测试用例功能，包括表单验证、JSON格式验证和数据提交。

## 入口位置
```
接口详情页面 → 相关用例标签页 → 右上角"+ 添加测试用例"按钮
```

## 对话框设计

### 对话框信息
- **标题**：添加测试用例
- **宽度**：700px
- **关闭方式**：点击遮罩层不关闭
- **表单布局**：标签宽度120px

### 表单字段

#### 1. 用例名称（必填）
- **字段**：`name`
- **类型**：文本输入
- **验证**：必填
- **示例**：正常登录测试

#### 2. 用例描述
- **字段**：`description`
- **类型**：多行文本（3行）
- **验证**：可选
- **示例**：使用正确的用户名和密码登录

#### 3. 优先级（必填）
- **字段**：`priority`
- **类型**：下拉选择
- **选项**：
  - P0 - 最高
  - P1 - 高
  - P2 - 中（默认）
  - P3 - 低
- **验证**：必填

#### 4. 严重程度（必填）
- **字段**：`severity`
- **类型**：下拉选择
- **选项**：
  - 严重（critical）
  - 高（high）
  - 中（medium，默认）
  - 低（low）
- **验证**：必填

#### 5. 测试数据
- **字段**：`preConditions`
- **类型**：多行文本（4行）
- **格式**：JSON字符串
- **验证**：JSON格式验证
- **示例**：
  ```json
  {
    "username": "testuser",
    "password": "Test@123"
  }
  ```

#### 6. 预期状态码
- **字段**：`expectedHttpStatus`
- **类型**：数字输入
- **范围**：100-599
- **默认值**：200
- **示例**：200、201、400、404

#### 7. 预期响应
- **字段**：`expectedResponseBody`
- **类型**：多行文本（6行）
- **格式**：JSON字符串
- **验证**：JSON格式验证
- **示例**：
  ```json
  {
    "code": 200,
    "message": "操作成功",
    "data": {
      "userId": "12345"
    }
  }
  ```

#### 8. 标签
- **字段**：`tags`
- **类型**：多选下拉（支持自定义）
- **预设选项**：
  - 冒烟测试
  - 回归测试
  - 功能测试
  - 边界测试
  - 异常测试
  - 安全测试
- **功能**：可输入自定义标签

#### 9. 是否启用
- **字段**：`isEnabled`
- **类型**：开关
- **默认值**：true（启用）

## 表单验证

### 必填项验证
```javascript
const caseFormRules = {
  name: [
    { required: true, message: '请输入用例名称', trigger: 'blur' }
  ],
  priority: [
    { required: true, message: '请选择优先级', trigger: 'change' }
  ],
  severity: [
    { required: true, message: '请选择严重程度', trigger: 'change' }
  ]
}
```

### JSON格式验证
```javascript
// 验证测试数据
if (caseFormData.preConditions) {
  try {
    JSON.parse(caseFormData.preConditions)
  } catch (e) {
    ElMessage.error('测试数据必须是有效的JSON格式')
    return
  }
}

// 验证预期响应
if (caseFormData.expectedResponseBody) {
  try {
    JSON.parse(caseFormData.expectedResponseBody)
  } catch (e) {
    ElMessage.error('预期响应必须是有效的JSON格式')
    return
  }
}
```

## 数据提交

### 前端数据格式
```javascript
{
  name: '正常登录测试',
  description: '使用正确的用户名和密码登录',
  priority: 'P0',
  severity: 'critical',
  preConditions: '{"username": "testuser", "password": "Test@123"}',
  expectedHttpStatus: 200,
  expectedResponseBody: '{"code": 200, "message": "登录成功"}',
  tags: ['冒烟测试', '功能测试'],
  isEnabled: true
}
```

### 转换为后端格式
```javascript
const requestData = {
  api_id: props.api.api_id,
  name: caseFormData.name,
  description: caseFormData.description,
  priority: caseFormData.priority,
  severity: caseFormData.severity,
  pre_conditions: JSON.parse(caseFormData.preConditions || '{}'),
  expected_http_status: caseFormData.expectedHttpStatus,
  expected_response_body: caseFormData.expectedResponseBody,
  tags: caseFormData.tags,
  is_enabled: caseFormData.isEnabled
}
```

### API调用
```javascript
import { createTestCase } from '@/api/testCase'

const response = await createTestCase(props.api.api_id, requestData)

if (response.code === 1) {
  ElMessage.success('测试用例创建成功')
  addCaseDialogVisible.value = false
  emit('refresh-cases')  // 通知父组件刷新用例列表
}
```

## 用户操作流程

### 创建流程
```
1. 点击接口进入详情页
2. 切换到"相关用例"标签页
3. 点击"+ 添加测试用例"按钮
4. 填写用例信息：
   - 用例名称（必填）
   - 用例描述
   - 优先级（必填）
   - 严重程度（必填）
   - 测试数据（JSON格式）
   - 预期状态码
   - 预期响应（JSON格式）
   - 标签
   - 是否启用
5. 点击"创建用例"按钮
6. 系统验证表单和JSON格式
7. 调用后端API创建用例
8. 创建成功，关闭对话框
9. 刷新用例列表
```

### 取消流程
```
点击"取消"按钮 → 关闭对话框 → 放弃输入
```

## 表单默认值

```javascript
{
  name: '',                    // 空字符串
  description: '',             // 空字符串
  priority: 'P2',              // 中优先级
  severity: 'medium',          // 中等严重程度
  preConditions: '',           // 空字符串
  expectedHttpStatus: 200,     // HTTP 200
  expectedResponseBody: '',    // 空字符串
  tags: [],                    // 空数组
  isEnabled: true              // 启用状态
}
```

## 表单示例

### 示例1：正常登录测试
```
用例名称：正常登录测试
用例描述：使用正确的用户名和密码登录
优先级：P0 - 最高
严重程度：严重
测试数据：
{
  "username": "johndoe",
  "password": "Test@123456"
}
预期状态码：200
预期响应：
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGc...",
    "userId": "12345"
  }
}
标签：冒烟测试、功能测试
是否启用：是
```

### 示例2：密码错误测试
```
用例名称：密码错误登录测试
用例描述：使用错误的密码尝试登录
优先级：P0 - 最高
严重程度：严重
测试数据：
{
  "username": "johndoe",
  "password": "WrongPassword"
}
预期状态码：401
预期响应：
{
  "code": 401,
  "message": "用户名或密码错误"
}
标签：异常测试
是否启用：是
```

## UI设计

### 对话框布局
```
┌────────────── 添加测试用例 ──────────────┐
│                                          │
│ 用例名称:  [____________________]        │
│                                          │
│ 用例描述:  [____________________]        │
│            [____________________]        │
│            [____________________]        │
│                                          │
│ 优先级:    [P2 - 中 ▼]                   │
│                                          │
│ 严重程度:  [中 ▼]                        │
│                                          │
│ 测试数据:  [____________________]        │
│            [____________________]        │
│            [____________________]        │
│            [____________________]        │
│                                          │
│ 预期状态码: [200]                        │
│                                          │
│ 预期响应:  [____________________]        │
│            [____________________]        │
│            [____________________]        │
│            [____________________]        │
│            [____________________]        │
│            [____________________]        │
│                                          │
│ 标签:      [冒烟测试 ×] [功能测试 ×]      │
│                                          │
│ 是否启用:  ● 开                          │
│                                          │
├──────────────────────────────────────────┤
│                      [取消] [创建用例]    │
└──────────────────────────────────────────┘
```

## 事件流程

### emit事件
```javascript
emit('refresh-cases')  // 通知父组件刷新用例列表
```

### 父组件处理
```vue
<ApiDetail
  :api="selectedNode"
  :related-cases="selectedNode.cases || []"
  @refresh-cases="handleRefreshCases"
/>
```

```javascript
const handleRefreshCases = async () => {
  // 重新加载接口的测试用例
  await loadApiTestCases(selectedNode.value)
}
```

## 错误处理

### 1. 表单验证错误
- 用例名称为空 → "请输入用例名称"
- 优先级未选择 → "请选择优先级"
- 严重程度未选择 → "请选择严重程度"

### 2. JSON格式错误
- 测试数据格式错误 → "测试数据必须是有效的JSON格式"
- 预期响应格式错误 → "预期响应必须是有效的JSON格式"

### 3. API调用错误
- 网络错误 → "创建失败，请检查输入信息"
- 后端错误 → 显示后端返回的错误信息

## 功能特性

### 1. 智能默认值
- 优先级默认P2（中）
- 严重程度默认medium（中）
- 预期状态码默认200
- 默认启用状态

### 2. JSON编辑
- 多行文本输入
- 自动换行
- 可粘贴格式化的JSON

### 3. 标签管理
- 多选下拉
- 支持筛选
- 支持自定义创建

### 4. 实时验证
- 失焦验证必填项
- 提交时验证JSON格式
- 友好的错误提示

## 后续优化建议

1. **JSON编辑器**：使用专业的JSON编辑器组件（如Monaco Editor）
2. **模板选择**：提供常用用例模板
3. **从接口生成**：根据接口定义自动生成测试数据
4. **批量导入**：支持批量导入测试用例
5. **复制创建**：从现有用例复制创建
6. **步骤编辑**：可视化编辑测试步骤
7. **断言配置**：可视化配置验证规则
8. **数据驱动**：支持数据驱动测试

## 相关文件
- `src/components/cases/ApiDetail.vue` - 接口详情组件
- `src/api/testCase.js` - 测试用例API
- `src/views/Cases.vue` - 用例管理页面

