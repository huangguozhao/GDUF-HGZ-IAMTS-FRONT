import request from './request'

export function generateTestCases(data) {
  return request({
    url: '/ai-testcase/generate',
    method: 'post',
    data
  })
}

export function getGenerationResult(generationId) {
  return request({
    url: `/ai-testcase/result/${generationId}`,
    method: 'get'
  })
}

export function confirmSaveTestCases(data) {
  return request({
    url: '/ai-testcase/confirm',
    method: 'post',
    data
  })
}
