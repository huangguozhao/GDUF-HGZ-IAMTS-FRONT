# 用例管理 API 集成指南

## 🚀 快速开始

### 1. 切换真实API/假数据模式

在 `src/views/Cases.vue` 文件中找到以下配置：

```javascript
// 配置：是否使用真实API（设置为 true 则调用后端，false 则使用假数据）
const USE_REAL_API = true  // 改为 false 使用假数据
```

- **`USE_REAL_API = true`**: 调用真实后端API
- **`USE_REAL_API = false`**: 使用前端假数据（用于演示和开发）

### 2. 后端API要求

确保后端服务运行在 `http://localhost:8080`，并提供以下接口：

#### 项目管理
- `GET /api/projects` - 获取项目列表
- `POST /api/projects` - 创建项目
- `PUT /api/projects/{project_id}` - 更新项目
- `DELETE /api/projects/{project_id}` - 删除项目

#### 模块管理
- `GET /api/projects/{project_id}/modules` - 获取项目下的模块列表
- `POST /api/projects/{project_id}/modules` - 创建模块
- `PUT /api/modules/{module_id}` - 更新模块
- `DELETE /api/modules/{module_id}` - 删除模块

#### 接口管理
- `GET /api/modules/{module_id}/apis` - 获取模块下的接口列表
- `POST /api/modules/{module_id}/apis` - 创建接口
- `PUT /api/apis/{api_id}` - 更新接口
- `DELETE /api/apis/{api_id}` - 删除接口

#### 测试用例管理
- `GET /api/apis/{api_id}/test-cases` - 获取接口的测试用例列表
- `POST /api/apis/{api_id}/test-cases` - 创建测试用例
- `PUT /api/apis/{api_id}/test-cases/{case_id}` - 更新测试用例
- `DELETE /api/apis/{api_id}/test-cases/{case_id}` - 删除测试用例
- `POST /api/apis/{api_id}/test-cases/{case_id}/execute` - 执行测试用例
- `GET /api/test-cases/{case_id}/execution-history` - 获取执行历史

## 📊 数据转换说明

### 后端 → 前端字段映射

#### 项目 (Project)
```javascript
{
  // 后端字段 → 前端字段
  project_id → id (显示用: P001, P002...)
  project_id → project_id (API调用用)
  name → name
  description → description
  created_at → created_time
  updated_at → updated_time
}
```

#### 模块 (Module)
```javascript
{
  module_id → id (显示用: M001, M002...)
  module_id → module_id (API调用用)
  module_code → module_code
  name → name
  description → description
  created_at → created_time
  updated_at → updated_time
}
```

#### 接口 (API)
```javascript
{
  api_id → id (显示用: A001, A002...)
  api_id → api_id (API调用用)
  api_code → api_code
  name → name
  path → url
  method → method
  description → description
  tags → tags
  created_at → created_time
  updated_at → updated_time
}
```

#### 测试用例 (Test Case)
```javascript
{
  case_id → case_id (API调用用)
  case_code → id (显示用)
  api_id → api_id
  name → name
  description → description
  priority → priority
  severity → severity
  tags → tags
  request_override → request_params (JSON字符串)
  expected_http_status → expected_status_code
  assertions → validation_rules (格式化字符串)
  is_enabled → is_enabled
  is_template → is_template
  version → version
  last_execution_status → status
  last_executed_at → last_executed_time
  created_at → created_time
  updated_at → updated_time
  creator_name → creator_name
}
```

### 前端 → 后端字段映射

前端提交数据时会自动转换，使用 `transformTestCaseToBackend` 等函数。

## 🔄 数据流程

### 加载流程
```
1. 获取所有项目 (GET /api/projects)
   ↓
2. 为每个项目获取模块 (GET /api/projects/{id}/modules)
   ↓
3. 为每个模块获取接口 (GET /api/modules/{id}/apis)
   ↓
4. 为每个接口获取测试用例 (GET /api/apis/{id}/test-cases)
   ↓
5. 组装成树形结构
   ↓
6. 渲染到页面
```

