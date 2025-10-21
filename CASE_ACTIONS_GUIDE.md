# 测试用例操作按钮说明

## 功能概述
为测试用例详情页面添加了完整的操作按钮组，包括主要操作和更多操作下拉菜单。

## 操作按钮布局

### 位置
位于用例标题的右侧，与标题在同一行

### 按钮组成
```
┌──────────────────────────────────────────────────────┐
│ 登录功能验证     [执行测试] [编辑] [复制] [更多 ▼]    │
└──────────────────────────────────────────────────────┘
```

## 主要操作按钮

### 1. 执行测试（主按钮）
- **图标**：CaretRight（播放图标）
- **类型**：primary（蓝色）
- **功能**：执行该测试用例
- **点击效果**：
  ```javascript
  handleExecute() {
    ElMessage.info(`正在执行测试用例：${testCase.name}`)
    // TODO: 调用执行测试API
  }
  ```

### 2. 编辑
- **图标**：Edit（编辑图标）
- **类型**：default（白色）
- **功能**：编辑测试用例信息
- **点击效果**：
  ```javascript
  handleEdit() {
    emit('edit', props.testCase)
  }
  ```

### 3. 复制
- **图标**：CopyDocument（复制图标）
- **类型**：default（白色）
- **功能**：复制当前用例创建新用例
- **点击效果**：
  ```javascript
  handleCopy() {
    ElMessage.success('用例已复制')
    // TODO: 实现复制功能
  }
  ```

### 4. 更多（下拉菜单）
- **图标**：MoreFilled（更多图标）
- **类型**：default（白色）
- **功能**：显示更多操作选项

## 更多操作菜单

### 下拉菜单项

#### 1. 导出用例
- **图标**：Download
- **功能**：导出用例为文件（JSON/Excel）
- **实现**：
  ```javascript
  case 'export':
    ElMessage.info('导出用例')
    // TODO: 实现导出功能
  ```

#### 2. 查看历史
- **图标**：Clock
- **功能**：查看完整的执行历史记录
- **实现**：
  ```javascript
  case 'history':
    ElMessage.info('查看历史')
    // TODO: 打开历史记录对话框
  ```

#### 3. 分享用例
- **图标**：Share
- **功能**：分享用例给其他成员
- **实现**：
  ```javascript
  case 'share':
    ElMessage.info('分享用例')
    // TODO: 实现分享功能
  ```

#### 4. 禁用用例（分隔线后）
- **图标**：CircleClose
- **功能**：禁用该测试用例（不删除）
- **实现**：
  ```javascript
  case 'disable':
    await ElMessageBox.confirm('确定要禁用用例吗？')
    ElMessage.success('用例已禁用')
    // TODO: 调用禁用API
  ```

#### 5. 删除用例（危险操作）
- **图标**：Delete
- **颜色**：红色文字
- **功能**：永久删除测试用例
- **实现**：
  ```javascript
  case 'delete':
    await ElMessageBox.confirm('确定要删除用例吗？此操作不可恢复！')
    emit('delete', props.testCase)
    emit('close')
    ElMessage.success('用例已删除')
  ```

## 按钮样式

### 主要按钮
```css
.case-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}
```

### 执行测试按钮（主按钮）
- 蓝色背景（type="primary"）
- 白色文字
- 带图标

### 其他按钮
- 白色背景（type="default"）
- 灰色边框
- 蓝色文字
- 带图标

### 下拉菜单
- 悬停高亮
- 危险操作（删除）使用红色文字
- 分隔线区分不同操作组

## 交互设计

### 1. 确认对话框
- **禁用用例**：黄色警告对话框
- **删除用例**：红色警告对话框，提示不可恢复

### 2. 消息提示
- **成功操作**：绿色成功提示
- **进行中操作**：蓝色信息提示
- **警告操作**：黄色警告提示
- **错误操作**：红色错误提示

### 3. 操作反馈
- 执行测试 → 显示"正在执行..."
- 复制用例 → 显示"用例已复制"
- 禁用用例 → 显示"用例已禁用"
- 删除用例 → 显示"用例已删除" + 关闭详情页

## 权限控制（建议）

### 操作权限等级
| 操作 | 权限要求 | 说明 |
|------|---------|------|
| 执行测试 | 测试员 | 所有测试人员可执行 |
| 编辑 | 创建者/管理员 | 只有创建者或管理员可编辑 |
| 复制 | 测试员 | 所有测试人员可复制 |
| 导出 | 测试员 | 所有测试人员可导出 |
| 查看历史 | 测试员 | 所有测试人员可查看 |
| 分享 | 测试员 | 所有测试人员可分享 |
| 禁用 | 创建者/管理员 | 只有创建者或管理员可禁用 |
| 删除 | 创建者/管理员 | 只有创建者或管理员可删除 |

