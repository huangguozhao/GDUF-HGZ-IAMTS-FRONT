# 测试用例详情页执行历史功能修复

## 问题描述

用户反馈：测试用例详情页面（**CaseDetail.vue**）中的执行历史部分没有调用 API 获取数据，只显示"该测试用例尚未执行"的空状态提示。

## 问题原因

原来的 `CaseDetail.vue` 组件中：
1. 执行历史数据完全依赖从父组件传入的 `props.executionHistory`
2. 没有主动调用 API 获取执行历史数据
3. 如果父组件没有传递数据，就一直显示空状态

```javascript
// 原来的实现
const displayHistory = computed(() => {
  if (props.executionHistory && props.executionHistory.length > 0) {
    return props.executionHistory
  }
  return []  // 如果 props 没有数据，就返回空数组
})
```

## 解决方案

### 1. 导入执行历史 API

在 `CaseDetail.vue` 中导入 `getExecutionRecords` API：

```javascript
import { 
  executeTestCase, 
  copyTestCase, 
  getTestCaseForCopy, 
  createTestCase, 
  updateTestCase, 
  createTestCaseShare, 
  revokeTestCaseShare,
  getExecutionRecords  // ✅ 新增
} from '../../api/testCase'
```

### 2. 添加响应式数据

```javascript
// 执行历史相关
const executionHistoryData = ref([])
const executionHistoryLoading = ref(false)
```

### 3. 实现 `loadExecutionHistory` 函数

```javascript
/**
 * 加载执行历史
 */
const loadExecutionHistory = async () => {
  try {
    executionHistoryLoading.value = true
    
    const params = {
      execution_scope: 'test_case',
      ref_id: props.testCase.caseId || props.testCase.case_id || props.testCase.id,
      page: 1,
      page_size: 5,  // 侧边栏只显示最近5条
      sort_by: 'start_time',
      sort_order: 'desc'
    }
    
    const response = await getExecutionRecords(params)
    
    if (response.code === 1 && response.data && response.data.items) {
      // 转换数据格式以适配现有模板
      executionHistoryData.value = response.data.items.map(item => ({
        id: item.record_id || item.recordId,
        status: mapExecutionStatus(item.status),
        action: getExecutionTypeText(item.execution_type || item.executionType),
        note: generateHistoryNote(item),
        executed_time: formatTime(item.start_time || item.startTime),
        executor: item.executor_info?.name || item.executorInfo?.name || '未知',
        environment: item.environment,
        duration: item.duration_seconds || item.durationSeconds,
        totalCases: item.total_cases || item.totalCases,
        passedCases: item.passed_cases || item.passedCases,
        failedCases: item.failed_cases || item.failedCases,
        successRate: item.success_rate || item.successRate
      }))
    } else {
      executionHistoryData.value = []
    }
  } catch (error) {
    console.error('加载执行历史失败:', error)
    executionHistoryData.value = []
  } finally {
    executionHistoryLoading.value = false
  }
}
```

### 4. 添加辅助函数

```javascript
/**
 * 映射执行状态
 */
const mapExecutionStatus = (status) => {
  const statusMap = {
    'completed': 'passed',
    'failed': 'failed',
    'running': 'running',
    'cancelled': 'cancelled'
  }
  return statusMap[status] || status
}

/**
 * 获取执行类型文本
 */
const getExecutionTypeText = (type) => {
  const typeMap = {
    'manual': '手动执行',
    'scheduled': '定时任务',
    'triggered': '触发执行'
  }
  return typeMap[type] || '手动执行'
}

/**
 * 生成历史记录的描述
 */
const generateHistoryNote = (item) => {
  const total = item.total_cases || item.totalCases || 0
  const passed = item.passed_cases || item.passedCases || 0
  const failed = item.failed_cases || item.failedCases || 0
  const successRate = item.success_rate || item.successRate || 0
  
  if (total > 0) {
    return `执行 ${total} 个用例，通过 ${passed} 个，失败 ${failed} 个，成功率 ${successRate.toFixed(2)}%`
  } else {
    const status = item.status
    if (status === 'completed') {
      return '执行成功'
    } else if (status === 'failed') {
      return item.error_message || item.errorMessage || '执行失败'
    } else {
      return '执行中...'
    }
  }
}
```

### 5. 更新 `displayHistory` 计算属性

```javascript
// 显示执行历史（优先使用API获取的数据）
const displayHistory = computed(() => {
  if (executionHistoryData.value && executionHistoryData.value.length > 0) {
    return executionHistoryData.value  // ✅ 优先使用从API获取的数据
  }
  
  if (props.executionHistory && props.executionHistory.length > 0) {
    return props.executionHistory  // 兼容：如果父组件传了数据也可以用
  }
  
  return []  // 都没有则返回空数组
})
```

### 6. 在组件挂载时加载数据

```javascript
import { ref, computed, reactive, onMounted } from 'vue'

// ...

onMounted(() => {
  loadExecutionHistory()  // ✅ 组件挂载时自动加载
})
```

### 7. 执行测试后刷新历史

在 `handleConfirmExecute` 函数中，执行成功后刷新历史记录：

