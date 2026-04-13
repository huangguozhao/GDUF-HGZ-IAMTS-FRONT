# 执行历史数据展示问题诊断指南

## 问题现象

执行历史详情页面显示：
- 用例ID: 1
- 数据条数: 0
- 总记录数: 0
- 加载状态: 已完成

## 诊断步骤

### 1. 打开浏览器开发者工具

1. **按F12或右键选择"检查"**
2. **切换到Console标签页**
3. **刷新页面或重新进入执行历史页面**

### 2. 查看控制台输出

页面加载时会输出以下调试信息：

```
页面挂载，路由参数: {caseId: "1"}
页面挂载，查询参数: {caseName: "正常登录测试"}
用例名称: 正常登录测试
用例ID: 1
=== 检查执行记录 ===
所有执行记录: {code: 1, data: {...}}
总共有 X 条执行记录
执行记录列表:
1. 记录ID: X, 用例ID: X, 执行人: XXX
...
用例 1 的执行记录数量: X
开始加载执行历史，用例ID: 1
请求参数: {...}
API URL: /execution-records
API响应: {...}
响应状态码: 1
响应数据: {...}
响应消息: 查询执行记录成功
```

### 3. 检查Network标签页

1. **切换到Network标签页**
2. **刷新页面**
3. **查找 `/api/execution-records` 请求**
4. **点击该请求查看详情**

检查以下内容：
- **请求状态**: 应该是200
- **请求参数**: 查看Query String Parameters
- **响应内容**: 查看Response

### 4. 使用测试功能

页面上的调试信息面板包含两个按钮：

#### 测试API调用
点击"测试API调用"按钮，会在控制台输出：
```
=== 开始测试API调用 ===
当前用例ID: 1
测试1 - 简单参数: {...}
测试1 - 响应: {...}
测试2 - 查询所有执行记录: {...}
测试2 - 响应: {...}
测试3 - 查询特定用例执行记录: {...}
测试3 - 响应: {...}
```

#### 重新加载
点击"重新加载"按钮，会重新执行数据加载流程。

## 可能的问题和解决方案

### 问题1: 用例ID为空
**症状**: 控制台显示"用例ID为空，无法加载数据"
**原因**: 路由参数传递不正确
**解决方案**: 
1. 检查从CaseDetail.vue跳转时的参数
2. 确保testCase对象包含正确的ID字段

### 问题2: API请求失败
**症状**: Network标签页显示请求失败（4xx或5xx状态码）
**原因**: 后端接口问题
**解决方案**:
1. 检查后端服务是否正常运行
2. 检查API路径是否正确
3. 检查请求参数格式

### 问题3: API返回空数据
**症状**: API请求成功但返回空数据
**原因**: 数据库中没有执行记录
**解决方案**:
1. 检查数据库中是否有执行记录
2. 确认用例ID是否正确
3. 检查执行记录的ref_id字段

### 问题4: 数据转换失败
**症状**: API返回数据但前端显示为空
**原因**: 数据转换逻辑问题
**解决方案**:
1. 检查API返回的数据结构
2. 调整数据转换逻辑
3. 添加字段兼容性处理

## 常见API响应格式

### 成功响应
```json
{
  "code": 1,
  "msg": "查询执行记录成功",
  "data": {
    "total": 5,
    "items": [
      {
        "recordId": 5,
        "executionScope": "test_case",
        "refId": 1,
        "scopeName": "正常登录测试",
        "executedBy": 1,
        "executorInfo": {
          "userId": 1,
          "name": "系统管理员",
          "email": "admin@pamc.com",
          "avatarUrl": "https://avatar.example.com/admin.jpg",
          "phone": "13800000001",
          "departmentId": 1,
          "departmentName": "技术部",
          "employeeId": "EMP001",
          "position": "System Administrator",
          "status": "active"
        },
        "executionType": "manual",
        "environment": "dev",
        "status": "completed",
        "startTime": "2025-10-22T11:33:22",
        "endTime": "2025-10-22T11:33:22",
        "durationSeconds": 0,
        "totalCases": 1,
        "executedCases": 1,
        "passedCases": 1,
        "failedCases": 0,
        "skippedCases": 0,
        "successRate": 100,
        "reportUrl": "/api/reports/74",
        "createdAt": "2025-10-22T11:33:21",
        "updatedAt": "2025-10-22T11:33:22"
      }
    ],
    "page": 1,
    "pageSize": 3
  }
}
```

### 空数据响应
```json
{
  "code": 1,
  "msg": "查询执行记录成功",
  "data": {
    "total": 0,
    "items": [],
    "page": 1,
    "pageSize": 20
  }
}
```

### 错误响应
```json
{
  "code": 0,
  "msg": "查询执行记录失败",
  "data": null
}
```

## 调试技巧

### 1. 使用控制台命令
在控制台中可以直接调用API：
```javascript
// 测试API调用
getExecutionRecords({
  execution_scope: 'test_case',
  ref_id: 1,
  page: 1,
  page_size: 10
}).then(response => {
  console.log('API响应:', response)
})
```

### 2. 检查Vue组件状态
```javascript
// 检查组件数据
console.log('执行历史数据:', executionHistory.value)
console.log('分页信息:', pagination)
console.log('加载状态:', loading.value)
```

### 3. 网络请求分析
在Network标签页中：
1. 查看请求URL是否正确
2. 检查请求参数
3. 查看响应状态码
4. 分析响应内容

## 快速修复建议

### 1. 如果API返回空数据
- 确认用例是否已经执行过
- 检查执行记录的ref_id字段
- 尝试执行一次测试用例

### 2. 如果API请求失败
- 检查后端服务状态
- 验证API路径和参数
- 检查网络连接

### 3. 如果数据转换失败
- 检查API响应格式
- 调整数据转换逻辑
- 添加错误处理

## 联系支持

如果按照以上步骤仍无法解决问题，请提供以下信息：

1. **控制台完整输出**
2. **Network标签页的API请求详情**
3. **浏览器版本和操作系统**
4. **具体的错误信息**

---

**诊断指南版本**: 1.0  
**创建日期**: 2024-10-22  
**适用版本**: 执行历史详情页面 v1.0
