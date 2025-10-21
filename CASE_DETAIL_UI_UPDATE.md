# 测试用例详情页面UI更新说明

## 更新概述
根据UI设计图，完全重构了测试用例详情页面（CaseDetail.vue），采用左右分栏布局，提供更专业和清晰的用例信息展示。

## 页面布局

### 整体结构
```
┌─────────────────────────────────────────────────────┐
│ 面包屑导航: 测试用例 › TC-1001                       │
├─────────────────────────────────────────────────────┤
│ 用例标题: 登录功能验证                              │
├───────────────────────────┬─────────────────────────┤
│                           │                         │
│  左侧主要内容              │  右侧辅助信息            │
│  - 基本信息卡片            │  - 执行历史             │
│  - 测试步骤                │  - 关联信息             │
│  - 测试数据                │  - 讨论区               │
│                           │                         │
└───────────────────────────┴─────────────────────────┘
```

## 主要功能模块

### 1. 面包屑导航
- 显示当前位置：测试用例 › TC-1001
- 灰色文字 + 分隔符
- 当前项加粗显示

### 2. 用例标题
- 大标题显示用例名称
- 24px字体，加粗
- 独立的区域，有底部边框

### 3. 左侧主要内容

#### 3.1 基本信息卡片
- **卡片样式**：浅灰背景，圆角边框
- **Grid布局**：2列网格
- **包含字段**：
  - 优先级（彩色标签）
  - 创建人
  - 创建时间
  - 最后修改时间

#### 3.2 测试步骤
- **卡片样式**：白色背景，圆角边框
- **步骤编号**：蓝色圆圈，白色数字
- **步骤内容**：
  - 操作描述（加粗）
  - 预期结果
  - 实际结果（如有）

#### 3.3 测试数据
- **卡片样式**：白色背景，圆角边框
- **表格形式**：标签-值对
- **数据项**：
  - 用户名：testuser
  - 密码：Test@123

### 4. 右侧辅助信息

#### 4.1 执行历史
- **卡片列表**：每条历史一个卡片
- **包含信息**：
  - 状态图标（成功/失败）
  - 执行人
  - 执行环境/结果
  - 执行时间

#### 4.2 关联信息
- **关联项类型**：
  - 需求（蓝色图标）
  - Bug（红色图标）
- **显示内容**：
  - 关联标题
  - 关联编号（如 REQ-2024-001）

#### 4.3 讨论区
- **评论列表**：头像 + 内容
- **包含信息**：
  - 用户头像
  - 评论者姓名
  - 评论时间
  - 评论内容

## 技术实现

### 组件结构
```vue
<div class="case-detail-container">
  <!-- 面包屑导航 -->
  <div class="breadcrumb">...</div>
  
  <!-- 用例标题 -->
  <div class="case-header">
    <h2 class="case-title">...</h2>
  </div>
  
  <!-- 主要内容 -->
  <div class="case-content">
    <!-- 左侧 -->
    <div class="case-main">
      <div class="info-card">...</div>
      <div class="section-card">测试步骤</div>
      <div class="section-card">测试数据</div>
    </div>
    
    <!-- 右侧 -->
    <div class="case-sidebar">
      <div class="sidebar-section">执行历史</div>
      <div class="sidebar-section">关联信息</div>
      <div class="sidebar-section">讨论</div>
    </div>
  </div>
</div>
```

### 数据结构

#### 测试步骤
```javascript
const displaySteps = computed(() => [
  {
    operation: '访问登录页面',
    expected: '显示登录表单'
  },
  {
    operation: '输入正确的用户名和密码',
    expected: '显示登录成功提示'
  },
  {
    operation: '点击登录按钮',
    expected: '跳转到首页'
  }
])
```

#### 测试数据
```javascript
const displayTestData = computed(() => [
  { label: '用户名', value: 'testuser' },
  { label: '密码', value: 'Test@123' }
])
```

#### 执行历史
```javascript
const displayHistory = computed(() => [
  {
    action: '李华',
    note: '开发环境',
    executed_time: '2024-01-20 16:45',
    status: 'passed'
  }
])
```

## 样式特点

