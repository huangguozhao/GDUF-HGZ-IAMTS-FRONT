# 执行历史功能修复验证文档

## 问题描述

用户反馈：测试用例详情页面中的执行历史只请求了一次，而且点开每个用例执行历史都不变，这是个大问题。

## 问题根因分析

### 1. **数据源冲突**
- **父组件** (`Cases.vue`) 使用 `getTestCaseHistory(caseId)` API
- **子组件** (`CaseDetail.vue`) 使用 `getExecutionRecords()` API
- 两个组件都在加载执行历史数据，导致冲突

### 2. **API 路径不一致**
- 父组件：`/test-cases/${caseId}/execution-history` (旧API)
- 子组件：`/execution-records` (新API，符合后端文档)

### 3. **缺少响应式监听**
- 子组件没有监听 `props.testCase` 的变化
- 切换用例时不会重新加载数据

### 4. **数据格式不统一**
- 父组件和子组件期望的数据格式不同
- 导致显示异常

## 修复方案

### ✅ 1. 移除父组件的数据加载责任

**修改文件**: `src/views/Cases.vue`

```javascript
// 选择节点时，不再加载执行历史
else if (level === 'case') {
  // 清空之前的执行历史，让子组件重新加载
  executionHistory.value = []
}

// 废弃 loadTestCaseHistory 函数
const loadTestCaseHistory = async (testCase) => {
  console.log('loadTestCaseHistory 已废弃，执行历史由 CaseDetail 组件处理')
  executionHistory.value = []
}
```

### ✅ 2. 增强子组件的响应式监听

**修改文件**: `src/components/cases/CaseDetail.vue`

```javascript
// 监听 testCase 变化，重新加载执行历史
watch(
  () => props.testCase?.id || props.testCase?.caseId || props.testCase?.case_id,
  (newId, oldId) => {
    // 只有当用例ID真正发生变化时才重新加载
    if (newId && newId !== oldId) {
      console.log('测试用例ID变化，重新加载执行历史:', { oldId, newId })
      loadExecutionHistory()
    }
  },
  { immediate: true }  // 立即执行一次
)
```

### ✅ 3. 统一数据源

```javascript
// 只使用子组件自己获取的数据，忽略父组件传递的数据
const displayHistory = computed(() => {
  return executionHistoryData.value || []
})
```

### ✅ 4. 增强调试日志

```javascript
const loadExecutionHistory = async () => {
  const caseId = props.testCase?.caseId || props.testCase?.case_id || props.testCase?.id
  console.log('开始加载执行历史，用例ID:', caseId, '用例信息:', props.testCase)
  
  const params = {
    execution_scope: 'test_case',
    ref_id: caseId,
    // ...
  }
  
  console.log('请求执行历史参数:', params)
  const response = await getExecutionRecords(params)
  console.log('执行历史API响应:', response)
}
```

## 验证步骤

### 1. **基础功能验证**

#### 1.1 打开浏览器开发者工具
- 按 F12 打开控制台
- 切换到 Network 标签页

#### 1.2 测试用例切换
1. 打开测试用例详情页面
2. 点击不同的测试用例
3. 观察控制台日志和网络请求

**预期结果**:
```
测试用例ID变化，重新加载执行历史: { oldId: 123, newId: 456 }
开始加载执行历史，用例ID: 456 用例信息: {...}
请求执行历史参数: { execution_scope: 'test_case', ref_id: 456, ... }
```

#### 1.3 网络请求验证
- 每次切换用例都应该有新的 API 请求
- 请求 URL: `GET /execution-records?execution_scope=test_case&ref_id=XXX`
- 请求参数中的 `ref_id` 应该对应不同的用例ID

### 2. **数据一致性验证**

#### 2.1 有执行历史的用例
- 选择有执行历史的测试用例
- 检查执行历史列表是否正确显示
- 验证数据格式：状态、时间、描述等

#### 2.2 无执行历史的用例
- 选择没有执行历史的测试用例
- 检查是否显示"该测试用例尚未执行"提示

### 3. **执行测试后验证**

#### 3.1 执行测试
1. 选择一个测试用例
2. 点击"执行测试"按钮
3. 完成测试执行

#### 3.2 验证自动刷新
- 执行完成后，执行历史应该自动刷新
- 控制台应该显示新的加载日志
- 最新的执行记录应该出现在列表顶部

### 4. **错误处理验证**

