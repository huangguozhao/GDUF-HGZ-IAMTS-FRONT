# 测试执行结果展示功能说明

## 功能概述
测试用例执行完成后，会弹出一个美观的执行结果对话框，展示详细的执行信息、断言结果和操作链接。

## 执行结果对话框

### 对话框信息
- **标题**：测试执行结果
- **宽度**：800px
- **触发时机**：同步执行完成后自动弹出

## 展示内容

### 1. 结果状态横幅

#### 测试通过
```
┌─────────────────────────────────────────┐
│  ✓                                     │
│  大图标  ✓ 测试通过                     │
│  (绿色)  正常登录测试                   │
│                                        │
│  背景：绿色渐变 + 绿色边框              │
└─────────────────────────────────────────┘
```

#### 测试失败
```
┌─────────────────────────────────────────┐
│  ✗                                     │
│  大图标  ✗ 测试失败                     │
│  (红色)  密码错误登录测试               │
│                                        │
│  背景：红色渐变 + 红色边框              │
└─────────────────────────────────────────┘
```

### 2. 执行信息卡片（4个卡片）

#### 卡片1：执行ID
```
┌──────────────┐
│  执行ID      │
│  1761017099998 │
└──────────────┘
```

#### 卡片2：响应状态码
```
┌──────────────┐
│ 响应状态码   │
│   [200]      │
│  (绿色标签)  │
└──────────────┘
```

#### 卡片3：执行耗时
```
┌──────────────┐
│  执行耗时    │
│   705ms      │
│  (蓝色高亮)  │
└──────────────┘
```

#### 卡片4：断言结果
```
┌──────────────┐
│  断言结果    │
│ 4 通过/0 失败│
│ (绿/红颜色)  │
└──────────────┘
```

### 3. 时间信息

```
┌─────────────────────────────────────────┐
│ 开始时间：2025-10-21 11:24:59          │
│ 结束时间：2025-10-21 11:24:59          │
└─────────────────────────────────────────┘
```

### 4. 失败信息（仅失败时显示）

```
┌─────────────────────────────────────────┐
│ 失败原因                                │
│ 用户名或密码错误                        │
└─────────────────────────────────────────┘
```

### 5. 操作链接

```
[查看执行日志] [查看测试报告] [重新测试]
```

## 数据结构

### 执行结果对象
```javascript
{
  executionId: 1761017099998,       // 执行记录ID
  caseId: 1,                        // 用例ID
  caseName: '正常登录测试',          // 用例名称
  status: 'passed',                 // 执行状态
  duration: 705,                    // 执行耗时(ms)
  startTime: '2025-10-21T11:24:59.2932349',  // 开始时间
  endTime: '2025-10-21T11:24:59.9987879',    // 结束时间
  responseStatus: 200,              // 响应状态码
  assertionsPassed: 4,              // 断言通过数
  assertionsFailed: 0,              // 断言失败数
  failureMessage: null,             // 失败信息
  logsLink: '/api/test-results/1761017099998/logs',  // 日志链接
  reportId: 45                      // 报告ID
}
```

## 字段映射（驼峰命名适配）

| 后端字段 | 前端字段 | 说明 |
|---------|---------|------|
| executionId | executionId | 执行ID |
| caseId | caseId | 用例ID |
| caseName | caseName | 用例名称 |
| status | status | 执行状态 |
| duration | duration | 执行耗时 |
| startTime | startTime | 开始时间 |
| endTime | endTime | 结束时间 |
| responseStatus | responseStatus | 响应状态码 |
| assertionsPassed | assertionsPassed | 断言通过数 |
| assertionsFailed | assertionsFailed | 断言失败数 |
| logsLink | logsLink | 日志链接 |
| reportId | reportId | 报告ID |

## 操作功能

### 1. 查看执行日志
```javascript
const handleViewLogs = () => {
  if (executionResult.value && executionResult.value.logsLink) {
    window.open(executionResult.value.logsLink, '_blank')
  } else {
    ElMessage.info('日志链接不可用')
  }
}
```
- 新窗口打开日志页面
- URL：`/api/test-results/{execution_id}/logs`

### 2. 查看测试报告
```javascript
const handleViewReport = () => {
  if (executionResult.value && executionResult.value.reportId) {
    ElMessage.info(`查看报告ID: ${executionResult.value.reportId}`)
    // TODO: 跳转到报告详情页面
    // router.push(`/reports/${executionResult.value.reportId}`)
  }
}
```
- 跳转到报告详情页面
- 报告ID：`reportId`

### 3. 重新测试
```javascript
const handleRetestFromResult = () => {
  resultDialogVisible.value = false
  executeDialogVisible.value = true
}
```
- 关闭结果对话框
- 重新打开执行配置对话框
- 保持上次的配置参数

