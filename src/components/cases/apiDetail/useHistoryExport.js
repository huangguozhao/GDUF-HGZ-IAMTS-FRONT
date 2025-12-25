import { ref, reactive, computed } from 'vue'
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
    'errorMessage', 'browser', 'appVersion', 'reportUrl', 'executionConfig'
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

  const loadHistoryRecords = async () => {
    try {
      historyLoading.value = true
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

      const params = {
        execution_scope: 'api',
        ref_id: props.api?.api_id || props.api?.id,
        status: apiStatus,
        start_time_begin: timeRange.start,
        start_time_end: timeRange.end,
        search_keyword: historySearchText.value || undefined,
        page: historyPagination.currentPage,
        page_size: historyPagination.pageSize,
        sort_by: 'start_time',
        sort_order: 'desc'
      }
      const response = await getExecutionRecords(params)
      if (response.code === 1 && response.data) {
        const { items, total } = response.data
        historyRecords.value = items.map(item => ({
          id: item.recordId,
          recordId: item.recordId,
          testTime: formatTime(item.startTime),
          startTime: item.startTime,
          endTime: item.endTime,
          executor: item.executorInfo?.name || '未知',
          executorId: item.executedBy,
          executorAvatar: item.executorInfo?.avatarUrl || '',
          responseTime: formatDuration(item.durationSeconds),
          durationSeconds: item.durationSeconds,
          status: item.status === 'completed' ? 'passed' : item.status,
          executionStatus: item.status,
          executionType: item.executionType,
          environment: item.environment,
          totalCases: item.totalCases,
          executedCases: item.executedCases,
          passedCases: item.passedCases,
          failedCases: item.failedCases,
          skippedCases: item.skippedCases,
          successRate: item.successRate,
          errorMessage: item.errorMessage,
          reportUrl: item.reportUrl,
          scopeName: item.scopeName,
          browser: item.browser,
          appVersion: item.appVersion,
          executionConfig: item.executionConfig,
          logFilePath: item.logFilePath,
          triggeredTaskId: item.triggeredTaskId,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt
        }))
        historyTotal.value = total
      } else {
        ElMessage.error(response.msg || '加载执行历史失败')
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
    try {
      const response = await getExecutionRecordById(record.recordId)
      if (response.code === 1 && response.data) {
        // 设置执行结果数据，用于显示在ExecutionResult组件中
        executionResult.value = {
          recordId: response.data.recordId,
          executionScope: response.data.executionScope,
          refId: response.data.refId,
          scopeName: response.data.scopeName,
          executorInfo: response.data.executorInfo,
          executionType: response.data.executionType,
          environment: response.data.environment,
          status: response.data.status,
          startTime: response.data.startTime,
          endTime: response.data.endTime,
          durationSeconds: response.data.durationSeconds,
          totalCases: response.data.totalCases,
          executedCases: response.data.executedCases,
          passedCases: response.data.passedCases,
          failedCases: response.data.failedCases,
          skippedCases: response.data.skippedCases,
          successRate: response.data.successRate,
          reportUrl: response.data.reportUrl,
          errorMessage: response.data.errorMessage,
          browser: response.data.browser,
          appVersion: response.data.appVersion
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
          const executeData = {
            environment: historyConfig?.environment || record.environment,
            baseUrl: historyConfig?.baseUrl,
            timeout: historyConfig?.timeout,
            authOverride: historyConfig?.authOverride,
            variables: historyConfig?.variables,
            async: false
          }
          const executeResponse = await executeTestCase(props.api.id, props.api.id, executeData)
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
        'errorMessage': { label: '错误信息', getValue: (r) => r.errorMessage || '-' },
        'browser': { label: '浏览器', getValue: (r) => r.browser || '-' },
        'appVersion': { label: '应用版本', getValue: (r) => r.appVersion || '-' },
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


