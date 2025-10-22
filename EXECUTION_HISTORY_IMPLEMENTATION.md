# 测试用例执行历史功能实现文档

## 概述

本文档说明了测试用例详情页面中执行历史功能的实现细节。该功能允许用户查看、筛选和管理测试用例的执行历史记录。

## 实现内容

### 1. API 接口层 (`src/api/testCase.js`)

新增了以下执行历史相关的 API 接口：

#### 1.1 `getExecutionRecords(params)`
分页查询测试执行记录，支持多种筛选条件：
- `execution_scope`: 执行范围类型 (api/module/project/test_suite/test_case)
- `ref_id`: 关联ID（接口ID或用例ID）
- `executed_by`: 执行人ID
- `execution_type`: 执行类型 (manual/scheduled/triggered)
- `environment`: 执行环境
- `status`: 执行状态 (running/completed/failed/cancelled)
- `start_time_begin/end`: 时间范围筛选
- `search_keyword`: 搜索关键词
- `browser`: 浏览器类型
- `app_version`: 应用版本
- `sort_by/sort_order`: 排序配置
- `page/page_size`: 分页参数

#### 1.2 `getExecutionRecordById(recordId)`
根据ID查询执行记录详情

#### 1.3 `getRecentExecutionRecords(executionScope, refId, limit)`
根据执行范围查询最近的执行记录

#### 1.4 `updateExecutionRecord(recordId, data)`
更新执行记录

#### 1.5 `deleteExecutionRecord(recordId)`
删除执行记录（软删除）

#### 1.6 `batchDeleteExecutionRecords(recordIds)`
批量删除执行记录

#### 1.7 `getExecutionStatistics(params)`
获取执行记录统计信息

#### 1.8 `getExecutionRecordsByExecutor(executedBy, limit)`
根据执行人查询执行记录

### 2. 组件层 (`src/components/cases/ApiDetail.vue`)

#### 2.1 数据定义

```javascript
// 筛选条件
const historyFilter = reactive({
  period: '7days',     // 时间范围：7days/30days/90days/all
  status: ''           // 执行状态筛选
})

// 分页配置
const historyPagination = reactive({
  currentPage: 1,
  pageSize: 10
})

// 数据状态
const historyTotal = ref(0)              // 总记录数
const historyRecords = ref([])           // 历史记录列表
const historyLoading = ref(false)        // 加载状态
const historySearchText = ref('')        // 搜索关键词
```

#### 2.2 核心功能

**数据加载**
- `loadHistoryRecords()`: 根据筛选条件加载执行历史记录
- 自动将后端数据转换为前端展示格式
- 支持时间范围筛选（7天/30天/90天/全部）
- 支持状态筛选（全部/成功/失败）
- 支持关键词搜索

**时间范围计算**
- `getTimeRange()`: 根据选择的时间段计算起止时间
- 返回 ISO 8601 格式的时间字符串

**状态映射**
- `mapExecutionStatus()`: 将后端状态映射为前端显示状态
  - `completed` → `passed`
  - `failed` → `failed`
  - `running` → `running`
  - `cancelled` → `cancelled`

**时长格式化**
- `formatDuration()`: 格式化执行时长
  - < 1秒：显示毫秒 (如 "125ms")
  - < 60秒：显示秒 (如 "5.3s")
  - ≥ 60秒：显示分秒 (如 "2分30秒")

#### 2.3 用户操作

**查看详情** (`handleViewHistoryDetail`)
- 调用 API 获取完整的执行记录详情
- 在弹窗中展示详细信息：
  - 基本信息（执行ID、执行人、执行类型、环境等）
  - 执行统计（总用例数、通过数、失败数、成功率等）
  - 错误信息（如果有）
  - 测试报告链接（如果有）

**重新测试** (`handleRetestFromHistory`)
- 获取历史记录的执行配置
- 使用相同配置重新执行测试
- 执行完成后自动刷新历史记录列表

**删除记录** (`handleDeleteHistory`)
- 二次确认后删除执行记录
- 删除成功后自动刷新列表

**分页操作**
- `handleHistorySizeChange`: 改变每页显示数量
- `handleHistoryPageChange`: 切换页码

#### 2.4 响应式监听

```javascript
// 监听筛选条件变化
watch(
  () => [historyFilter.period, historyFilter.status, historySearchText.value],
  () => {
    historyPagination.currentPage = 1  // 重置到第一页
    loadHistoryRecords()               // 重新加载数据
  }
)

// 监听标签页切换
watch(activeTab, (newTab) => {
  if (newTab === 'history') {
    loadHistoryRecords()  // 切换到历史标签页时加载数据
  }
})

// 组件挂载时初始化
onMounted(() => {
  if (activeTab.value === 'history') {
    loadHistoryRecords()
  }
})
```

### 3. UI 界面

