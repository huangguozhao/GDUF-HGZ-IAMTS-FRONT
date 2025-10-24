# 模块新建功能实现文档

## 概述
本文档记录了在 Cases.vue 中实现项目结构的"新建模块"功能，使其与后端 API 接口对接的完整过程。

## 后端接口规范

### 接口地址
```
POST /modules
```

### 请求体 (CreateModuleDTO)
```typescript
{
  moduleCode?: string,        // 模块编码，项目内唯一（可选，留空则自动生成）
  projectId: number,          // 项目ID（必填）
  parentModuleId?: number,    // 父模块ID（可选）
  name: string,               // 模块名称（必填）
  description?: string,       // 模块描述
  sortOrder?: number,         // 排序顺序
  status?: string,            // 模块状态
  ownerId?: number,           // 模块负责人ID
  tags?: string[]             // 标签信息
}
```

### 响应格式
```typescript
{
  code: number,
  msg: string,
  data: CreateModuleResponseDTO
}
```

## 实现内容

### 1. API 接口更新 (`src/api/project.js`)

#### 更新点：
- 修改 `createModule` 函数，将请求发送到 `/modules` 端点（而非之前的 `/projects/${projectId}/modules`）
- 添加所有 DTO 字段的支持
- 统一使用驼峰命名法（后端要求）
- 添加调试日志以便排查问题

#### 代码示例：
```javascript
export function createModule(projectId, data) {
  const requestData = {
    projectId: projectId,
    moduleCode: data.module_code || data.moduleCode,
    name: data.name,
    description: data.description,
    parentModuleId: data.parent_module_id || data.parentModuleId || null,
    sortOrder: data.sort_order || data.sortOrder || 0,
    status: data.status || 'active',
    ownerId: data.owner_id || data.ownerId || null,
    tags: data.tags || []
  }
  
  return request({
    url: `/modules`,
    method: 'post',
    data: requestData
  })
}
```

### 2. 表单界面更新 (`src/views/Cases.vue`)

#### 新增字段：
1. **模块编码** - 支持手动输入或自动生成
2. **排序顺序** - 使用数字输入框控制显示顺序
3. **模块状态** - 下拉选择（活跃/已归档/已禁用）
4. **标签** - 多选标签支持

#### 表单布局：
```vue
<template v-if="dialogType === 'module'">
  <!-- 模块名称 -->
  <el-form-item label="模块名称" prop="name">
    <el-input v-model="formData.name" />
  </el-form-item>
  
  <!-- 模块编码 -->
  <el-form-item label="模块编码" prop="module_code">
    <el-input 
      v-model="formData.module_code" 
      :disabled="isEdit"
      placeholder="留空则自动生成"
    />
  </el-form-item>
  
  <!-- 排序顺序 -->
  <el-form-item label="排序顺序" prop="sort_order">
    <el-input-number 
      v-model="formData.sort_order" 
      :min="0" 
    />
  </el-form-item>
  
  <!-- 模块状态 -->
  <el-form-item label="模块状态" prop="status">
    <el-select v-model="formData.status">
      <el-option label="活跃" value="active" />
      <el-option label="已归档" value="archived" />
      <el-option label="已禁用" value="disabled" />
    </el-select>
  </el-form-item>
  
  <!-- 标签 -->
  <el-form-item label="标签" prop="tags">
    <el-select v-model="formData.tags" multiple filterable allow-create>
      <!-- 预设标签选项 -->
    </el-select>
  </el-form-item>
</template>
```

### 3. 数据模型更新

#### formData 新增字段：
```javascript
const formData = reactive({
  // ... 其他字段
  
  // 模块相关字段
  module_code: '',
  sort_order: 0,
  status: 'active',
  owner_id: null,
  tags: [],
  
  // ... 其他字段
})
```

### 4. 数据转换工具更新 (`src/utils/dataTransform.js`)

#### 更新 `transformModuleToBackend` 函数：
- 支持所有新增字段
- 处理下划线和驼峰命名的兼容性
- 设置合理的默认值

