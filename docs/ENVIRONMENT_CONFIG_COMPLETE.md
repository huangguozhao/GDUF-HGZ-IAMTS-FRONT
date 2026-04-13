# 环境配置功能完整说明

## 页面布局

### 整体结构（1000px宽对话框）
```
┌────────────────────────────────────────────────────────────┐
│                    项目环境配置                              │
├──────────┬─────────────────────────────────────────────────┤
│          │  开发环境                           [编辑]       │
│ 🔍搜索   ├─────────────────────────────────────────────────┤
│          │ [基础配置] [数据配置项] [外部服务] [环境变量]... │
├──────────┤                                                  │
│ 开发环境  │  基础URL: [https://dev.example.com          ]   │
│  [默认]  │  端口号:  [8080                             ]   │
│ [运行中] │  域名:    [dev.example.com                 ]   │
│          │  协议:    [https ▼]                            │
├──────────┤  环境描述: [开发环境主要用于...              ]   │
│ 测试环境  │                                                  │
├──────────┤  ┌────────────────────────────────────────┐    │
│预发布环境 │  │ ✓ 部署状态   运行中                    │    │
├──────────┤  │ ⚠ 健康状态   良好                      │    │
│ 生产环境  │  │ ℹ 最后更新   2024-02-20 15:30         │    │
│          │  │ ✕ 排斥时间   未设置                    │    │
│          │  └────────────────────────────────────────┘    │
│          │                                                  │
│[+新建环境]│                                                  │
└──────────┴─────────────────────────────────────────────────┘
                                          [取消] [保存配置]
```

## 左侧环境列表（200px）

### 功能特性
1. **搜索框**：快速搜索环境
2. **环境列表**：
   - 环境名称
   - 徽章标识（默认、运行中）
   - 点击切换环境
3. **新建按钮**：底部蓝色按钮

### 环境项状态
- **普通状态**：白色背景
- **悬停状态**：浅灰背景
- **选中状态**：蓝色背景 + 白色文字
- **默认标识**：蓝色徽章
- **运行中标识**：绿色徽章

## 右侧环境详情（800px）

### 标题栏
- 显示当前环境名称
- 编辑按钮（修改环境名称）

### 标签页导航
1. **基础配置** ✓
2. **数据配置项**
3. **外部服务**
4. **环境变量**
5. **认证配置**
6. **功能开关**
7. **部署信息**

### 基础配置标签页

#### 配置项（2列网格布局）
| 配置项 | 说明 | 示例 |
|--------|------|------|
| 基础URL | 环境的基础访问地址 | https://dev.example.com |
| 端口号 | 服务端口 | 8080 |
| 域名 | 环境域名 | dev.example.com |
| 协议 | HTTP协议类型 | https / http |
| 环境描述 | 环境说明（全宽） | 开发环境主要用于... |

#### 状态指示器（4个状态卡片）
| 状态 | 图标 | 颜色 | 说明 |
|------|------|------|------|
| 部署状态 | ✓ | 绿色 | 运行中 / 已停止 |
| 健康状态 | ⚠ | 橙色 | 良好 / 异常 |
| 最后更新 | ℹ | 蓝色 | 2024-02-20 15:30 |
| 排斥时间 | ✕ | 灰色 | 未设置 |

## 技术实现

### 数据结构
```javascript
const envFormData = reactive({
  project_id: null,
  environments: [
    {
      name: '开发环境',
      base_url: 'https://dev.example.com',
      port: '8080',
      domain: 'dev.example.com',
      protocol: 'https',
      description: '开发环境主要用于开发人员本地开发和单元测试',
      is_default: true,
      status: 'active'  // active | inactive
    }
  ]
})

const currentEnvIndex = ref(0)
const envActiveTab = ref('basic')
const envSearchText = ref('')

const currentEnvironment = computed(() => {
  return envFormData.environments[currentEnvIndex.value]
})
```

### 关键方法

