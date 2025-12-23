export const truncateText = (text, maxLength) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

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

export const formatDuration = (seconds) => {
  if (!seconds && seconds !== 0) return '-'
  if (seconds < 1) return `${Math.round(seconds * 1000)}ms`
  if (seconds < 60) return `${seconds.toFixed(1)}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}分${remainingSeconds}秒`
}

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

export default {
  truncateText,
  formatTestData,
  formatTestDataFull,
  formatExpectedResult,
  formatExpectedResultFull,
  formatDuration,
  formatTime
}


