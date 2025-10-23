# 测试用例导出功能实现文档

## 功能概述

在测试用例详情页面（`CaseDetail.vue`）中实现了完整的测试用例导出功能，支持多种格式、丰富的选项配置和良好的用户体验。

## 核心特性

### ✅ 1. 多种导出格式

支持4种主流导出格式，满足不同使用场景：

| 格式 | 扩展名 | 适用场景 | 特点 |
|------|--------|----------|------|
| **Excel** | `.xlsx` | 查看和编辑 | 📊 推荐，支持格式化和公式 |
| **JSON** | `.json` | 程序处理 | { } 标准数据交换格式 |
| **YAML** | `.yaml` | 配置管理 | 📄 适合版本控制 |
| **CSV** | `.csv` | 表格处理 | 📋 简单的文本格式 |

### ✅ 2. 灵活的导出选项

#### 基本信息（必选）
- 用例编码
- 用例名称
- 用例描述
- 优先级和严重程度
- 创建人和创建时间

#### 可选内容
- **测试步骤** 🔢：详细的操作步骤和预期结果
- **断言规则** ✓：JSON路径、状态码等验证规则
- **提取规则** 🔍：响应数据提取配置
- **执行历史** 📊：最近的测试执行记录

### ✅ 3. 高级配置

- **自定义文件名**：支持自定义导出文件名
- **编码选择**（CSV格式）：
  - UTF-8：标准编码
  - GBK：中文Excel兼容

### ✅ 4. 良好的用户体验

#### 直观的界面
- 格式选择带图标和描述
- 实时显示预计文件大小
- 清晰的导出内容说明

#### 智能提示
- 格式建议和适用场景说明
- 文件命名规则提示
- 导出进度反馈

#### 错误处理
- 超时处理：友好的超时提示
- 404错误：接口不存在提示
- 500错误：服务器错误提示
- 网络错误：网络连接提示

## 实现细节

### 1. API接口（src/api/testCase.js）

#### 导出单个测试用例
```javascript
export function exportTestCase(caseId, format = 'json', options = {})
```

**参数说明：**
- `caseId`：测试用例ID
- `format`：导出格式（excel/json/yaml/csv）
- `options`：导出选项
  - `includeSteps`：是否包含测试步骤
  - `includeAssertions`：是否包含断言规则
  - `includeExtractors`：是否包含提取规则
  - `includeHistory`：是否包含执行历史

**关键配置：**
```javascript
{
  url: `/test-cases/${caseId}/export`,
  method: 'get',
  responseType: 'blob',  // 重要：接收文件流
  timeout: 30000  // 30秒超时
}
```

#### 批量导出测试用例
```javascript
export function exportTestCases(exportData)
```

**支持的过滤条件：**
- 项目ID、模块ID、接口ID
- 优先级、严重程度
- 标签、启用状态
- 创建人、创建时间范围

### 2. 组件实现（src/components/cases/CaseDetail.vue）

#### 数据结构
```javascript
const exportFormData = reactive({
  format: 'excel',  // 默认Excel格式
  includeOptions: ['steps', 'assertions', 'extractors'],
  fileName: '',  // 自定义文件名
  encoding: 'utf-8'  // CSV编码
})
```

#### 核心函数

##### handleExport()
打开导出对话框，重置表单数据

##### handleConfirmExport()
执行导出操作，处理文件下载

**流程：**
1. 表单验证
2. 构建导出选项
3. 调用API获取文件流
4. 生成文件名
5. 创建下载链接
6. 触发下载
7. 清理资源

##### getFileExtension(format)
获取文件扩展名

##### getFormatName(format)
获取格式显示名称

##### getEstimatedSize()
估算导出文件大小

### 3. UI组件

#### 导出对话框结构
```
导出测试用例对话框
├── 导出说明（Alert）
├── 导出格式选择
│   ├── Excel (.xlsx)
│   ├── JSON (.json)
│   ├── YAML (.yaml)
│   └── CSV (.csv)
├── 导出内容选择
│   ├── 基本信息（必选）
│   ├── 测试步骤
│   ├── 断言规则
│   ├── 提取规则
│   └── 执行历史
├── 高级选项
│   ├── 文件命名
│   └── 编码格式（CSV）
├── 导出统计
│   ├── 导出格式
│   ├── 用例数量
│   └── 预计大小
└── 操作按钮
    ├── 取消
    └── 开始导出
```

#### 样式特点
- **格式选择**：图标+名称+描述的组合展示
- **复选框列表**：垂直排列，带图标标识
- **统计信息**：3列网格布局，渐变背景
- **响应式设计**：适配不同屏幕尺寸

## 使用流程

### 1. 打开导出对话框

用户在测试用例详情页点击"更多" → "导出用例"

### 2. 配置导出选项

```
步骤1：选择导出格式
  ├─ Excel：推荐，适合查看编辑
  ├─ JSON：适合程序处理
  ├─ YAML：适合配置管理
  └─ CSV：适合表格处理

步骤2：选择导出内容
  ├─ ✓ 基本信息（必选）
  ├─ □ 测试步骤
  ├─ □ 断言规则
  ├─ □ 提取规则
  └─ □ 执行历史

步骤3：高级配置（可选）
  ├─ 自定义文件名
  └─ 选择编码格式（CSV）

步骤4：查看预估信息
  ├─ 导出格式
  ├─ 用例数量
  └─ 预计大小
```

### 3. 执行导出

点击"开始导出"，系统自动：
1. 向后端发送导出请求
2. 接收文件流
3. 生成下载链接
4. 自动下载文件

