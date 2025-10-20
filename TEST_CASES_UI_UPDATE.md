# 测试用例（相关用例）页面UI更新说明

## 更新概述
根据UI设计图，重新设计了接口详情页面中的"相关用例"标签页，提供更专业的测试用例列表展示。

## 主要功能

### 1. 筛选工具栏
- **测试类型筛选**：所有测试类型、功能测试、边界测试、异常测试、安全测试
- **优先级筛选**：所有优先级、高、中、低
- **排序选择**：默认排序、按名称、按创建时间、按更新时间
- **添加用例按钮**：快速添加新的测试用例
- **搜索框**：搜索用例名称或测试数据

### 2. 用例列表表格
#### 表格列
- **用例名称**：测试用例的名称（可点击查看详情）
- **测试类型**：
  - 功能测试：蓝色标签
  - 边界测试：橙色标签
  - 异常测试：红色标签
  - 安全测试：绿色标签
- **优先级**：
  - 高：红色标签
  - 中：橙色标签
  - 低：灰色标签
- **测试数据**：显示测试用例的输入数据（超长显示省略号，悬停显示完整内容）
- **预期结果**：显示预期的测试结果
- **操作**：
  - 运行：执行该测试用例
  - 查看：查看用例详细信息

#### 表格特性
- 整行可点击
- 悬停高亮效果
- 响应式列宽
- 固定操作列
- 文本溢出显示省略号

### 3. 分页功能
- 显示当前记录范围（如：显示 1-6 / 12 条记录）
- 上一页、下一页、页码跳转

## 技术实现

### 组件结构
```vue
<div class="cases-content">
  <!-- 筛选工具栏 -->
  <div class="cases-toolbar">
    <!-- 类型筛选 | 优先级筛选 | 排序 | 添加用例 | 搜索 -->
  </div>

  <!-- 用例列表表格 -->
  <el-table :data="filteredCases" @row-click="handleCaseRowClick">
    <!-- 用例名称 | 测试类型 | 优先级 | 测试数据 | 预期结果 | 操作 -->
  </el-table>

  <!-- 分页 -->
  <div class="cases-pagination">
    <!-- 记录信息 | 分页器 -->
  </div>
</div>
```

### 数据结构

#### 测试用例
```javascript
const testCasesList = ref([
  {
    id: 1,
    name: '正常用户信息更新',
    caseType: 'functional',
    priority: '高',
    testData: '有效的用户ID和完整更新信息（50字符以内的姓名、符合规则的电子邮箱和手机号码）',
    expectedResult: '状态码 200，更新成功'
  }
])
```

#### 筛选条件
```javascript
const casesFilter = reactive({
  type: '',        // 测试类型
  priority: '',    // 优先级
  sortBy: 'default' // 排序方式
})
```

#### 分页配置
```javascript
const casesPagination = reactive({
  currentPage: 1,
  pageSize: 10
})

const casesTotal = ref(12) // 总记录数
```

### 计算属性 - 过滤用例
```javascript
const filteredCases = computed(() => {
  let cases = props.relatedCases.length > 0 ? props.relatedCases : testCasesList.value
  
  // 类型过滤
  if (casesFilter.type) {
    cases = cases.filter(c => c.caseType === casesFilter.type)
  }
  
  // 优先级过滤
  if (casesFilter.priority) {
    cases = cases.filter(c => c.priority === casesFilter.priority)
  }
  
  // 搜索过滤
  if (casesSearchText.value) {
    const keyword = casesSearchText.value.toLowerCase()
    cases = cases.filter(c => 
      c.name.toLowerCase().includes(keyword) ||
      (c.testData && c.testData.toLowerCase().includes(keyword))
    )
  }
  
  return cases
})
```

## 功能方法

### 1. 添加测试用例
```javascript
const handleAddTestCase = () => {
  ElMessage.info('打开添加测试用例对话框')
  // TODO: 打开创建用例对话框
}
```