### 创建流程
```
1. 用户填写表单
   ↓
2. 验证表单
   ↓
3. 转换为后端格式
   ↓
4. 调用对应的创建API
   ↓
5. 重新加载项目树
   ↓
6. 显示成功消息
```

### 更新流程
```
1. 用户修改表单
   ↓
2. 验证表单
   ↓
3. 转换为后端格式
   ↓
4. 调用对应的更新API (需要ID)
   ↓
5. 重新加载项目树
   ↓
6. 更新详情面板
   ↓
7. 显示成功消息
```

### 删除流程
```
1. 用户确认删除
   ↓
2. 调用对应的删除API (需要ID)
   ↓
3. 重新加载项目树
   ↓
4. 关闭详情面板
   ↓
5. 显示成功消息
```

### 执行测试流程
```
1. 用户点击执行
   ↓
2. 调用执行API (POST /api/apis/{api_id}/test-cases/{case_id}/execute)
   ↓
3. 等待执行完成
   ↓
4. 重新加载项目树（获取最新状态）
   ↓
5. 更新用例状态显示
   ↓
6. 显示执行结果
```

## 📝 后端响应格式要求

所有接口必须遵循统一的响应格式：

```json
{
  "code": 1,  // 1=成功, 0=业务失败, 负数=错误
  "msg": "success",
  "data": {
    // 具体数据
  }
}
```

### 分页响应格式
```json
{
  "code": 1,
  "msg": "success",
  "data": {
    "total": 100,
    "items": [...],
    "page": 1,
    "page_size": 10
  }
}
```

## ⚙️ 配置说明

### 修改baseURL
在 `src/api/request.js` 中修改：

```javascript
const request = axios.create({
  baseURL: '/api', // 通过Vite代理
  timeout: 10000
})
```

### 修改代理配置
在 `vite.config.js` 中修改：

```javascript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // 修改为你的后端地址
        changeOrigin: true
      }
    }
  }
})
```

## 🐛 调试技巧

### 1. 查看网络请求
- 打开浏览器开发者工具 (F12)
- 切换到 Network 标签
- 筛选 XHR 请求
- 查看请求和响应详情

### 2. 查看控制台日志
所有API错误都会在控制台输出详细信息：
```
加载项目树失败: Error: ...
加载模块失败: Error: ...
```

### 3. 测试单个接口
可以在浏览器控制台直接测试：

```javascript
// 测试获取项目列表
const res = await fetch('/api/projects', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
const data = await res.json()
console.log(data)
```

## 🔧 常见问题

### 1. 跨域问题
确保配置了 Vite 代理，或者后端允许跨域请求。

### 2. 认证Token失效
如果遇到 401 错误，尝试重新登录获取新Token。

### 3. 数据加载缓慢
初次加载会发送多个请求（项目→模块→接口→用例），建议后端优化：
- 提供一个获取完整树的接口
- 使用GraphQL减少请求次数
- 添加缓存机制

### 4. 数据格式不匹配
检查 `src/utils/dataTransform.js` 中的转换逻辑是否正确。

## 📚 相关文件

- `src/api/project.js` - 项目/模块/接口API
- `src/api/testCase.js` - 测试用例API  
- `src/utils/dataTransform.js` - 数据转换工具
- `src/views/Cases.vue` - 用例管理页面
- `vite.config.js` - Vite配置（代理设置）

## ✅ 测试清单

启用真实API前，确保：

- [ ] 后端服务已启动 (`http://localhost:8080`)
- [ ] 已登录并获取有效Token
- [ ] Vite代理配置正确
- [ ] 数据库已初始化且有测试数据
- [ ] 所有必需的后端接口已实现
- [ ] 响应格式符合约定
- [ ] 在浏览器控制台测试单个接口成功

## 🎯 下一步

1. 设置 `USE_REAL_API = true`
2. 启动后端服务
3. 刷新前端页面
4. 在控制台查看是否有错误
5. 如有问题，先设回 `USE_REAL_API = false` 继续使用假数据

