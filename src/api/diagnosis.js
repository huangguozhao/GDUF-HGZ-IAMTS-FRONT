import request from './request'

/**
 * AI诊断相关API接口
 */

/**
 * 执行AI诊断
 * @param {Object} params - 诊断参数
 * @param {string} params.diagnosisType - 诊断类型: test_failure, performance, error_log
 * @param {string} params.errorMessage - 错误信息
 * @param {string} params.errorLog - 错误日志
 * @param {string} params.description - 问题描述
 * @returns {Promise}
 */
export const diagnose = (params) => {
  return request({
    url: '/ai-diagnosis/diagnose',
    method: 'post',
    data: params,
    timeout: 60000 // AI诊断需要较长时间，设置60秒超时
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

