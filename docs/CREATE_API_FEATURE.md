# 新建接口功能实现文档

## 功能概述

在项目树的模块节点上实现"新建接口"功能，允许用户创建新的接口，并优化了刷新机制，保持树的展开/折叠状态。

## 后端API规范

### 创建接口
- **请求方法**: `POST`
- **请求路径**: `/apis`
- **权限要求**: `api:create`
- **请求体**: `CreateApiDTO` 对象
- **说明**: moduleId 作为请求体中的 `module_id` 字段传递

```java
@PostMapping
@GlobalInterceptor(checkLogin = true, checkPermission = {"api:create"})
public ResponseVO<ApiDTO> createApi(@RequestBody CreateApiDTO createDTO) {
    // ... 实现逻辑
}
```

**请求体字段**：
```json
{
  "module_id": 1,
  "api_code": "USER_LOGIN",
  "name": "用户登录",
  "method": "POST",
  "path": "/api/auth/login",
  "base_url": "http://api.example.com",
  "description": "用户登录接口",
  "request_parameters": {},
  "request_headers": {},
  "request_body": {},
  "request_body_type": "json",
  "tags": ["认证", "登录"]
}
```

## 功能实现

### 1. 已有基础功能

#### 1.1 触发入口
在 `TreeNode.vue` 组件中，模块节点的上下文菜单中有"新建接口"选项：
```vue
<el-dropdown-item command="add-api" icon="Plus">
  新建接口
</el-dropdown-item>
```

#### 1.2 事件处理
```javascript
const handleAddApi = (module) => {
  dialogType.value = 'api'
  isEdit.value = false
  resetForm()
  formData.parentId = module.module_id // 保存模块ID
  dialogVisible.value = true
}
```

#### 1.3 表单字段
```vue
<template v-if="dialogType === 'api'">
  <el-form-item label="接口名称" prop="name">
    <el-input v-model="formData.name" placeholder="请输入接口名称" />
  </el-form-item>
  <el-form-item label="接口URL" prop="url">
    <el-input v-model="formData.url" placeholder="请输入接口URL" />
  </el-form-item>
  <el-form-item label="请求方法" prop="method">
    <el-select v-model="formData.method" placeholder="请选择请求方法">
      <el-option label="GET" value="GET" />
      <el-option label="POST" value="POST" />
      <el-option label="PUT" value="PUT" />
      <el-option label="DELETE" value="DELETE" />
      <el-option label="PATCH" value="PATCH" />
    </el-select>
  </el-form-item>
  <el-form-item label="接口描述" prop="description">
    <el-input
      v-model="formData.description"
      type="textarea"
      :rows="3"
      placeholder="请输入接口描述"
    />
  </el-form-item>
</template>
```

#### 1.4 表单验证
```javascript
const formRules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  url: [{ required: true, message: '请输入URL', trigger: 'blur' }],
  method: [{ required: true, message: '请选择请求方法', trigger: 'change' }]
}
```

### 2. 本次优化内容

#### 2.1 优化保存逻辑
**修改前**：创建接口后重新加载整个项目树，导致所有展开状态丢失
```javascript
} else if (dialogType.value === 'api') {
  if (isEdit.value) {
    await updateApi(formData.api_id, data)
  } else {
    await createApi(formData.parentId, data)
  }
  await loadProjectTree()  // ❌ 会重置所有展开状态
}
```

**修改后**：只刷新当前模块的接口列表，保持展开状态
```javascript
} else if (dialogType.value === 'api') {
  if (isEdit.value) {
    await updateApi(formData.api_id, data)
    // 更新后只刷新当前接口数据，保持展开状态
    await updateCurrentApiData()
  } else {
    // 创建接口
    const response = await createApi(formData.parentId, data)
    if (response.code === 1) {
      // 创建成功后，重新加载当前模块的接口列表
      await refreshModuleApis(formData.parentId)
    }
  }
}
```

#### 2.2 添加 refreshModuleApis 函数
```javascript
// 刷新模块的接口列表（保持折叠状态）
const refreshModuleApis = async (moduleId) => {
  if (!moduleId) {
    console.error('模块ID不能为空')
    return
  }
  
  try {
    // 查找对应的模块节点
    let targetModule = null
    projects.value.forEach(project => {
      if (project.modules) {
        const module = project.modules.find(m => m.module_id === moduleId)
        if (module) {
          targetModule = module
        }
        // 也检查子模块
        project.modules.forEach(m => {
          if (m.children) {
            const subModule = m.children.find(sm => sm.module_id === moduleId)
            if (subModule) {
              targetModule = subModule
            }
          }
        })
      }
    })
    
    if (!targetModule) {
      console.error('未找到模块节点')
      return
    }
    
    // 重新加载该模块的接口列表（强制刷新）
    await loadModuleApis(targetModule, true)
  } catch (error) {
    console.error('刷新模块接口列表失败:', error)
  }
}
```

#### 2.3 优化 loadModuleApis 函数
添加 `forceRefresh` 参数支持强制刷新：
```javascript
const loadModuleApis = async (module, forceRefresh = false) => {
  // 如果接口已经加载过且不是强制刷新，直接返回
  if (!forceRefresh && module.apis && module.apis.length > 0) {
    return
  }
  
  // ... 其余逻辑不变
}
```

### 3. 数据转换

#### 3.1 字段映射
表单使用 `url` 字段，后端需要 `path` 字段，在 `transformApiToBackend` 中处理：
```javascript
export function transformApiToBackend(api) {
  return {
    api_code: api.api_code,
    name: api.name,
    method: api.method,
    path: api.url || api.path,  // 字段映射
    description: api.description,
    tags: api.tags || []
  }
}
```