#### 4.1 网络错误
- 断网或模拟网络错误
- 检查是否显示适当的错误提示
- 组件不应该崩溃

#### 4.2 数据格式错误
- 模拟后端返回异常数据
- 检查错误处理是否正常

## 调试技巧

### 1. **控制台日志监控**

关键日志信息：
```javascript
// 用例切换
测试用例ID变化，重新加载执行历史: { oldId: 123, newId: 456 }

// API 请求
开始加载执行历史，用例ID: 456 用例信息: {...}
请求执行历史参数: { execution_scope: 'test_case', ref_id: 456, ... }

// API 响应
执行历史API响应: { code: 1, data: {...} }
成功获取执行历史数据，条数: 3
转换后的执行历史数据: [...]
```

### 2. **网络请求监控**

在 Network 标签页中：
- 过滤 `execution-records` 请求
- 检查请求参数是否正确
- 检查响应数据格式

### 3. **Vue DevTools**

如果安装了 Vue DevTools：
- 检查 `executionHistoryData` 响应式数据
- 观察数据变化过程
- 验证计算属性 `displayHistory` 的值

## 常见问题排查

### Q1: 切换用例后执行历史没有变化

**排查步骤**:
1. 检查控制台是否有"测试用例ID变化"的日志
2. 检查用例ID是否正确传递
3. 检查 API 请求是否发出
4. 检查 API 响应数据

**可能原因**:
- 用例ID字段名不匹配
- watch 监听器没有正确触发
- API 请求失败

### Q2: 执行历史显示为空

**排查步骤**:
1. 检查 API 响应数据
2. 检查数据转换逻辑
3. 检查后端是否有该用例的执行记录

**可能原因**:
- 后端确实没有执行记录
- 数据转换逻辑错误
- API 返回格式不符合预期

### Q3: 执行测试后历史没有刷新

**排查步骤**:
1. 检查 `handleConfirmExecute` 中是否调用了 `loadExecutionHistory()`
2. 检查执行是否成功
3. 检查控制台是否有刷新日志

**可能原因**:
- 执行失败，没有触发刷新
- 刷新函数调用失败
- 新数据还没有同步到数据库

## 性能优化建议

### 1. **请求去重**
如果用户快速切换用例，可能会产生多个并发请求。可以考虑：
```javascript
// 添加请求去重逻辑
let currentRequest = null

const loadExecutionHistory = async () => {
  if (currentRequest) {
    currentRequest.cancel?.()
  }
  
  currentRequest = getExecutionRecords(params)
  // ...
}
```

### 2. **数据缓存**
对于频繁访问的用例，可以考虑缓存执行历史数据：
```javascript
const historyCache = new Map()

const loadExecutionHistory = async () => {
  const caseId = getCaseId()
  if (historyCache.has(caseId)) {
    executionHistoryData.value = historyCache.get(caseId)
    return
  }
  
  // 加载新数据并缓存
}
```

### 3. **分页加载**
如果执行历史很多，可以考虑分页加载：
```javascript
const loadMoreHistory = () => {
  // 加载更多历史记录
}
```

## 测试用例

### 自动化测试建议

```javascript
// 示例测试用例
describe('执行历史功能', () => {
  test('切换用例时应该重新加载执行历史', async () => {
    // 模拟用例切换
    // 验证 API 请求
    // 验证数据更新
  })
  
  test('执行测试后应该自动刷新历史', async () => {
    // 模拟测试执行
    // 验证历史刷新
  })
  
  test('无执行历史时应该显示空状态', async () => {
    // 模拟空数据
    // 验证空状态显示
  })
})
```

## 总结

通过以上修复，执行历史功能现在应该能够：

1. ✅ **正确响应用例切换** - 每次切换用例都会重新加载对应的执行历史
2. ✅ **使用统一的 API** - 只使用 `/execution-records` API，避免数据冲突
3. ✅ **自动刷新** - 执行测试后自动刷新历史记录
4. ✅ **错误处理** - 完善的错误处理和用户提示
5. ✅ **调试友好** - 详细的日志输出，便于问题排查

**关键改进**:
- 移除了父组件的数据加载责任
- 增强了子组件的响应式监听
- 统一了数据源和 API 调用
- 添加了详细的调试日志

现在每个测试用例的执行历史都应该独立且正确显示了！🎉

---

**修复日期**: 2024-10-22  
**验证状态**: 待验证  
**修复人**: Development Team