### 2. 运行测试用例
```javascript
const handleRunTestCase = (testCase) => {
  ElMessage.info(`运行测试用例：${testCase.name}`)
  // TODO: 执行该测试用例
}
```

### 3. 查看用例详情
```javascript
// 通过 emit 传递给父组件
$emit('select-case', testCase)
```

### 4. 文本截断
```javascript
const truncateText = (text, maxLength) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
```

## 样式特点

### 1. 工具栏样式
```css
.cases-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: #fafafa;
  border-bottom: 1px solid #e4e7ed;
}
```

### 2. 表格交互
```css
.cases-table :deep(.el-table__row) {
  cursor: pointer;
}

.cases-table :deep(.el-table__row:hover) {
  background: #f5f7fa;
}
```

### 3. 用例名称单元格
```css
.case-name-cell:hover .case-name-text {
  color: #409eff;
}

.case-name-text {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
  transition: color 0.2s;
}
```

### 4. 测试数据单元格
```css
.test-data-text {
  font-size: 13px;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

## 标签颜色映射

### 测试类型
| 类型 | 标签颜色 | Element Plus Type |
|------|----------|-------------------|
| 功能测试 | 蓝色 | primary |
| 边界测试 | 橙色 | warning |
| 异常测试 | 红色 | danger |
| 安全测试 | 绿色 | success |

### 优先级
| 优先级 | 标签颜色 | Element Plus Type |
|--------|----------|-------------------|
| 高 | 红色 | danger |
| 中 | 橙色 | warning |
| 低 | 灰色 | info |

## UI设计特点

### 1. 表格设计
- **简洁清晰**：突出关键信息
- **彩色标签**：直观区分类型和优先级
- **文本省略**：长文本显示省略号，悬停显示完整内容
- **可点击行**：整行可点击，提升交互体验

### 2. 筛选功能
- **多维度筛选**：类型、优先级、排序组合筛选
- **搜索功能**：支持关键字搜索
- **快速添加**：一键添加新用例

### 3. 操作便捷
- **运行测试**：快速执行单个用例
- **查看详情**：查看用例完整信息
- **整行点击**：点击任意位置查看详情

### 4. 信息展示
- **名称突出**：用例名称加粗显示
- **数据预览**：测试数据和预期结果简要展示
- **完整提示**：使用 Tooltip 显示完整内容

## 表格列说明

| 列名 | 最小宽度 | 对齐 | 说明 |
|------|----------|------|------|
| 用例名称 | 200px | 左对齐 | 可点击查看详情 |
| 测试类型 | 120px | 居中 | 彩色标签显示 |
| 优先级 | 100px | 居中 | 彩色标签显示 |
| 测试数据 | 250px | 左对齐 | 超长显示省略号 + Tooltip |
| 预期结果 | 200px | 左对齐 | 简要显示 |
| 操作 | 180px | 居中 | 运行、查看按钮 |

## 数据流程

### 1. 初始加载
```
页面加载 → 获取相关用例列表 → 应用默认筛选 → 显示第1页
```

### 2. 筛选流程
```
用户选择筛选条件 → 过滤数据 → 重置分页到第1页 → 刷新表格
```

### 3. 搜索流程
```
用户输入关键字 → 实时过滤数据 → 更新表格显示
```

### 4. 操作流程
```
运行用例 → 执行测试 → 显示测试结果
查看详情 → 触发 select-case 事件 → 父组件切换到用例详情
添加用例 → 打开创建对话框 → 保存 → 刷新列表
```

## 功能清单

### ✅ 已实现功能
- [x] 用例列表表格展示
- [x] 测试类型筛选
- [x] 优先级筛选
- [x] 排序功能
- [x] 搜索功能
- [x] 测试类型标签（彩色）
- [x] 优先级标签（彩色）
- [x] 文本截断和Tooltip
- [x] 运行用例按钮
- [x] 查看详情按钮
- [x] 整行点击功能
- [x] 分页功能
- [x] 记录统计信息

### 🔄 待完善功能
- [ ] 添加用例对话框实现
- [ ] 批量操作功能
- [ ] 用例导入/导出
- [ ] 用例复制功能
- [ ] 用例启用/禁用
- [ ] 用例标签管理
- [ ] 与后端API集成

## 对比旧版本

### 旧版本
- 简单的卡片列表
- 信息展示有限
- 缺少筛选和搜索
- 无分页功能
- 操作选项少

### 新版本
- 专业的表格展示
- 完整的用例信息
- 强大的筛选和搜索
- 完善的分页功能
- 丰富的操作选项
- 彩色标签区分

## 辅助函数

### 1. 获取用例类型标签颜色
```javascript
const getCaseTypeTagType = (type) => {
  const typeMap = {
    'functional': 'primary',  // 功能测试 - 蓝色
    'boundary': 'warning',    // 边界测试 - 橙色
    'exception': 'danger',    // 异常测试 - 红色
    'security': 'success'     // 安全测试 - 绿色
  }
  return typeMap[type] || ''
}
```

### 2. 获取优先级标签颜色
```javascript
const getPriorityTagType = (priority) => {
  const priorityMap = {
    '高': 'danger',   // 红色
    '中': 'warning',  // 橙色
    '低': 'info'      // 灰色
  }
  return priorityMap[priority] || ''
}
```

### 3. 文本截断
```javascript
const truncateText = (text, maxLength) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
```

## 测试用例示例数据

```javascript
{
  id: 1,
  name: '正常用户信息更新',
  caseType: 'functional',
  priority: '高',
  testData: '有效的用户ID和完整更新信息（50字符以内的姓名、符合规则的电子邮箱和手机号码）',
  expectedResult: '状态码 200，更新成功'
}
```

## 注意事项

1. **文本溢出**：长文本使用省略号 + Tooltip展示
2. **性能优化**：大量用例时使用虚拟滚动
3. **状态管理**：与props.relatedCases保持同步
4. **权限控制**：添加、编辑、删除操作需要权限验证

## 后续优化建议

1. **批量操作**：支持批量运行、批量删除
2. **用例模板**：支持从模板创建用例
3. **用例复制**：快速复制现有用例
4. **用例分组**：支持用例分组管理
5. **执行顺序**：支持用例执行顺序调整
6. **依赖关系**：显示用例间的依赖关系
7. **统计图表**：显示用例统计信息（类型分布、优先级分布等）
8. **快速过滤**：添加更多快速筛选标签
9. **用例导入**：支持批量导入用例
10. **用例导出**：支持导出用例为Excel/JSON

## 交互优化

### 1. 悬停效果
- 表格行悬停：浅灰色背景
- 用例名称悬停：蓝色文字

### 2. 点击反馈
- 整行点击：查看详情
- 运行按钮：执行测试
- 查看按钮：打开详情面板

### 3. 视觉反馈
- 彩色标签：快速识别类型和优先级
- 图标提示：运行、查看等操作图标
- Tooltip：完整内容提示

## 使用场景

### 场景1：查看接口的所有用例
```
用户点击接口 → 切换到"相关用例"标签 → 查看用例列表
```

### 场景2：筛选特定类型的用例
```
选择"安全测试" → 列表只显示安全测试用例
```

### 场景3：快速运行用例
```
点击"运行"按钮 → 执行测试 → 查看结果
```

### 场景4：添加新用例
```
点击"+ 添加测试用例" → 填写用例信息 → 保存 → 刷新列表
```

## 与其他标签页的关联

- **基本信息**：查看接口基本配置
- **请求参数**：配置接口参数
- **响应结果**：查看最近一次测试结果
- **测试历史**：查看所有历史测试记录
- **相关用例**：管理该接口的所有测试用例

每个用例点击"查看"后，会切换到用例详情页面（CaseDetail组件）
