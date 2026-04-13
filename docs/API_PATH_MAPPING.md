# API路径映射说明

## 前端请求路径 → 后端控制器路径

### 项目管理
- 前端: `/api/apis/projects` → 后端: `/projects`
- 前端: `/api/apis/projects/tree` → 后端: `/projects/tree`

### 模块管理
- 前端: `/api/projects/{id}/modules` → 后端: `/projects/{id}/modules`

### 接口管理
- 前端: `/api/modules/{id}/apis` → 后端: `/modules/{id}/apis`
- 前端: `/api/apis/{id}` → 后端: `/apis/{id}`

### 测试用例管理
- 前端: `/api/apis/{id}/test-cases` → 后端: `/apis/{id}/test-cases`

## 建议的修改方案

### 方案1：修改前端API路径（推荐）
保持后端路径不变，修改前端API调用路径，使其与后端控制器匹配。

### 方案2：修改后端控制器路径
如果前端路径已经固定，可以修改后端控制器的 `@RequestMapping` 注解。

## 当前问题
前端请求 `http://localhost:5180/api/apis/projects` 无法匹配后端控制器 `/projects`，导致404错误。

## 解决步骤
1. 修改 `src/api/project.js` 中的 `getProjects` 函数
2. 检查其他API文件中的路径配置
3. 确保所有API路径与后端控制器匹配
4. 测试API调用是否正常工作
