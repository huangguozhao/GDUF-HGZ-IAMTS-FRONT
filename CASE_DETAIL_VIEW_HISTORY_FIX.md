# 测试用例详情页"查看历史"功能修复

## 问题描述

在测试用例详情页面（`CaseDetail.vue`）的"更多操作"下拉菜单中，"查看历史"选项点击后只显示提示信息，没有真正打开执行历史详情弹窗。

## 修复内容

### 修改文件

`src/components/cases/CaseDetail.vue`

### 修改位置

第 1646-1648 行，`handleMoreAction` 函数中的 `'history'` 命令处理逻辑

### 修改前

```javascript
case 'history':
  ElMessage.info('查看历史')
  // TODO: 打开历史记录对话框
  break
```

### 修改后

```javascript
case 'history':
  handleViewMoreHistory()
  break
```

## 功能说明

修复后，点击"更多操作" → "查看历史"将会：

1. ✅ 调用 `handleViewMoreHistory()` 函数
2. ✅ 打开 `ExecutionHistoryModal` 组件弹窗
3. ✅ 显示该测试用例的完整执行历史记录

## 相关组件

### ExecutionHistoryModal

已经在第 794-799 行引入并配置：

```vue
<!-- 执行历史弹窗 -->
<ExecutionHistoryModal
  v-model:visible="executionHistoryModalVisible"
  :test-case="testCase"
  @close="executionHistoryModalVisible = false"
/>
```

### handleViewMoreHistory 函数

在第 1086-1094 行已经实现：

```javascript
// 查看更多执行历史
const handleViewMoreHistory = () => {
  const caseId = props.testCase?.caseId || props.testCase?.case_id || props.testCase?.id
  if (caseId) {
    // 打开执行历史弹窗
    executionHistoryModalVisible.value = true
  } else {
    ElMessage.error('无法获取用例ID')
  }
}
```

## 使用场景

用户可以通过以下两种方式查看完整执行历史：

1. **侧边栏按钮**：点击执行历史区域底部的"查看更多执行历史"按钮
2. **更多操作菜单**：点击顶部操作栏的"更多" → "查看历史"（✨ 本次修复）

两种方式都会打开同一个执行历史详情弹窗，显示该测试用例的所有执行记录。

## 相关文件

- `src/components/cases/CaseDetail.vue` - 测试用例详情组件
- `src/components/cases/ExecutionHistoryModal.vue` - 执行历史弹窗组件

## 验证步骤

1. 打开任意测试用例详情页面
2. 点击右上角"更多"按钮
3. 选择"查看历史"菜单项
4. 应该弹出执行历史详情弹窗，显示该用例的所有执行记录

## 注意事项

- 执行历史数据由 `ExecutionHistoryModal` 组件自己负责加载
- 弹窗会显示该测试用例的所有执行记录（不限数量）
- 支持分页、排序和筛选功能