### 1. 卡片设计
```css
/* 浅色信息卡片 */
.info-card {
  background: #fafafa;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
}

/* 白色区块卡片 */
.section-card {
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 20px;
}

/* 侧边栏卡片 */
.sidebar-section {
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
}
```

### 2. 布局设计
```css
/* 左右分栏 */
.case-content {
  display: flex;
  gap: 24px;
}

.case-main {
  flex: 1;        /* 左侧占据剩余空间 */
  min-width: 0;
}

.case-sidebar {
  width: 320px;   /* 右侧固定宽度 */
  flex-shrink: 0;
}

/* Grid 布局 */
.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
```

### 3. 测试步骤样式
```css
.step-number {
  width: 24px;
  height: 24px;
  background: #409eff;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.step-operation {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.step-expected {
  font-size: 13px;
  color: #606266;
}
```

### 4. 执行历史样式
```css
.history-card {
  background: #fafafa;
  border-radius: 6px;
  padding: 12px;
}

.history-header {
  display: flex;
  align-items: center;
  gap: 8px;
}
```

## UI设计特点

### 1. 层次清晰
- **三级视觉层次**：导航 → 标题 → 内容
- **左右分栏**：主要信息 vs 辅助信息
- **卡片设计**：每个模块独立卡片

### 2. 信息组织
- **基本信息**：2列网格，紧凑展示
- **测试步骤**：序号 + 内容，清晰易读
- **测试数据**：标签-值对，表格形式
- **执行历史**：时间线展示，状态图标

### 3. 视觉设计
- **圆角卡片**：8px圆角，现代感
- **颜色区分**：
  - 浅灰背景：#fafafa（信息卡片）
  - 白色背景：#ffffff（主要内容）
  - 蓝色强调：#409eff（步骤编号）
- **间距统一**：16px、20px、24px

### 4. 交互设计
- **可滚动内容**：内容区域独立滚动
- **悬停效果**：关联项悬停变色
- **图标提示**：状态、关联类型用图标标识

## 功能列表

### ✅ 已实现功能
- [x] 面包屑导航
- [x] 用例标题显示
- [x] 基本信息2列网格展示
- [x] 优先级彩色标签
- [x] 测试步骤序号列表
- [x] 测试数据表格展示
- [x] 执行历史卡片列表
- [x] 关联信息（需求、Bug）
- [x] 讨论区评论列表
- [x] 用户头像显示
- [x] 状态图标显示
- [x] 独立滚动区域

### 🔄 待完善功能
- [ ] 编辑用例功能
- [ ] 删除用例功能
- [ ] 添加评论功能
- [ ] 关联信息点击跳转
- [ ] 执行历史详情查看
- [ ] 测试步骤编辑
- [ ] 测试数据编辑
- [ ] 更多关联类型

## 计算属性

### 1. 显示测试步骤
```javascript
const displaySteps = computed(() => {
  if (props.testCase.test_steps && Array.isArray(props.testCase.test_steps)) {
    return props.testCase.test_steps
  }
  
  // 返回默认步骤
  return [
    {
      operation: '访问登录页面',
      expected: '显示登录表单'
    },
    {
      operation: '输入正确的用户名和密码',
      expected: '显示登录成功提示'
    },
    {
      operation: '点击登录按钮',
      expected: '跳转到首页'
    }
  ]
})
```

### 2. 显示测试数据
```javascript
const displayTestData = computed(() => {
  const params = props.testCase.request_override || props.testCase.request_params
  
  if (params && typeof params === 'object') {
    return Object.entries(params).map(([key, value]) => ({
      label: key,
      value: typeof value === 'object' ? JSON.stringify(value) : String(value)
    }))
  }
  
  // 返回默认数据
  return [
    { label: '用户名', value: 'testuser' },
    { label: '密码', value: 'Test@123' }
  ]
})
```

### 3. 显示执行历史
```javascript
const displayHistory = computed(() => {
  if (props.executionHistory && props.executionHistory.length > 0) {
    return props.executionHistory
  }
  
  // 返回默认历史
  return [
    {
      action: '李华',
      note: '开发环境',
      executed_time: '2024-01-20 16:45',
      status: 'passed'
    }
  ]
})
```

## 优先级标签映射