#### 1. 打开配置对话框
```javascript
const handleConfigEnvironment = (project) => {
  envFormData.project_id = project.project_id
  currentEnvIndex.value = 0
  envActiveTab.value = 'basic'
  envDialogVisible.value = true
}
```

#### 2. 添加新环境
```javascript
const handleAddEnvironment = () => {
  envFormData.environments.push({
    name: `新环境 ${envFormData.environments.length + 1}`,
    base_url: '',
    port: '8080',
    domain: '',
    protocol: 'https',
    description: '',
    is_default: false,
    status: 'inactive'
  })
  currentEnvIndex.value = envFormData.environments.length - 1
  ElMessage.success('环境已添加，请配置基本信息')
}
```

#### 3. 删除环境
```javascript
const handleRemoveEnvironment = (index) => {
  if (envFormData.environments.length <= 1) {
    ElMessage.warning('至少保留一个环境配置')
    return
  }
  
  ElMessageBox.confirm(
    `确定要删除环境 "${envFormData.environments[index].name}" 吗？`,
    '删除确认'
  ).then(() => {
    envFormData.environments.splice(index, 1)
    if (currentEnvIndex.value >= envFormData.environments.length) {
      currentEnvIndex.value = envFormData.environments.length - 1
    }
    ElMessage.success('环境已删除')
  })
}
```

#### 4. 编辑环境名称
```javascript
const handleEditEnvironmentName = () => {
  ElMessageBox.prompt('请输入环境名称', '编辑环境', {
    inputValue: currentEnvironment.value.name,
    inputValidator: (value) => {
      if (!value) return '环境名称不能为空'
      return true
    }
  }).then(({ value }) => {
    currentEnvironment.value.name = value
    ElMessage.success('环境名称已更新')
  })
}
```

#### 5. 保存配置
```javascript
const handleSaveEnvironments = () => {
  const hasEmpty = envFormData.environments.some(env => !env.name || !env.base_url)
  if (hasEmpty) {
    ElMessage.error('请填写完整的环境配置信息（环境名称和Base URL为必填项）')
    return
  }
  
  // TODO: 调用后端API
  ElMessage.success('环境配置已保存')
  envDialogVisible.value = false
}
```

## 样式特点

### 1. 左右分栏布局
```css
.env-config-layout {
  display: flex;
  height: 600px;
  overflow: hidden;
}

.env-sidebar {
  width: 200px;
  background: #fafafa;
}

.env-content {
  flex: 1;
  background: white;
}
```

### 2. 环境列表项
```css
.env-sidebar-item {
  padding: 12px;
  border-radius: 4px;
  cursor: pointer;
  background: white;
}

.env-sidebar-item.is-active {
  background: #409eff;
  color: white;
}
```

### 3. 标签页
```css
.env-tabs {
  display: flex;
  border-bottom: 1px solid #e4e7ed;
  background: #fafafa;
  overflow-x: auto;
}

.env-tab-item.active {
  color: #409eff;
  border-bottom-color: #409eff;
}
```

### 4. 表单布局
```css
.env-form-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}
```

### 5. 状态指示器
```css
.env-status-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #fafafa;
  border-radius: 6px;
}
```

## 交互流程

### 1. 查看环境配置
```
项目详情 → 点击"环境配置" → 打开对话框 → 显示环境列表和详情
```

### 2. 切换环境
```
点击左侧环境列表项 → 右侧显示该环境详情 → 可编辑配置
```

### 3. 添加环境
```
点击"+ 新建环境" → 创建新环境 → 自动切换到新环境 → 填写配置信息
```

### 4. 编辑环境名称
```
点击右上角"编辑" → 弹出输入框 → 输入新名称 → 确认更新
```

### 5. 删除环境
```
（在左侧列表右键或添加删除按钮） → 确认删除 → 删除环境 → 切换到其他环境
```

### 6. 切换标签页
```
点击标签页导航 → 显示对应配置内容 → 编辑配置 → 自动保存到当前环境
```

