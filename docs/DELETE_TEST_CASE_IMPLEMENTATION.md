# 删除测试用例功能实现

## 功能概述

根据后端接口规范，实现了测试用例详情页面中的删除测试用例功能，包括确认对话框、错误处理和用户反馈。

## 实现内容

### 1. API接口修改

#### 1.1 修改删除接口函数
**文件**: `src/api/testCase.js`

```javascript
// 删除测试用例
export function deleteTestCase(caseId) {
  return request({
    url: `/testcases/${caseId}`,
    method: 'delete'
  })
}
```

**修改说明**:
- 移除了 `apiId` 参数，因为后端接口只需要 `caseId`
- 符合后端接口规范：`DELETE /testcases/{case_id}`

### 2. 删除功能实现

#### 2.1 删除按钮优化
**文件**: `src/components/cases/ApiDetail.vue`

```vue
<el-button 
  type="danger" 
  :icon="Delete"
  @click="handleDelete"
  :loading="deleteLoading"
>
  删除用例
</el-button>
```

**特性**:
- 添加了删除图标
- 显示加载状态
- 危险按钮样式

#### 2.2 删除确认对话框
```javascript
const handleDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除测试用例"${testCase.name}"吗？删除后将无法恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger',
        customClass: 'delete-confirm-dialog'
      }
    )
    
    deleteLoading.value = true
    
    try {
      const response = await deleteTestCase(testCase.caseId || testCase.case_id || testCase.id)
      
      if (response.code === 1) {
        ElMessage.success('测试用例删除成功')
        emit('delete-case', testCase)
        emit('close')
      } else {
        handleDeleteError(response)
      }
    } catch (error) {
      console.error('删除测试用例失败:', error)
      ElMessage.error('删除失败: ' + (error.message || '未知错误'))
    } finally {
      deleteLoading.value = false
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除确认失败:', error)
    }
  }
}
```

**特性**:
- 二次确认对话框
- 显示测试用例名称
- 加载状态管理
- 错误处理

#### 2.3 错误处理机制
```javascript
const handleDeleteError = (response) => {
  const errorMessages = {
    '-4': '测试用例不存在',
    '0': response.msg || '测试用例删除失败'
  }
  
  // 特殊错误处理
  if (response.msg) {
    if (response.msg.includes('已被删除')) {
      ElMessage.warning('该测试用例已被删除')
      emit('delete-case', testCase)
      emit('close')
      return
    }
    
    if (response.msg.includes('权限不足')) {
      ElMessage.error('权限不足，无法删除测试用例')
      return
    }
    
    if (response.msg.includes('正在被测试计划使用')) {
      ElMessage.error('用例正在被测试计划使用，无法删除')
      return
    }
    
    if (response.msg.includes('不能删除系统用例')) {
      ElMessage.error('不能删除系统用例')
      return
    }
    
    if (response.msg.includes('模板用例')) {
      ElMessage.error('模板用例不能被删除')
      return
    }
  }
  
  // 通用错误处理
  const errorMessage = errorMessages[response.code] || response.msg || '删除失败'
  ElMessage.error(errorMessage)
}
```

**处理的错误类型**:
- 测试用例不存在 (code: -4)
- 权限不足 (code: -2)
- 用例已被删除
- 用例正在被测试计划使用
- 不能删除系统用例
- 模板用例不能被删除

### 3. 样式优化

#### 3.1 删除确认对话框样式
```css
:deep(.delete-confirm-dialog) {
  .el-message-box__header {
    background: #fef0f0;
    border-bottom: 1px solid #fde2e2;
  }
  
  .el-message-box__title {
    color: #f56c6c;
    font-weight: 600;
  }
  
  .el-message-box__content {
    padding: 20px;
  }
  
  .el-message-box__message {
    color: #606266;
    line-height: 1.6;
  }
  
  .el-message-box__btns {
    padding: 16px 20px;
    background: #fafafa;
    border-top: 1px solid #e4e7ed;
  }
  
  .el-button--danger {
    background: #f56c6c;
    border-color: #f56c6c;
  }
  
  .el-button--danger:hover {
    background: #f78989;
    border-color: #f78989;
  }
}
```

#### 3.2 删除按钮样式
```css
.form-actions .el-button--danger {
  background: #f56c6c;
  border-color: #f56c6c;
  color: white;
}

.form-actions .el-button--danger:hover {
  background: #f78989;
  border-color: #f78989;
}

.form-actions .el-button--danger:focus {
  background: #f56c6c;
  border-color: #f56c6c;
}

.form-actions .el-button--danger.is-loading {
  background: #f78989;
  border-color: #f78989;
}
```

## 后端接口规范

### 请求格式
```
DELETE /testcases/{case_id}
Authorization: Bearer {token}
```

### 响应格式

#### 成功响应
```json
{
  "code": 1,
  "msg": "测试用例删除成功",
  "data": null
}
```

