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

### 1. API函数（已存在）

在 `src/api/project.js` 中已有 `updateApi` 函数：

```javascript
export function updateApi(apiId, data) {
  return request({
    url: `/apis/${apiId}`,
    method: 'put',
    data: {
      name: data.name,
      method: data.method,
      path: data.path,
      description: data.description,
      request_parameters: data.request_parameters,
      request_headers: data.request_headers,
      request_body: data.request_body,
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

#### 3.2 实现 handleRefreshApi 方法
```javascript
const handleRefreshApi = async () => {
  if (selectedLevel.value === 'api' && selectedNode.value) {
    try {
      // 重新加载整个项目树
      await loadProjectTree()
      
      // 重新查找并选中当前接口节点
      const apiId = selectedNode.value.api_id || selectedNode.value.id
      const findApiNode = (nodes) => {
        for (const node of nodes) {
          if (node.modules) {
            for (const module of node.modules) {
              if (module.apis) {
                const api = module.apis.find(a => 
                  (a.api_id || a.id) === apiId
                )
                if (api) return api
              }
            }
          }
        }
        return null
      }
      
      const updatedApi = findApiNode(projects.value)
      if (updatedApi) {
        selectedNode.value = updatedApi
      }
    } catch (error) {
      console.error('刷新接口失败:', error)
      ElMessage.error('刷新接口失败')
    }
  }
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

### ✅ 自动刷新
- 保存成功后自动刷新页面数据
- 重新加载项目树获取最新信息
- 保持当前选中状态

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

## 注意事项

1. **权限控制**: 需要 `api:update` 权限
2. **数据验证**: 前后端双重验证确保数据完整性
3. **并发控制**: 保存过程中禁用保存按钮（可选，未实现）
4. **错误提示**: 所有错误都有友好的中文提示
5. **数据刷新**: 保存成功后自动刷新，无需手动刷新页面

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

## 相关文件

- `src/components/cases/ApiDetail.vue` - 接口详情组件
- `src/views/Cases.vue` - 测试用例管理页面
- `src/api/project.js` - 项目和接口相关API

## 更新日期
2025-01-24

