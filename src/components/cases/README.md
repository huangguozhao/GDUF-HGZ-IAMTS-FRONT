# 用例管理组件说明

## 层级结构

```
项目 (Project)
  └── 模块 (Module)
      └── 接口 (API)
          └── 测试用例 (Test Case)
```

## 组件说明

### 1. TreeNode.vue
树形节点组件，用于展示项目、模块、接口的层级结构。

**Props:**
- `node`: 节点数据对象
- `level`: 节点层级 ('project' | 'module' | 'api')
- `defaultExpanded`: 默认是否展开

**Events:**
- `add-module`: 添加模块
- `add-api`: 添加接口
- `add-case`: 添加测试用例
- `edit`: 编辑节点
- `delete`: 删除节点

**特性:**
- 支持展开/收起子节点
- 显示子节点数量
- 悬停显示操作按钮
- 不同层级有不同的样式

### 2. CaseCard.vue
测试用例卡片组件，展示用例详细信息。

**Props:**
- `testCase`: 测试用例对象
- `isSelected`: 是否被选中
- `isActive`: 是否为当前激活用例

**Events:**
- `select`: 选择用例
- `toggle-select`: 切换选中状态
- `execute`: 执行用例
- `edit`: 编辑用例
- `copy`: 复制用例
- `delete`: 删除用例

**特性:**
- 支持多选（复选框）
- 显示用例状态（通过/失败/未执行）
- 失败用例红色背景
- 显示基本信息（描述、最后执行时间、预期状态码）
- 快捷操作按钮

### 3. CaseDetail.vue
用例详情面板组件，右侧滑出显示。

**Props:**
- `testCase`: 测试用例对象
- `executionHistory`: 执行历史数组

**Events:**
- `close`: 关闭详情面板

**特性:**
- 显示完整的用例信息
- 显示请求参数（JSON格式）
- 显示预期结果和实际结果
- 显示执行历史时间轴
- 支持复制参数

## 使用示例

```vue
<template>
  <!-- 项目层级 -->
  <TreeNode
    v-for="project in projects"
    :key="project.id"
    :node="project"
    level="project"
    @add-module="handleAddModule"
  >
    <!-- 模块层级 -->
    <TreeNode
      v-for="module in project.modules"
      :key="module.id"
      :node="module"
      level="module"
      @add-api="handleAddApi"
    >
      <!-- 接口层级 -->
      <TreeNode
        v-for="api in module.apis"
        :key="api.id"
        :node="api"
        level="api"
        @add-case="handleAddCase"
      >
        <!-- 用例卡片 -->
        <CaseCard
          v-for="testCase in api.cases"
          :key="testCase.id"
          :test-case="testCase"
          @select="handleSelectCase"
        />
      </TreeNode>
    </TreeNode>
  </TreeNode>
</template>
```

## 数据结构

```javascript
// 项目
{
  id: 'P001',
  name: '用户管理系统',
  description: '用户相关的API接口管理',
  modules: [...]
}

// 模块
{
  id: 'M001',
  name: '用户认证模块',
  description: '用户登录、注册、权限验证',
  apis: [...]
}

// 接口
{
  id: 'A001',
  name: '用户登录',
  url: '/api/v1/auth/login',
  method: 'POST',
  description: '用户登录接口',
  cases: [...]
}

// 测试用例
{
  id: 'TC-001',
  name: '正常登录测试',
  api_url: '/api/v1/auth/login',
  request_params: '{"email": "test@example.com"}',
  expected_status_code: 200,
  validation_rules: 'code=0, msg="success"',
  last_executed_time: '2024-03-10 14:30',
  status: 'passed', // 'passed' | 'failed' | 'not_executed'
  created_time: '2024-02-15 10:30',
  description: '测试正常用户登录流程'
}
```

## 主要功能

1. **层级展示**: 清晰的四级层级结构
2. **搜索功能**: 支持全文搜索
3. **批量操作**: 支持批量执行、批量删除用例
4. **统计信息**: 实时显示项目、模块、接口、用例数量
5. **CRUD操作**: 完整的增删改查功能
6. **执行测试**: 单个执行或批量执行测试用例
7. **详情查看**: 右侧滑出详情面板
8. **状态管理**: 用例状态实时更新

