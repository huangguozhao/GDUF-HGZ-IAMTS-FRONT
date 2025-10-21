# 模块数据适配说明

## 功能概述
更新了模块数据转换函数，支持后端返回的嵌套子模块结构和统计信息。

## 后端数据格式

### 模块对象结构
```json
{
  "moduleId": 3,
  "moduleCode": "TRADING",
  "projectId": 1,
  "name": "交易模块",
  "description": "交易相关接口",
  "sortOrder": 3,
  "status": "active",
  "ownerInfo": {
    "userId": 4,
    "name": "王芳",
    "avatarUrl": "https://avatar.example.com/wang.jpg"
  },
  "creatorName": "系统管理员",
  "createdAt": "2025-10-19T10:39:36",
  "updatedAt": "2025-10-19T10:39:36",
  "isDeleted": false,
  "apiCount": 0,
  "caseCount": 0,
  "children": [
    {
      "moduleId": 4,
      "moduleCode": "TRADING-SPOT",
      "parentModuleId": 3,
      "name": "现货交易",
      "description": "现货交易子模块",
      "apiCount": 5,
      "caseCount": 6,
      "children": []
    },
    {
      "moduleId": 5,
      "moduleCode": "TRADING-SIM",
      "parentModuleId": 3,
      "name": "模拟交易",
      "description": "模拟交易子模块",
      "apiCount": 4,
      "caseCount": 3,
      "children": []
    }
  ]
}
```

## 字段映射

### 基本字段
| 前端字段 | 后端字段（驼峰） | 后端字段（下划线） | 说明 |
|---------|----------------|------------------|------|
| id | moduleId | module_id | 模块ID |
| module_code | moduleCode | module_code | 模块编码 |
| project_id | projectId | project_id | 项目ID |
| parent_module_id | parentModuleId | parent_module_id | 父模块ID |
| sort_order | sortOrder | sort_order | 排序顺序 |
| owner_info | ownerInfo | owner_info | 负责人信息 |
| creator_name | creatorName | creator_name | 创建人姓名 |
| created_time | createdAt | created_at | 创建时间 |
| updated_time | updatedAt | updated_at | 更新时间 |

### 统计字段
| 前端字段 | 后端字段（驼峰） | 后端字段（下划线） | 说明 |
|---------|----------------|------------------|------|
| api_count | apiCount | api_count | 接口数量 |
| case_count | caseCount | case_count | 用例数量 |

### 树形结构
| 前端字段 | 后端字段 | 说明 |
|---------|---------|------|
| children | children | 子模块数组 |
| apis | - | 接口数组（前端按需加载） |

## 数据转换函数

### 递归转换模块
```javascript
export function transformModule(module) {
  const transformed = {
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
    creator_name: module.creatorName || module.creator_name,
    tags: module.tags || [],
    api_count: module.apiCount || module.api_count || 0,
    case_count: module.caseCount || module.case_count || 0,
    level: module.level || 1,
    path: module.path,
    created_time: module.createdAt || module.created_at,
    updated_time: module.updatedAt || module.updated_at,
    apis: [],
    children: []
  }
  
  // 递归处理子模块
  if (module.children && Array.isArray(module.children) && module.children.length > 0) {
    transformed.children = module.children.map(transformModule)
  }
  
  return transformed
}
```

## 树形结构渲染

### 渲染逻辑
```vue
<TreeNode v-for="module in project.modules" level="module">
  <!-- 子模块 -->
  <TreeNode v-for="subModule in module.children" level="module">
    <!-- 子模块的接口 -->
    <TreeNode v-for="api in subModule.apis" level="api">
      <!-- 测试用例 -->
    </TreeNode>
  </TreeNode>
  
  <!-- 一级模块的接口 -->
  <TreeNode v-for="api in module.apis" level="api">
    <!-- 测试用例 -->
  </TreeNode>
</TreeNode>
```

### hasChildren 逻辑更新
```javascript
const hasChildren = computed(() => {
  if (props.level === 'project') return props.node.modules?.length > 0
  if (props.level === 'module') {
    // 模块可能有子模块或接口
    return (props.node.children?.length > 0) || (props.node.apis?.length > 0)
  }
  if (props.level === 'api') return props.node.cases?.length > 0
  return false
})
```

