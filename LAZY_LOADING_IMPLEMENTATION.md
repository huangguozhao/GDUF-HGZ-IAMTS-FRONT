# 按需加载模块功能实现说明

## 功能概述
实现了测试用例页面的按需加载功能，当用户点击项目时，动态加载该项目的模块信息，提升页面性能和用户体验。

## 主要修改

### 1. 项目点击处理逻辑优化 (`src/views/Cases.vue`)

#### 修改前
- 页面初始化时预加载所有项目、模块、接口和测试用例
- 数据量大时加载缓慢，影响用户体验

#### 修改后
- 页面初始化时只加载项目列表
- 点击项目时按需加载模块
- 点击模块时按需加载接口
- 点击接口时按需加载测试用例

```javascript
// 选择节点
const handleSelectNode = async (node, level) => {
  selectedNode.value = node
  selectedLevel.value = level
  
  // 如果是项目，按需加载模块
  if (level === 'project') {
    await loadProjectModules(node)
  }
  // 如果是模块，按需加载接口
  else if (level === 'module') {
    await loadModuleApis(node)
  }
  // 如果是接口，按需加载测试用例
  else if (level === 'api') {
    await loadApiTestCases(node)
  }
  // 如果是用例，加载执行历史
  else if (level === 'case') {
    await loadTestCaseHistory(node)
  }
}
```

### 2. 按需加载函数实现

#### 加载项目模块
```javascript
const loadProjectModules = async (project) => {
  // 防止重复加载
  if (project.modules && project.modules.length > 0) {
    return
  }
  
  if (project._loadingModules) {
    return
  }
  
  try {
    project._loadingModules = true
    loading.value = true
    
    const response = await getModulesByProject(project.project_id, {
      structure: 'tree',
      includeStatistics: true
    })
    
    if (response.code === 1) {
      const modules = response.data.modules || []
      project.modules = modules.map(transformModule)
      
      if (modules.length > 0) {
        ElMessage.success(`加载了 ${modules.length} 个模块`)
      }
    } else {
      ElMessage.error(response.msg || '加载模块失败')
      project.modules = []
    }
  } catch (error) {
    console.error('加载项目模块失败:', error)
    ElMessage.error('加载模块失败，请稍后重试')
    project.modules = []
  } finally {
    project._loadingModules = false
    loading.value = false
  }
}
```

#### 加载模块接口
```javascript
const loadModuleApis = async (module) => {
  // 防止重复加载
  if (module.apis && module.apis.length > 0) {
    return
  }
  
  if (module._loadingApis) {
    return
  }
  
  try {
    module._loadingApis = true
    loading.value = true
    
    const response = await getApisByModule(module.module_id)
    
    if (response.code === 1) {
      const apis = response.data || []
      module.apis = apis.map(transformApi)
      
      if (apis.length > 0) {
        ElMessage.success(`加载了 ${apis.length} 个接口`)
      }
    } else {
      ElMessage.error(response.msg || '加载接口失败')
      module.apis = []
    }
  } catch (error) {
    console.error('加载模块接口失败:', error)
    ElMessage.error('加载接口失败，请稍后重试')
    module.apis = []
  } finally {
    module._loadingApis = false
    loading.value = false
  }
}
```

#### 加载接口测试用例
```javascript
const loadApiTestCases = async (api) => {
  // 防止重复加载
  if (api.cases && api.cases.length > 0) {
    return
  }
  
  if (api._loadingCases) {
    return
  }
  
  try {
    api._loadingCases = true
    loading.value = true
    
    const response = await getTestCasesByApi(api.api_id, { pageSize: 100 })
    
    if (response.code === 1) {
      const cases = response.data.items || []
      api.cases = cases.map(transformTestCase)
      
      if (cases.length > 0) {
        ElMessage.success(`加载了 ${cases.length} 个测试用例`)
      }
    } else {
      ElMessage.error(response.msg || '加载测试用例失败')
      api.cases = []
    }
  } catch (error) {
    console.error('加载接口测试用例失败:', error)
    ElMessage.error('加载测试用例失败，请稍后重试')
    api.cases = []
  } finally {
    api._loadingCases = false
    loading.value = false
  }
}
```

### 3. API接口优化 (`src/api/project.js`)

#### 更新模块获取接口
```javascript
export function getModulesByProject(projectId, params = {}) {
  return request({
    url: `/projects/${projectId}/modules`,
    method: 'get',
    params: {
      structure: params.structure || 'tree',
      status: params.status || 'active',
      include_deleted: params.includeDeleted || false,
      include_statistics: params.includeStatistics || false,
      search_keyword: params.searchKeyword,
      sort_by: params.sortBy || 'sort_order',
      sort_order: params.sortOrder || 'asc'
    }
  })
}
```

