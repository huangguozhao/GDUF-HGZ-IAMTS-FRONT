import request from './request'

/**
 * AI诊断相关API接口
 */

/**
 * 执行AI诊断（测试失败诊断）
 * @param {Object} params - 诊断参数
 * @param {string} params.failureMessage - 失败消息
 * @param {string} params.failureType - 失败类型
 * @param {number} params.responseStatus - HTTP响应状态码
 * @param {string} params.responseBody - 响应体
 * @param {string} params.apiPath - API路径
 * @param {string} params.apiMethod - API方法
 * @param {string} params.caseName - 用例名称
 * @returns {Promise}
 */
export const diagnose = (params) => {
  return request({
    url: '/api/ai-diagnosis/execute',
    method: 'post',
    data: params,
    timeout: 30000
  })
}

/**
 * 获取诊断结果
 * @param {string} diagnosisId - 诊断ID
 * @returns {Promise}
 */
export const getDiagnosisResult = (diagnosisId) => {
  return request({
    url: `/api/ai-diagnosis/result/${diagnosisId}`,
    method: 'get',
    timeout: 5000
  })
}

/**
 * 测试失败诊断
 * @param {string} errorMessage - 错误信息
 * @param {string} errorLog - 错误日志(可选)
 * @param {string} description - 问题描述(可选)
 * @returns {Promise}
 */
export const diagnoseTestFailure = (errorMessage, errorLog, description) => {
  return request({
    url: '/ai-diagnosis/test-failure',
    method: 'post',
    params: {
      errorMessage,
      errorLog: errorLog || '',
      description: description || ''
    }
  })
}

/**
 * 性能问题诊断
 * @param {string} performanceData - 性能数据
 * @param {string} description - 问题描述(可选)
 * @returns {Promise}
 */
export const diagnosePerformance = (performanceData, description) => {
  return request({
    url: '/ai-diagnosis/performance',
    method: 'post',
    params: {
      performanceData,
      description: description || ''
    }
  })
}

/**
 * 错误日志诊断
 * @param {string} errorLog - 错误日志
 * @param {string} description - 问题描述(可选)
 * @returns {Promise}
 */
export const diagnoseErrorLog = (errorLog, description) => {
  return request({
    url: '/ai-diagnosis/error-log',
    method: 'post',
    params: {
      errorLog,
      description: description || ''
    }
  })
}

/**
 * 获取AI诊断功能状态
 * @returns {Promise}
 */
export const getDiagnosisStatus = () => {
  return request({
    url: '/ai-diagnosis/status',
    method: 'get'
  })
}

