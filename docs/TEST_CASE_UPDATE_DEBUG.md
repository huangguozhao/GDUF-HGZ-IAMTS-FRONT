# 测试用例更新接口调试指南

## 🔍 请按以下步骤调试

### 步骤1: 查看浏览器控制台日志

打开浏览器开发者工具（F12），切换到 Console 标签页，执行更新操作后查看以下日志：

```
=== updateTestCase ===
用例ID: xxx
原始数据: {...}
过滤后的请求数据: {...}
=====================
```

以及：

```
=== HTTP 请求详情 ===
请求方法: PUT
请求URL: /testcases/xxx
请求数据 (JSON字符串): {...}
====================
```

**请将完整的日志内容复制给我！**

### 步骤2: 查看 Network 面板

1. 打开开发者工具，切换到 Network 标签页
2. 执行更新操作
3. 找到对应的 PUT 请求（`/testcases/xxx`）
4. 点击该请求，查看：
   - **Request Payload** - 实际发送的数据
   - **Response** - 服务器返回的内容
   - **Status Code** - HTTP 状态码

**请将这些信息截图或复制给我！**

### 步骤3: 查看后端日志

查看后端控制台或日志文件，看是否有错误信息：
- 参数验证失败？
- 数据类型错误？
- 业务逻辑错误？

## 🤔 常见问题排查

### 问题1: 缺少必填字段

后端可能要求某些字段必填，但前端没有发送。

**检查方法**：
查看控制台日志中的 `过滤后的请求数据`，确认是否包含以下字段：
- ✅ name（必填）
- ✅ description
- ✅ testType
- ✅ priority
- ✅ severity

### 问题2: 数据类型不匹配

例如：
- `expectedHttpStatus` 应该是数字，但发送的是字符串
- `tags` 应该是数组，但发送的是字符串
- `isEnabled` 应该是布尔值，但发送的是字符串

### 问题3: 字段名不匹配

前端使用下划线命名（`expected_http_status`），但后端期望驼峰命名（`expectedHttpStatus`）。

我已经在 `src/api/testCase.js` 中做了转换，但需要确认实际发送的数据。

### 问题4: 数组/对象字段为 null 或 undefined

后端可能不接受 `null` 值，需要转换为空数组 `[]` 或空对象 `{}`。

## 🔧 临时测试方案

使用 Postman 或 curl 直接测试后端接口：

```bash
curl -X PUT http://localhost:8080/api/testcases/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "caseCode": "TC001",
    "name": "测试用例名称",
    "description": "测试描述",
    "testType": "functional",
    "priority": "P1",
    "severity": "high",
    "tags": ["tag1", "tag2"],
    "preConditions": [],
    "testSteps": [],
    "requestOverride": {},
    "expectedHttpStatus": 200,
    "expectedResponseSchema": {},
    "expectedResponseBody": "",
    "assertions": [],
    "extractors": [],
    "validators": [],
    "isEnabled": true,
    "isTemplate": false,
    "templateId": 0,
    "version": "1.0"
  }'
```

如果这个请求成功，说明后端接口没问题，是前端发送的数据格式有问题。

## 📋 请提供以下信息

为了帮您准确定位问题，请提供：

1. ✅ 浏览器控制台的完整日志
2. ✅ Network 面板中的 Request Payload
3. ✅ Network 面板中的 Response
4. ✅ HTTP 状态码
5. ✅ 后端日志（如果有）

有了这些信息，我就能准确定位问题并修复！🎯

