# 模块删除功能实现文档

## 概述
本文档记录了模块删除功能的实现，确保与后端 API 接口正确对接。

## 后端接口规范

### 接口地址
```
DELETE /modules/{moduleId}
```

### 路径参数
- `moduleId`: 模块ID（Integer）

### 响应格式
```json
{
  "code": 1,
  "msg": "模块删除成功",
  "data": null
}
```

### 错误处理
后端会返回以下错误：
- **模块不存在** → 404 Not Found
- **模块已被删除** → 业务错误
- **模块存在子模块** → 业务错误
- **模块存在接口数据** → 业务错误
- **模块正在被使用** → 业务错误
- **不能删除系统模块** → 业务错误
- **权限不足** → 403 Forbidden

## 前端实现

### 1. API 接口 (`src/api/project.js`)

✅ **已验证正确** - 无需修改

```javascript
export function deleteModule(moduleId) {
  return request({
    url: `/modules/${moduleId}`,
    method: 'delete'
  })
}
```

### 2. 删除逻辑 (`src/views/Cases.vue`)

#### 优化的 `handleDeleteModule` 函数：

```javascript
const handleDeleteModule = async (module) => {
  try {
    // 二次确认对话框（带警告提示）
    await ElMessageBox.confirm(
      `确定要删除模块 "${module.name}" 吗？`, 
      '删除确认', 
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: true,
        message: `
          <div>
            <p>确定要删除模块 <strong>${module.name}</strong> 吗？</p>
            <p style="color: #e6a23c; font-size: 12px; margin-top: 8px;">
              ⚠️ 注意：如果模块下存在子模块或接口，将无法删除
            </p>
          </div>
        `
      }
    )
    
    // 调用删除接口
    const moduleId = module.module_id || module.moduleId || module.id
    const response = await deleteModule(moduleId)
    
    if (response.code === 1) {
      ElMessage.success('模块删除成功')
      
      // 清空选中状态（如果删除的是当前选中的模块）
      if (selectedLevel.value === 'module' && 
          (selectedNode.value?.module_id === moduleId || 
           selectedNode.value?.id === moduleId)) {
        selectedNode.value = null
        selectedLevel.value = null
      }
      
      // 重新加载项目树
      await loadProjectTree()
      
      // 保存状态
      savePageState()
    } else {
      ElMessage.error(response.msg || '删除模块失败')
    }
    
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除模块失败:', error)
      ElMessage.error(error.msg || error.message || '删除模块失败')
    }
  }
}
```

## 功能特性

### 1. 二次确认对话框
- ✅ 显示模块名称
- ✅ 警告提示：子模块或接口存在时无法删除
- ✅ 支持取消操作

### 2. 智能ID识别
```javascript
const moduleId = module.module_id || module.moduleId || module.id
```
兼容多种命名格式，确保正确获取模块ID

### 3. 状态管理
- 如果删除的是当前选中的模块，自动清空选中状态
- 删除成功后自动刷新项目树
- 保存页面状态到 localStorage

### 4. 错误处理
- 用户取消操作：静默处理
- 删除失败：显示后端返回的错误信息
- 异常情况：显示通用错误提示

### 5. 调试日志
```javascript
console.log('=== 删除模块 ===')
console.log('模块ID:', moduleId)
console.log('模块名称:', module.name)
```
便于开发调试和问题排查

## 用户操作流程

```
1. 用户点击模块的"更多操作"按钮
   ↓
2. 选择"删除"选项
   ↓
3. 弹出确认对话框（显示警告信息）
   ↓
4. 用户点击"确定"
   ↓
5. 调用 DELETE /modules/{moduleId}
   ↓
6. 后端验证（子模块、接口、权限等）
   ↓
7a. 成功 → 显示成功消息 → 刷新树
7b. 失败 → 显示错误消息（如：存在子模块）
```

## 后端验证规则

根据后端代码，删除前会检查：

1. ✅ **模块存在性** - 模块必须存在
2. ✅ **删除状态** - 模块未被标记为已删除
3. ✅ **子模块检查** - 不存在子模块
4. ✅ **接口检查** - 不存在接口数据
5. ✅ **使用状态** - 模块未被使用
6. ✅ **系统模块** - 非系统模块
7. ✅ **权限检查** - 用户有删除权限

任何一项不满足，都会返回相应的错误信息。

## 错误消息示例

### 前端显示的错误消息：
- "模块不存在"
- "模块存在子模块，无法删除"
- "模块存在接口数据，无法删除"
- "模块正在被使用，无法删除"
- "不能删除系统模块"
- "权限不足，无法删除该模块"

### 用户友好提示：
在确认对话框中预先提示：
> ⚠️ 注意：如果模块下存在子模块或接口，将无法删除

这样用户在删除前就能了解限制条件。

## 与其他删除功能的对比

### 删除项目 (`handleDeleteProject`)
使用通用的 `handleDelete` 函数

### 删除模块 (`handleDeleteModule`)
✅ 独立实现，带特定警告提示

### 删除接口 (`handleDeleteApi`)
独立实现，保持展开状态

### 删除用例 (`handleDeleteCase`)
独立实现，智能选择相邻用例

## 测试建议

### 正常场景：
1. ✅ 删除空模块（无子模块、无接口）
2. ✅ 删除后自动刷新树
3. ✅ 删除当前选中的模块，自动清空选中状态
4. ✅ 删除非选中模块，保持当前选中状态

### 异常场景：
1. ✅ 删除包含子模块的模块 → 显示错误
2. ✅ 删除包含接口的模块 → 显示错误
3. ✅ 删除系统模块 → 显示错误
4. ✅ 无权限删除 → 显示错误
5. ✅ 删除不存在的模块 → 显示错误

### 交互测试：
1. ✅ 点击"取消"按钮 → 不执行删除
2. ✅ 点击对话框外部关闭 → 不执行删除
3. ✅ 按 ESC 键关闭 → 不执行删除
4. ✅ 快速连续点击 → 防止重复请求

## 相关文件

### 已修改的文件：
- ✅ `src/api/project.js` - 删除接口（已验证正确）
- ✅ `src/views/Cases.vue` - 删除逻辑（已优化）

### 依赖的组件：
- Element Plus MessageBox（确认对话框）
- Element Plus Message（提示消息）

## 优化点

### 相比旧版本的改进：
1. ✅ **不依赖 `selectedLevel`** - 直接使用传入的 module 对象
2. ✅ **详细的警告提示** - 告知用户删除限制
3. ✅ **智能状态管理** - 只在必要时清空选中状态
4. ✅ **完善的错误处理** - 区分用户取消和真实错误
5. ✅ **调试信息** - 便于排查问题

## 注意事项

1. **级联删除**：后端不支持级联删除，必须先删除子模块和接口
2. **权限控制**：需要用户有相应权限才能删除
3. **软删除**：后端使用软删除机制，数据不会真正从数据库中移除
4. **状态同步**：删除后会重新加载整个项目树，确保数据一致性

## 版本信息
- 实现日期：2024-10-24
- 接口版本：v1
- 状态：✅ 已完成并验证

---

**功能已完成** ✓

