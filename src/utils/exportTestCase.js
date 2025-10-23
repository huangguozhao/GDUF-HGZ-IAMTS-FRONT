/**
 * 测试用例导出工具类
 * 提供前端本地导出功能（当后端接口未实现时使用）
 */

import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

/**
 * 导出为Excel格式
 * @param {Object} testCase - 测试用例数据
 * @param {Object} options - 导出选项
 */
export function exportToExcel(testCase, options = {}) {
  const {
    includeSteps = true,
    includeAssertions = true,
    includeExtractors = true,
    includeHistory = false,
    fileName = null
  } = options

  // 准备工作表数据
  const worksheets = {}

  // 1. 基本信息工作表
  const basicInfo = prepareBasicInfo(testCase)
  worksheets['基本信息'] = XLSX.utils.json_to_sheet(basicInfo)

  // 2. 测试步骤工作表
  if (includeSteps && testCase.testSteps?.length > 0) {
    const steps = prepareTestSteps(testCase.testSteps)
    worksheets['测试步骤'] = XLSX.utils.json_to_sheet(steps)
  }

  // 3. 断言规则工作表
  if (includeAssertions && testCase.assertions?.length > 0) {
    const assertions = prepareAssertions(testCase.assertions)
    worksheets['断言规则'] = XLSX.utils.json_to_sheet(assertions)
  }

  // 4. 提取规则工作表
  if (includeExtractors && testCase.extractors?.length > 0) {
    const extractors = prepareExtractors(testCase.extractors)
    worksheets['提取规则'] = XLSX.utils.json_to_sheet(extractors)
  }

  // 5. 执行历史工作表（如果需要）
  if (includeHistory && testCase.executionHistory?.length > 0) {
    const history = prepareExecutionHistory(testCase.executionHistory)
    worksheets['执行历史'] = XLSX.utils.json_to_sheet(history)
  }

  // 创建工作簿
  const workbook = XLSX.utils.book_new()
  Object.keys(worksheets).forEach(sheetName => {
    XLSX.utils.book_append_sheet(workbook, worksheets[sheetName], sheetName)
  })

  // 生成文件名
  const defaultFileName = `${testCase.caseCode || 'testcase'}_${getCurrentTimestamp()}.xlsx`
  const finalFileName = fileName || defaultFileName

  // 导出文件
  XLSX.writeFile(workbook, finalFileName)
  
  return {
    success: true,
    fileName: finalFileName,
    message: '导出成功'
  }
}

/**
 * 导出为JSON格式
 */
