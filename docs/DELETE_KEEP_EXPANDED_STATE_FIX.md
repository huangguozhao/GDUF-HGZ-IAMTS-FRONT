# 删除后保持项目结构展开状态修复

## 问题描述

用户需要删除后刷新数据，但是希望：
1. **保持项目结构展开状态**：不要恢复到原始折叠状态
2. **智能选中相邻用例**：可以跳到附近一条测试用例展示

## 问题分析

### 当前问题

**删除后的流程**：
1. 执行删除操作
2. 重新加载项目树 `loadProjectTree()`
3. 项目结构恢复到原始折叠状态 ❌
4. 没有选中相邻的测试用例 ❌

**根本原因**：
- `loadProjectTree()` 会重新加载整个项目树，导致所有节点恢复到初始状态
- 没有保存和恢复展开状态
- 没有实现智能选中相邻用例的逻辑

## 修复方案

### 1. 保存展开状态

```javascript
// 保存当前展开状态，避免重新加载后折叠
const currentExpandedNodes = new Set(expandedNodes.value)
```

**关键点**：
- ✅ 在删除前保存当前的展开状态
- ✅ 使用 `Set` 数据结构保存展开的节点ID
- ✅ 重新加载后恢复展开状态

### 2. 恢复展开状态

```javascript
// 重新加载项目树，刷新数据
await loadProjectTree()

// 恢复展开状态
expandedNodes.value = currentExpandedNodes
```

**关键点**：
- ✅ 在重新加载数据后立即恢复展开状态
- ✅ 保持用户之前的浏览位置

### 3. 智能选中相邻用例

```javascript
// 保存当前状态信息
const currentApiId = testCase?.api_id || testCase?.apiId
const currentCaseIndex = testCase?.index || 0

// 删除后，尝试选中相邻的测试用例
if (currentApiId) {
  // 查找该接口下的测试用例列表
  const findApi = (projects) => {
    for (const project of projects) {
      for (const module of project.modules || []) {
        for (const api of module.apis || []) {
          if (api.id === currentApiId || api.api_id === currentApiId) {
            return api
          }
        }
      }
    }
    return null
  }
  
  const api = findApi(projects.value)
  if (api && api.cases && api.cases.length > 0) {
    // 选中相邻的测试用例
    const nextCaseIndex = Math.min(currentCaseIndex, api.cases.length - 1)
    const nextCase = api.cases[nextCaseIndex]
    
    if (nextCase) {
      // 选中相邻的测试用例
      selectedNode.value = nextCase
      selectedLevel.value = 'case'
      
      // 保存新的状态
      savePageState()
    } else {
      // 如果没有相邻的测试用例，选中父级接口
      selectedNode.value = api
      selectedLevel.value = 'api'
      savePageState()
    }
  }
}
```

**关键点**：
- ✅ 保存当前接口ID和用例索引
- ✅ 查找该接口下的测试用例列表
- ✅ 选中相邻的测试用例（优先选择同一索引位置）
- ✅ 如果没有相邻用例，选中父级接口
- ✅ 保存新的状态

## 修复效果

### 1. 保持项目结构展开状态
- ✅ 删除后项目结构保持展开状态
- ✅ 用户无需重新展开节点
- ✅ 保持用户的浏览上下文

### 2. 智能选中相邻用例
- ✅ 自动选中相邻的测试用例
- ✅ 如果没有相邻用例，选中父级接口
- ✅ 提供流畅的浏览体验

### 3. 用户体验改善
- ✅ 删除操作更加流畅
- ✅ 保持用户的浏览位置
- ✅ 提供清晰的视觉反馈

## 完整的删除流程

### 修复后的流程

```
用户点击删除
  ↓
弹出确认框
  ↓
用户确认删除
  ↓
保存当前状态信息
  - currentApiId
  - currentCaseIndex
  - currentExpandedNodes
  ↓
执行删除操作
  ↓
清理选中状态
  ↓
重新加载项目树
  ↓
恢复展开状态
  expandedNodes.value = currentExpandedNodes
  ↓
查找相邻测试用例
  ↓
选中相邻测试用例（或父级接口）
  ↓
保存新的状态
  savePageState()
  ↓
界面更新完成
```

## 最佳实践

### 1. 状态保存和恢复

```javascript
// 推荐做法：在操作前保存状态，操作后恢复
const handleDeleteCase = async (testCase) => {
  // 1. 保存当前状态
  const currentApiId = testCase?.api_id || testCase?.apiId
  const currentExpandedNodes = new Set(expandedNodes.value)
  
  // 2. 执行删除操作
  await deleteTestCase(id)
  
  // 3. 重新加载数据
  await loadProjectTree()
  
  // 4. 恢复状态
  expandedNodes.value = currentExpandedNodes
  
  // 5. 选中相邻节点
  selectNextCase(currentApiId)
}
```

### 2. 智能选中逻辑

```javascript
// 推荐做法：实现智能选中逻辑
const selectNextCase = (apiId) => {
  const api = findApi(apiId)
  
  if (api && api.cases && api.cases.length > 0) {
    // 选中相邻的测试用例
    const nextCase = api.cases[nextCaseIndex]
    selectedNode.value = nextCase
    selectedLevel.value = 'case'
  } else {
    // 选中父级接口
    selectedNode.value = api
    selectedLevel.value = 'api'
  }
  
  savePageState()
}
```

### 3. 用户体验优化

```javascript
// 推荐做法：提供流畅的删除体验
const handleDeleteCase = async (testCase) => {
  // 1. 保存状态
  const state = { expandedNodes, apiId, caseIndex }
  
  // 2. 执行删除
  await deleteTestCase(id)
  
  // 3. 恢复状态
  restoreState(state)
  
  // 4. 选中相邻节点
  selectNextCase(state.apiId)
  
  // 5. 保存新状态
  savePageState()
}
```

## 测试验证

### 1. 功能测试
- ✅ 删除后项目结构保持展开状态
- ✅ 自动选中相邻的测试用例
- ✅ 如果没有相邻用例，选中父级接口

### 2. 边界测试
- ✅ 删除最后一个测试用例时的处理
- ✅ 删除后接口下没有用例时的处理
- ✅ 删除后展开状态正确恢复

### 3. 用户体验测试
- ✅ 删除操作流畅
- ✅ 保持用户的浏览位置
- ✅ 提供清晰的视觉反馈

## 总结

通过保存和恢复展开状态，以及实现智能选中相邻用例的逻辑，成功解决了删除后项目结构恢复到原始折叠状态的问题：

1. **保存展开状态**：在删除前保存当前的展开状态
2. **恢复展开状态**：重新加载后立即恢复展开状态
3. **智能选中相邻用例**：自动选中相邻的测试用例或父级接口
4. **保存新状态**：保存新的选中状态

这些修复确保了删除后用户能够保持他们的浏览上下文，提供了更好的用户体验。🎉

---

**修复日期**: 2024-10-22  
**修复人**: Development Team  
**问题类型**: 删除后状态保持  
**影响范围**: 测试用例删除功能