```javascript
export function transformModuleToBackend(module) {
  const data = {
    name: module.name,
    description: module.description,
    parent_module_id: module.parent_module_id || module.parentModuleId || null,
    sort_order: module.sort_order || module.sortOrder || 0,
    status: module.status || 'active',
    tags: module.tags || []
  }
  
  // 模块编码（可选）
  if (module.module_code || module.moduleCode) {
    data.module_code = module.module_code || module.moduleCode
  }
  
  // 负责人ID（可选）
  if (module.owner_id || module.ownerId) {
    data.owner_id = module.owner_id || module.ownerId
  }
  
  return data
}
```

## 使用流程

### 创建模块步骤：
1. 在项目结构中，点击项目节点的"更多操作"菜单
2. 选择"新建模块"
3. 填写表单：
   - 模块名称（必填）
   - 模块编码（可选，留空自动生成）
   - 模块描述（可选）
   - 排序顺序（默认0）
   - 模块状态（默认活跃）
   - 标签（可选，支持多选和自定义）
4. 点击"创建"按钮
5. 系统自动刷新项目树，新建的模块会出现在列表中

### 数据流转：
```
用户填写表单
    ↓
formData (Vue reactive)
    ↓
transformModuleToBackend (数据转换)
    ↓
createModule (API 调用)
    ↓
POST /modules (后端接口)
    ↓
响应处理
    ↓
刷新项目树
```

## 特性说明

### 1. 模块编码
- 支持手动输入或留空自动生成
- 创建后不可修改（编辑模式下禁用）
- 在项目内必须唯一

### 2. 排序顺序
- 使用数字输入框
- 最小值为0
- 数字越小，显示越靠前

### 3. 模块状态
- **活跃 (active)** - 正常使用的模块
- **已归档 (archived)** - 已完成或暂停的模块
- **已禁用 (disabled)** - 停用的模块

### 4. 标签管理
- 支持多选
- 支持筛选
- 支持自定义创建新标签
- 预设常用标签选项

### 5. 错误处理
API 层面自动处理以下错误：
- 模块编码已存在
- 项目不存在
- 父模块不存在
- 负责人不存在
- 权限不足
- 参数错误
- 服务器错误

## 注意事项

1. **项目ID传递**：创建模块时必须提供项目ID，通过 `formData.parentId` 传递
2. **命名兼容性**：代码同时支持下划线命名和驼峰命名，确保前后端兼容
3. **可选字段**：模块编码、父模块ID、负责人ID等字段为可选，留空不会报错
4. **默认值**：排序顺序默认为0，状态默认为 'active'
5. **数据刷新**：创建成功后自动刷新项目树，保证数据同步

## 测试建议

### 功能测试：
1. ✅ 创建顶级模块（无父模块）
2. ✅ 创建子模块（有父模块）
3. ✅ 使用自定义模块编码创建
4. ✅ 留空模块编码让系统自动生成
5. ✅ 设置不同的排序顺序，验证显示顺序
6. ✅ 选择不同的模块状态
7. ✅ 添加单个/多个标签
8. ✅ 创建自定义标签

### 边界测试：
1. ✅ 模块名称为空（应该验证失败）
2. ✅ 模块编码重复（后端应返回错误）
3. ✅ 项目ID不存在（后端应返回错误）
4. ✅ 排序顺序为负数（前端限制最小值为0）
5. ✅ 特殊字符处理

## 相关文件

### 修改的文件：
- `src/api/project.js` - API 接口定义
- `src/views/Cases.vue` - 页面组件和表单
- `src/utils/dataTransform.js` - 数据转换工具

### 依赖的组件：
- Element Plus (el-input, el-input-number, el-select, el-form-item)
- Vue 3 (reactive, ref)

## 版本信息
- 实现日期：2024-10-24
- Vue 版本：3.x
- Element Plus 版本：最新
- 后端接口版本：v1

## 后续优化建议

1. **负责人选择**：添加负责人选择器（目前只能手动输入ID）
2. **父模块选择**：添加父模块树形选择器
3. **表单验证**：增强表单验证规则
4. **实时预览**：显示模块编码格式预览
5. **批量操作**：支持批量创建多个模块
6. **模板功能**：支持从模板创建模块
7. **权限控制**：根据用户权限控制可操作的项目

---

**文档完成** ✓