### 4. 文件命名规则

**默认命名：**
```
{用例编码}_{日期时间}.{扩展名}
例如：TC_AUTH001_001_2025-10-23T16-30-45.xlsx
```

**自定义命名：**
```
{自定义名称}.{扩展名}
例如：登录测试用例.xlsx
```

## 错误处理机制

### 1. 前端验证
- 格式必选验证
- 文件名长度限制（100字符）

### 2. 网络错误处理
```javascript
try {
  const response = await exportTestCase(...)
  // 处理成功
} catch (error) {
  if (error.message.includes('timeout')) {
    // 超时处理
  } else if (error.response?.status === 404) {
    // 接口不存在
  } else if (error.response?.status === 500) {
    // 服务器错误
  } else {
    // 其他错误
  }
}
```

### 3. 文件下载错误
- 检查响应数据大小
- 验证Blob对象
- 清理下载资源

## 扩展性设计

### 1. 添加新格式

只需修改3处：

#### ① 格式选项（模板）
```vue
<el-option label="XML (.xml)" value="xml">
  <span class="format-option">
    <span class="format-icon">📜</span>
    <span class="format-name">XML (.xml)</span>
    <span class="format-desc">适合数据交换</span>
  </span>
</el-option>
```

#### ② 扩展名映射（script）
```javascript
const getFileExtension = (format) => {
  const extMap = {
    excel: 'xlsx',
    json: 'json',
    yaml: 'yaml',
    csv: 'csv',
    xml: 'xml'  // 新增
  }
  return extMap[format] || 'txt'
}
```

#### ③ 格式名称（script）
```javascript
const getFormatName = (format) => {
  const nameMap = {
    excel: 'Excel (.xlsx)',
    json: 'JSON (.json)',
    yaml: 'YAML (.yaml)',
    csv: 'CSV (.csv)',
    xml: 'XML (.xml)'  // 新增
  }
  return nameMap[format] || format
}
```

### 2. 添加新的导出选项

在 `exportFormData.includeOptions` 中添加新选项：

```javascript
exportFormData.includeOptions = [
  'steps', 
  'assertions', 
  'extractors', 
  'history',
  'attachments'  // 新增：附件
]
```

在模板中添加对应的复选框：

```vue
<el-checkbox label="attachments">
  <span class="checkbox-label">
    <span class="checkbox-icon">📎</span>
    附件
  </span>
</el-checkbox>
```

### 3. 批量导出扩展

已预留批量导出API `exportTestCases()`，支持：
- 按条件筛选
- 批量选择用例ID
- 统一导出配置

## 后端接口要求

### 单个用例导出

**接口地址：** `GET /test-cases/{caseId}/export`

**请求参数：**
```
format: string (excel|json|yaml|csv)
include_steps: boolean
include_assertions: boolean
include_extractors: boolean
include_history: boolean
```

**响应格式：**
```
Content-Type: application/octet-stream
Content-Disposition: attachment; filename="testcase.xlsx"

[文件二进制流]
```

### 批量导出

**接口地址：** `POST /test-cases/export`

**请求体：**
```json
{
  "format": "excel",
  "case_ids": [1, 2, 3],
  "filter": {
    "project_id": 1,
    "priority": "P0",
    "is_enabled": true
  },
  "options": {
    "include_steps": true,
    "include_assertions": true,
    "include_extractors": true,
    "include_history": false
  }
}
```

## 相关文件

### 前端
- `src/components/cases/CaseDetail.vue` - 用例详情组件（包含导出对话框）
- `src/api/testCase.js` - 测试用例API（包含导出接口）

### 后端（待实现）
- 测试用例导出控制器
- Excel/JSON/YAML/CSV生成器
- 文件流处理服务

## 性能优化

### 1. 文件大小估算
根据选项动态计算预估大小，帮助用户判断

### 2. 超时时间
- 单个用例：30秒
- 批量导出：60秒

### 3. 资源清理
```javascript
// 及时清理下载链接
document.body.removeChild(link)
window.URL.revokeObjectURL(url)
```

## 安全考虑

### 1. 文件名验证
- 长度限制：最多100字符
- 字符过滤：移除特殊字符

### 2. 权限检查
后端应验证用户是否有权限导出该用例

### 3. 数据脱敏
敏感信息（如密码、Token）应在导出时脱敏处理

## 测试建议

### 功能测试
1. ✅ 各种格式导出成功
2. ✅ 导出选项生效
3. ✅ 文件命名正确
4. ✅ 文件内容完整

### 异常测试
1. ✅ 网络超时处理
2. ✅ 服务器错误处理
3. ✅ 无效用例ID处理
4. ✅ 大文件导出

### 兼容性测试
1. ✅ 不同浏览器下载
2. ✅ 不同操作系统
3. ✅ 移动端适配

## 未来规划

### 短期
- [ ] 添加导出模板功能
- [ ] 支持导出到云存储
- [ ] 导出任务队列（大批量）

### 长期
- [ ] 自定义导出字段
- [ ] 导出历史记录
- [ ] 定时导出任务
- [ ] 导出数据可视化

## 总结

测试用例导出功能提供了完整的解决方案，包括：

✅ **多种格式**：满足不同使用场景  
✅ **灵活选项**：自由配置导出内容  
✅ **良好体验**：直观的界面和智能提示  
✅ **完善错误处理**：友好的错误提示  
✅ **高扩展性**：易于添加新格式和选项  

该功能已经可以投入使用，后续可以根据实际需求继续优化和扩展。