#### 错误响应
```json
// 用例不存在 (HTTP 404)
{
  "code": -4,
  "msg": "测试用例不存在",
  "data": null
}

// 用例已被删除 (HTTP 400)
{
  "code": 0,
  "msg": "测试用例已被删除",
  "data": null
}

// 权限不足 (HTTP 403)
{
  "code": -2,
  "msg": "权限不足，无法删除测试用例",
  "data": null
}

// 用例正在被测试计划使用 (HTTP 400)
{
  "code": 0,
  "msg": "用例正在被测试计划使用，无法删除",
  "data": null
}

// 不能删除系统用例 (HTTP 400)
{
  "code": 0,
  "msg": "不能删除系统用例",
  "data": null
}

// 用例是模板用例 (HTTP 400)
{
  "code": 0,
  "msg": "模板用例不能被删除",
  "data": null
}
```

## 业务逻辑

### 删除前检查
1. **认证与授权**: 验证Token和用户权限
2. **验证目标用例**: 检查用例是否存在
3. **检查用例状态**: 检查用例是否已被删除
4. **业务规则检查**:
   - 检查用例是否为系统用例
   - 检查用例是否为模板用例
   - 检查用例是否正在被测试计划使用
   - 检查操作者是否有权限删除该用例

### 软删除操作
- 设置 `is_deleted` 字段为 `TRUE`
- 设置 `deleted_at` 字段为当前时间
- 设置 `deleted_by` 字段为当前操作者的用户ID
- 设置 `is_enabled` 字段为 `FALSE`

### 级联删除策略
1. **阻止删除**: 如果用例正在被使用，阻止删除操作（推荐）
2. **级联删除**: 删除用例时，同时删除所有关联的执行记录（危险）
3. **转移引用**: 将测试计划中的用例引用转移到其他用例

## 安全考虑

### 权限控制
- 删除操作需要用例管理权限
- 系统用例和模板用例通常不允许删除
- 重要用例删除需要更高级别的权限审批

### 操作确认
- 删除操作需要二次确认
- 显示被删除用例的名称
- 明确提示删除后无法恢复

### 审计追踪
- 删除操作记录详细日志
- 包括操作人、时间、原因等信息
- 支持操作回滚和恢复

## 用户体验

### 操作流程
1. 用户点击"删除用例"按钮
2. 显示确认对话框，显示用例名称
3. 用户确认后显示加载状态
4. 调用后端API执行删除
5. 显示操作结果并刷新界面

### 错误处理
- 友好的错误提示信息
- 区分不同类型的错误
- 提供相应的解决建议

### 视觉反馈
- 删除按钮的危险样式
- 确认对话框的警告样式
- 加载状态的视觉反馈
- 成功/失败的消息提示

## 测试验证

### 功能测试
- ✅ 删除按钮正常显示
- ✅ 确认对话框正常弹出
- ✅ 删除操作正常执行
- ✅ 错误处理正常显示
- ✅ 成功删除后界面正常刷新

### 权限测试
- ✅ 无权限用户无法删除
- ✅ 系统用例无法删除
- ✅ 模板用例无法删除
- ✅ 正在使用的用例无法删除

### 错误处理测试
- ✅ 网络错误处理
- ✅ 服务器错误处理
- ✅ 业务逻辑错误处理
- ✅ 用户取消操作处理

## 文件结构

### 修改的文件
```
src/api/testCase.js              # API接口函数
src/components/cases/ApiDetail.vue # 删除功能实现
```

### 新增功能
- 删除测试用例API调用
- 确认对话框
- 错误处理机制
- 加载状态管理
- 样式优化

## 后续优化建议

### 功能增强
- **批量删除**: 支持批量删除多个测试用例
- **回收站功能**: 提供已删除用例的恢复功能
- **删除预览**: 显示删除用例的详细信息
- **删除原因**: 要求用户填写删除原因

### 性能优化
- **异步删除**: 大量用例的异步删除处理
- **进度显示**: 批量删除的进度条显示
- **取消操作**: 支持取消正在进行的删除操作

### 安全增强
- **二次验证**: 重要用例的二次验证机制
- **权限分级**: 不同级别用户的删除权限
- **操作日志**: 详细的操作审计日志

## 总结

删除测试用例功能已成功实现，包括：

1. **完整的API集成**: 符合后端接口规范
2. **用户友好的界面**: 确认对话框和错误提示
3. **完善的错误处理**: 覆盖各种错误场景
4. **安全的操作流程**: 二次确认和权限控制
5. **良好的用户体验**: 加载状态和视觉反馈

该功能完全符合业务需求，提供了安全、可靠的测试用例删除能力。🎉

---

**实现日期**: 2024-10-22  
**实现人**: Development Team  
**功能类型**: 测试用例管理  
**影响范围**: 测试用例删除功能