#### 3.1 筛选工具栏
- 时间范围选择器（最近7天/30天/90天/全部）
- 状态筛选器（全部/成功/失败）
- 搜索框（支持关键词搜索）
- 导出按钮

#### 3.2 历史记录表格
显示列：
- 测试时间
- 执行人（带头像）
- 响应状态码
- 响应时间
- 测试结果（带图标）
- 操作按钮（查看详情/重新测试/删除）

#### 3.3 分页组件
- 显示当前页和总记录数
- 支持切换每页显示数量（10/20/50/100）
- 支持页码跳转

#### 3.4 详情对话框
分为多个区域：
- **基本信息**：执行ID、范围、人员、类型、环境、状态、时间等
- **执行统计**：总用例数、通过数、失败数、跳过数、成功率
- **错误信息**：执行失败时的错误详情
- **测试报告**：查看完整报告的链接

### 4. 样式优化

#### 4.1 表格样式
- 斑马纹效果提升可读性
- 状态标签使用不同颜色区分
- 响应式布局适配不同屏幕

#### 4.2 详情对话框样式
- 分段展示，层次清晰
- 使用 Element Plus Descriptions 组件
- 错误信息高亮显示
- 成功率根据数值使用不同颜色

#### 4.3 交互反馈
- Loading 状态显示
- 操作成功/失败的消息提示
- 删除操作的二次确认

## 数据流

```
用户交互 → 触发筛选/分页 → 调用 loadHistoryRecords()
                                    ↓
                            调用 API getExecutionRecords()
                                    ↓
                            后端返回数据
                                    ↓
                            数据格式转换
                                    ↓
                            更新 historyRecords
                                    ↓
                            UI 自动更新
```

## 接口对接说明

### 后端响应格式

```javascript
{
  "code": 1,
  "msg": "查询成功",
  "data": {
    "total": 42,
    "items": [
      {
        "record_id": 1,
        "scope_name": "用户登录测试",
        "executed_by": 1,
        "executor_info": {
          "name": "张三",
          "avatar_url": "..."
        },
        "execution_type": "manual",
        "environment": "测试环境",
        "status": "completed",
        "start_time": "2024-03-12T15:30:45.000Z",
        "end_time": "2024-03-12T15:30:50.000Z",
        "duration_seconds": 5,
        "total_cases": 10,
        "passed_cases": 8,
        "failed_cases": 2,
        "skipped_cases": 0,
        "success_rate": 80.00,
        "error_message": null,
        "report_url": "..."
      }
    ],
    "page": 1,
    "page_size": 10
  }
}
```

### 字段映射

前端使用驼峰和下划线两种格式兼容：
- `record_id` / `recordId`
- `start_time` / `startTime`
- `executor_info` / `executorInfo`
- 等等...

## 使用示例

### 在其他页面中使用

```vue
<template>
  <api-detail 
    :api="currentApi" 
    :related-cases="relatedCases"
    @close="handleClose"
  />
</template>

<script setup>
import ApiDetail from '@/components/cases/ApiDetail.vue'

const currentApi = ref({
  id: 1,
  apiId: 1,
  name: '用户登录接口',
  method: 'POST',
  path: '/api/auth/login',
  // ...其他字段
})
</script>
```

## 注意事项

1. **权限控制**：所有接口调用都需要有效的 JWT Token
2. **错误处理**：所有 API 调用都包含 try-catch 错误处理
3. **数据刷新**：执行操作（删除、重新测试）后会自动刷新列表
4. **性能优化**：使用 watch 监听筛选条件变化，避免不必要的请求
5. **用户体验**：
   - Loading 状态提示
   - 操作反馈（成功/失败提示）
   - 二次确认（删除操作）

## 扩展功能建议

以下功能可以在后续版本中考虑：

1. **批量操作**：支持批量删除执行记录
2. **导出功能**：导出执行历史为 Excel/CSV
3. **趋势图表**：展示执行成功率趋势
4. **对比功能**：对比两次执行结果的差异
5. **筛选增强**：
   - 按执行人筛选
   - 按执行类型筛选
   - 自定义时间范围
6. **详情增强**：
   - 展示具体的测试步骤执行情况
   - 展示请求和响应的详细信息
   - 支持查看执行日志

## 更新日志

### v1.0.0 (2024-10-22)
- ✅ 实现执行历史的基础查询功能
- ✅ 实现筛选和分页功能
- ✅ 实现查看详情、重新测试、删除操作
- ✅ 添加响应式监听和自动刷新
- ✅ 优化 UI 样式和交互体验

## 相关文件

- `/src/api/testCase.js` - API 接口定义
- `/src/components/cases/ApiDetail.vue` - 主组件
- 后端接口：`/execution-records/*` - 执行记录相关接口

## 技术栈

- Vue 3 (Composition API)
- Element Plus
- Axios (请求库)
- JavaScript (ES6+)

---

**维护者**: Development Team  
**最后更新**: 2024-10-22

