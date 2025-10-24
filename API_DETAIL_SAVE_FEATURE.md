# 接口详情页面保存修改功能实现文档

## 功能概述

在接口详情页面实现了"保存修改"功能，允许用户编辑接口的基本信息并保存到后端。

## 后端API规范

### 更新接口
- **请求方法**: `PUT`
- **请求路径**: `/apis/{apiId}`
- **权限要求**: `api:update`
- **请求体**: `UpdateApiDTO` 对象

```java
@PutMapping("/{apiId}")
@GlobalInterceptor(checkLogin = true, checkPermission = {"api:update"})
public ResponseVO<ApiDTO> updateApi(
        @PathVariable("apiId") Integer apiId,
        @RequestBody UpdateApiDTO updateDTO) {
    // ... 实现逻辑
}
```

## 前端实现

### 1. API函数

在 `src/api/project.js` 中的 `updateApi` 函数：

```javascript
export function updateApi(apiId, data) {
  return request({
    url: `/apis/${apiId}`,
    method: 'put',
    data: {
      module_id: data.module_id,
      api_code: data.api_code,
      name: data.name,
      method: data.method,
      path: data.path,
      base_url: data.base_url,
      description: data.description,
      precondition: data.precondition,
      request_parameters: data.request_parameters,
      request_headers: data.request_headers,
      request_body: data.request_body,
      request_body_type: data.request_body_type,
      tags: data.tags
    }
  })
}
```

### 2. ApiDetail.vue 组件修改

#### 2.1 导入更新API
```javascript
import { getModulesByProject, updateApi } from '@/api/project'
```

#### 2.2 apiData 改为响应式对象

**修改前**：`apiData` 是 computed 属性（只读）
```javascript
const apiData = computed(() => {
  return {
    project: props.api.project_name || props.api.projectName || '-',
    module: props.api.module_name || props.api.moduleName || '-',
    // ...
  }
})
```

**修改后**：改为 reactive 对象（可编辑）
```javascript
const apiData = reactive({
  project: '',
  module: '',
  moduleId: null,
  name: '',
  path: '',
  method: 'GET',
  description: '',
  precondition: '',
  tags: [],
  requestParameters: null,
  requestHeaders: null,
  requestBody: null,
  requestBodyType: 'json'
})
```

#### 2.3 监听 props.api 变化
```javascript
watch(
  () => props.api,
  (newApi) => {
    if (newApi) {
      apiData.project = newApi.project_name || newApi.projectName || '-'
      apiData.module = newApi.module_name || newApi.moduleName || '-'
      apiData.moduleId = newApi.module_id || newApi.moduleId
      apiData.name = newApi.name || ''
      apiData.path = newApi.path || newApi.url || ''
      apiData.method = newApi.method || 'GET'
      apiData.description = newApi.description || ''
      apiData.precondition = newApi.precondition || newApi.pre_condition || ''
      apiData.tags = newApi.tags || []
      // ... 其他字段
    }
  },
  { immediate: true }
)
```

#### 2.4 实现 handleSave 方法

```javascript
const handleSave = async () => {
  // 1. 基本验证
  if (!apiData.name || apiData.name.trim() === '') {
    ElMessage.error('接口名称不能为空')
    return
  }
  
  if (!apiData.path || apiData.path.trim() === '') {
    ElMessage.error('接口路径不能为空')
    return
  }
  
  if (!apiData.method) {
    ElMessage.error('请求方法不能为空')
    return
  }
  
  // 2. 获取接口ID
  const apiId = props.api?.api_id || props.api?.id
  if (!apiId) {
    ElMessage.error('无法获取接口ID')
    return
  }
  
  try {
    // 3. 处理模块ID（如果用户更改了模块）
    let targetModuleId = apiData.moduleId
    if (apiData.module !== (props.api.module_name || props.api.moduleName)) {
      const selectedModule = availableModules.value.find(m => m.name === apiData.module)
      if (selectedModule) {
        targetModuleId = selectedModule.id
      }
    }
    
    // 4. 构造请求数据
    const updateData = {
      name: apiData.name.trim(),
      method: apiData.method,
      path: apiData.path.trim(),
      description: apiData.description || '',
      module_id: targetModuleId,
      precondition: apiData.precondition || '',
      tags: apiData.tags || [],
      request_parameters: apiData.requestParameters,
      request_headers: apiData.requestHeaders,
      request_body: apiData.requestBody,
      request_body_type: apiData.requestBodyType
    }
    
    // 5. 调用API
    const response = await updateApi(apiId, updateData)
    
    // 6. 处理响应
    if (response.code === 1) {
      ElMessage.success('保存成功')
      emit('refresh')  // 触发父组件刷新
    } else {
      ElMessage.error(response.msg || '保存失败')
    }
  } catch (error) {
    console.error('保存接口失败:', error)
    if (error.response?.data?.msg) {
      ElMessage.error(error.response.data.msg)
    } else {
      ElMessage.error('保存失败，请稍后重试')
    }
  }
}
```