#### 3.2 添加上下文信息
在 `loadModuleApis` 中，为每个接口添加项目和模块信息：
```javascript
module.apis = apis.map(api => {
  const transformedApi = transformApi(api)
  // 添加上下文信息
  transformedApi.project_id = module.project_id
  transformedApi.projectId = module.project_id
  transformedApi.project_name = module.project_name || '-'
  transformedApi.projectName = module.project_name || '-'
  transformedApi.module_id = module.module_id
  transformedApi.moduleId = module.module_id
  transformedApi.module_name = module.name
  transformedApi.moduleName = module.name
  return transformedApi
})
```

## 用户操作流程

1. **在左侧树中右键点击模块节点**（如"认证模块"）
2. **选择"新建接口"**
3. **填写表单**：
   - 接口名称（必填）：例如"用户登录"
   - 接口URL（必填）：例如"/api/auth/login"
   - 请求方法（必填）：选择POST/GET/PUT/DELETE/PATCH
   - 接口描述（可选）：详细说明接口功能
4. **点击"确定"按钮**
5. **系统自动**：
   - 验证表单数据
   - 调用后端API创建接口
   - 刷新当前模块的接口列表
   - 显示成功消息
   - **保持树的所有展开/折叠状态**
6. **创建成功后**：
   - 新接口出现在模块下
   - 树结构保持原有状态
   - 可以立即查看新接口详情

## 智能刷新机制对比

| 特性 | ❌ 旧方案（重新加载树） | ✅ 新方案（局部刷新） |
|------|-------------------|------------------|
| 展开/折叠状态 | 🔴 全部重置 | 🟢 完全保持 |
| 网络请求 | 🔴 加载所有项目数据 | 🟢 只加载当前模块的接口 |
| 用户体验 | 🔴 创建后树折叠 | 🟢 无感知更新 |
| 性能 | 🔴 较差 | 🟢 优秀 |
| 其他模块的接口 | 🔴 全部重新加载 | 🟢 保持不变 |

## 功能特性

### ✅ 表单验证
- 接口名称必填
- 接口URL必填
- 请求方法必选
- 实时表单验证反馈

### ✅ 智能刷新
- 创建成功后只刷新当前模块的接口列表
- **保持所有节点的展开/折叠状态**
- 不影响其他模块的加载状态
- 性能优化：只请求必要的数据

### ✅ 数据完整性
- 自动添加项目ID和模块ID
- 正确的字段映射（url → path）
- 保留所有上下文信息

### ✅ 错误处理
- 前端表单验证
- 后端错误消息展示
- 网络错误处理
- 友好的中文提示

## 测试建议

### 功能测试
1. ✅ 右键点击模块，选择"新建接口"
2. ✅ 填写完整信息并提交
3. ✅ 验证新接口出现在模块下
4. ✅ 点击新接口查看详情

### 验证测试
1. ✅ 接口名称为空时显示错误
2. ✅ 接口URL为空时显示错误
3. ✅ 请求方法未选择时显示错误
4. ✅ 创建成功后显示成功提示

### 状态保持测试（重要）
1. ✅ **展开多个项目和模块**
2. ✅ **在某个模块下创建新接口**
3. ✅ **验证所有节点的展开状态保持不变**
4. ✅ **验证新接口出现在正确的模块下**
5. ✅ **验证其他模块的接口列表未被重新加载**

### 边界测试
1. ✅ 网络异常时的错误处理
2. ✅ 后端返回错误时的处理
3. ✅ 无权限时的错误提示
4. ✅ 模块ID为空时的处理

## 相关文件

- `src/views/Cases.vue` - 主页面组件
  - 添加 `refreshModuleApis` 函数
  - 优化 `loadModuleApis` 函数（添加 forceRefresh 参数）
  - 优化 `handleSaveWithAPI` 中的接口创建逻辑
- `src/api/project.js` - API函数（已有 `createApi`）
- `src/utils/dataTransform.js` - 数据转换（已有字段映射）
- `src/components/cases/TreeNode.vue` - 树节点组件（已有菜单选项）

## 与测试用例创建的一致性

新建接口的刷新机制与测试用例创建保持一致：

| 操作 | 刷新策略 | 状态保持 |
|------|---------|----------|
| 创建测试用例 | 只刷新当前接口的用例列表 | ✅ |
| 创建接口 | 只刷新当前模块的接口列表 | ✅ |
| 更新接口 | 只更新当前接口数据 | ✅ |
| 更新测试用例 | 只更新当前用例数据 | ✅ |

## 后端响应格式

### 成功响应
```json
{
  "code": 1,
  "msg": "创建接口成功",
  "data": {
    "apiId": 123,
    "name": "用户登录",
    "method": "POST",
    "path": "/api/auth/login",
    "description": "用户登录接口",
    // ... 其他字段
  }
}
```

### 错误响应
```json
{
  "code": -1,
  "msg": "接口名称不能为空"
}
```

或

```json
{
  "code": -3,
  "msg": "接口路径已存在"
}
```

## 注意事项

1. **权限控制**: 需要 `api:create` 权限
2. **数据验证**: 前后端双重验证确保数据完整性
3. **字段映射**: 注意 `url` → `path` 的转换
4. **模块ID**: 通过 `formData.parentId` 传递
5. **上下文信息**: 新接口会自动继承模块的项目信息
6. **智能刷新**: 只刷新相关数据，保持UI状态

## 总结

本次实现优化了新建接口功能的刷新机制，参考了接口更新和测试用例创建的设计模式：

1. **局部刷新**：只重新加载当前模块的接口列表
2. **状态保持**：保持所有节点的展开/折叠状态
3. **性能优化**：减少不必要的网络请求
4. **用户体验**：无感知的数据更新

这种设计模式确保了整个系统的一致性和流畅性，为用户提供了更好的使用体验。

## 更新日期
2025-01-24

