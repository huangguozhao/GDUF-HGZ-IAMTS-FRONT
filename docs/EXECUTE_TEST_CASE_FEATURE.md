# 执行测试用例功能说明（完整版）

## 功能概述
在用例详情页面实现了完整的测试用例执行功能，包括执行配置、API调用、结果展示三个核心部分，完全集成后端API。

## 入口位置
```
用例详情页面 → 右上角"执行测试"按钮（蓝色主按钮）
```

## 执行配置对话框

### 对话框信息
- **标题**：执行测试配置
- **宽度**：600px
- **关闭方式**：点击遮罩层不关闭

### 配置选项

#### 1. 执行环境
- **字段**：`environment`
- **类型**：下拉选择
- **选项**：
  - 开发环境 (dev)
  - 测试环境 (test)
  - 预发布环境 (staging)
  - 生产环境 (prod)
- **默认值**：dev
- **说明**：选择测试用例的执行环境

#### 2. Base URL
- **字段**：`base_url`
- **类型**：文本输入
- **必填**：否
- **说明**：覆盖接口的基础URL，留空则使用环境默认URL

#### 3. 超时时间
- **字段**：`timeout`
- **类型**：数字输入
- **范围**：1-300秒
- **默认值**：30秒
- **说明**：请求超时时间，覆盖接口默认超时设置

#### 4. 执行模式
- **字段**：`async`
- **类型**：单选
- **选项**：
  - 同步执行（false）
  - 异步执行（true）
- **默认值**：同步执行
- **说明**：
  - 同步：立即执行并等待结果
  - 异步：提交到队列，后台执行

#### 5. 执行变量
- **字段**：`variables`
- **类型**：多行文本（JSON格式）
- **必填**：否
- **格式验证**：JSON格式验证
- **示例**：
  ```json
  {
    "username": "testuser",
    "password": "Test@123"
  }
  ```
- **说明**：用于参数化测试的变量

## API调用

### 请求路径
```
POST /test-cases/{case_id}/execute
```

### 请求头
```javascript
{
  'Authorization': 'Bearer {token}',
  'Content-Type': 'application/json'
}
```

### 请求体
```json
{
  "environment": "test",
  "base_url": "https://test-api.example.com",
  "timeout": 60,
  "variables": {
    "username": "testuser",
    "password": "Test123!"
  },
  "async": false
}
```

### 响应数据

#### 同步执行成功
```json
{
  "code": 1,
  "msg": "用例执行完成",
  "data": {
    "execution_id": 10001,
    "case_id": 1001,
    "case_name": "正常登录测试",
    "status": "passed",
    "duration": 1250,
    "start_time": "2024-09-16T10:30:00.000Z",
    "end_time": "2024-09-16T10:30:01.250Z",
    "response_status": 200,
    "assertions_passed": 3,
    "assertions_failed": 0,
    "failure_message": null,
    "logs_link": "/api/test-results/10001/logs",
    "report_id": 5001
  }
}
```

#### 异步执行成功
```json
{
  "code": 1,
  "msg": "用例执行任务已提交",
  "data": {
    "task_id": "task_abc123def456",
    "case_id": 1001,
    "status": "pending",
    "estimated_wait_time": 5,
    "queue_position": 3,
    "monitor_url": "/api/tasks/task_abc123def456/status"
  }
}
```

## 功能流程

### 执行流程
```
1. 点击"执行测试"按钮
2. 打开执行配置对话框
3. 配置执行参数：
   - 选择执行环境
   - 设置Base URL（可选）
   - 设置超时时间
   - 选择执行模式
   - 输入执行变量（可选）
4. 点击"开始执行"
5. 验证JSON格式（如有执行变量）
6. 调用后端API执行测试
7. 显示执行结果：
   - 同步执行：立即显示测试结果
   - 异步执行：显示任务ID
8. 关闭对话框
9. 刷新执行历史
```

### 结果处理

#### 同步执行
- **成功**：显示用时和断言通过情况
  ```
  测试执行成功！用时: 1250ms，断言通过: 3/3
  ```
- **失败**：显示失败原因
  ```
  测试执行失败：用户名或密码错误
  ```

#### 异步执行
- **提交成功**：显示任务ID
  ```
  测试任务已提交，任务ID: task_abc123def456
  ```

## 代码实现

