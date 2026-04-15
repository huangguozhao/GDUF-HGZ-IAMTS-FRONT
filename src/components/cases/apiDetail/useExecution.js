import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { executeTestCase, executeApiTest } from '@/api/testCase'

export function useExecution(props, emit, deps = {}) {
  // deps can include activeTab (ref) - loadHistoryRecords is optional
  const executeDialogVisible = ref(false)
  const executing = ref(false)
  const executeVariables = ref('')
  const isExecutingApi = ref(false) // 是否为接口级执行
  const executeFormData = reactive({
    environment: 'dev',
    baseUrl: '',
    timeout: 30,
    variables: {},
    async: false,
    concurrency: 3,
    caseFilter: {
      priority: [],
      tags: [],
      enabledOnly: true
    },
    executionOrder: 'priority_desc'
  })

  const resultDialogVisible = ref(false)
  const executionResult = ref(null)
  const currentTestCase = ref(null)

  const handleRunTestCase = (testCase) => {
    currentTestCase.value = testCase
    isExecutingApi.value = false
    Object.assign(executeFormData, {
      environment: 'dev',
      baseUrl: '',
      timeout: 30,
      variables: {},
      async: false
    })
    executeVariables.value = ''
    executeDialogVisible.value = true
  }

  const handleConfirmExecute = async () => {
    try {
      executing.value = true

      let parsedVariables = {}
      if (executeVariables.value) {
        try {
          parsedVariables = JSON.parse(executeVariables.value)
        } catch (e) {
          ElMessage.error('执行变量必须是有效的JSON格式')
          executing.value = false
          return
        }
      }

      const requestData = {
        environment: executeFormData.environment,
        async: executeFormData.async
      }
      if (executeFormData.baseUrl) requestData.base_url = executeFormData.baseUrl
      if (executeFormData.timeout) requestData.timeout = executeFormData.timeout
      if (Object.keys(parsedVariables).length > 0) requestData.variables = parsedVariables

      if (isExecutingApi.value) {
        if (executeFormData.concurrency) requestData.concurrency = executeFormData.concurrency
        const caseFilter = {}
        if (executeFormData.caseFilter.priority && executeFormData.caseFilter.priority.length > 0) caseFilter.priority = executeFormData.caseFilter.priority
        if (executeFormData.caseFilter.tags && executeFormData.caseFilter.tags.length > 0) caseFilter.tags = executeFormData.caseFilter.tags
        caseFilter.enabled_only = executeFormData.caseFilter.enabledOnly
        if (Object.keys(caseFilter).length > 0) requestData.case_filter = caseFilter
        if (executeFormData.executionOrder) requestData.execution_order = executeFormData.executionOrder

        const apiId = props.api?.api_id || props.api?.id || props.api?.apiId
        if (!apiId) {
          ElMessage.error('无法获取接口ID')
          executing.value = false
          return
        }

        const response = await executeApiTest(apiId, requestData)
        if (response.code === 1) {
          if (requestData.async) {
            ElMessage.success(`接口测试任务已提交，任务ID: ${response.data.taskId || response.data.task_id}`)
            executeDialogVisible.value = false
          } else {
            const totalCases = response.data.totalCases || response.data.total_cases || 0
            const passed = response.data.passed || 0
            const failed = response.data.failed || 0
            const broken = response.data.broken || 0
            const skipped = response.data.skipped || 0
            const isPassed = (failed + broken) === 0 && passed > 0
            
            // 使用后端返回的执行信息，如果没有则使用默认值
            const executionScope = response.data.executionScope || 'api'
            const executionType = response.data.executionType || 'manual'
            const environment = response.data.environment || requestData.environment || 'dev'
            
            // 从 caseResults 中提取响应数据
            const caseResults = response.data.caseResults || response.data.case_results || []
            const firstCaseResult = caseResults.length > 0 ? caseResults[0] : {}
            
            executionResult.value = {
              // 基本信息
              executionId: response.data.executionId || response.data.execution_id,
              recordId: response.data.executionId || response.data.execution_id,
              apiId: response.data.apiId || response.data.api_id,
              apiName: response.data.apiName || response.data.api_name,
              apiMethod: response.data.apiMethod || response.data.api_method,
              apiPath: response.data.apiPath || response.data.api_path,
              caseName: `接口测试: ${response.data.apiName || response.data.api_name || props.api?.name}`,
              scopeName: `接口测试: ${response.data.apiName || response.data.api_name || props.api?.name}`,
              status: isPassed ? 'passed' : 'failed',
              // 时间信息
              startTime: response.data.startTime || response.data.start_time,
              endTime: response.data.endTime || response.data.end_time,
              duration: response.data.totalDuration || response.data.total_duration || 0,
              durationSeconds: (response.data.totalDuration || response.data.total_duration || 0) / 1000,
              // 测试统计
              totalCases,
              executedCases: totalCases - skipped,
              passedCases: passed,
              failedCases: failed + broken,
              skippedCases: skipped,
              successRate: response.data.successRate || response.data.success_rate || (totalCases > 0 ? (passed / totalCases * 100) : 0),
              // 响应数据（从 caseResults 中获取）
              responseStatus: firstCaseResult.responseStatus || 200,
              responseBody: caseResults,
              responseHeaders: [],
              // 断言结果
              assertionsPassed: passed,
              assertionsFailed: failed + broken,
              failureMessage: (failed + broken) > 0 ? `${failed + broken}个用例执行失败` : null,
              failureType: firstCaseResult.failureType || firstCaseResult.failure_type,
              reportId: response.data.reportId || response.data.report_id,
              reportName: response.data.reportName || response.data.report_name,
              detailUrl: response.data.detailUrl || response.data.detail_url,
              caseResults: caseResults,
              assertionDetails: [],
              // 额外信息
              environment,
              executionType,
              executionScope
            }
            executeDialogVisible.value = false
            resultDialogVisible.value = true
          }

          if (deps.activeTab?.value === 'history' && typeof deps.loadHistoryRecords === 'function') {
            await deps.loadHistoryRecords()
          }
          emit('refresh-cases')
        } else {
          ElMessage.error(response.msg || '执行失败')
        }
      } else {
        if (!currentTestCase.value) {
          ElMessage.error('未选择测试用例')
          executing.value = false
          return
        }
        const caseId = currentTestCase.value.caseId || currentTestCase.value.case_id || currentTestCase.value.id
        const response = await executeTestCase(null, caseId, requestData)
        if (response.code === 1) {
          if (requestData.async) {
            ElMessage.success(`测试任务已提交，任务ID: ${response.data.taskId || response.data.task_id}`)
            executeDialogVisible.value = false
          } else {
            // 单个测试用例执行结果
            // 使用后端返回的实际断言统计，如果没有则根据状态判断
            // 兼容多种可能的字段名：passed, assertionsPassed, assertions_passed, passedAssertions
            const passedCount = response.data.passed ?? response.data.assertionsPassed ?? response.data.assertions_passed ?? response.data.passedAssertions ?? 
              (response.data.status === 'passed' || response.data.status === 'completed' ? 1 : 0)
            const failedCount = response.data.failed ?? response.data.assertionsFailed ?? response.data.assertions_failed ?? response.data.failedAssertions ?? 
              (response.data.status === 'failed' || response.data.status === 'broken' ? 1 : 0)
            
            executionResult.value = {
              // 基本信息
              executionId: response.data.executionId || response.data.execution_id,
              recordId: response.data.executionId || response.data.execution_id,
              caseId: response.data.caseId || response.data.case_id,
              caseCode: response.data.caseCode || response.data.case_code,
              caseName: response.data.caseName || response.data.case_name,
              scopeName: response.data.caseName || response.data.case_name || '单个测试用例',
              // 接口信息（新增）
              apiId: response.data.apiId || response.data.api_id,
              apiName: response.data.apiName || response.data.api_name,
              status: response.data.status === 'completed' ? 'passed' : response.data.status,
              // 时间信息
              startTime: response.data.startTime || response.data.start_time,
              endTime: response.data.endTime || response.data.end_time,
              duration: response.data.duration || 0,
              durationSeconds: (response.data.duration || 0) / 1000,
              // 测试统计（单个用例）
              totalCases: 1,
              executedCases: 1,
              passedCases: passedCount,
              failedCases: failedCount,
              skippedCases: response.data.skippedCases || response.data.skipped_cases || 0,
              successRate: response.data.successRate || response.data.success_rate || (failedCount === 0 && passedCount > 0 ? 100 : 0),
              // 断言结果
              responseStatus: response.data.responseStatus || response.data.response_status,
              assertionsPassed: passedCount,
              assertionsFailed: failedCount,
              failureMessage: response.data.failureMessage || response.data.failure_message,
              failureType: response.data.failureType || response.data.failure_type,
              failureTrace: response.data.failureTrace || response.data.failure_trace,
              logsLink: response.data.logsLink || response.data.logs_link,
              reportId: response.data.reportId || response.data.report_id,
              reportName: response.data.reportName || response.data.report_name,
              assertionDetails: response.data.assertionDetails || response.data.assertion_details || [],
              responseBody: response.data.responseBody || response.data.response_body,
              responseHeaders: response.data.responseHeaders || response.data.response_headers,
              // 额外信息（使用后端返回的值）
              environment: response.data.environment || requestData.environment || 'dev',
              executionType: response.data.executionType || 'manual',
              executionScope: response.data.executionScope || 'test_case'
            }
            executeDialogVisible.value = false
            resultDialogVisible.value = true
          }
          emit('refresh-cases')
        } else {
          ElMessage.error(response.msg || '执行失败')
        }
      }
    } catch (error) {
      console.error('执行测试失败:', error)
      ElMessage.error(error.msg || error.message || '执行测试失败，请稍后重试')
    } finally {
      executing.value = false
    }
  }

  const handleViewLogs = () => {
    if (executionResult.value && executionResult.value.logsLink) {
      window.open(executionResult.value.logsLink, '_blank')
    } else {
      ElMessage.info('日志链接不可用')
    }
  }

  const handleViewReport = () => {
    if (executionResult.value && executionResult.value.reportId) {
      ElMessage.info(`查看报告ID: ${executionResult.value.reportId}`)
    } else {
      ElMessage.info('报告不可用')
    }
  }

  const handleRetestFromResult = () => {
    resultDialogVisible.value = false
    executeDialogVisible.value = true
  }

  // 快速执行：使用默认配置直接执行，无需打开配置对话框
  const handleQuickExecute = async () => {
    try {
      executing.value = true

      // 使用默认配置
      const requestData = {
        environment: 'dev',
        async: false,
        base_url: '',
        timeout: 30,
        variables: {}
      }

      // 判断是执行测试用例还是接口测试
      const hasTestCase = currentTestCase.value && (currentTestCase.value.case_id || currentTestCase.value.caseId || currentTestCase.value.id)
      
      if (hasTestCase) {
        // 执行单个测试用例
        const caseId = currentTestCase.value.case_id || currentTestCase.value.caseId || currentTestCase.value.id
        const response = await executeTestCase(caseId, requestData)
        
        if (response.code === 1) {
          // 兼容多种可能的字段名：passed, assertionsPassed, assertions_passed, passedAssertions
          const passedCount = response.data.passed ?? response.data.assertionsPassed ?? response.data.assertions_passed ?? response.data.passedAssertions ?? 
            (response.data.status === 'passed' || response.data.status === 'completed' ? 1 : 0)
          const failedCount = response.data.failed ?? response.data.assertionsFailed ?? response.data.assertions_failed ?? response.data.failedAssertions ?? 
            (response.data.status === 'failed' || response.data.status === 'broken' ? 1 : 0)
          
          executionResult.value = {
            executionId: response.data.executionId || response.data.execution_id,
            recordId: response.data.executionId || response.data.execution_id,
            caseId: response.data.caseId || response.data.case_id,
            caseCode: response.data.caseCode || response.data.case_code,
            caseName: response.data.caseName || response.data.case_name,
            scopeName: response.data.caseName || response.data.case_name || '单个测试用例',
            apiId: response.data.apiId || response.data.api_id,
            apiName: response.data.apiName || response.data.api_name,
            status: response.data.status === 'completed' ? 'passed' : response.data.status,
            startTime: response.data.startTime || response.data.start_time,
            endTime: response.data.endTime || response.data.end_time,
            duration: response.data.duration || 0,
            durationSeconds: (response.data.duration || 0) / 1000,
            totalCases: 1,
            executedCases: 1,
            passedCases: passedCount,
            failedCases: failedCount,
            skippedCases: response.data.skippedCases || response.data.skipped_cases || 0,
            successRate: response.data.successRate || response.data.success_rate || (failedCount === 0 && passedCount > 0 ? 100 : 0),
            responseStatus: response.data.responseStatus || response.data.response_status,
            assertionsPassed: passedCount,
            assertionsFailed: failedCount,
            failureMessage: response.data.failureMessage || response.data.failure_message,
            failureType: response.data.failureType || response.data.failure_type,
            failureTrace: response.data.failureTrace || response.data.failure_trace,
            logsLink: response.data.logsLink || response.data.logs_link,
            reportId: response.data.reportId || response.data.report_id,
            reportName: response.data.reportName || response.data.report_name,
            assertionDetails: response.data.assertionDetails || response.data.assertion_details || [],
            responseBody: response.data.responseBody || response.data.response_body,
            responseHeaders: response.data.responseHeaders || response.data.response_headers,
            environment: response.data.environment || requestData.environment || 'dev',
            executionType: response.data.executionType || 'manual',
            executionScope: response.data.executionScope || 'test_case'
          }
          resultDialogVisible.value = true
          emit('refresh-cases')
        } else {
          ElMessage.error(response.msg || '执行失败')
        }
      } else if (props.api) {
        // 执行接口测试（所有关联的测试用例）
        const apiId = props.api?.api_id || props.api?.id || props.api?.apiId
        if (!apiId) {
          ElMessage.error('无法获取接口ID')
          executing.value = false
          return
        }

        const response = await executeApiTest(apiId, requestData)
        if (response.code === 1) {
          const totalCases = response.data.totalCases || response.data.total_cases || 0
          const passed = response.data.passed || 0
          const failed = response.data.failed || 0
          const broken = response.data.broken || 0
          const skipped = response.data.skipped || 0
          const isPassed = (failed + broken) === 0 && passed > 0
          
          const executionScope = response.data.executionScope || 'api'
          const executionType = response.data.executionType || 'manual'
          const environment = response.data.environment || requestData.environment || 'dev'
          
          // 从 caseResults 中提取响应数据
          const caseResults = response.data.caseResults || response.data.case_results || []
          const firstCaseResult = caseResults.length > 0 ? caseResults[0] : {}
          
          executionResult.value = {
            executionId: response.data.executionId || response.data.execution_id,
            recordId: response.data.executionId || response.data.execution_id,
            apiId: response.data.apiId || response.data.api_id,
            apiName: response.data.apiName || response.data.api_name,
            apiMethod: response.data.apiMethod || response.data.api_method,
            apiPath: response.data.apiPath || response.data.api_path,
            caseName: `接口测试: ${response.data.apiName || response.data.api_name || props.api?.name}`,
            scopeName: `接口测试: ${response.data.apiName || response.data.api_name || props.api?.name}`,
            status: isPassed ? 'passed' : 'failed',
            startTime: response.data.startTime || response.data.start_time,
            endTime: response.data.endTime || response.data.end_time,
            duration: response.data.totalDuration || response.data.total_duration || 0,
            durationSeconds: (response.data.totalDuration || response.data.total_duration || 0) / 1000,
            totalCases,
            executedCases: totalCases - skipped,
            passedCases: passed,
            failedCases: failed + broken,
            skippedCases: skipped,
            successRate: response.data.successRate || response.data.success_rate || (totalCases > 0 ? (passed / totalCases * 100) : 0),
            // 响应数据（从 caseResults 中获取）
            responseStatus: firstCaseResult.responseStatus || 200,
            responseBody: caseResults,
            responseHeaders: [],
            assertionsPassed: passed,
            assertionsFailed: failed + broken,
            failureMessage: (failed + broken) > 0 ? `${failed + broken}个用例执行失败` : null,
            failureType: firstCaseResult.failureType || firstCaseResult.failure_type,
            reportId: response.data.reportId || response.data.report_id,
            reportName: response.data.reportName || response.data.report_name,
            detailUrl: response.data.detailUrl || response.data.detail_url,
            caseResults: caseResults,
            assertionDetails: [],
            environment,
            executionType,
            executionScope
          }
          resultDialogVisible.value = true
          emit('refresh-cases')
        } else {
          ElMessage.error(response.msg || '执行失败')
        }
      } else {
        ElMessage.warning('没有可执行的测试用例或接口')
      }
    } catch (error) {
      console.error('快速执行失败:', error)
      ElMessage.error(error.msg || error.message || '快速执行失败，请稍后重试')
    } finally {
      executing.value = false
    }
  }

  const handleTest = () => {
    Object.assign(executeFormData, {
      environment: 'dev',
      baseUrl: '',
      timeout: 30,
      variables: {},
      async: false,
      concurrency: 3,
      caseFilter: {
        priority: [],
        tags: [],
        enabledOnly: true
      },
      executionOrder: 'priority_desc'
    })
    executeVariables.value = ''
    executeDialogVisible.value = true
    isExecutingApi.value = true
  }

  return {
    executeDialogVisible,
    executing,
    executeVariables,
    isExecutingApi,
    executeFormData,
    resultDialogVisible,
    executionResult,
    currentTestCase,
    handleRunTestCase,
    handleConfirmExecute,
    handleQuickExecute,
    handleViewLogs,
    handleViewReport,
    handleRetestFromResult,
    handleTest
  }
}

export default useExecution