### 4. 数据转换函数更新 (`src/utils/dataTransform.js`)

#### 增强模块数据转换
```javascript
export function transformModule(module) {
  return {
    id: module.moduleId || module.module_id,
    module_id: module.moduleId || module.module_id,
    name: module.name,
    description: module.description,
    module_code: module.moduleCode || module.module_code,
    project_id: module.projectId || module.project_id,
    parent_module_id: module.parentModuleId || module.parent_module_id,
    sort_order: module.sortOrder || module.sort_order,
    status: module.status,
    owner_info: module.ownerInfo || module.owner_info,
    tags: module.tags || [],
    api_count: module.apiCount || module.api_count || 0,
    case_count: module.caseCount || module.case_count || 0,
    level: module.level || 1,
    path: module.path,
    created_time: module.createdAt || module.created_at,
    updated_time: module.updatedAt || module.updated_at,
    apis: [] // 默认为空，后续填充
  }
}
```

### 5. 页面初始化优化

#### 修改前
```javascript
const loadProjectTree = async () => {
  // 预加载所有项目、模块、接口、测试用例
  // 数据量大时加载缓慢
}
```

#### 修改后
```javascript
const loadProjectTree = async () => {
  loading.value = true
  try {
    // 只获取项目列表，不预加载模块、接口和测试用例
    const projectsRes = await getProjects({ pageSize: 100 })
    if (projectsRes.code !== 1) {
      ElMessage.error(projectsRes.msg || '加载项目失败')
      return
    }
    
    const projectList = projectsRes.data.items || []
    
    // 转换项目数据，但不加载子级数据
    projects.value = projectList.map(project => ({
      ...transformProject(project),
      project_id: project.projectId || project.project_id,
      modules: [] // 初始为空，按需加载
    }))
    
    ElMessage.success(`加载了 ${projectList.length} 个项目`)
  } catch (error) {
    console.error('加载项目树失败:', error)
    ElMessage.error('加载数据失败，请稍后重试')
  } finally {
    loading.value = false
  }
}
```

## 性能优化特性

### 1. 防重复加载
- 使用 `_loadingModules`、`_loadingApis`、`_loadingCases` 标志防止重复请求
- 检查数据是否已存在，避免重复加载

### 2. 加载状态管理
- 统一的 `loading` 状态管理
- 用户友好的加载提示信息

### 3. 错误处理
- 完善的错误捕获和处理
- 用户友好的错误提示信息

### 4. 数据缓存
- 已加载的数据会被缓存，避免重复请求
- 提升用户体验和系统性能

## 用户体验改进

### 1. 快速响应
- 页面初始化速度大幅提升
- 按需加载减少不必要的网络请求

### 2. 智能提示
- 加载成功时显示加载的数据量
- 错误时提供明确的错误信息

### 3. 视觉反馈
- 加载状态指示器
- 选中状态正确显示

## 后端接口要求

### 模块获取接口
- **路径**: `/projects/{project_id}/modules`
- **方法**: `GET`
- **参数**: 
  - `structure`: 返回结构 (`tree` 或 `flat`)
  - `include_statistics`: 是否包含统计信息
  - `status`: 模块状态过滤
  - `sort_by`: 排序字段
  - `sort_order`: 排序顺序

### 响应格式
```json
{
  "code": 1,
  "msg": "success",
  "data": {
    "project_id": 1,
    "project_name": "项目名称",
    "total_modules": 8,
    "modules": [
      {
        "module_id": 1,
        "module_code": "USER_MGMT",
        "name": "用户管理模块",
        "description": "用户相关的功能模块",
        "api_count": 25,
        "case_count": 120,
        "children": []
      }
    ]
  }
}
```

## 测试验证

### 1. 功能测试
- [x] 点击项目能正确加载模块
- [x] 点击模块能正确加载接口
- [x] 点击接口能正确加载测试用例
- [x] 防重复加载机制有效
- [x] 错误处理正常

### 2. 性能测试
- [x] 页面初始化速度提升
- [x] 内存使用优化
- [x] 网络请求减少

### 3. 用户体验测试
- [x] 加载状态显示正常
- [x] 选中状态正确
- [x] 错误提示友好

## 注意事项

1. **数据一致性**: 确保后端返回的数据格式与前端期望一致
2. **错误处理**: 网络错误时提供友好的用户提示
3. **性能监控**: 监控加载性能，必要时进行进一步优化
4. **缓存策略**: 考虑实现更复杂的数据缓存策略

## 后续优化建议

1. **虚拟滚动**: 对于大量数据的列表，考虑实现虚拟滚动
2. **预加载**: 智能预加载用户可能访问的数据
3. **离线缓存**: 实现离线数据缓存机制
4. **数据同步**: 实现数据的实时同步更新