export function exportToJSON(testCase, options = {}) {
  const {
    includeSteps = true,
    includeAssertions = true,
    includeExtractors = true,
    includeHistory = false,
    fileName = null
  } = options

  // 构建导出数据
  const exportData = {
    // 基本信息
    caseCode: testCase.caseCode || testCase.case_code,
    caseName: testCase.name,
    description: testCase.description,
    priority: testCase.priority,
    severity: testCase.severity,
    tags: testCase.tags || [],
    version: testCase.version,
    isEnabled: testCase.isEnabled || testCase.is_enabled,
    
    // 关联信息
    apiId: testCase.apiId || testCase.api_id,
    apiName: testCase.apiName || testCase.api_name,
    apiPath: testCase.apiPath || testCase.api_path,
    apiMethod: testCase.apiMethod || testCase.api_method,
    
    // 创建信息
    creatorName: testCase.creatorInfo?.name || testCase.creator_name,
    createdAt: testCase.createdAt || testCase.created_time,
    updatedAt: testCase.updatedAt || testCase.updated_time
  }

  // 前置条件
  if (testCase.preConditions) {
    exportData.preConditions = testCase.preConditions
  }

  // 请求参数覆盖
  if (testCase.requestOverride) {
    exportData.requestOverride = testCase.requestOverride
  }

  // 预期响应
  exportData.expectedResponse = {
    httpStatus: testCase.expectedHttpStatus || testCase.expected_http_status || 200,
    responseBody: testCase.expectedResponseBody || testCase.expected_response_body,
    responseSchema: testCase.expectedResponseSchema || testCase.expected_response_schema
  }

  // 测试步骤
  if (includeSteps && testCase.testSteps?.length > 0) {
    exportData.testSteps = testCase.testSteps.map(step => ({
      operation: step.operation,
      expected: step.expected,
      actual: step.actual
    }))
  }

  // 断言规则
  if (includeAssertions && testCase.assertions?.length > 0) {
    exportData.assertions = testCase.assertions.map(assertion => ({
      type: assertion.type,
      path: assertion.path,
      expression: assertion.expression,
      expected: assertion.expected
    }))
  }

  // 提取规则
  if (includeExtractors && testCase.extractors?.length > 0) {
    exportData.extractors = testCase.extractors.map(extractor => ({
      name: extractor.name,
      expression: extractor.expression,
      description: extractor.description
    }))
  }

  // 执行历史
  if (includeHistory && testCase.executionHistory?.length > 0) {
    exportData.executionHistory = testCase.executionHistory.map(record => ({
      executionId: record.executionId || record.execution_id,
      status: record.status,
      startTime: record.startTime || record.start_time,
      endTime: record.endTime || record.end_time,
      duration: record.duration,
      executor: record.executor,
      environment: record.environment
    }))
  }

  // 生成JSON字符串
  const jsonString = JSON.stringify(exportData, null, 2)

  // 生成文件名
  const defaultFileName = `${testCase.caseCode || 'testcase'}_${getCurrentTimestamp()}.json`
  const finalFileName = fileName || defaultFileName

  // 创建Blob并下载
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' })
  saveAs(blob, finalFileName)

  return {
    success: true,
    fileName: finalFileName,
    message: '导出成功'
  }
}

/**
 * 导出为YAML格式
 */
export function exportToYAML(testCase, options = {}) {
  const {
    includeSteps = true,
    includeAssertions = true,
    includeExtractors = true,
    includeHistory = false,
    fileName = null
  } = options

  // 构建YAML内容
  let yamlContent = `# 测试用例导出
# 导出时间: ${new Date().toLocaleString('zh-CN')}

# ==================== 基本信息 ====================
caseCode: ${testCase.caseCode || testCase.case_code || ''}
caseName: ${testCase.name || ''}
description: |
  ${testCase.description || ''}
priority: ${testCase.priority || 'P2'}
severity: ${testCase.severity || 'medium'}
version: ${testCase.version || '1.0'}
isEnabled: ${testCase.isEnabled || testCase.is_enabled || true}
tags:
${(testCase.tags || []).map(tag => `  - ${tag}`).join('\n')}

# ==================== 关联信息 ====================
api:
  id: ${testCase.apiId || testCase.api_id || ''}
  name: ${testCase.apiName || testCase.api_name || ''}
  path: ${testCase.apiPath || testCase.api_path || ''}
  method: ${testCase.apiMethod || testCase.api_method || ''}

# ==================== 创建信息 ====================
creator: ${testCase.creatorInfo?.name || testCase.creator_name || ''}
createdAt: ${testCase.createdAt || testCase.created_time || ''}
updatedAt: ${testCase.updatedAt || testCase.updated_time || ''}
`

  // 前置条件
  if (testCase.preConditions) {
    yamlContent += `\n# ==================== 前置条件 ====================\n`
    yamlContent += `preConditions:\n${formatObjectToYAML(testCase.preConditions, 2)}\n`
  }

  // 请求参数覆盖
  if (testCase.requestOverride) {
    yamlContent += `\n# ==================== 请求参数 ====================\n`
    yamlContent += `requestOverride:\n${formatObjectToYAML(testCase.requestOverride, 2)}\n`
  }

  // 预期响应
  yamlContent += `\n# ==================== 预期响应 ====================\n`
  yamlContent += `expectedResponse:\n`
  yamlContent += `  httpStatus: ${testCase.expectedHttpStatus || testCase.expected_http_status || 200}\n`
  if (testCase.expectedResponseBody) {
    yamlContent += `  responseBody:\n${formatObjectToYAML(testCase.expectedResponseBody, 4)}\n`
  }

  // 测试步骤
  if (includeSteps && testCase.testSteps?.length > 0) {
    yamlContent += `\n# ==================== 测试步骤 ====================\n`
    yamlContent += `testSteps:\n`
    testCase.testSteps.forEach((step, index) => {
      yamlContent += `  - step: ${index + 1}\n`
      yamlContent += `    operation: ${step.operation || ''}\n`
      yamlContent += `    expected: ${step.expected || ''}\n`
    })
  }

  // 断言规则
  if (includeAssertions && testCase.assertions?.length > 0) {
    yamlContent += `\n# ==================== 断言规则 ====================\n`
    yamlContent += `assertions:\n`
    testCase.assertions.forEach((assertion, index) => {
      yamlContent += `  - type: ${assertion.type}\n`
      if (assertion.path) yamlContent += `    path: ${assertion.path}\n`
      if (assertion.expression) yamlContent += `    expression: ${assertion.expression}\n`
      if (assertion.expected !== undefined) yamlContent += `    expected: ${assertion.expected}\n`
    })
  }

  // 提取规则
  if (includeExtractors && testCase.extractors?.length > 0) {
    yamlContent += `\n# ==================== 提取规则 ====================\n`
    yamlContent += `extractors:\n`
    testCase.extractors.forEach(extractor => {
      yamlContent += `  - name: ${extractor.name}\n`
      yamlContent += `    expression: ${extractor.expression}\n`
      if (extractor.description) yamlContent += `    description: ${extractor.description}\n`
    })
  }

  // 生成文件名
  const defaultFileName = `${testCase.caseCode || 'testcase'}_${getCurrentTimestamp()}.yaml`
  const finalFileName = fileName || defaultFileName

  // 创建Blob并下载
  const blob = new Blob([yamlContent], { type: 'text/yaml;charset=utf-8' })
  saveAs(blob, finalFileName)

  return {
    success: true,
    fileName: finalFileName,
    message: '导出成功'
  }
}