## 实现建议

### 1. 执行测试功能
```javascript
const handleExecute = async () => {
  try {
    loading.value = true
    const response = await executeTestCase(testCase.api_id, testCase.case_id)
    
    if (response.code === 1) {
      ElMessage.success('测试执行成功')
      // 刷新执行历史
      await loadExecutionHistory()
    } else {
      ElMessage.error(response.msg || '测试执行失败')
    }
  } catch (error) {
    ElMessage.error('测试执行失败')
  } finally {
    loading.value = false
  }
}
```

### 2. 复制用例功能
```javascript
const handleCopy = () => {
  // 打开创建用例对话框，预填充当前用例数据
  const copiedData = {
    ...props.testCase,
    id: null,
    case_id: null,
    name: `${props.testCase.name} (副本)`
  }
  
  emit('copy', copiedData)
}
```

### 3. 导出用例功能
```javascript
const handleExport = () => {
  // 导出为JSON格式
  const data = JSON.stringify(props.testCase, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${props.testCase.case_code || props.testCase.id}.json`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('用例已导出')
}
```

### 4. 禁用用例功能
```javascript
const handleDisable = async () => {
  try {
    const response = await updateTestCase(
      testCase.api_id, 
      testCase.case_id, 
      { is_enabled: false }
    )
    
    if (response.code === 1) {
      ElMessage.success('用例已禁用')
      emit('refresh')
    }
  } catch (error) {
    ElMessage.error('禁用失败')
  }
}
```

## 按钮布局示例

### 正常状态
```html
<div class="case-actions">
  <el-button type="primary" :icon="CaretRight">执行测试</el-button>
  <el-button :icon="Edit">编辑</el-button>
  <el-button :icon="CopyDocument">复制</el-button>
  <el-dropdown>
    <el-button :icon="MoreFilled">更多</el-button>
    <template #dropdown>
      <el-dropdown-menu>
        <!-- 菜单项 -->
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</div>
```

### 加载状态
```html
<el-button type="primary" :icon="CaretRight" loading>
  执行测试
</el-button>
```

### 禁用状态
```html
<el-button :icon="Edit" disabled>
  编辑
</el-button>
```

## 事件流程

### 1. 执行测试流程
```
点击"执行测试" 
  → 显示加载状态 
  → 调用后端API 
  → 显示执行结果 
  → 刷新执行历史
```

### 2. 编辑用例流程
```
点击"编辑" 
  → 触发edit事件 
  → 父组件打开编辑对话框 
  → 保存修改 
  → 刷新详情
```

### 3. 复制用例流程
```
点击"复制" 
  → 复制用例数据 
  → 打开创建对话框（预填充） 
  → 修改名称等信息 
  → 创建新用例
```

### 4. 删除用例流程
```
点击"更多" → "删除用例" 
  → 显示确认对话框 
  → 确认删除 
  → 调用删除API 
  → 关闭详情页 
  → 刷新列表
```

## 优势特点

### 1. 操作分组
- **主要操作**：执行、编辑、复制（常用）
- **更多操作**：导出、历史、分享、禁用、删除（不常用）

### 2. 视觉层次
- **主按钮**：蓝色，突出显示
- **次要按钮**：白色，正常显示
- **危险操作**：红色文字，警示作用

### 3. 交互友好
- **图标提示**：每个按钮都有图标
- **确认对话框**：危险操作需要确认
- **消息反馈**：每个操作都有消息提示

### 4. 扩展性
- **下拉菜单**：方便添加新操作
- **事件系统**：通过emit与父组件通信
- **权限控制**：易于添加权限判断

## 相关事件

### Emit事件
```javascript
emit('edit', testCase)      // 编辑用例
emit('delete', testCase)    // 删除用例
emit('close')               // 关闭详情页
emit('copy', copiedData)    // 复制用例（建议添加）
emit('refresh')             // 刷新数据（建议添加）
```

## 注意事项

1. **权限控制**：根据用户权限显示/隐藏按钮
2. **状态管理**：操作过程中显示loading状态
3. **错误处理**：操作失败时显示友好的错误提示
4. **数据同步**：操作成功后及时刷新相关数据

## 后续优化建议

1. **批量操作**：支持批量禁用、批量删除等
2. **快捷键**：添加键盘快捷键支持
3. **权限显示**：根据权限动态显示可用操作
4. **操作日志**：记录所有操作到日志
5. **撤销功能**：支持某些操作的撤销
6. **模板创建**：从现有用例创建模板
7. **标签管理**：快速添加/删除标签
8. **优先级调整**：快速修改优先级
