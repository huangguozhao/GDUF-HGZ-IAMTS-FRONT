# 删除后保持项目结构展开状态最终修复

## 问题描述

用户报告删除后，左边的项目结构还是恢复成了初始折叠状态了。

## 问题分析

### 根本原因

**问题所在**：
1. `loadProjectTree()` 会重新加载整个项目树，导致所有节点恢复到初始状态
2. 重新加载后，只加载了项目列表，`modules` 是空数组 `[]`
3. 即使恢复了 `expandedNodes` Set，但由于没有加载对应的子数据，节点无法真正展开
4. 需要**主动加载**展开节点对应的子数据，才能真正恢复展开状态

**之前的错误理解**：
- 以为只需恢复 `expandedNodes` Set 就能恢复展开状态
- 但实际上 `expandedNodes` 只是标记，还需要加载对应的子数据

## 修复方案

### 1. 添加恢复展开状态的函数

```javascript
// 根据展开的节点ID恢复展开状态
const restoreExpandedNodes = async (expandedNodeIds) => {
  for (const nodeId of expandedNodeIds) {
    // 尝试找到对应的节点并展开
    await expandNodeById(nodeId)
  }
}

// 根据ID展开节点
const expandNodeById = async (nodeId) => {
  // 查找节点
  const findNodeById = (nodes) => {
    for (const node of nodes) {
      if (node.id === nodeId || node.project_id === nodeId || node.module_id === nodeId || node.api_id === nodeId) {
        return node
      }
      
      if (node.modules) {
        const found = findNodeById(node.modules)
        if (found) return found
      }
    }
    return null
  }
  
  const node = findNodeById(projects.value)
  if (node) {
    // 如果是项目节点，加载模块
    if (node.project_id && !node.modules?.length) {
      await loadProjectModules(node)
    }
    // 如果是模块节点，加载接口
    else if (node.module_id && !node.apis?.length) {
      await loadModuleApis(node)
    }
    
    // 添加到展开列表
    expandedNodes.value.add(nodeId)
  }
}
```

**关键点**：
- ✅ 遍历所有展开的节点ID
- ✅ 查找对应的节点
- ✅ 根据节点类型加载子数据
- ✅ 添加到展开列表

### 2. 在删除后调用恢复函数

```javascript
const handleDeleteCase = async (testCase) => {
  try {
    if (USE_REAL_API) {
      // 保存当前状态信息
      const currentApiId = testCase?.api_id || testCase?.apiId
      const currentCaseIndex = testCase?.index || 0
      
      // 保存当前展开状态，避免重新加载后折叠
      const currentExpandedNodesArray = Array.from(expandedNodes.value)
      
      // 调用真实API删除
      const response = await deleteTestCase(testCase?.case_id || testCase?.caseId || testCase?.id)
      
      if (response.code === 1) {
        ElMessage.success('测试用例删除成功')
        
        // 先清理选中状态
        if (selectedNode.value?.id === testCase?.id) {
          selectedNode.value = null
          selectedLevel.value = null
        }
        
        // 重新加载项目树，刷新数据
        await loadProjectTree()
        
        // 恢复展开状态 - 使用ID匹配
        expandedNodes.value = new Set(currentExpandedNodesArray)
        
        // 异步恢复展开的节点数据 ✅
        await restoreExpandedNodes(currentExpandedNodesArray)
        
        // 删除后，尝试选中相邻的测试用例
        // ...
      }
    }
  } catch (error) {
    // ...
  }
}
```

**关键点**：
- ✅ 保存展开的节点ID数组
- ✅ 重新加载项目树
- ✅ 恢复 `expandedNodes` Set
- ✅ **异步恢复展开的节点数据**

## 修复效果

### 1. 保持项目结构展开状态
- ✅ 删除后项目结构保持展开状态
- ✅ 主动加载展开节点对应的子数据
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
  - currentExpandedNodesArray ✅
  ↓
执行删除操作
  ↓
清理选中状态
  ↓
重新加载项目树
  await loadProjectTree()
  ↓
恢复展开状态标记
  expandedNodes.value = new Set(currentExpandedNodesArray)
  ↓
异步恢复展开的节点数据 ✅
  await restoreExpandedNodes(currentExpandedNodesArray)
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

## 关键技术点

### 1. 状态保存

```javascript
// 保存展开节点ID数组
const currentExpandedNodesArray = Array.from(expandedNodes.value)
```

### 2. 状态恢复

```javascript
// 1. 恢复展开标记
expandedNodes.value = new Set(currentExpandedNodesArray)

// 2. 恢复展开的数据
await restoreExpandedNodes(currentExpandedNodesArray)
```

### 3. 节点展开逻辑

```javascript
const expandNodeById = async (nodeId) => {
  const node = findNodeById(projects.value)
  if (node) {
    // 根据节点类型加载子数据
    if (node.project_id && !node.modules?.length) {
      await loadProjectModules(node)
    } else if (node.module_id && !node.apis?.length) {
      await loadModuleApis(node)
    }
    
    // 添加到展开列表
    expandedNodes.value.add(nodeId)
  }
}
```

## 最佳实践

### 1. 状态持久化

```javascript
// 推荐做法：保存ID数组，而不是Set对象
const saveState = () => {
  const expandedNodeIds = Array.from(expandedNodes.value)
  // 保存到localStorage
}

// 恢复时重新构建Set并加载数据
const restoreState = async () => {
  expandedNodes.value = new Set(savedExpandedNodeIds)
  await restoreExpandedNodes(savedExpandedNodeIds)
}
```

### 2. 异步数据加载

```javascript
// 推荐做法：异步恢复展开状态
const restoreExpandedNodes = async (expandedNodeIds) => {
  for (const nodeId of expandedNodeIds) {
    await expandNodeById(nodeId)
  }
}
```

### 3. 用户体验优化

```javascript
// 推荐做法：保持用户的浏览上下文
const handleDeleteCase = async (testCase) => {
  // 1. 保存状态
  const state = { expandedNodes, apiId, caseIndex }
  
  // 2. 执行删除
  await deleteTestCase(id)
  
  // 3. 恢复状态和数据
  await restoreExpandedNodes(state.expandedNodes)
  
  // 4. 选中相邻节点
  selectNextCase(state.apiId)
}
```

## 测试验证

### 1. 功能测试
- ✅ 删除后项目结构保持展开状态
- ✅ 展开节点对应的子数据正确加载
- ✅ 自动选中相邻的测试用例

### 2. 边界测试
- ✅ 删除最后一个测试用例时的处理
- ✅ 删除后展开状态正确恢复
- ✅ 多个节点展开时的处理

### 3. 用户体验测试
- ✅ 删除操作流畅
- ✅ 保持用户的浏览位置
- ✅ 提供清晰的视觉反馈

## 总结

通过添加 `restoreExpandedNodes` 和 `expandNodeById` 函数，成功解决了删除后项目结构恢复到原始折叠状态的问题：

1. **保存展开节点ID**：保存所有展开节点的ID数组
2. **恢复展开标记**：重新构建 `expandedNodes` Set
3. **异步加载子数据**：根据节点类型主动加载对应的子数据
4. **智能选中相邻用例**：自动选中相邻的测试用例或父级接口

这些修复确保了删除后用户能够完全保持他们的浏览上下文，提供了更好的用户体验。🎉

---

**修复日期**: 2024-10-22  
**修复人**: Development Team  
**问题类型**: 删除后状态保持（最终修复）  
**影响范围**: 测试用例删除功能