### API方法更新
```javascript
// src/api/testCase.js
export function executeTestCase(apiId, caseId, executeData = {}) {
  return request({
    url: `/test-cases/${caseId}/execute`,
    method: 'post',
    data: {
      environment: executeData.environment,
      base_url: executeData.base_url,
      timeout: executeData.timeout,
      auth_override: executeData.auth_override,
      variables: executeData.variables,
      async: executeData.async || false,
      callback_url: executeData.callback_url
    }
  })
}
```

### 执行方法
```javascript
const handleConfirmExecute = async () => {
  try {
    executing.value = true
    
    // 1. 解析执行变量
    let parsedVariables = {}
    if (executeVariables.value) {
      try {
        parsedVariables = JSON.parse(executeVariables.value)
      } catch (e) {
        ElMessage.error('执行变量必须是有效的JSON格式')
        executing.value = false
        return
      }
    }
    
    // 2. 构建请求数据
    const requestData = {
      environment: executeFormData.environment,
      async: executeFormData.async
    }
    
    if (executeFormData.baseUrl) {
      requestData.base_url = executeFormData.baseUrl
    }
    
    if (executeFormData.timeout) {
      requestData.timeout = executeFormData.timeout
    }
    
    if (Object.keys(parsedVariables).length > 0) {
      requestData.variables = parsedVariables
    }
    
    // 3. 调用执行API
    const caseId = props.testCase.caseId || props.testCase.case_id
    const response = await executeTestCase(null, caseId, requestData)
    
    // 4. 处理响应
    if (response.code === 1) {
      if (requestData.async) {
        ElMessage.success(`测试任务已提交，任务ID: ${response.data.task_id}`)
      } else {
        if (response.data.status === 'passed') {
          ElMessage.success(`测试执行成功！用时: ${response.data.duration}ms，断言通过: ${response.data.assertions_passed}/${response.data.assertions_passed + response.data.assertions_failed}`)
        } else if (response.data.status === 'failed') {
          ElMessage.error(`测试执行失败：${response.data.failure_message || '未通过断言'}`)
        } else {
          ElMessage.warning(`测试执行完成，状态: ${response.data.status}`)
        }
      }
      
      executeDialogVisible.value = false
      emit('refresh')
    } else {
      ElMessage.error(response.msg || '执行失败')
    }
    
  } catch (error) {
    console.error('执行测试失败:', error)
    ElMessage.error(error.msg || error.message || '执行测试失败，请稍后重试')
  } finally {
    executing.value = false
  }
}
```

### 刷新处理
```javascript
// src/views/Cases.vue
const handleRefreshTestCase = async () => {
  try {
    // 重新加载用例的执行历史
    if (selectedNode.value && selectedLevel.value === 'case') {
      await loadTestCaseHistory(selectedNode.value)
    }
    
    ElMessage.success('数据已刷新')
  } catch (error) {
    console.error('刷新失败:', error)
  }
}
```

## 执行状态展示

### 执行中
- 按钮显示"执行中..."
- 按钮loading状态
- 禁止重复点击

### 执行成功
- 绿色成功提示
- 显示执行时长
- 显示断言通过情况
- 刷新执行历史

### 执行失败
- 红色错误提示
- 显示失败原因
- 记录失败信息

## 错误处理

### 1. JSON格式错误
```
执行变量必须是有效的JSON格式
```

### 2. 用例不存在
```
测试用例不存在
```

### 3. 用例未启用
```
测试用例未启用，无法执行
```

### 4. 接口不存在
```
关联的接口不存在或已禁用
```

### 5. 权限不足
```
权限不足，无法执行测试用例
```

### 6. 执行超时
```
执行超时（30秒）
```

### 7. 网络错误
```
执行测试失败，请稍后重试
```

## 执行结果数据

### 执行结果对象
```javascript
{
  execution_id: 10001,          // 执行记录ID
  case_id: 1001,                // 用例ID
  case_name: '正常登录测试',     // 用例名称
  status: 'passed',             // 执行状态
  duration: 1250,               // 执行耗时(ms)
  start_time: '...',            // 开始时间
  end_time: '...',              // 结束时间
  response_status: 200,         // 响应状态码
  assertions_passed: 3,         // 断言通过数
  assertions_failed: 0,         // 断言失败数
  failure_message: null,        // 失败信息
  logs_link: '...',             // 日志链接
  report_id: 5001               // 报告ID
}
```

## UI设计

### 执行配置对话框
```
┌──────── 执行测试配置 ────────┐
│                              │
│ 执行环境:  [开发环境 ▼]      │
│                              │
│ Base URL:  [______________]  │
│                              │
│ 超时时间:  [30] 秒           │
│                              │
│ 执行模式:  ○ 同步执行        │
│            ○ 异步执行        │
│                              │
│ 执行变量:  [______________]  │
│            [______________]  │
│            [______________]  │
│            [______________]  │
│                              │
├──────────────────────────────┤
│              [取消] [开始执行] │
└──────────────────────────────┘
```

