import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { executeTestCase, executeApiTest } from '@/api/testCase'

export function useExecution(props, emit, deps = {}) {
  // deps can include activeTab (ref) and loadHistoryRecords (fn)
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
            ElMessage.success(`接口测试任务已提交，任务ID: ${response.data.task_id || response.data.taskId}`)
            executeDialogVisible.value = false
          } else {
            const totalCases = response.data.totalCases || response.data.total_cases || 0
            const passed = response.data.passed || 0
            const failed = response.data.failed || 0
            executionResult.value = {
              executionId: response.data.executionId || response.data.execution_id,
              apiId: response.data.apiId || response.data.api_id,
              apiName: response.data.apiName || response.data.api_name,
              caseName: `接口测试: ${response.data.apiName || response.data.api_name || props.api?.name}`,
              status: failed === 0 && passed > 0 ? 'passed' : (failed > 0 ? 'failed' : 'not_executed'),
              duration: response.data.totalDuration || response.data.total_duration,
              startTime: response.data.startTime || response.data.start_time,
              endTime: response.data.endTime || response.data.end_time,
              responseStatus: 200,
              assertionsPassed: passed,
              assertionsFailed: failed,
              totalCases,
              successRate: response.data.successRate || response.data.success_rate || 0,
              failureMessage: failed > 0 ? `${failed}个用例执行失败` : null,
              reportId: response.data.reportId || response.data.report_id,
              detailUrl: response.data.detailUrl || response.data.detail_url,
              caseResults: response.data.caseResults || response.data.case_results || []
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
            executionResult.value = {
              executionId: response.data.executionId || response.data.execution_id,
              caseId: response.data.caseId || response.data.case_id,
              caseName: response.data.caseName || response.data.case_name,
              status: response.data.status,
              duration: response.data.duration,
              startTime: response.data.startTime || response.data.start_time,
              endTime: response.data.endTime || response.data.end_time,
              responseStatus: response.data.responseStatus || response.data.response_status,
              assertionsPassed: response.data.assertionsPassed || response.data.assertions_passed || 0,
              assertionsFailed: response.data.assertionsFailed || response.data.assertions_failed || 0,
              failureMessage: response.data.failureMessage || response.data.failure_message,
              logsLink: response.data.logsLink || response.data.logs_link,
              reportId: response.data.reportId || response.data.report_id
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
    handleViewLogs,
    handleViewReport,
    handleRetestFromResult,
    handleTest
  }
}

export default useExecution


