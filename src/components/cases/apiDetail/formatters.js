export const truncateText = (text, maxLength) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export const formatTestData = (row) => {
  // 支持多种字段名格式
  const preConditions = row?.preConditions ?? row?.pre_conditions ?? row?.testData ?? null
  // 修复：空对象 {} 也要显示，而不是显示"无测试数据"
  if (preConditions === null || preConditions === undefined || preConditions === '') return '📋 无测试数据'
  if (typeof preConditions === 'string') {
    try {
      const parsed = JSON.parse(preConditions)
      if (typeof parsed === 'object' && parsed !== null && Object.keys(parsed).length > 0) {
        const pairs = []
        for (const [key, value] of Object.entries(parsed)) {
          const displayKey = key.charAt(0).toUpperCase() + key.slice(1)
          const displayValue = value === '' ? '(空)' : (typeof value === 'object' ? JSON.stringify(value) : value)
          pairs.push(`${displayKey}: ${displayValue}`)
        }
        return pairs.length > 0 ? `📊 ${pairs.join(' | ')}` : '📋 无测试数据'
      }
      // 字符串解析后是空对象，也返回无测试数据
      if (typeof parsed === 'object' && parsed !== null && Object.keys(parsed).length === 0) {
        return '📋 无测试数据'
      }
      return `📝 ${preConditions}`
    } catch (e) {
      return `📝 ${preConditions}`
    }
  }
  if (typeof preConditions === 'object' && preConditions !== null) {
    // 空对象判断
    if (Object.keys(preConditions).length === 0) {
      return '📋 无测试数据'
    }
    const pairs = []
    for (const [key, value] of Object.entries(preConditions)) {
      const displayKey = key.charAt(0).toUpperCase() + key.slice(1)
      const displayValue = value === '' ? '(空)' : (typeof value === 'object' ? JSON.stringify(value) : value)
      pairs.push(`${displayKey}: ${displayValue}`)
    }
    return pairs.length > 0 ? `📊 ${pairs.join(' | ')}` : '📋 无测试数据'
  }
  return `📝 ${String(preConditions)}`
}

export const formatTestDataFull = (row) => {
  // 支持多种字段名格式
  const preConditions = row?.preConditions ?? row?.pre_conditions ?? row?.testData ?? null
  // 空对象也要返回"暂无测试数据"
  if (preConditions === null || preConditions === undefined || preConditions === '') return '暂无测试数据'
  if (typeof preConditions === 'string') {
    try {
      const parsed = JSON.parse(preConditions)
      // 空对象判断
      if (typeof parsed === 'object' && parsed !== null && Object.keys(parsed).length === 0) {
        return '暂无测试数据'
      }
      return JSON.stringify(parsed, null, 2)
    } catch (e) {
      return preConditions
    }
  }
  if (typeof preConditions === 'object' && preConditions !== null) {
    // 空对象判断
    if (Object.keys(preConditions).length === 0) {
      return '暂无测试数据'
    }
    return JSON.stringify(preConditions, null, 2)
  }
  return String(preConditions)
}

export const formatExpectedResult = (row) => {
  // 支持多种字段名格式
  const expectedResponseBody = row?.expectedResponseBody ?? row?.expected_response_body ?? row?.expectedResult ?? null
  // 修复：空字符串也要显示"无预期结果"
  if (!expectedResponseBody && expectedResponseBody !== 0) return '📋 无预期结果'
  if (typeof expectedResponseBody === 'string') {
    // 空字符串判断
    if (expectedResponseBody.trim() === '') return '📋 无预期结果'
    try {
      const parsed = JSON.parse(expectedResponseBody)
      if (parsed.code !== undefined && parsed.msg) {
        const icon = parsed.code === 1 ? '✅' : parsed.code === -1 ? '❌' : '⚠️'
        return `${icon} code: ${parsed.code} | msg: ${parsed.msg}`
      }
      if (parsed.data !== undefined && parsed.data !== null) {
        return `✓ 包含数据: ${typeof parsed.data === 'object' ? 'Object' : parsed.data}`
      }
      if (typeof parsed === 'object') {
        const pairs = []
        for (const [key, value] of Object.entries(parsed)) {
          if (key !== 'code' && key !== 'msg' && key !== 'data') {
            pairs.push(`${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`)
          }
        }
        return pairs.length > 0 ? `📊 ${pairs.join(' | ')}` : `📄 ${JSON.stringify(parsed)}`
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

export const formatExpectedResultFull = (row) => {
  // 支持多种字段名格式
  const expectedResponseBody = row?.expectedResponseBody ?? row?.expected_response_body ?? row?.expectedResult ?? null
  // 修复：空字符串也要返回"暂无预期结果"
  if (expectedResponseBody === null || expectedResponseBody === undefined) return '暂无预期结果'
  if (typeof expectedResponseBody === 'string' && expectedResponseBody.trim() === '') return '暂无预期结果'
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


