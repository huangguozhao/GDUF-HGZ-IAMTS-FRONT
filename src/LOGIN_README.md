# 接口自动化管理平台 - 登录页面

## 功能特性

### 🎨 UI设计
- 完全按照提供的UI设计图实现
- 左侧信息面板展示平台特色功能
- 右侧登录表单，支持邮箱和密码登录
- 响应式设计，支持移动端适配

### 🔐 认证功能
- 用户登录/登出
- JWT Token认证
- 密码重置功能
- 记住我功能
- 路由守卫保护

### 🛠 技术实现
- Vue 3 + Composition API
- Element Plus UI组件库
- Pinia状态管理
- Vue Router路由管理
- 模拟API接口

## 项目结构

```
src/
├── api/
│   ├── auth.js              # 认证相关API接口
│   └── request.js           # 请求封装和模拟数据
├── components/
│   └── base/
│       └── index.js         # 基础UI组件
├── stores/
│   └── useUserStore.js      # 用户状态管理
├── views/
│   ├── Login.vue            # 登录页面
│   └── NotFound.vue         # 404页面
├── router/
│   └── index.js             # 路由配置和守卫
└── main.js                  # 应用入口
```

## 使用方法

### 1. 启动项目
```bash
npm run dev
```

### 2. 访问登录页面
打开浏览器访问：`http://localhost:5173/login`

### 3. 测试账号
系统提供了以下测试账号：

**管理员账号：**
- 邮箱：`admin@example.com`
- 密码：`123456`

**测试工程师账号：**
- 邮箱：`test@example.com`
- 密码：`123456`

### 4. 功能测试

#### 登录功能
1. 输入邮箱和密码
2. 点击"登录"按钮
3. 登录成功后自动跳转到首页

#### 记住我功能
1. 勾选"记住我"复选框
2. 登录成功后，下次访问登录页面会自动填充邮箱

#### 忘记密码功能
1. 点击"忘记密码?"链接
2. 在弹出的对话框中输入邮箱
3. 点击"发送重置邮件"按钮
4. 系统会显示发送成功提示

#### 密码重置功能
1. 使用邮箱 `admin@example.com` 或 `test@example.com`
2. 验证码使用：`123456`
3. 新密码长度至少8位

## API接口说明

### 认证接口

#### 用户登录
- **URL**: `/auth/login`
- **方法**: `POST`
- **参数**: 
  ```json
  {
    "email": "admin@example.com",
    "password": "123456"
  }
  ```

#### 获取当前用户信息
- **URL**: `/auth/me`
- **方法**: `GET`
- **Headers**: `Authorization: Bearer <token>`

#### 密码重置请求
- **URL**: `/auth/password/reset-request`
- **方法**: `POST`
- **参数**:
  ```json
  {
    "account": "admin@example.com",
    "channel": "email"
  }
  ```

#### 执行密码重置
- **URL**: `/auth/password/reset`
- **方法**: `POST`
- **参数**:
  ```json
  {
    "account": "admin@example.com",
    "verification_code": "123456",
    "new_password": "NewPassword123"
  }
  ```

## 开发规范

### 组件命名
- 使用PascalCase命名组件
- 基础组件以Base前缀开头
- 页面组件放在views目录

### 状态管理
- 使用Pinia进行状态管理
- Store文件以use开头
- 组合式API风格

### 路由管理
- 使用路由守卫进行权限控制
- 页面标题自动设置
- 支持路由重定向

### 样式规范
- 使用scoped样式
- 响应式设计
- BEM命名规范

## 注意事项

1. **模拟数据**: 当前使用模拟API，实际项目中需要连接真实后端
2. **密码安全**: 模拟环境中密码为明文，生产环境需要使用加密
3. **Token管理**: JWT Token存储在localStorage中，生产环境建议使用httpOnly Cookie
4. **错误处理**: 已实现基本的错误处理和用户提示
5. **响应式**: 支持桌面端和移动端适配

## 后续开发建议

1. **真实API集成**: 替换模拟API为真实后端接口
2. **安全增强**: 添加CSRF保护、XSS防护等安全措施
3. **用户体验**: 添加加载动画、骨架屏等优化
4. **国际化**: 支持多语言切换
5. **主题切换**: 支持明暗主题切换
6. **单点登录**: 集成SSO功能
7. **多因子认证**: 支持短信验证码、邮箱验证等

## 技术栈

- **前端框架**: Vue 3.3+
- **构建工具**: Vite
- **UI组件库**: Element Plus
- **状态管理**: Pinia
- **路由管理**: Vue Router
- **开发语言**: JavaScript
- **样式**: CSS3 + Element Plus样式
- **图标**: Element Plus Icons

## 浏览器支持

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## 许可证

本项目仅供学习和演示使用。
