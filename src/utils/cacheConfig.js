/**
 * HTTP缓存配置工具
 * 提供不同类型资源的缓存策略配置
 */

// 缓存策略常量
export const CACHE_STRATEGIES = {
  // HTML文件：不缓存
  HTML: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  },

  // JavaScript文件：长期缓存（1年）
  JAVASCRIPT: {
    'Cache-Control': 'public, max-age=31536000, immutable',
    'Expires': 'Thu, 31 Dec 2037 23:55:55 GMT'
  },

  // CSS文件：长期缓存（1年）
  CSS: {
    'Cache-Control': 'public, max-age=31536000, immutable',
    'Expires': 'Thu, 31 Dec 2037 23:55:55 GMT'
  },

  // 图片文件：中期缓存（1个月）
  IMAGES: {
    'Cache-Control': 'public, max-age=2592000',
    'Expires': 'Thu, 31 Dec 2037 23:55:55 GMT'
  },

  // 字体文件：长期缓存（1年）
  FONTS: {
    'Cache-Control': 'public, max-age=31536000, immutable',
    'Expires': 'Thu, 31 Dec 2037 23:55:55 GMT'
  },

  // API请求：不缓存
  API: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  },

  // 开发环境：短时间缓存
  DEVELOPMENT: {
    'Cache-Control': 'public, max-age=300', // 5分钟
    'Expires': 'Thu, 01 Jan 1970 00:05:00 GMT'
  }
}

/**
 * 根据文件路径获取相应的缓存策略
 * @param {string} url - 请求的URL路径
 * @param {boolean} isProduction - 是否为生产环境
 * @returns {object} 缓存头配置对象
 */
export function getCacheStrategy(url, isProduction = false) {
  if (!url) return CACHE_STRATEGIES.HTML

  // API请求
  if (url.startsWith('/api/')) {
    return CACHE_STRATEGIES.API
  }

  // HTML文件
  if (url.endsWith('.html') || url === '/' || url === '') {
    return CACHE_STRATEGIES.HTML
  }

  // JavaScript文件
  if (url.endsWith('.js')) {
    return isProduction ? CACHE_STRATEGIES.JAVASCRIPT : CACHE_STRATEGIES.DEVELOPMENT
  }

  // CSS文件
  if (url.endsWith('.css')) {
    return isProduction ? CACHE_STRATEGIES.CSS : CACHE_STRATEGIES.DEVELOPMENT
  }

  // 图片文件
  if (/\.(png|jpg|jpeg|gif|ico|svg|webp)$/i.test(url)) {
    return CACHE_STRATEGIES.IMAGES
  }

  // 字体文件
  if (/\.(woff|woff2|ttf|eot)$/i.test(url)) {
    return CACHE_STRATEGIES.FONTS
  }

  // 其他静态资源
  return CACHE_STRATEGIES.HTML
}

/**
 * 为响应对象设置缓存头
 * @param {object} res - Express响应对象
 * @param {object} cacheHeaders - 缓存头配置对象
 */
export function setCacheHeaders(res, cacheHeaders) {
  Object.entries(cacheHeaders).forEach(([key, value]) => {
    res.setHeader(key, value)
  })
}

/**
 * 获取缓存策略的描述信息
 * @param {string} strategyType - 策略类型
 * @returns {string} 策略描述
 */
export function getCacheStrategyDescription(strategyType) {
  const descriptions = {
    HTML: '不缓存 - 确保用户始终获取最新内容',
    JAVASCRIPT: '长期缓存(1年) - 利用文件名哈希进行版本控制',
    CSS: '长期缓存(1年) - 利用文件名哈希进行版本控制',
    IMAGES: '中期缓存(1个月) - 适用于不经常更新的图片资源',
    FONTS: '长期缓存(1年) - 字体文件通常稳定不变',
    API: '不缓存 - API响应需要实时性',
    DEVELOPMENT: '短时间缓存(5分钟) - 开发环境优化'
  }

  return descriptions[strategyType] || '未知缓存策略'
}

/**
 * 检查缓存配置是否正确
 * @param {object} headers - HTTP响应头
 * @param {string} expectedStrategy - 期望的缓存策略
 * @returns {boolean} 配置是否正确
 */
export function validateCacheHeaders(headers, expectedStrategy) {
  const expected = CACHE_STRATEGIES[expectedStrategy]
  if (!expected) return false

  return Object.entries(expected).every(([key, value]) => {
    return headers[key] === value
  })
}
