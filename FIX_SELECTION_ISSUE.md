# 项目选中状态问题修复说明

## 问题描述
在用例管理页面中，点击一个项目时，所有项目都显示为选中状态。

## 问题原因
1. **数据转换问题**：`transformProject` 函数生成的 `id` 字段不是唯一的
2. **字段命名不匹配**：后端返回的是 `projectId`（驼峰命名），但前端期望的是 `project_id`（下划线命名）
3. **选中状态判断**：Vue模板中使用 `selectedNode?.id === project.id` 来判断选中状态
4. **重复ID**：由于字段名不匹配，所有项目的 `id` 都变成了 `undefined`，导致选中状态混乱

## 后端数据格式
```json
{
  "projectId": 1,  // 驼峰命名
  "name": "PAMC Exchange Platform",
  "description": "...",
  "createdAt": "2025-10-19T10:38:36",  // 驼峰命名
  "updatedAt": "2025-10-19T10:38:36"   // 驼峰命名
}
```

## 修复方案
修改 `src/utils/dataTransform.js` 文件中的数据转换函数，兼容两种命名方式：

### 修改前
```javascript
export function transformProject(project) {
  return {
    id: project.project_id, // undefined，因为后端返回的是 projectId
    project_id: project.project_id,
    // ...
  }
}
```

### 修改后
```javascript
export function transformProject(project) {
  return {
    id: project.projectId || project.project_id, // 兼容两种命名方式
    project_id: project.projectId || project.project_id,
    created_time: project.createdAt || project.created_at,
    updated_time: project.updatedAt || project.updated_at,
    // ...
  }
}
```

## 修改内容
1. **项目转换**：`id: project.projectId || project.project_id`
2. **模块转换**：`id: module.moduleId || module.module_id`
3. **接口转换**：`id: api.apiId || api.api_id`
4. **测试用例转换**：`id: testCase.caseId || testCase.case_id`

## 验证步骤
1. 重启前端开发服务器
2. 访问用例管理页面
3. 点击不同的项目，确认只有被点击的项目显示为选中状态
4. 检查浏览器控制台，确认项目ID正确显示（1, 2, 3, 4, 5...）

## 注意事项
- 确保后端返回的ID是唯一的
- 兼容驼峰命名和下划线命名两种格式
- 选中状态判断逻辑：`selectedNode?.id === project.id && selectedLevel === 'project'`

## 相关文件
- `src/utils/dataTransform.js` - 数据转换函数
- `src/views/Cases.vue` - 用例管理页面
- `src/components/cases/TreeNode.vue` - 树节点组件