#### 2.5 添加 emit 事件
```javascript
const emit = defineEmits([
  'select-case', 
  'edit-case', 
  'delete-case', 
  'close', 
  'refresh-cases',
  'refresh'  // 新增
])
```

### 3. Cases.vue 父组件修改

#### 3.1 监听 refresh 事件
```vue
<ApiDetail
  v-else-if="selectedLevel === 'api'"
  :api="selectedNode"
  :related-cases="selectedNode.cases || []"
  @select-case="handleSelectCase"
  @edit-case="handleEditCase"
  @refresh="handleRefreshApi"
  @delete-case="handleDeleteCase"
  @refresh-cases="handleRefreshCases"
/>
```

#### 3.2 添加 getApiById API 导入
```javascript
import {
  getProjects,
  getModulesByProject,
  getApisByModule,
  getApiById,  // 新增
  // ... 其他导入
} from '../api/project'
```

#### 3.3 实现智能刷新机制（参考测试用例更新）

**核心思想**：只更新当前接口的数据，不重新加载整个项目树，保持展开/折叠状态。

```javascript
// 更新当前选中的接口数据（保持折叠状态）
const updateCurrentApiData = async () => {
  if (selectedLevel.value === 'api' && selectedNode.value) {
    try {
      // 获取当前接口ID
      const apiId = selectedNode.value.api_id || selectedNode.value.id
      if (!apiId) {
        console.error('无法获取接口ID')
        return
      }
      
      // 调用API获取最新的接口详情
      const response = await getApiById(apiId)
      
      if (response.code === 1 && response.data) {
        const apiData = response.data
        const transformedApi = transformApi(apiData)
        
        // 保留关联数据（测试用例列表等）
        transformedApi.cases = selectedNode.value.cases || []
        
        // 在树结构中找到并更新对应的接口节点
        let found = false
        projects.value.forEach(project => {
          if (project.modules) {
            project.modules.forEach(module => {
              if (module.apis) {
                const apiIndex = module.apis.findIndex(api => 
                  (api.api_id || api.id) === apiId
                )
                if (apiIndex !== -1) {
                  // 更新树中的接口数据
                  Object.assign(module.apis[apiIndex], transformedApi)
                  // 更新当前选中的节点
                  selectedNode.value = module.apis[apiIndex]
                  found = true
                }
              }
            })
          }
        })
        
        if (!found) {
          console.warn('在项目树中未找到对应的接口节点')
        }
      } else {
        ElMessage.error(response.msg || '获取接口详情失败')
      }
    } catch (error) {
      console.error('更新接口数据失败:', error)
      ElMessage.error('更新接口数据失败')
    }
  }
}

// 刷新接口详情（当接口信息更新后）
const handleRefreshApi = async () => {
  // 只更新当前接口数据，不重新加载整个树，保持折叠状态
  await updateCurrentApiData()
}
```

## 功能特性

### ✅ 表单验证
- 接口名称必填
- 接口路径必填
- 请求方法必选

### ✅ 智能模块切换
- 支持用户更改接口所属模块
- 自动查找新模块的ID并提交

### ✅ 完整字段支持
- 基本信息：名称、路径、方法、描述
- 模块信息：支持切换所属模块
- 前置条件
- 标签
- 请求参数、请求头、请求体

### ✅ 错误处理
- 前端表单验证
- 后端错误消息展示
- 网络错误处理

### ✅ 智能刷新机制
- 保存成功后自动刷新接口数据
- **只更新当前接口**，不重新加载整个项目树
- **保持树的展开/折叠状态**（参考测试用例更新机制）
- 保留关联数据（如测试用例列表）
- 自动更新左侧树和右侧详情页

## 用户操作流程

1. 用户在左侧树中选择一个接口
2. 右侧显示接口详情页面（基本信息标签页）
3. 用户编辑表单字段：
   - 修改接口名称
   - 修改接口路径
   - 修改请求方法（GET/POST/PUT/DELETE）
   - 修改描述
   - 切换所属模块
   - 修改前置条件
   - 编辑标签