### 执行中状态
```
按钮显示: [⏳ 执行中...]
按钮状态: loading (禁用)
```

### 执行成功
```
提示消息: ✓ 测试执行成功！用时: 1250ms，断言通过: 3/3
消息类型: success (绿色)
```

### 执行失败
```
提示消息: ✗ 测试执行失败：用户名或密码错误
消息类型: error (红色)
```

## 使用场景

### 场景1：快速执行（默认配置）
```
1. 点击"执行测试"
2. 保持默认配置
3. 点击"开始执行"
4. 等待执行完成
5. 查看执行结果
```

### 场景2：指定环境执行
```
1. 点击"执行测试"
2. 选择"测试环境"
3. 点击"开始执行"
4. 使用测试环境的配置执行
```

### 场景3：覆盖URL执行
```
1. 点击"执行测试"
2. 输入自定义Base URL
3. 点击"开始执行"
4. 使用指定URL执行测试
```

### 场景4：参数化执行
```
1. 点击"执行测试"
2. 在"执行变量"中输入JSON数据
3. 点击"开始执行"
4. 变量会覆盖用例的默认测试数据
```

### 场景5：异步执行
```
1. 点击"执行测试"
2. 选择"异步执行"
3. 点击"开始执行"
4. 获得任务ID
5. 通过任务ID查询执行状态
```

## 执行参数说明

### environment（执行环境）
- **用途**：指定测试用例在哪个环境执行
- **影响**：决定使用哪个环境的配置（URL、认证等）
- **示例**：dev, test, staging, prod

### base_url（基础URL覆盖）
- **用途**：临时覆盖接口的基础URL
- **场景**：测试特定服务器、本地调试
- **示例**：`https://custom-api.example.com`

### timeout（超时时间）
- **用途**：设置请求超时时间
- **场景**：慢接口、网络不稳定
- **单位**：秒
- **示例**：30, 60, 120

### variables（执行变量）
- **用途**：参数化测试数据
- **格式**：JSON对象
- **场景**：数据驱动测试、动态参数
- **示例**：
  ```json
  {
    "userId": "12345",
    "userName": "张三",
    "timestamp": "1234567890"
  }
  ```

### async（异步执行）
- **用途**：控制执行模式
- **同步**：立即执行，阻塞等待结果
- **异步**：提交任务，后台执行
- **适用场景**：
  - 同步：快速验证、调试
  - 异步：批量执行、长时间任务

## 执行后处理

### 1. 刷新执行历史
执行完成后自动刷新右侧的"执行历史"列表，显示最新的执行记录。

### 2. 更新用例状态
如果是从树形列表执行，用例前的状态点会更新颜色：
- 绿色：通过
- 红色：失败

### 3. 显示执行结果
在用例详情页面可以查看详细的执行结果。

## 响应数据处理

### 同步执行结果
```javascript
if (response.data.status === 'passed') {
  ElMessage.success(
    `测试执行成功！用时: ${response.data.duration}ms，` +
    `断言通过: ${response.data.assertions_passed}/` +
    `${response.data.assertions_passed + response.data.assertions_failed}`
  )
}
```

### 异步执行结果
```javascript
if (requestData.async) {
  ElMessage.success(
    `测试任务已提交，任务ID: ${response.data.task_id}`
  )
}
```

## 注意事项

1. **JSON验证**：执行变量必须是有效的JSON格式
2. **超时设置**：合理设置超时时间，避免长时间等待
3. **环境选择**：注意选择正确的执行环境
4. **异步执行**：异步执行需要通过任务ID查询结果
5. **权限控制**：确保有执行测试的权限
6. **数据刷新**：执行后自动刷新执行历史

## 后续优化建议

1. **环境管理集成**：从项目环境配置中加载环境列表
2. **变量模板**：提供常用变量模板
3. **执行进度**：显示执行进度条
4. **实时日志**：实时显示执行日志
5. **结果详情**：直接在对话框中显示执行结果
6. **快速重试**：失败后一键重试
7. **批量执行**：支持批量执行多个用例
8. **定时执行**：支持定时自动执行

## 相关文件
- `src/components/cases/CaseDetail.vue` - 用例详情组件
- `src/api/testCase.js` - 测试用例API
- `src/views/Cases.vue` - 用例管理页面