/**
 * 导出为CSV格式
 */
export function exportToCSV(testCase, options = {}) {
  const {
    encoding = 'utf-8',
    fileName = null
  } = options

  // CSV只包含基本信息
  const rows = [
    ['字段', '值'],
    ['用例编码', testCase.caseCode || testCase.case_code || ''],
    ['用例名称', testCase.name || ''],
    ['用例描述', testCase.description || ''],
    ['优先级', testCase.priority || ''],
    ['严重程度', testCase.severity || ''],
    ['标签', (testCase.tags || []).join(', ')],
    ['版本', testCase.version || ''],
    ['启用状态', testCase.isEnabled || testCase.is_enabled ? '是' : '否'],
    ['接口名称', testCase.apiName || testCase.api_name || ''],
    ['接口路径', testCase.apiPath || testCase.api_path || ''],
    ['接口方法', testCase.apiMethod || testCase.api_method || ''],
    ['预期状态码', testCase.expectedHttpStatus || testCase.expected_http_status || ''],
    ['创建人', testCase.creatorInfo?.name || testCase.creator_name || ''],
    ['创建时间', testCase.createdAt || testCase.created_time || ''],
    ['更新时间', testCase.updatedAt || testCase.updated_time || '']
  ]

  // 转换为CSV字符串
  const csvContent = rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')

  // 处理编码
  let blob
  if (encoding === 'gbk') {
    // GBK编码（中文Excel兼容）
    const uint8Array = new TextEncoder().encode(csvContent)
    blob = new Blob(['\uFEFF', uint8Array], { type: 'text/csv;charset=gbk' })
  } else {
    // UTF-8编码
    blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8' })
  }

  // 生成文件名
  const defaultFileName = `${testCase.caseCode || 'testcase'}_${getCurrentTimestamp()}.csv`
  const finalFileName = fileName || defaultFileName

  // 下载文件
  saveAs(blob, finalFileName)

  return {
    success: true,
    fileName: finalFileName,
    message: '导出成功'
  }
}

// ==================== 辅助函数 ====================

/**
 * 准备基本信息数据
 */