```javascript
if (response.code === 1) {
  // ... 处理执行结果
  
  // 刷新执行历史
  loadExecutionHistory()  // ✅ 执行成功后刷新
  
  emit('refresh')
}
```

### 8. 添加 Loading 状态

在模板中添加 loading 状态显示：

```vue
<div v-loading="executionHistoryLoading" element-loading-text="加载中..." style="min-height: 100px;">
  <div v-if="displayHistory.length > 0" class="history-list">
    <!-- 历史记录列表 -->
  </div>
  <div v-else-if="!executionHistoryLoading" class="empty-history">
    <!-- 空状态提示 -->
  </div>
</div>
```

## 数据流程

```
组件挂载
  ↓
调用 loadExecutionHistory()
  ↓
调用 API: getExecutionRecords({
  execution_scope: 'test_case',
  ref_id: testCase.id,
  page: 1,
  page_size: 5
})
  ↓
后端返回数据
  ↓
数据格式转换
  ↓
更新 executionHistoryData
  ↓
displayHistory 计算属性自动更新
  ↓
UI 显示执行历史
```

## 执行测试后的流程

```
用户点击"执行测试"
  ↓
调用 executeTestCase API
  ↓
执行成功
  ↓
调用 loadExecutionHistory() 刷新历史
  ↓
显示最新的执行记录
```

## 数据格式转换

### 后端返回格式

```javascript
{
  "code": 1,
  "msg": "查询成功",
  "data": {
    "items": [
      {
        "record_id": 1,
        "execution_scope": "test_case",
        "ref_id": 123,
        "scope_name": "密码错误登录测试",
        "executed_by": 1,
        "executor_info": {
          "name": "张三",
          "avatar_url": "..."
        },
        "execution_type": "manual",
        "status": "completed",
        "start_time": "2025-10-21T13:40:00Z",
        "end_time": "2025-10-21T13:40:05Z",
        "duration_seconds": 5,
        "total_cases": 10,
        "passed_cases": 8,
        "failed_cases": 2,
        "success_rate": 80.00,
        "environment": "测试环境"
      }
    ],
    "total": 1,
    "page": 1,
    "page_size": 5
  }
}
```

### 前端显示格式

```javascript
{
  id: 1,
  status: 'passed',  // completed → passed
  action: '手动执行',  // manual → 手动执行
  note: '执行 10 个用例，通过 8 个，失败 2 个，成功率 80.00%',
  executed_time: '2025-10-21 13:40:00',  // 格式化后的时间
  executor: '张三',
  environment: '测试环境',
  duration: 5,
  totalCases: 10,
  passedCases: 8,
  failedCases: 2,
  successRate: 80.00
}
```

## 关键改进点

### ✅ 1. 主动获取数据
- 组件不再被动等待 props
- 主动调用 API 获取最新数据

### ✅ 2. 自动刷新
- 组件挂载时自动加载
- 执行测试后自动刷新

### ✅ 3. Loading 状态
- 加载时显示 loading 提示
- 提升用户体验

### ✅ 4. 智能降级
- 优先使用 API 数据
- 如果 API 失败，还可以使用 props 数据
- 向下兼容旧代码

### ✅ 5. 数据转换
- 将后端数据格式转换为前端需要的格式
- 支持驼峰和下划线命名兼容

## 测试要点

1. **组件挂载测试**
   - 打开测试用例详情页
   - 检查是否自动调用 API
   - 检查是否显示 loading 状态

2. **有数据场景**
   - 如果有执行历史，应该显示列表
   - 显示执行类型、状态、描述、时间

3. **无数据场景**
   - 如果没有执行历史，显示空状态提示
   - 提示"该测试用例尚未执行"

4. **执行测试场景**
   - 执行测试后
   - 执行历史应该自动刷新
   - 显示最新的执行记录

5. **错误处理**
   - API 调用失败时不应该崩溃
   - 应该在控制台输出错误信息
   - 显示空状态

## 相关文件

- **修改文件**: `src/components/cases/CaseDetail.vue`
- **使用 API**: `src/api/testCase.js` → `getExecutionRecords()`
- **后端接口**: `GET /execution-records`

## 影响范围

- ✅ 测试用例详情页的执行历史部分
- ✅ 不影响其他功能
- ✅ 向下兼容，不破坏现有代码

## 注意事项

1. **权限要求**: 用户需要有 `testcase:view` 权限才能查看执行历史
2. **性能优化**: 侧边栏只加载最近 5 条记录，避免数据过多
3. **错误处理**: 所有 API 调用都包含 try-catch 错误处理
4. **数据兼容**: 支持驼峰和下划线两种命名格式

## 后续优化建议

1. **点击查看更多**: 添加"查看全部历史"按钮，跳转到完整的历史记录页面
2. **实时更新**: 如果执行是异步的，可以考虑轮询或 WebSocket 实时更新
3. **缓存优化**: 可以考虑缓存执行历史数据，避免重复请求
4. **筛选功能**: 可以添加按状态、时间筛选的功能

---

**修复日期**: 2024-10-22  
**修复人**: Development Team  
**测试状态**: ✅ 已通过 Linter 检查

