/**
 * 缓存失效管理工具
 * 处理缓存版本控制和强制更新机制
 */

import { CACHE_STRATEGIES } from './cacheConfig.js'

// 版本管理
let currentVersion = Date.now().toString()
const VERSION_KEY = 'app_cache_version'

/**
 * 获取当前应用版本
 * @returns {string} 版本号
 */
export function getCurrentVersion() {
  // 尝试从localStorage获取版本
  if (typeof window !== 'undefined') {
    const storedVersion = localStorage.getItem(VERSION_KEY)
    if (storedVersion) {
      currentVersion = storedVersion
    }
  }
  return currentVersion
}

/**
 * 更新应用版本（强制缓存失效）
 * @param {string} newVersion - 新版本号，不提供则自动生成
 */
export function updateVersion(newVersion = null) {
  currentVersion = newVersion || Date.now().toString()

  if (typeof window !== 'undefined') {
    localStorage.setItem(VERSION_KEY, currentVersion)
  }

  // 触发版本更新事件
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cacheVersionUpdate', {
      detail: { version: currentVersion }
    }))
  }
}

/**
 * 检查版本是否需要更新
 * @param {string} serverVersion - 服务器版本
 * @returns {boolean} 是否需要更新
 */
export function needsVersionUpdate(serverVersion) {
  return getCurrentVersion() !== serverVersion
}

/**
 * 清除所有缓存（Service Worker缓存、localStorage等）
 */
export function clearAllCache() {
  return Promise.all([
    // 清除localStorage版本信息
    clearVersionCache(),
    // 清除Service Worker缓存（如果存在）
    clearServiceWorkerCache(),
    // 清除其他应用缓存
    clearApplicationCache()
  ])
}

/**
 * 清除版本缓存
 */
export function clearVersionCache() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(VERSION_KEY)
    currentVersion = Date.now().toString()
  }
}

/**
 * 清除Service Worker缓存
 */
export function clearServiceWorkerCache() {
  if ('serviceWorker' in navigator && 'caches' in window) {
    return caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          return caches.delete(cacheName)
        })
      )
    })
  }
  return Promise.resolve()
}

/**
 * 清除应用特定缓存
 */
export function clearApplicationCache() {
  // 清除localStorage中的应用数据（除了版本信息）
  if (typeof window !== 'undefined') {
    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('app_') && key !== VERSION_KEY) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key))
  }

  // 清除sessionStorage
  if (typeof window !== 'undefined' && window.sessionStorage) {
    sessionStorage.clear()
  }
}

/**
 * 强制刷新页面（清除缓存后）
 */
export function forceRefresh() {
  // 先清除缓存
  clearAllCache().then(() => {
    // 使用hard refresh清除浏览器缓存
    if (typeof window !== 'undefined') {
      window.location.reload(true)
    }
  })
}

/**
 * 检查资源是否需要重新加载
 * @param {string} resourceUrl - 资源URL
 * @param {string} lastModified - 最后修改时间
 * @returns {boolean} 是否需要重新加载
 */
export function shouldReloadResource(resourceUrl, lastModified) {
  if (typeof window === 'undefined') return false

  const cacheKey = `resource_${btoa(resourceUrl)}`
  const cachedModified = localStorage.getItem(cacheKey)

  if (!cachedModified || cachedModified !== lastModified) {
    localStorage.setItem(cacheKey, lastModified)
    return true
  }

  return false
}

/**
 * 为URL添加版本参数
 * @param {string} url - 原始URL
 * @param {boolean} force - 是否强制添加版本参数
 * @returns {string} 带版本参数的URL
 */
export function addVersionParameter(url, force = false) {
  if (!url || typeof url !== 'string') return url

  // 只为静态资源添加版本参数
  const isStaticResource = /\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/.test(url)

  if (!isStaticResource && !force) return url

  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}v=${getCurrentVersion()}`
}

/**
 * 创建缓存失效的HTML meta标签
 * @returns {string} HTML meta标签字符串
 */
export function createCacheMetaTags() {
  const version = getCurrentVersion()
  return `
    <!-- 缓存控制 -->
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    <!-- 应用版本 -->
    <meta name="app-version" content="${version}">
  `
}

/**
 * 监听版本更新事件
 * @param {function} callback - 版本更新回调函数
 */
export function onVersionUpdate(callback) {
  if (typeof window !== 'undefined') {
    window.addEventListener('cacheVersionUpdate', (event) => {
      callback(event.detail.version)
    })
  }
}

/**
 * 获取缓存状态信息（用于调试）
 * @returns {object} 缓存状态信息
 */
export function getCacheStatus() {
  const status = {
    version: getCurrentVersion(),
    hasServiceWorker: false,
    cacheStorage: false,
    localStorage: false
  }

  if (typeof window !== 'undefined') {
    status.hasServiceWorker = 'serviceWorker' in navigator
    status.cacheStorage = 'caches' in window
    status.localStorage = !!window.localStorage

    // 检查Service Worker缓存
    if (status.cacheStorage) {
      caches.keys().then(names => {
        status.cacheNames = names
      }).catch(() => {
        status.cacheNames = []
      })
    }
  }

  return status
}

/**
 * 预加载关键资源
 * @param {Array<string>} resources - 要预加载的资源URL数组
 */
export function preloadResources(resources) {
  if (typeof window === 'undefined' || !Array.isArray(resources)) return

  resources.forEach(url => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = addVersionParameter(url)
    link.as = getResourceType(url)
    document.head.appendChild(link)
  })
}

/**
 * 获取资源类型（用于preload的as属性）
 * @param {string} url - 资源URL
 * @returns {string} 资源类型
 */
function getResourceType(url) {
  if (/\.js$/.test(url)) return 'script'
  if (/\.css$/.test(url)) return 'style'
  if (/\.(png|jpg|jpeg|gif|ico|svg)$/.test(url)) return 'image'
  if (/\.(woff|woff2|ttf|eot)$/.test(url)) return 'font'
  return 'fetch'
}