## 标签页功能

### 基础配置 ✅
- 基础URL、端口号、域名、协议
- 环境描述
- 状态指示器（部署状态、健康状态、最后更新、排斥时间）

### 数据配置项 🔄
- 数据库配置
- 缓存配置
- 消息队列配置

### 外部服务 🔄
- 第三方API配置
- 服务依赖配置

### 环境变量 🔄
- 系统环境变量
- 自定义变量

### 认证配置 🔄
- 认证方式配置
- Token配置
- OAuth配置

### 功能开关 🔄
- 功能开关列表
- 开关状态管理

### 部署信息 🔄
- 部署历史
- 版本信息
- 容器信息

## 使用示例

### 示例1：配置开发环境
```javascript
{
  name: '开发环境',
  base_url: 'https://dev.example.com',
  port: '8080',
  domain: 'dev.example.com',
  protocol: 'https',
  description: '开发环境主要用于开发人员本地开发和单元测试',
  is_default: true,
  status: 'active'
}
```

### 示例2：配置生产环境
```javascript
{
  name: '生产环境',
  base_url: 'https://prod.example.com',
  port: '443',
  domain: 'prod.example.com',
  protocol: 'https',
  description: '生产环境配置，请谨慎操作',
  is_default: false,
  status: 'inactive'
}
```

## UI特点

### 1. 左侧列表
- 浅灰色背景
- 白色卡片项
- 选中项蓝色高亮
- 徽章标识（默认、运行中）

### 2. 右侧详情
- 白色背景
- 多标签页导航
- 2列网格表单
- 状态指示卡片

### 3. 徽章设计
- **默认**：蓝色徽章
- **运行中**：绿色徽章
- **选中时**：白色背景，蓝色文字

### 4. 状态卡片
- 4个状态卡片平铺
- 图标 + 标签 + 值
- 浅灰色背景
- 圆角设计

## 功能清单

### ✅ 已实现
- [x] 环境配置入口按钮
- [x] 左右分栏布局
- [x] 环境列表展示
- [x] 环境搜索功能
- [x] 环境选中切换
- [x] 新建环境
- [x] 删除环境
- [x] 编辑环境名称
- [x] 多标签页导航
- [x] 基础配置表单
- [x] 状态指示器
- [x] 默认环境标识
- [x] 运行状态标识
- [x] 表单验证

### 🔄 待实现
- [ ] 从后端加载环境配置
- [ ] 保存到后端
- [ ] 其他标签页内容
- [ ] 环境连通性测试
- [ ] 环境复制功能
- [ ] 环境导入导出
- [ ] 环境变量管理
- [ ] 批量操作

## 响应式设计

### 独立滚动区域
1. **环境列表**：独立滚动（overflow-y: auto）
2. **标签页内容**：独立滚动（overflow-y: auto）
3. **标签页导航**：横向滚动（overflow-x: auto）

### 固定区域
1. **搜索框**：固定在顶部
2. **新建按钮**：固定在底部
3. **标题栏**：固定在顶部
4. **标签页导航**：固定在内容区顶部

## 注意事项

1. **至少一个环境**：删除时检查，至少保留一个
2. **名称唯一性**：建议添加名称重复检查
3. **URL格式**：建议添加URL格式验证
4. **端口范围**：验证端口号范围（1-65535）
5. **默认环境**：确保只有一个默认环境
6. **当前索引**：删除后正确处理当前索引

## 后续优化建议

1. **右键菜单**：在环境列表项添加右键菜单
2. **拖拽排序**：支持环境列表拖拽排序
3. **环境复制**：快速复制现有环境配置
4. **批量操作**：批量启用/禁用环境
5. **环境分组**：支持环境分组管理
6. **配置模板**：提供常用环境配置模板
7. **连通性测试**：添加"测试连接"功能
8. **配置对比**：对比不同环境的配置差异