function prepareBasicInfo(testCase) {
  return [
    { 字段: '用例编码', 值: testCase.caseCode || testCase.case_code || '' },
    { 字段: '用例名称', 值: testCase.name || '' },
    { 字段: '用例描述', 值: testCase.description || '' },
    { 字段: '优先级', 值: testCase.priority || '' },
    { 字段: '严重程度', 值: testCase.severity || '' },
    { 字段: '标签', 值: (testCase.tags || []).join(', ') },
    { 字段: '版本', 值: testCase.version || '' },
    { 字段: '启用状态', 值: testCase.isEnabled || testCase.is_enabled ? '是' : '否' },
    { 字段: '接口ID', 值: testCase.apiId || testCase.api_id || '' },
    { 字段: '接口名称', 值: testCase.apiName || testCase.api_name || '' },
    { 字段: '接口路径', 值: testCase.apiPath || testCase.api_path || '' },
    { 字段: '接口方法', 值: testCase.apiMethod || testCase.api_method || '' },
    { 字段: '预期状态码', 值: testCase.expectedHttpStatus || testCase.expected_http_status || '' },
    { 字段: '创建人', 值: testCase.creatorInfo?.name || testCase.creator_name || '' },
    { 字段: '创建时间', 值: testCase.createdAt || testCase.created_time || '' },
    { 字段: '更新时间', 值: testCase.updatedAt || testCase.updated_time || '' }
  ]
}

/**
 * 准备测试步骤数据
 */
function prepareTestSteps(testSteps) {
  return testSteps.map((step, index) => ({
    步骤序号: index + 1,
    操作步骤: step.operation || '',
    预期结果: step.expected || '',
    实际结果: step.actual || ''
  }))
}

/**
 * 准备断言规则数据
 */
function prepareAssertions(assertions) {
  return assertions.map((assertion, index) => ({
    序号: index + 1,
    断言类型: assertion.type || '',
    JSON路径: assertion.path || '',
    表达式: assertion.expression || '',
    预期值: assertion.expected || ''
  }))
}

/**
 * 准备提取规则数据
 */
function prepareExtractors(extractors) {
  return extractors.map((extractor, index) => ({
    序号: index + 1,
    变量名: extractor.name || '',
    表达式: extractor.expression || '',
    描述: extractor.description || ''
  }))
}

/**
 * 准备执行历史数据
 */
function prepareExecutionHistory(history) {
  return history.map((record, index) => ({
    序号: index + 1,
    执行ID: record.executionId || record.execution_id || '',
    执行状态: record.status || '',
    开始时间: record.startTime || record.start_time || '',
    结束时间: record.endTime || record.end_time || '',
    执行耗时: record.duration ? `${record.duration}ms` : '',
    执行人: record.executor || '',
    执行环境: record.environment || ''
  }))
}

/**
 * 格式化对象为YAML
 */
function formatObjectToYAML(obj, indent = 0) {
  const spaces = ' '.repeat(indent)
  let result = ''
  
  if (typeof obj === 'object' && obj !== null) {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null) {
        result += `${spaces}${key}:\n${formatObjectToYAML(value, indent + 2)}`
      } else {
        result += `${spaces}${key}: ${value}\n`
      }
    }
  } else {
    result = `${spaces}${obj}\n`
  }
  
  return result
}

/**
 * 获取当前时间戳字符串
 */
function getCurrentTimestamp() {
  return new Date().toISOString().slice(0, 19).replace(/:/g, '-').replace('T', '_')
}

/**
 * 主导出函数
 * @param {Object} testCase - 测试用例数据
 * @param {String} format - 导出格式
 * @param {Object} options - 导出选项
 */
export function exportTestCaseLocal(testCase, format = 'excel', options = {}) {
  try {
    switch (format) {
      case 'excel':
        return exportToExcel(testCase, options)
      case 'json':
        return exportToJSON(testCase, options)
      case 'yaml':
        return exportToYAML(testCase, options)
      case 'csv':
        return exportToCSV(testCase, options)
      default:
        throw new Error(`不支持的导出格式: ${format}`)
    }
  } catch (error) {
    console.error('导出失败:', error)
    return {
      success: false,
      message: error.message || '导出失败'
    }
  }
}