```javascript
const getPriorityType = (priority) => {
  const typeMap = {
    'P0': 'danger',
    'P1': 'danger',
    'P2': 'warning',
    'P3': 'info',
    '高': 'danger',
    '中': 'warning',
    '低': 'info'
  }
  return typeMap[priority] || 'warning'
}
```

## 对比旧版本

### 旧版本
- 简单的右侧面板
- 信息展示单一
- 缺少视觉层次
- 布局较为拥挤

### 新版本
- 完整的页面布局
- 面包屑导航
- 左右分栏设计
- 卡片化模块
- 清晰的视觉层次
- 丰富的信息展示
- 独立滚动区域

## 模块说明

### 左侧主要内容（flex: 1）
1. **基本信息卡片**：优先级、创建人、时间信息
2. **测试步骤**：序号列表，操作和预期结果
3. **测试数据**：参数和值的表格展示

### 右侧辅助信息（320px固定宽度）
1. **执行历史**：最近的测试执行记录
2. **关联信息**：关联的需求和Bug
3. **讨论区**：团队成员的评论和讨论

## 样式规范

### 1. 间距规范
- 卡片间距：20px
- 卡片内边距：16-20px
- 元素间距：12-16px
- 小元素间距：4-8px

### 2. 字体规范
- 标题：24px / 16px / 14px
- 正文：14px / 13px
- 辅助文字：12px
- 字重：600（标题）/ 500（强调）/ 400（正文）

### 3. 颜色规范
- 主要文字：#303133
- 次要文字：#606266
- 辅助文字：#909399
- 提示文字：#c0c4cc
- 主题色：#409eff
- 成功色：#67c23a
- 失败色：#f56c6c

### 4. 圆角规范
- 大卡片：8px
- 小卡片：6px
- 标签：4px
- 圆形：50%

## 响应式设计

### 内容滚动
```css
.case-content {
  flex: 1;
  display: flex;
  gap: 24px;
  padding: 24px;
  overflow-y: auto;
  overflow-x: hidden;
}
```

### 固定元素
```css
.breadcrumb {
  flex-shrink: 0;  /* 不参与压缩 */
}

.case-header {
  flex-shrink: 0;  /* 不参与压缩 */
}
```

## 图标使用

### Element Plus Icons
- `CircleCheckFilled`：成功状态
- `CircleCloseFilled`：失败状态
- `Link`：关联需求
- `WarningFilled`：关联Bug
- `User`：用户头像
- `Edit`：编辑按钮
- `Delete`：删除按钮

## 数据适配

### 1. 从props获取数据
```javascript
props.testCase          // 用例主数据
props.executionHistory  // 执行历史数据
```

### 2. 数据转换和默认值
- 测试步骤：从 `test_steps` 获取或使用默认值
- 测试数据：从 `request_override` 或 `request_params` 解析
- 执行历史：从 `executionHistory` 获取或使用默认值

### 3. 兼容性处理
- 支持对象和字符串两种格式
- JSON解析失败时使用默认数据
- 空值显示 `-` 占位符

## 用户体验优化

### 1. 视觉层次
- 清晰的面包屑导航
- 醒目的用例标题
- 分区明确的内容布局

### 2. 信息密度
- 左侧：详细的测试信息
- 右侧：辅助的历史和关联信息
- 合理的信息分布

### 3. 交互反馈
- 悬停效果
- 点击反馈
- 状态指示

### 4. 滚动优化
- 独立滚动区域
- 固定的导航和标题
- 自定义滚动条样式

## 注意事项

1. **数据格式**：确保后端返回的数据格式与前端期望一致
2. **空值处理**：所有字段都有默认值或占位符
3. **性能优化**：使用计算属性避免重复计算
4. **响应式**：确保在不同屏幕尺寸下正常显示

## 后续优化建议

1. **编辑功能**：实现用例的在线编辑
2. **评论功能**：实现添加评论和回复
3. **附件上传**：支持上传测试相关的附件
4. **版本历史**：显示用例的修改历史
5. **标签管理**：支持用例标签的添加和删除
6. **快速操作**：添加快速复制、快速执行等功能
7. **关联管理**：支持添加和删除关联信息
8. **权限控制**：根据用户权限显示不同操作
