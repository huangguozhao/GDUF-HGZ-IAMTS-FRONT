<template>
  <div class="reports-container">
    <!-- 顶部工具栏 -->
    <div class="reports-header">
      <div class="header-left">
        <h2 class="page-title">📊 报告中心</h2>
        <div class="reports-stats">
          <span class="stat-item">
            <span class="stat-label">总报告数:</span>
            <span class="stat-value">{{ totalReports }}</span>
          </span>
          <span class="stat-item">
            <span class="stat-label">本月新增:</span>
            <span class="stat-value text-success">{{ monthlyReports }}</span>
          </span>
        </div>
      </div>
      <div class="header-right">
        <el-button type="primary" @click="handleRefresh">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 搜索和过滤区域 -->
    <div class="filter-section">
      <el-form :model="filterForm" inline>
        <el-form-item label="关键词搜索">
          <el-input
            v-model="filterForm.searchKeyword"
            placeholder="搜索报告名称、描述"
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
            style="width: 250px"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="报告类型">
          <el-select
            v-model="filterForm.reportType"
            placeholder="全部"
            clearable
            @change="handleSearch"
            style="width: 150px"
          >
            <el-option label="执行报告" value="execution" />
            <el-option label="趋势报告" value="trend" />
            <el-option label="API测试" value="api" />
            <el-option label="性能测试" value="performance" />
            <el-option label="自动化测试" value="automation" />
            <el-option label="手工测试" value="manual" />
          </el-select>
        </el-form-item>

        <el-form-item label="环境">
          <el-select
            v-model="filterForm.environment"
            placeholder="全部"
            clearable
            @change="handleSearch"
            style="width: 120px"
          >
            <el-option label="开发环境" value="dev" />
            <el-option label="测试环境" value="test" />
            <el-option label="预发布环境" value="staging" />
            <el-option label="生产环境" value="prod" />
          </el-select>
        </el-form-item>

        <el-form-item label="状态">
          <el-select
            v-model="filterForm.reportStatus"
            placeholder="全部"
            clearable
            @change="handleSearch"
            style="width: 120px"
          >
            <el-option label="生成中" value="generating" />
            <el-option label="已完成" value="completed" />
            <el-option label="失败" value="failed" />
          </el-select>
        </el-form-item>

        <el-form-item label="成功率">
          <el-input-number
            v-model="filterForm.successRateMin"
            :min="0"
            :max="100"
            :precision="2"
            placeholder="最小"
            @change="handleSearch"
            style="width: 100px"
          />
          <span style="margin: 0 8px">-</span>
          <el-input-number
            v-model="filterForm.successRateMax"
            :min="0"
            :max="100"
            :precision="2"
            placeholder="最大"
            @change="handleSearch"
            style="width: 100px"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleResetFilter">
            <el-icon><RefreshLeft /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 高级过滤 -->
      <el-collapse v-model="advancedFilterVisible" style="margin-top: 16px">
        <el-collapse-item title="高级筛选" name="advanced">
          <el-form :model="filterForm" inline>
            <el-form-item label="开始时间">
              <el-date-picker
                v-model="filterForm.startTimeBegin"
                type="datetime"
                placeholder="选择开始时间"
                value-format="YYYY-MM-DDTHH:mm:ss"
                @change="handleSearch"
                style="width: 200px"
              />
            </el-form-item>

            <el-form-item label="结束时间">
              <el-date-picker
                v-model="filterForm.startTimeEnd"
                type="datetime"
                placeholder="选择结束时间"
                value-format="YYYY-MM-DDTHH:mm:ss"
                @change="handleSearch"
                style="width: 200px"
              />
            </el-form-item>

            <el-form-item label="文件格式">
              <el-select
                v-model="filterForm.fileFormat"
                placeholder="全部"
                clearable
                @change="handleSearch"
                style="width: 120px"
              >
                <el-option label="HTML" value="html" />
                <el-option label="JSON" value="json" />
                <el-option label="PDF" value="pdf" />
                <el-option label="Excel" value="excel" />
              </el-select>
            </el-form-item>

            <el-form-item label="包含已删除">
              <el-switch
                v-model="filterForm.includeDeleted"
                @change="handleSearch"
              />
            </el-form-item>
          </el-form>
        </el-collapse-item>
      </el-collapse>
    </div>

    <!-- 调试信息面板 -->
    <el-alert
      v-if="reportList.length === 0 && !loading"
      title="调试信息"
      type="info"
      closable
      style="margin-bottom: 20px"
    >
      <template #default>
        <div style="font-size: 14px; line-height: 1.8">
          <p><strong>数据状态：</strong></p>
          <p>报告列表长度: {{ reportList.length }}</p>
          <p>总记录数: {{ pagination.total }}</p>
          <p>当前页: {{ pagination.page }}</p>
          <p>每页条数: {{ pagination.pageSize }}</p>
          <p>加载状态: {{ loading ? '加载中' : '已完成' }}</p>
          <p style="color: #e6a23c">
            ⚠️ 如果数据已查询到但未显示，请检查浏览器控制台日志
          </p>
        </div>
      </template>
    </el-alert>

    <!-- 报告列表 -->
    <div class="reports-list">
      <el-table
        :data="reportList"
        v-loading="loading"
        stripe
        border
        @selection-change="handleSelectionChange"
        style="width: 100%"
      >
        <el-table-column type="selection" width="55" />
        
        <el-table-column prop="reportId" label="报告ID" width="100" />
        
        <el-table-column prop="reportName" label="报告名称" min-width="200">
          <template #default="{ row }">
            <div class="report-name-cell">
              <span class="report-name-text" @click="handleViewDetail(row)" style="cursor: pointer; color: #409eff">
                {{ row.reportName }}
              </span>
              <el-tag v-if="row.projectName" size="small" type="info" style="margin-left: 8px">
                {{ row.projectName }}
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="reportType" label="报告类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getReportTypeTag(row.reportType)" size="small">
              {{ formatReportType(row.reportType) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="environment" label="环境" width="120">
          <template #default="{ row }">
            <el-tag :type="getEnvironmentTag(row.environment)" size="small">
              {{ formatEnvironment(row.environment) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="reportStatus" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.reportStatus)" size="small">
              {{ formatStatus(row.reportStatus) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="successRate" label="成功率" width="100">
          <template #default="{ row }">
            <el-progress
              :percentage="parseFloat(row.successRate || 0)"
              :color="getSuccessRateColor(row.successRate)"
              :stroke-width="8"
            />
          </template>
        </el-table-column>

        <el-table-column label="测试统计" width="200">
          <template #default="{ row }">
            <div class="test-stats">
              <span class="stat-badge total">总数: {{ row.totalCases || 0 }}</span>
              <span class="stat-badge success">通过: {{ row.passedCases || 0 }}</span>
              <span class="stat-badge danger">失败: {{ row.failedCases || 0 }}</span>
              <span class="stat-badge warning">跳过: {{ row.skippedCases || 0 }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="startTime" label="开始时间" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.startTime) }}
          </template>
        </el-table-column>

        <el-table-column prop="duration" label="耗时" width="100">
          <template #default="{ row }">
            {{ formatDuration(row.duration) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button size="small" type="primary" text @click="handleViewDetail(row)">
                <el-icon><View /></el-icon>
                查看
              </el-button>
              <el-button size="small" type="success" text @click="handleExport(row)">
                <el-icon><Download /></el-icon>
                导出
              </el-button>
              <el-button size="small" type="danger" text @click="handleDelete(row)">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>

        <!-- 空状态 -->
        <template #empty>
          <el-empty description="暂无报告数据">
            <template #image>
              <div style="font-size: 80px">📊</div>
            </template>
            <el-button type="primary" @click="handleRefresh">刷新数据</el-button>
          </el-empty>
        </template>
      </el-table>

      <!-- 批量操作工具栏 -->
      <div v-if="selectedReports.length > 0" class="batch-actions">
        <span class="batch-info">已选择 {{ selectedReports.length }} 项</span>
        <el-button type="danger" size="small" @click="handleBatchDelete">
          <el-icon><Delete /></el-icon>
          批量删除
        </el-button>
      </div>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>

    <!-- 报告详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="报告详情"
      width="80%"
      :close-on-click-modal="false"
    >
      <div v-if="currentReport" class="report-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="报告ID">{{ currentReport.reportId }}</el-descriptions-item>
          <el-descriptions-item label="报告名称">{{ currentReport.reportName }}</el-descriptions-item>
          <el-descriptions-item label="报告类型">
            <el-tag :type="getReportTypeTag(currentReport.reportType)" size="small">
              {{ formatReportType(currentReport.reportType) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="环境">
            <el-tag :type="getEnvironmentTag(currentReport.environment)" size="small">
              {{ formatEnvironment(currentReport.environment) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusTag(currentReport.reportStatus)" size="small">
              {{ formatStatus(currentReport.reportStatus) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="成功率">
            <el-progress
              :percentage="parseFloat(currentReport.successRate || 0)"
              :color="getSuccessRateColor(currentReport.successRate)"
            />
          </el-descriptions-item>
          <el-descriptions-item label="总用例数">{{ currentReport.totalCases || 0 }}</el-descriptions-item>
          <el-descriptions-item label="已执行">{{ currentReport.executedCases || 0 }}</el-descriptions-item>
          <el-descriptions-item label="通过数">
            <span class="text-success">{{ currentReport.passedCases || 0 }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="失败数">
            <span class="text-danger">{{ currentReport.failedCases || 0 }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="异常数">
            <span class="text-danger">{{ currentReport.brokenCases || 0 }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="跳过数">
            <span class="text-warning">{{ currentReport.skippedCases || 0 }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="开始时间">{{ formatDateTime(currentReport.startTime) }}</el-descriptions-item>
          <el-descriptions-item label="结束时间">{{ formatDateTime(currentReport.endTime) }}</el-descriptions-item>
          <el-descriptions-item label="耗时">{{ formatDuration(currentReport.duration) }}</el-descriptions-item>
          <el-descriptions-item label="文件格式">{{ currentReport.fileFormat }}</el-descriptions-item>
          <el-descriptions-item label="文件大小">{{ formatFileSize(currentReport.fileSize) }}</el-descriptions-item>
          <el-descriptions-item label="下载地址" :span="2">
            <el-link v-if="currentReport.downloadUrl" :href="currentReport.downloadUrl" type="primary" target="_blank">
              {{ currentReport.downloadUrl }}
            </el-link>
            <span v-else>-</span>
          </el-descriptions-item>
          <el-descriptions-item label="描述" :span="2">
            {{ currentReport.description || '-' }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleExport(currentReport)">
          <el-icon><Download /></el-icon>
          导出报告
        </el-button>
      </template>
    </el-dialog>

    <!-- 导出选项对话框 -->
    <el-dialog
      v-model="exportDialogVisible"
      title="导出报告"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="exportForm" label-width="140px">
        <el-form-item label="导出格式">
          <el-select v-model="exportForm.exportFormat" style="width: 100%">
            <el-option label="HTML" value="html" />
            <el-option label="JSON" value="json" />
            <el-option label="PDF" value="pdf" />
            <el-option label="Excel" value="excel" />
          </el-select>
        </el-form-item>

        <el-form-item label="包含详细结果">
          <el-switch v-model="exportForm.includeDetails" />
        </el-form-item>

        <el-form-item label="包含附件信息">
          <el-switch v-model="exportForm.includeAttachments" />
        </el-form-item>

        <el-form-item label="包含失败详情">
          <el-switch v-model="exportForm.includeFailureDetails" />
        </el-form-item>

        <el-form-item label="时区">
          <el-select v-model="exportForm.timezone" style="width: 100%">
            <el-option label="上海 (GMT+8)" value="Asia/Shanghai" />
            <el-option label="香港 (GMT+8)" value="Asia/Hong_Kong" />
            <el-option label="东京 (GMT+9)" value="Asia/Tokyo" />
            <el-option label="伦敦 (GMT+0)" value="Europe/London" />
            <el-option label="纽约 (GMT-5)" value="America/New_York" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="exportDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmExport" :loading="exporting">
          <el-icon v-if="!exporting"><Download /></el-icon>
          {{ exporting ? '导出中...' : '确认导出' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Refresh,
  Search,
  RefreshLeft,
  View,
  Download,
  Delete
} from '@element-plus/icons-vue'
import {
  getReportList,
  getReportById,
  deleteReport,
  batchDeleteReports,
  exportReport
} from '../api/report'

// 响应式数据
const loading = ref(false)
const reportList = ref([])
const selectedReports = ref([])
const detailDialogVisible = ref(false)
const exportDialogVisible = ref(false)
const currentReport = ref(null)
const currentExportReport = ref(null)
const exporting = ref(false)
const advancedFilterVisible = ref([])

// 过滤表单
const filterForm = reactive({
  searchKeyword: '',
  reportType: null,
  environment: null,
  reportStatus: null,
  fileFormat: null,
  startTimeBegin: null,
  startTimeEnd: null,
  successRateMin: null,
  successRateMax: null,
  tags: '',
  includeDeleted: false
})

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
})

// 导出表单
const exportForm = reactive({
  exportFormat: 'html',
  includeDetails: true,
  includeAttachments: false,
  includeFailureDetails: true,
  timezone: 'Asia/Shanghai'
})

// 计算属性
const totalReports = computed(() => pagination.total)
const monthlyReports = computed(() => {
  // 这里可以添加逻辑统计本月新增报告数
  return reportList.value.length
})

// 加载报告列表
const loadReportList = async () => {
  loading.value = true
  try {
    const params = {
      ...filterForm,
      page: pagination.page,
      pageSize: pagination.pageSize,
      sortBy: 'start_time',
      sortOrder: 'desc'
    }

    console.log('=== 开始加载报告列表 ===')
    console.log('请求参数:', params)

    const response = await getReportList(params)
    
    console.log('=== API响应 ===')
    console.log('完整响应对象:', response)
    console.log('响应类型:', typeof response)
    console.log('响应码:', response?.code)
    console.log('响应消息:', response?.msg)
    console.log('响应数据:', response?.data)

    // 检查响应是否成功
    if (response && (response.code === 1 || response.code === '1') && response.data) {
      const items = response.data.items || []
      const total = response.data.total || 0
      
      console.log('=== 数据处理 ===')
      console.log('报告数量:', items.length)
      console.log('总记录数:', total)
      console.log('第一条报告:', items[0])
      
      reportList.value = items
      pagination.total = total
      
      console.log('=== 数据赋值后 ===')
      console.log('reportList.value:', reportList.value)
      console.log('reportList.value.length:', reportList.value.length)
      
      ElMessage.success(`加载了 ${reportList.value.length} 条报告`)
    } else {
      console.error('API返回错误或数据格式不正确')
      console.error('响应对象:', response)
      ElMessage.error((response && response.msg) || '加载报告列表失败')
    }
  } catch (error) {
    console.error('=== 加载报告列表异常 ===')
    console.error('错误对象:', error)
    console.error('错误消息:', error.message)
    console.error('错误堆栈:', error.stack)
    ElMessage.error('加载报告列表失败')
  } finally {
    loading.value = false
    console.log('=== 加载完成 ===')
    console.log('loading:', loading.value)
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadReportList()
}

// 重置过滤
const handleResetFilter = () => {
  Object.keys(filterForm).forEach(key => {
    if (typeof filterForm[key] === 'boolean') {
      filterForm[key] = false
    } else {
      filterForm[key] = null
    }
  })
  filterForm.searchKeyword = ''
  filterForm.tags = ''
  handleSearch()
}

// 刷新
const handleRefresh = () => {
  loadReportList()
}

// 选择变化
const handleSelectionChange = (selection) => {
  selectedReports.value = selection
}

// 查看详情
const handleViewDetail = async (report) => {
  loading.value = true
  try {
    const response = await getReportById(report.reportId)
    if (response.code === 1 && response.data) {
      currentReport.value = response.data
      detailDialogVisible.value = true
    } else {
      ElMessage.error(response.msg || '加载报告详情失败')
    }
  } catch (error) {
    console.error('加载报告详情失败:', error)
    ElMessage.error('加载报告详情失败')
  } finally {
    loading.value = false
  }
}

// 导出
const handleExport = (report) => {
  currentExportReport.value = report
  exportDialogVisible.value = true
}

// 确认导出
const handleConfirmExport = async () => {
  if (!currentExportReport.value) return

  exporting.value = true
  try {
    const response = await exportReport(currentExportReport.value.reportId, exportForm)

    // 检查响应类型
    if (response instanceof Blob) {
      // 检查是否是JSON错误响应
      if (response.type === 'application/json') {
        const text = await response.text()
        const errorData = JSON.parse(text)
        
        if (errorData.code !== 1) {
          ElMessage.error(errorData.msg || '导出报告失败')
          return
        }
      }

      // 创建下载链接
      const blob = response
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      // 根据格式设置文件扩展名
      const extensions = {
        html: '.html',
        json: '.json',
        pdf: '.pdf',
        excel: '.xlsx'
      }
      const ext = extensions[exportForm.exportFormat] || '.html'
      link.download = `${currentExportReport.value.reportName}_${Date.now()}${ext}`
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      ElMessage.success('报告导出成功')
      exportDialogVisible.value = false
    } else {
      // 如果返回的不是Blob，显示错误
      ElMessage.error(response.msg || '导出报告失败')
    }
  } catch (error) {
    console.error('导出报告失败:', error)
    
    // 尝试从错误响应中提取错误信息
    if (error.response && error.response.data) {
      const errorData = error.response.data
      if (errorData.msg) {
        ElMessage.error(errorData.msg)
      } else {
        ElMessage.error('导出报告失败：服务器错误')
      }
    } else if (error.message) {
      ElMessage.error(`导出报告失败：${error.message}`)
    } else {
      ElMessage.error('导出报告失败')
    }
  } finally {
    exporting.value = false
  }
}

// 删除
const handleDelete = async (report) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除报告 "${report.reportName}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const response = await deleteReport(report.reportId, false)

    if (response.code === 1) {
      ElMessage.success('报告删除成功')
      loadReportList()
    } else {
      ElMessage.error(response.msg || '删除报告失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除报告失败:', error)
      ElMessage.error('删除报告失败')
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedReports.value.length} 个报告吗？`,
      '批量删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const reportIds = selectedReports.value.map(r => r.reportId)
    const response = await batchDeleteReports(reportIds)

    if (response.code === 1) {
      ElMessage.success(`成功删除 ${response.data} 个报告`)
      selectedReports.value = []
      loadReportList()
    } else {
      ElMessage.error(response.msg || '批量删除报告失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除报告失败:', error)
      ElMessage.error('批量删除报告失败')
    }
  }
}

// 分页变化
const handlePageChange = (page) => {
  pagination.page = page
  loadReportList()
}

const handleSizeChange = (size) => {
  pagination.pageSize = size
  pagination.page = 1
  loadReportList()
}

// 格式化函数
const formatReportType = (type) => {
  const types = {
    api: 'API测试',
    performance: '性能测试',
    automation: '自动化测试',
    manual: '手工测试',
    execution: '执行报告',
    trend: '趋势报告'
  }
  return types[type] || type
}

const formatEnvironment = (env) => {
  const environments = {
    dev: '开发环境',
    development: '开发环境',
    test: '测试环境',
    testing: '测试环境',
    staging: '预发布环境',
    prod: '生产环境',
    production: '生产环境'
  }
  return environments[env] || env
}

const formatStatus = (status) => {
  const statuses = {
    generating: '生成中',
    completed: '已完成',
    failed: '失败'
  }
  return statuses[status] || status
}

const formatDateTime = (dateTime) => {
  if (!dateTime) return '-'
  return new Date(dateTime).toLocaleString('zh-CN')
}

const formatDuration = (duration) => {
  if (!duration) return '-'
  const seconds = Math.floor(duration / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  
  if (hours > 0) {
    return `${hours}小时${minutes % 60}分${seconds % 60}秒`
  } else if (minutes > 0) {
    return `${minutes}分${seconds % 60}秒`
  } else {
    return `${seconds}秒`
  }
}

const formatFileSize = (size) => {
  if (!size) return '-'
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`
  if (size < 1024 * 1024 * 1024) return `${(size / 1024 / 1024).toFixed(2)} MB`
  return `${(size / 1024 / 1024 / 1024).toFixed(2)} GB`
}

// 标签类型
const getReportTypeTag = (type) => {
  const tags = {
    api: 'primary',
    performance: 'success',
    automation: 'warning',
    manual: 'info',
    execution: 'primary',
    trend: 'success'
  }
  return tags[type] || ''
}

const getEnvironmentTag = (env) => {
  const tags = {
    dev: 'info',
    development: 'info',
    test: 'warning',
    testing: 'warning',
    staging: 'primary',
    prod: 'danger',
    production: 'danger'
  }
  return tags[env] || ''
}

const getStatusTag = (status) => {
  const tags = {
    generating: 'warning',
    completed: 'success',
    failed: 'danger'
  }
  return tags[status] || ''
}

const getSuccessRateColor = (rate) => {
  const rateNum = parseFloat(rate)
  if (rateNum >= 90) return '#67c23a'
  if (rateNum >= 70) return '#e6a23c'
  return '#f56c6c'
}

// 生命周期
onMounted(() => {
  loadReportList()
})
</script>

<style scoped>
.reports-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

/* 顶部工具栏 */
.reports-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.reports-stats {
  display: flex;
  gap: 24px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-label {
  color: #909399;
  font-size: 14px;
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.text-success {
  color: #67c23a;
}

.text-danger {
  color: #f56c6c;
}

.text-warning {
  color: #e6a23c;
}

/* 过滤区域 */
.filter-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* 报告列表 */
.reports-list {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.report-name-cell {
  display: flex;
  align-items: center;
}

.report-name-text {
  font-weight: 500;
}

.test-stats {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.stat-badge.total {
  background: #f4f4f5;
  color: #909399;
}

.stat-badge.success {
  background: #f0f9ff;
  color: #67c23a;
}

.stat-badge.danger {
  background: #fef0f0;
  color: #f56c6c;
}

.stat-badge.warning {
  background: #fdf6ec;
  color: #e6a23c;
}

/* 批量操作 */
.batch-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #ecf5ff;
  border-radius: 4px;
  margin-top: 16px;
}

.batch-info {
  color: #409eff;
  font-weight: 500;
}

/* 分页 */
.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

/* 报告详情 */
.report-detail {
  padding: 20px 0;
}
</style>