## 统计信息展示

### 模块统计
根据后端返回的 `apiCount` 和 `caseCount` 直接展示：

```
认证模块
├── 接口数：5
├── 用例数：8
└── 通过率：计算得出
```

### 子模块统计
```
交易模块
├── 接口数：0（父模块本身）
├── 用例数：0（父模块本身）
└── 子模块：
    ├── 现货交易（接口数：5，用例数：6）
    └── 模拟交易（接口数：4，用例数：3）
```

## 数据示例

### 示例1：一级模块（无子模块）
```json
{
  "moduleId": 1,
  "moduleCode": "AUTH",
  "name": "认证模块",
  "apiCount": 5,
  "caseCount": 8,
  "children": []
}
```

**渲染结果：**
```
📂 认证模块
   ├── 接口数：5
   ├── 用例数：8
   └── [展开可显示5个接口]
```

### 示例2：父模块（含子模块）
```json
{
  "moduleId": 3,
  "moduleCode": "TRADING",
  "name": "交易模块",
  "apiCount": 0,
  "caseCount": 0,
  "children": [
    {
      "moduleId": 4,
      "name": "现货交易",
      "apiCount": 5,
      "caseCount": 6
    },
    {
      "moduleId": 5,
      "name": "模拟交易",
      "apiCount": 4,
      "caseCount": 3
    }
  ]
}
```

**渲染结果：**
```
📂 交易模块
   ├── 📂 现货交易（接口数：5，用例数：6）
   └── 📂 模拟交易（接口数：4，用例数：3）
```

## 按需加载流程

### 1. 加载项目模块
```
点击项目 
  → loadProjectModules(project)
  → getModulesByProject(project_id, {structure: 'tree'})
  → 后端返回模块树（包含children）
  → transformModule递归转换
  → 渲染模块树
```

### 2. 加载模块接口
```
点击模块 
  → loadModuleApis(module)
  → getApisByModule(module_id)
  → 后端返回接口列表
  → transformApi转换
  → 添加到module.apis
```

### 3. 加载子模块接口
```
点击子模块 
  → loadModuleApis(subModule)
  → getApisByModule(subModule_id)
  → 后端返回接口列表
  → transformApi转换
  → 添加到subModule.apis
```

## 树形结构层级

### 支持的层级
```
项目 (Project)
└── 模块 (Module)
    ├── 子模块 (Sub-Module)
    │   └── 接口 (API)
    │       └── 测试用例 (Test Case)
    └── 接口 (API)
        └── 测试用例 (Test Case)
```

### 最大深度
- 项目 → 模块 → 子模块 → 接口 → 测试用例（5级）

## 模块状态

### 状态值
- `active`：激活
- `inactive`：未激活
- `archived`：已归档

### 显示样式
```javascript
const statusMap = {
  'active': { type: 'success', text: '激活' },
  'inactive': { type: 'info', text: '未激活' },
  'archived': { type: 'warning', text: '已归档' }
}
```

## 负责人信息

### 数据结构
```json
{
  "ownerInfo": {
    "userId": 4,
    "name": "王芳",
    "avatarUrl": "https://avatar.example.com/wang.jpg"
  }
}
```

### 使用方式
```javascript
// 获取负责人名称
const ownerName = module.ownerInfo?.name || module.owner_info?.name || '未指定'

// 获取负责人头像
const ownerAvatar = module.ownerInfo?.avatarUrl || module.owner_info?.avatar_url || ''
```

## 注意事项

1. **递归转换**：子模块需要递归调用 `transformModule`
2. **统计信息**：`apiCount` 和 `caseCount` 由后端计算提供
3. **树形渲染**：使用嵌套的 `TreeNode` 组件
4. **按需加载**：子模块的接口也是按需加载
5. **ID唯一性**：确保所有模块ID（包括子模块）是唯一的

## 相关文件
- `src/utils/dataTransform.js` - 数据转换工具
- `src/components/cases/TreeNode.vue` - 树节点组件
- `src/views/Cases.vue` - 用例管理页面
- `src/components/cases/LevelStats.vue` - 模块统计组件
