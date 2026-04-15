import { ref, reactive, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getExecutionRecords, getExecutionRecordById, deleteExecutionRecord, executeTestCase } from '@/api/testCase'
import { exportToExcel, exportToJson, exportToCsv } from './exportUtils'
import { formatDuration, formatTime } from './formatters'

export function useHistoryExport(props, emit, deps = {}) {
  const { resultDialogVisible, executionResult } = deps
  const historySearchText = ref('')
  const historyFilter = reactive({
    period: '7days',
    status: ''
  })

  const historyPagination = reactive({
    currentPage: 1,
    pageSize: 10
  })

  const historyTotal = ref(0)
  const historyRecords = ref([])
  const historyLoading = ref(false)
  const historyDetailDialogVisible = ref(false)
  const currentHistoryDetail = ref(null)

  // 导出历史相关
  const exportHistoryDialogVisible = ref(false)
  const exportingHistory = ref(false)
  const exportHistoryForm = reactive({
    format: 'excel',
    scope: 'current',
    includeFields: [
      'testTime', 'executor', 'environment', 'executionType',
      'responseTime', 'status', 'totalCases', 'passedCases',
      'failedCases', 'successRate'
    ],
    fileName: ''
  })

  const allExportFields = [
    'testTime', 'executor', 'environment', 'executionType',
    'responseTime', 'status', 'totalCases', 'executedCases',
    'passedCases', 'failedCases', 'skippedCases', 'successRate',
    'reportUrl', 'executionConfig'
  ]

  const getTimeRange = () => {
    if (!historyFilter.period || historyFilter.period === 'all') {
      return { start: null, end: null }
    }
    const now = new Date()
    const end = now.toISOString()
    let start = null
    switch (historyFilter.period) {
      case '7days':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
        break
      case '30days':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
        break
      case '90days':
        start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString()
        break
    }
    return { start, end }
  }

  // 缓存 API 下的用例 ID 列表
  let cachedCaseIds = null
  
  // 监听 relatedCases 变化，清除缓存
  watch(() => props.relatedCases, () => {
    cachedCaseIds = null
  })
  
  const loadHistoryRecords = async () => {
    try {
      historyLoading.value = true
      console.log('=== loadHistoryRecords 被调用 ===')
      console.log('props.api:', props.api)
      console.log('props.relatedCases:', props.relatedCases)
      
      // 获取当前 API 的 ID
      const apiId = props.api?.api_id || props.api?.id
      console.log('apiId:', apiId)
      
      // 如果有 relatedCases（来自 props），获取用例 ID 列表
      if (props.relatedCases && props.relatedCases.length > 0) {
        console.log('relatedCases 长度:', props.relatedCases.length)
        cachedCaseIds = props.relatedCases.map(c => c.case_id || c.id).filter(id => id)
        console.log('cachedCaseIds:', cachedCaseIds)
      } else {
        console.log('relatedCases 为空')
      }
      
      // 如果仍然没有用例 ID，尝试从 props 获取
      if (!cachedCaseIds || cachedCaseIds.length === 0) {
        console.log('cachedCaseIds 为空，设置空结果')
        // 如果没有用例，则没有执行历史
        historyRecords.value = []
        historyTotal.value = 0
        return
      }
      
      const timeRange = getTimeRange()
      // 转换前端状态值为后端期望的值
      let apiStatus = undefined
      if (historyFilter.status) {
        if (historyFilter.status === 'passed') {
          apiStatus = 'completed'
        } else {
          apiStatus = historyFilter.status
        }
      }
      
      // 如果只有一个用例，直接查询
      // 如果有多个用例，使用第一个用例 ID（因为执行记录是按用例存储的）
      const caseId = cachedCaseIds[0]
      console.log('使用 caseId 查询:', caseId)
      
      const params = {
        execution_scope: 'test_case',
        ref_id: caseId,
        status: apiStatus,
        start_time_begin: timeRange.start,
        start_time_end: timeRange.end,
        search_keyword: historySearchText.value || undefined,
        page: historyPagination.currentPage,
        page_size: historyPagination.pageSize,
        sort_by: 'start_time',
        sort_order: 'desc'
      }
      console.log('=== loadHistoryRecords 查询参数 ===')
      console.log('params:', params)
      console.log('relatedCases:', props.relatedCases)
      
      const response = await getExecutionRecords(params)
      console.log('=== loadHistoryRecords 响应 ===')
      console.log('response:', response)
      
      if (response.code === 1 && response.data) {
        const { items, total } = response.data
        console.log('=== items 和 total ===')
        console.log('items:', items)
        console.log('total:', total)
        historyRecords.value = items.map(item => ({
          // 处理字段命名兼容（下划线和驼峰）
          id: item.recordId || item.record_id,
          recordId: item.recordId || item.record_id,
          testTime: formatTime(item.startTime || item.start_time),
          startTime: item.startTime || item.start_time,
          endTime: item.endTime || item.end_time,
          executor: item.executorInfo?.name || item.executor_info?.name || '未知',
          executorId: item.executedBy || item.executed_by,
          executorAvatar: item.executorInfo?.avatarUrl || item.executor_info?.avatar_url || '',
          responseTime: formatDuration(item.durationSeconds ?? item.duration_seconds ?? 0),
          durationSeconds: item.durationSeconds ?? item.duration_seconds ?? 0,
          status: (item.status || item.execution_status) === 'completed' ? 'passed' : (item.status || item.execution_status),
          executionStatus: item.status || item.execution_status,
          executionType: item.executionType || item.execution_type,
          environment: item.environment,
          totalCases: item.totalCases ?? item.total_cases ?? 0,
          executedCases: item.executedCases ?? item.executed_cases ?? 0,
          passedCases: item.passedCases ?? item.passed_cases ?? 0,
          failedCases: item.failedCases ?? item.failed_cases ?? 0,
          skippedCases: item.skippedCases ?? item.skipped_cases ?? 0,
          successRate: item.successRate ?? item.success_rate ?? 0,
          errorMessage: item.errorMessage || item.error_message,
          reportUrl: item.reportUrl || item.report_url,
          scopeName: item.scopeName || item.scope_name,
          browser: item.browser,
          appVersion: item.appVersion || item.app_version,
          executionConfig: item.executionConfig || item.execution_config,
          logFilePath: item.logFilePath || item.log_file_path,
          triggeredTaskId: item.triggeredTaskId || item.triggered_task_id,
          createdAt: item.createdAt || item.created_at,
          updatedAt: item.updatedAt || item.updated_at
        }))
        historyTotal.value = total
      } else {
        historyRecords.value = []
        historyTotal.value = 0
      }
    } catch (error) {
      console.error('加载执行历史失败:', error)
      ElMessage.error('加载执行历史失败: ' + (error.message || '未知错误'))
      historyRecords.value = []
      historyTotal.value = 0
    } finally {
      historyLoading.value = false
    }
  }

  const filteredHistoryRecords = computed(() => historyRecords.value)

  const handleViewHistoryDetail = async (record) => {
    console.log('=== handleViewHistoryDetail called ===')
    console.log('record:', record)
    try {
      const response = await getExecutionRecordById(record.recordId)
      console.log('=== getExecutionRecordById response ===')
      console.log('response:', response)
      if (response.code === 1 && response.data) {
        const data = response.data
        // 处理字段命名兼容（下划线和驼峰）
        // 设置执行结果数据，用于显示在ExecutionResult组件中
        executionResult.value = {
          recordId: data.recordId || data.record_id,
          executionScope: data.executionScope || data.execution_scope,
          refId: data.refId || data.ref_id,
          scopeName: data.scopeName || data.scope_name,
          executorInfo: data.executorInfo || data.executor_info,
          executionType: data.executionType || data.execution_type,
          environment: data.environment,
          status: data.status,
          startTime: data.startTime || data.start_time,
          endTime: data.endTime || data.end_time,
          durationSeconds: data.durationSeconds ?? data.duration_seconds ?? 0,
          totalCases: data.totalCases ?? data.total_cases ?? 0,
          executedCases: data.executedCases ?? data.executed_cases ?? 0,
          passedCases: data.passedCases ?? data.passed_cases ?? 0,
          failedCases: data.failedCases ?? data.failed_cases ?? 0,
          skippedCases: data.skippedCases ?? data.skipped_cases ?? 0,
          successRate: data.successRate ?? data.success_rate ?? 0,
          reportUrl: data.reportUrl || data.report_url,
          errorMessage: data.errorMessage || data.error_message,
          browser: data.browser,
          appVersion: data.appVersion || data.app_version,
          // 添加用例执行结果详情
          caseResults: data.caseResults || data.case_results || []
        }
        resultDialogVisible.value = true
      } else {
        ElMessage.error(response.msg || '获取详情失败')
      }
    } catch (error) {
      console.error('获取执行记录详情失败:', error)
      ElMessage.error('获取详情失败: ' + (error.message || '未知错误'))
    }
  }

  const handleRetestFromHistory = async (record) => {
    try {
      const response = await getExecutionRecordById(record.recordId)
      if (response.code === 1 && response.data) {
        let historyConfig = response.data.executionConfig
        if (historyConfig && typeof historyConfig === 'string') {
          try { historyConfig = JSON.parse(historyConfig) } catch (e) { console.error(e) }
        }
        ElMessageBox.confirm(
          `确定要使用历史记录 #${record.recordId} 的配置重新执行测试吗？`,
          '重新测试',
          { confirmButtonText: '确定', cancelButtonText: '取消', type: 'info' }
        ).then(async () => {
          // 获取用例ID - 优先使用record中的refId（用例ID），其次使用当前查看的用例ID
          const caseIdToExecute = record.refId || record.caseId || record.id
          // 获取接口ID - 优先使用record中的apiId，其次使用props.api中的id
          const apiIdToExecute = record.apiId || props.api?.id || record.api_id || props.api?.api_id
          
          if (!caseIdToExecute) {
            ElMessage.error('无法获取用例ID，请重新选择历史记录')
            return
          }
          
          const executeData = {
            environment: historyConfig?.environment || record.environment,
            baseUrl: historyConfig?.baseUrl || record.baseUrl,
            timeout: historyConfig?.timeout,
            authOverride: historyConfig?.authOverride,
            variables: historyConfig?.variables,
            async: false
          }
          console.log('=== 重新测试 ===')
          console.log('用例ID:', caseIdToExecute)
          console.log('接口ID:', apiIdToExecute)
          console.log('执行配置:', executeData)
          
          const executeResponse = await executeTestCase(apiIdToExecute, caseIdToExecute, executeData)
          if (executeResponse.code === 1) {
            ElMessage.success('测试执行成功')
            await loadHistoryRecords()
          } else {
            ElMessage.error(executeResponse.msg || '执行失败')
          }
        }).catch(() => {})
      }
    } catch (error) {
      console.error('重新测试失败:', error)
      ElMessage.error('重新测试失败: ' + (error.message || '未知错误'))
    }
  }

  const handleDeleteHistory = async (record) => {
    ElMessageBox.confirm(
      `确定要删除这条测试记录吗？删除后将无法恢复。`,
      '删除确认',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning', confirmButtonClass: 'el-button--danger' }
    ).then(async () => {
      try {
        const response = await deleteExecutionRecord(record.recordId)
        if (response.code === 1) {
          ElMessage.success('删除成功')
          await loadHistoryRecords()
        } else {
          ElMessage.error(response.msg || '删除失败')
        }
      } catch (error) {
        console.error('删除执行记录失败:', error)
        ElMessage.error('删除失败: ' + (error.message || '未知错误'))
      }
    }).catch(() => {})
  }

  const handleHistorySizeChange = (pageSize) => {
    historyPagination.pageSize = pageSize
    historyPagination.currentPage = 1
    loadHistoryRecords()
  }

  const handleHistoryPageChange = (page) => {
    historyPagination.currentPage = page
    loadHistoryRecords()
  }

  const suggestedFileName = computed(() => {
    const apiName = props.api?.name || '接口'
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const ext = exportHistoryForm.format === 'excel' ? 'xlsx' : exportHistoryForm.format
    return `${apiName}_测试历史_${timestamp}.${ext}`
  })

  const selectAllFields = () => { exportHistoryForm.includeFields = [...allExportFields] }
  const clearAllFields = () => { exportHistoryForm.includeFields = [] }
  const selectRecommendedFields = () => {
    exportHistoryForm.includeFields = [
      'testTime', 'executor', 'environment', 'executionType',
      'responseTime', 'status', 'totalCases', 'passedCases',
      'failedCases', 'successRate'
    ]
  }

  const handleOpenExportHistoryDialog = () => {
    selectRecommendedFields()
    exportHistoryForm.format = 'excel'
    exportHistoryForm.scope = 'current'
    exportHistoryForm.fileName = ''
    exportHistoryDialogVisible.value = true
  }

  const handleConfirmExportHistory = async () => {
    try {
      exportingHistory.value = true
      const dataToExport = exportHistoryForm.scope === 'current' ? filteredHistoryRecords.value : historyRecords.value
      if (!dataToExport || dataToExport.length === 0) {
        ElMessage.warning('没有可导出的数据')
        return
      }

      const fieldMapping = {
        'testTime': { label: '测试时间', getValue: (r) => r.testTime },
        'executor': { label: '执行人', getValue: (r) => r.executor },
        'environment': { label: '执行环境', getValue: (r) => r.environment || '-' },
        'executionType': { label: '执行类型', getValue: (r) => r.executionType || '-' },
        'responseTime': { label: '响应时间', getValue: (r) => r.responseTime },
        'status': { label: '测试结果', getValue: (r) => r.status || '-' },
        'totalCases': { label: '总用例数', getValue: (r) => r.totalCases || 0 },
        'executedCases': { label: '已执行数', getValue: (r) => r.executedCases || 0 },
        'passedCases': { label: '通过数', getValue: (r) => r.passedCases || 0 },
        'failedCases': { label: '失败数', getValue: (r) => r.failedCases || 0 },
        'skippedCases': { label: '跳过数', getValue: (r) => r.skippedCases || 0 },
        'successRate': { label: '成功率', getValue: (r) => (r.successRate !== undefined && r.successRate !== null) ? `${(r.successRate * 100).toFixed(2)}%` : '-' },
        'reportUrl': { label: '报告地址', getValue: (r) => r.reportUrl || '-' },
        'executionConfig': { label: '执行配置', getValue: (r) => {
          if (!r.executionConfig) return '-'
          if (typeof r.executionConfig === 'string') return r.executionConfig
          return JSON.stringify(r.executionConfig)
        }}
      }

      const filteredData = dataToExport.map(record => {
        const filtered = {}
        exportHistoryForm.includeFields.forEach(field => {
          if (fieldMapping[field]) {
            filtered[fieldMapping[field].label] = fieldMapping[field].getValue(record)
          }
        })
        return filtered
      })

      const fileName = exportHistoryForm.fileName || suggestedFileName.value
      if (exportHistoryForm.format === 'excel') exportToExcel(filteredData, fileName)
      else if (exportHistoryForm.format === 'json') exportToJson(filteredData, fileName)
      else if (exportHistoryForm.format === 'csv') exportToCsv(filteredData, fileName)

      ElMessage.success('导出成功')
      exportHistoryDialogVisible.value = false
    } catch (error) {
      console.error('导出失败:', error)
      ElMessage.error('导出失败: ' + (error.message || '未知错误'))
    } finally {
      exportingHistory.value = false
    }
  }

  return {
    historySearchText,
    historyFilter,
    historyPagination,
    historyTotal,
    historyRecords,
    historyLoading,
    historyDetailDialogVisible,
    currentHistoryDetail,
    exportHistoryDialogVisible,
    exportingHistory,
    exportHistoryForm,
    allExportFields,
    getTimeRange,
    loadHistoryRecords,
    filteredHistoryRecords,
    handleViewHistoryDetail,
    handleRetestFromHistory,
    handleDeleteHistory,
    handleHistorySizeChange,
    handleHistoryPageChange,
    suggestedFileName,
    selectAllFields,
    clearAllFields,
    selectRecommendedFields,
    handleOpenExportHistoryDialog,
    handleConfirmExportHistory
  }
}

export default useHistoryExport