## 样式设计

### 状态横幅

#### 通过状态
```css
.result-banner.status-passed {
  background: linear-gradient(135deg, #f0f9ff 0%, #e1f3d8 100%);
  border: 2px solid #67c23a;
}
```
- 绿色渐变背景
- 绿色边框
- 大绿勾图标

#### 失败状态
```css
.result-banner.status-failed {
  background: linear-gradient(135deg, #fef0f0 0%, #fde2e2 100%);
  border: 2px solid #f56c6c;
}
```
- 红色渐变背景
- 红色边框
- 大红叉图标

### 信息卡片
```css
.info-card {
  background: #fafafa;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
}
```
- 浅灰背景
- 居中对齐
- 圆角边框

### 颜色系统
- **执行耗时**：蓝色高亮（#409eff）
- **断言通过**：绿色（#67c23a）
- **断言失败**：红色（#f56c6c）
- **时间信息**：灰色背景

## 展示流程

### 完整流程
```
1. 用户点击"执行测试"
2. 打开执行配置对话框
3. 配置执行参数
4. 点击"开始执行"
5. 显示loading状态："执行中..."
6. 调用后端API
7. 后端执行测试
8. 返回执行结果
9. 关闭配置对话框
10. 弹出执行结果对话框 ← 新增
11. 展示详细的执行信息
12. 用户可以：
    - 查看执行日志
    - 查看测试报告
    - 重新测试
    - 关闭对话框
13. 刷新执行历史列表
```

## UI设计示例

### 测试通过
```
┌──────────────── 测试执行结果 ────────────────┐
│                                             │
│ ╔═══════════════════════════════════════╗  │
│ ║   ✓                                  ║  │
│ ║  [60px]  ✓ 测试通过                  ║  │
│ ║   图标   正常登录测试                 ║  │
│ ╚═══════════════════════════════════════╝  │
│                                             │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐      │
│ │执行ID│ │状态码│ │耗时  │ │断言  │      │
│ │176..│ │ [200]│ │705ms │ │4通过 │      │
│ └──────┘ └──────┘ └──────┘ └──────┘      │
│                                             │
│ ┌─────────────────────────────────────┐   │
│ │ 开始时间：2025-10-21 11:24:59      │   │
│ │ 结束时间：2025-10-21 11:24:59      │   │
│ └─────────────────────────────────────┘   │
│                                             │
│   [查看执行日志] [查看测试报告] [重新测试]   │
│                                             │
├─────────────────────────────────────────────┤
│                                  [关闭]     │
└─────────────────────────────────────────────┘
```

## 数据适配

### 后端返回（驼峰命名）
```json
{
  "code": 1,
  "msg": "用例执行完成",
  "data": {
    "executionId": 1761017099998,
    "caseId": 1,
    "caseName": "正常登录测试",
    "status": "passed",
    "duration": 705,
    "startTime": "2025-10-21T11:24:59.2932349",
    "endTime": "2025-10-21T11:24:59.9987879",
    "responseStatus": 200,
    "assertionsPassed": 4,
    "assertionsFailed": 0,
    "logsLink": "/api/test-results/1761017099998/logs",
    "reportId": 45
  }
}
```

### 前端处理
```javascript
executionResult.value = {
  executionId: response.data.executionId || response.data.execution_id,
  caseId: response.data.caseId || response.data.case_id,
  caseName: response.data.caseName || response.data.case_name,
  status: response.data.status,
  duration: response.data.duration,
  startTime: response.data.startTime || response.data.start_time,
  endTime: response.data.endTime || response.data.end_time,
  responseStatus: response.data.responseStatus || response.data.response_status,
  assertionsPassed: response.data.assertionsPassed || response.data.assertions_passed || 0,
  assertionsFailed: response.data.assertionsFailed || response.data.assertions_failed || 0,
  failureMessage: response.data.failureMessage || response.data.failure_message,
  logsLink: response.data.logsLink || response.data.logs_link,
  reportId: response.data.reportId || response.data.report_id
}
```

## 优势特点

### 1. 可视化展示
- 大图标直观显示成功/失败
- 渐变背景增强视觉效果
- 卡片式信息展示

### 2. 信息完整
- 执行ID、状态码、耗时、断言结果
- 开始和结束时间
- 失败原因（如有）

### 3. 快速操作
- 一键查看日志
- 一键查看报告
- 一键重新测试

### 4. 用户友好
- 清晰的层次结构
- 关键信息高亮
- 操作便捷

## 相关文件
- `src/components/cases/CaseDetail.vue` - 用例详情组件
- `src/api/testCase.js` - 测试用例API