4. 点击"保存修改"按钮
5. 系统验证表单数据
6. 调用后端API保存
7. 显示成功/失败消息
8. 自动刷新页面数据

## 后端响应格式

### 成功响应
```json
{
  "code": 1,
  "msg": "更新接口成功",
  "data": {
    "apiId": 1,
    "name": "用户登录",
    "method": "POST",
    "path": "/api/auth/login",
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

## 智能刷新机制说明

### 为什么采用局部更新而非全量刷新？

**对比两种方案：**

#### ❌ 方案A：重新加载整个项目树
```javascript
// 旧方案
const handleRefreshApi = async () => {
  await loadProjectTree()  // 重新加载所有项目、模块、接口
  // 问题：会重置所有展开/折叠状态
}
```
**缺点**：
- 会重置所有节点的展开/折叠状态
- 用户体验差：保存后树结构全部折叠
- 性能开销大：重新加载所有数据

#### ✅ 方案B：只更新当前接口（当前实现）
```javascript
// 新方案（参考测试用例更新机制）
const handleRefreshApi = async () => {
  await updateCurrentApiData()  // 只更新当前接口
}

const updateCurrentApiData = async () => {
  // 1. 调用 getApiById 获取最新数据
  // 2. 转换数据格式
  // 3. 在树结构中找到并更新对应节点
  // 4. 保留关联数据（如测试用例列表）
}
```
**优点**：
- ✅ 保持所有节点的展开/折叠状态
- ✅ 用户体验好：保存后状态不变
- ✅ 性能好：只请求一个接口的数据
- ✅ 与测试用例更新机制保持一致

### 实现细节

1. **保留状态**：不修改 `expandedNodes` Set
2. **局部更新**：使用 `Object.assign()` 更新树节点
3. **保留关联**：保留 `cases` 等关联数据
4. **双向同步**：同时更新 `projects.value` 和 `selectedNode.value`

## 注意事项

1. **权限控制**: 需要 `api:update` 权限
2. **数据验证**: 前后端双重验证确保数据完整性
3. **并发控制**: 保存过程中禁用保存按钮（可选，未实现）
4. **错误提示**: 所有错误都有友好的中文提示
5. **智能刷新**: 保存成功后自动刷新当前接口数据，保持UI状态

## 测试建议

### 功能测试
- ✅ 修改接口名称并保存
- ✅ 修改接口路径并保存
- ✅ 切换请求方法并保存
- ✅ 更改所属模块并保存
- ✅ 编辑描述和前置条件

### 验证测试
- ✅ 接口名称为空时显示错误
- ✅ 接口路径为空时显示错误
- ✅ 保存成功后显示成功提示
- ✅ 保存失败后显示错误提示

### 边界测试
- ✅ 网络异常时的错误处理
- ✅ 后端返回错误时的处理
- ✅ 无权限时的错误提示

### 状态保持测试（重要）
- ✅ **展开多个项目和模块**
- ✅ **修改某个接口并保存**
- ✅ **验证所有节点的展开状态保持不变**
- ✅ **验证左侧树中的接口名称已更新**
- ✅ **验证右侧详情页数据已更新**

## 相关文件

- `src/components/cases/ApiDetail.vue` - 接口详情组件
- `src/views/Cases.vue` - 测试用例管理页面
- `src/api/project.js` - 项目和接口相关API（新增 `getApiById` 函数）

## 更新历史

### 2025-01-24 v2 - 优化刷新机制
- ✅ 添加 `getApiById` API 函数
- ✅ 实现 `updateCurrentApiData` 函数
- ✅ 优化 `handleRefreshApi`，参考测试用例更新机制
- ✅ **保存后保持树的展开/折叠状态**
- ✅ 只更新当前接口数据，提升性能
- ✅ 保留关联数据（测试用例列表等）

### 2025-01-24 v1 - 初始实现
- ✅ 实现接口详情页面保存修改功能
- ✅ 表单验证和错误处理
- ✅ 支持模块切换
- ✅ 基本的数据刷新

## 总结

本功能实现了接口详情页面的保存修改功能，**特别优化了刷新机制**，参考测试用例的更新逻辑，实现了：

1. **智能刷新**：只更新当前接口，不重新加载整个项目树
2. **状态保持**：保存后保持所有节点的展开/折叠状态
3. **用户体验**：无感知的数据更新，流畅的操作体验
4. **性能优化**：减少不必要的网络请求和DOM更新

这种设计模式可以推广到其他类似场景，如模块更新、项目更新等。

