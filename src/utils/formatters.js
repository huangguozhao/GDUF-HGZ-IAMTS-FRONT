/**
 * 统一格式化工具函数
 */

// 截断文本
export const truncateText = (text, maxLength) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// 格式化测试数据
export const formatTestData = (preConditions) => {
  if (!preConditions) return '📋 无测试数据'
  if (typeof preConditions === 'string') {
    try {
      preConditions = JSON.parse(preConditions)
    } catch (e) {
      return `📝 ${preConditions}`
    }
  }
  if (typeof preConditions === 'object' && preConditions !== null) {
    const pairs = []
    for (const [key, value] of Object.entries(preConditions)) {
      const displayKey = key.charAt(0).toUpperCase() + key.slice(1)
      const displayValue = value === '' ? '(空)' : value
      pairs.push(`${displayKey}: ${displayValue}`)
    }
    return pairs.length > 0 ? `📊 ${pairs.join(' | ')}` : '📋 无测试数据'
  }
  return `📝 ${String(preConditions)}`
}

// 格式化测试数据（完整显示）
export const formatTestDataFull = (preConditions) => {
  if (!preConditions) return '暂无测试数据'
  if (typeof preConditions === 'string') {
    try {
      const parsed = JSON.parse(preConditions)
      return JSON.stringify(parsed, null, 2)
    } catch (e) {
      return preConditions
    }
  }
  if (typeof preConditions === 'object' && preConditions !== null) {
    return JSON.stringify(preConditions, null, 2)
  }
  return String(preConditions)
}

// 格式化预期结果
export const formatExpectedResult = (expectedResponseBody) => {
  if (!expectedResponseBody) return '📋 无预期结果'
  if (typeof expectedResponseBody === 'string') {
    try {
      const parsed = JSON.parse(expectedResponseBody)
      if (parsed.code !== undefined && parsed.msg) {
        const icon = parsed.code === 1 ? '✅' : parsed.code === -1 ? '❌' : '⚠️'
        return `${icon} code: ${parsed.code} | msg: ${parsed.msg}`
      }
      if (parsed.data !== undefined && parsed.data !== null) {
        return `✓ 包含数据: ${typeof parsed.data === 'object' ? 'Object' : parsed.data}`
      }
      return `📄 ${JSON.stringify(parsed)}`
    } catch (e) {
      return `📝 ${expectedResponseBody}`
    }
  }
  if (typeof expectedResponseBody === 'object' && expectedResponseBody !== null) {
    if (expectedResponseBody.code !== undefined && expectedResponseBody.msg) {
      const icon = expectedResponseBody.code === 1 ? '✅' : expectedResponseBody.code === -1 ? '❌' : '⚠️'
      return `${icon} code: ${expectedResponseBody.code} | msg: ${expectedResponseBody.msg}`
    }
    return `📄 ${JSON.stringify(expectedResponseBody)}`
  }
  return `📝 ${String(expectedResponseBody)}`
}

// 格式化预期结果（完整显示）
export const formatExpectedResultFull = (expectedResponseBody) => {
  if (!expectedResponseBody) return '暂无预期结果'
  if (typeof expectedResponseBody === 'string') {
    try {
      const parsed = JSON.parse(expectedResponseBody)
      return JSON.stringify(parsed, null, 2)
    } catch (e) {
      return expectedResponseBody
    }
  }
  if (typeof expectedResponseBody === 'object' && expectedResponseBody !== null) {
    return JSON.stringify(expectedResponseBody, null, 2)
  }
  return String(expectedResponseBody)
}

// 格式化持续时间
export const formatDuration = (seconds) => {
  if (!seconds && seconds !== 0) return '-'
  if (seconds < 1) return `${Math.round(seconds * 1000)}ms`
  if (seconds < 60) return `${seconds.toFixed(1)}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}分${remainingSeconds}秒`
}

// 格式化时间 - 基本版本（日期时间，不包含秒）
export const formatTime = (time) => {
  if (!time) return '-'
  if (typeof time === 'string' && time.includes('T')) {
    const date = new Date(time)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(/\//g, '-')
  }
  return time
}

// 格式化时间 - 带秒数版本
export const formatTimeWithSeconds = (timeStr) => {
  if (!timeStr) return '-'
  try {
    const date = new Date(timeStr)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  } catch (error) {
    return timeStr
  }
}

// 格式化时间 - 仅时间部分
export const formatTimeOnly = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleTimeString('zh-CN', { hour12: false })
}

// 格式化时间 - 完整日期时间
export const formatDateTime = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

// 格式化时间 - 灵活版本（支持full参数）
export const formatTimeFull = (timestamp, full = false) => {
  if (!timestamp) return '未知时间'
  const date = new Date(timestamp)
  if (full) {
    return date.toLocaleString('zh-CN')
  }
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 截断消息（用于集成日志）
export const truncateMessage = (message, maxLength) => {
  if (!message || message.length <= maxLength) return message
  return message.substring(0, maxLength) + '...'
}

export default {
  truncateText,
  formatTestData,
  formatTestDataFull,
  formatExpectedResult,
  formatExpectedResultFull,
  formatDuration,
  formatTime,
  formatTimeWithSeconds,
  formatTimeOnly,
  formatDateTime,
  formatTimeFull,
  truncateMessage
}
