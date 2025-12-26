# 通知设置模块

## 功能概述

通知设置模块提供了完整的通知管理系统，包括通知渠道配置、通知模板管理、通知规则设置和通知历史记录查看等功能。

## 组件结构

```
notification/
├── NotificationTypesConfig.vue    # 通知类型配置组件
├── NotificationTemplates.vue      # 通知模板管理组件
├── NotificationRules.vue          # 通知规则设置组件
├── NotificationHistory.vue        # 通知历史记录组件
├── EditTemplateModal.vue          # 编辑通知模板弹窗
├── EditRuleModal.vue              # 编辑通知规则弹窗
└── README.md                      # 说明文档
```

## 主要功能

### 1. 通知类型配置 (NotificationTypesConfig.vue)

- **邮件通知配置**: SMTP服务器设置、邮件发送测试
- **短信通知配置**: SMS服务商配置、短信发送测试
- **系统通知配置**: 系统内部消息通知开关
- **通知频率控制**: 重复通知间隔、每日最大通知次数、静默时间段设置
- **高级设置**: 通知队列、重试机制、通知日志等

### 2. 通知模板管理 (NotificationTemplates.vue)

- **模板列表**: 支持分页、搜索、筛选
- **模板类型**: 邮件模板、短信模板、系统模板
- **模板编辑**: 创建和编辑通知模板
- **变量支持**: 支持模板变量替换

### 3. 通知规则设置 (NotificationRules.vue)

- **规则配置**: 触发类型（手动/自动/定时）
- **通知渠道**: 多渠道选择（邮件/短信/系统/Webhook）
- **接收人设置**: 指定用户、角色用户、项目成员
- **触发条件**: 多条件组合设置
- **规则状态**: 启用/禁用规则

### 4. 通知历史记录 (NotificationHistory.vue)

- **历史查询**: 按时间范围、渠道、状态筛选
- **统计信息**: 发送成功/失败/进行中数量统计
- **详情查看**: 查看通知发送详情
- **重发功能**: 支持失败通知重发
- **导出功能**: 支持历史记录导出

## API接口

### 通知设置相关
- `getNotificationSettings()` - 获取通知设置
- `updateNotificationSettings(data)` - 更新通知设置
- `testEmailConfig(data)` - 测试邮件配置
- `testSmsConfig(data)` - 测试短信配置

### 通知模板相关
- `getNotificationTemplates(params)` - 获取模板列表
- `createNotificationTemplate(data)` - 创建模板
- `updateNotificationTemplate(id, data)` - 更新模板
- `deleteNotificationTemplate(id)` - 删除模板

### 通知规则相关
- `getNotificationRules(params)` - 获取规则列表
- `createNotificationRule(data)` - 创建规则
- `updateNotificationRule(id, data)` - 更新规则
- `deleteNotificationRule(id)` - 删除规则
- `toggleNotificationRuleStatus(id, enabled)` - 切换规则状态

### 通知历史相关
- `getNotificationHistory(params)` - 获取历史记录
- `resendNotification(id)` - 重发通知
- `exportNotificationHistory(params)` - 导出历史记录

## 使用说明

### 1. 配置通知渠道

在"通知类型"标签页中：
1. 启用需要的通知渠道（邮件/短信/系统）
2. 配置相应的服务器参数
3. 点击"测试配置"验证设置是否正确

### 2. 创建通知模板

在"通知模板"标签页中：
1. 点击"新建模板"按钮
2. 选择模板类型（邮件/短信/系统）
3. 填写模板内容，支持使用变量
4. 保存模板

### 3. 设置通知规则

在"通知规则"标签页中：
1. 点击"新建规则"按钮
2. 配置触发条件和通知渠道
3. 选择接收人
4. 设置规则优先级和重试次数
5. 启用规则

### 4. 查看通知历史

在"通知历史"标签页中：
1. 使用筛选条件查找特定通知
2. 查看通知发送统计
3. 点击"详情"查看完整通知内容
4. 对失败的通知进行重发操作

## 模板变量

系统支持以下模板变量：

- `{{userName}}` - 用户姓名
- `{{projectName}}` - 项目名称
- `{{caseName}}` - 用例名称
- `{{status}}` - 状态信息
- `{{time}}` - 时间信息

## 注意事项

1. **权限控制**: 确保用户有相应的权限访问通知设置功能
2. **数据验证**: 所有输入数据都会进行前端验证
3. **错误处理**: 网络请求失败时会显示友好的错误提示
4. **性能优化**: 大量数据时使用分页加载，避免页面卡顿
5. **响应式设计**: 支持不同屏幕尺寸的适配
