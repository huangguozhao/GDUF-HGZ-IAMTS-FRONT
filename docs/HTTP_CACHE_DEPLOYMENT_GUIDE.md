# HTTP缓存部署指南

本文档说明了如何在生产环境中为静态资源配置适当的HTTP缓存头。

## 缓存策略概述

根据静态资源的类型和更新频率，我们采用以下缓存策略：

### 1. HTML文件 (`index.html`)
- **缓存策略**: 不缓存
- **原因**: HTML文件可能包含动态内容，需要确保用户始终获取最新版本
- **Cache-Control**: `no-cache, no-store, must-revalidate`

### 2. JavaScript和CSS文件
- **缓存策略**: 长期缓存（1年）
- **原因**: 这些文件具有哈希文件名，当内容变化时文件名会改变
- **Cache-Control**: `public, max-age=31536000, immutable`

### 3. 静态资源（图片、字体、favicon等）
- **缓存策略**: 中期缓存（1个月）
- **原因**: 这些资源更新不频繁，但可能需要偶尔更新
- **Cache-Control**: `public, max-age=2592000`

## 服务器配置示例

### Nginx配置

在nginx配置文件中添加以下location块：

```nginx
# HTML文件 - 不缓存
location ~* \.html$ {
    add_header Cache-Control "no-cache, no-store, must-revalidate";
    add_header Pragma "no-cache";
    add_header Expires "0";
    try_files $uri $uri/ /index.html;
}

# JS/CSS文件 - 长期缓存
location ~* \.(js|css)$ {
    add_header Cache-Control "public, max-age=31536000, immutable";
    add_header Expires "Thu, 31 Dec 2037 23:55:55 GMT";
}

# 静态资源 - 中期缓存
location ~* \.(png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    add_header Cache-Control "public, max-age=2592000";
    add_header Expires "Thu, 31 Dec 2037 23:55:55 GMT";
}

# API请求 - 不缓存
location /api/ {
    add_header Cache-Control "no-cache, no-store, must-revalidate";
    add_header Pragma "no-cache";
    add_header Expires "0";
    proxy_pass http://backend_server;
}
```

### Apache配置

在`.htaccess`文件中添加：

```apache
# HTML文件 - 不缓存
<Files "*.html">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
    Header set Pragma "no-cache"
    Header set Expires "0"
</Files>

# JS/CSS文件 - 长期缓存
<FilesMatch "\.(js|css)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
    Header set Expires "Thu, 31 Dec 2037 23:55:55 GMT"
</FilesMatch>

# 静态资源 - 中期缓存
<FilesMatch "\.(png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$">
    Header set Cache-Control "public, max-age=2592000"
    Header set Expires "Thu, 31 Dec 2037 23:55:55 GMT"
</FilesMatch>

# API请求 - 不缓存
<Location "/api/">
    Header set Cache-Control "no-cache, no-store, must-revalidate"
    Header set Pragma "no-cache"
    Header set Expires "0"
</Location>
```

## 验证缓存配置

### 使用浏览器开发者工具
1. 打开浏览器开发者工具 (F12)
2. 切换到"Network"标签页
3. 刷新页面
4. 检查静态资源的响应头中的`Cache-Control`字段

### 使用curl命令
```bash
# 检查JS文件缓存头
curl -I http://your-domain.com/assets/index-xxxxxxxx.js

# 检查CSS文件缓存头
curl -I http://your-domain.com/assets/index-xxxxxxxx.css

# 检查HTML文件缓存头
curl -I http://your-domain.com/index.html
```

## 缓存失效策略

当需要强制更新缓存时，可以采取以下措施：

### 1. 文件名哈希
- Vite已经为JS/CSS文件生成了哈希文件名
- 当文件内容变化时，新的构建会生成新的哈希，确保缓存失效

### 2. 版本号更新
- 在构建时添加版本号参数
- 例如：`script src="/assets/index.js?v=1.2.3"`

### 3. 手动缓存清理
- 修改服务器配置中的缓存时间
- 重启服务器（某些服务器可能需要）

## 注意事项

1. **开发环境**: 开发服务器配置为不缓存，确保开发时的实时更新
2. **CDN**: 如果使用CDN，需要在CDN配置中设置相应的缓存规则
3. **Service Worker**: 如果使用Service Worker，需要确保缓存策略与之兼容
4. **HTTPS**: 缓存头在HTTPS和HTTP下表现一致，但推荐使用HTTPS

## 性能影响

正确的缓存配置可以显著提升网站性能：
- **首次访问**: 用户下载所有静态资源
- **后续访问**: 静态资源从缓存加载，页面加载速度提升50-80%
- **带宽节省**: 减少服务器带宽消耗
- **用户体验**: 页面响应更快
