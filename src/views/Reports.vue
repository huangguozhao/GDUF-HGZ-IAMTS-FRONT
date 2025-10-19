<template>
  <div class="reports-container">
    <!-- 面包屑导航 -->
    <div class="breadcrumb">
      <span class="breadcrumb-item">首页</span>
      <span class="breadcrumb-separator">></span>
      <span class="breadcrumb-item active">报告中心</span>
    </div>

    <!-- 页面标题 -->
    <h2 class="page-title">测试报告</h2>

    <!-- 筛选区域 -->
    <div class="filter-section">
      <div class="filter-left">
        <el-select 
          v-model="filters.projectId" 
          placeholder="所有项目" 
          class="filter-item"
          clearable
        >
          <el-option label="所有项目" :value="null" />
          <el-option 
            v-for="project in projects" 
            :key="project.id" 
            :label="project.name" 
            :value="project.id" 
          />
        </el-select>

        <el-date-picker
          v-model="filters.startDate"
          type="date"
          placeholder="开始日期"
          class="filter-item"
          clearable
          :prefix-icon="Calendar"
        />

        <span class="date-separator">至</span>

        <el-date-picker
          v-model="filters.endDate"
          type="date"
          placeholder="结束日期"
          class="filter-item"
          clearable
          :prefix-icon="Calendar"
        />

        <el-select 
          v-model="filters.status" 
          placeholder="全部状态" 
          class="filter-item"
          clearable
        >
          <el-option label="全部状态" :value="null" />
          <el-option label="通过" value="passed" />
          <el-option label="失败" value="failed" />
        </el-select>
      </div>

      <div class="filter-right">
        <el-button type="primary" :icon="Upload" @click="handleExport">
          导出报告
        </el-button>
      </div>
    </div>

    <!-- 报告列表表格 -->
    <el-table 
      :data="reportList" 
      class="report-table"
      v-loading="loading"
      style="width: 100%"
    >
      <el-table-column prop="id" label="报告ID" width="180" />
      
      <el-table-column prop="projectName" label="关联项目" width="150" />
      
      <el-table-column prop="testTime" label="测试时间" width="180" />
      
      <el-table-column prop="duration" label="执行耗时" width="100" />
      
      <el-table-column label="通过率" width="250">
        <template #default="scope">
          <div class="pass-rate-cell">
            <el-progress 
              :percentage="scope.row.passRate" 
              :color="getProgressColor(scope.row.passRate)"
              :show-text="false"
            />
            <span class="pass-rate-text">{{ scope.row.passRate }}%</span>
          </div>
        </template>
      </el-table-column>
      
      <el-table-column label="状态" width="120">
        <template #default="scope">
          <div class="status-cell">
            <el-icon 
              :class="['status-icon', scope.row.status === 'passed' ? 'success' : 'danger']"
            >
              <SuccessFilled v-if="scope.row.status === 'passed'" />
              <CircleCloseFilled v-else />
            </el-icon>
            <span :class="['status-text', scope.row.status === 'passed' ? 'success' : 'danger']">
              {{ scope.row.status === 'passed' ? '通过' : '失败' }}
            </span>
          </div>
        </template>
      </el-table-column>
      
      <el-table-column label="操作" width="240" fixed="right">
        <template #default="scope">
          <el-button 
            link 
            type="primary" 
            :icon="View"
            @click="handleViewDetail(scope.row)"
          >
            查看详情
          </el-button>
          <el-button 
            link 
            type="primary" 
            :icon="Download"
            @click="handleDownloadPDF(scope.row)"
          >
            下载PDF
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <div class="pagination-info">
        共 {{ pagination.total }} 条记录，当前显示 1-{{ reportList.length }} 条
      </div>
      <el-pagination
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="pagination.total"
        layout="sizes, prev, pager, next"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Calendar, 
  Upload, 
  View, 
  Download,
  SuccessFilled,
  CircleCloseFilled
} from '@element-plus/icons-vue'
import { getReportList, exportReport, downloadReportPDF } from '../api/report'
import { getProjects } from '../api/project'

// 筛选条件
const filters = reactive({
  projectId: null,
  startDate: null,
  endDate: null,
  status: null
})

// 分页信息
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 128
})

// 数据列表
const reportList = ref([])
const projects = ref([])
const loading = ref(false)

// 获取项目列表
const fetchProjects = async () => {
  try {
    const response = await getProjects()
    projects.value = response.data || []
  } catch (error) {
    console.error('获取项目列表失败:', error)
    // 使用模拟项目数据
    projects.value = [
      { id: 1, name: '电商支付系统' },
      { id: 2, name: '用户中心' },
      { id: 3, name: '物流管理平台' }
    ]
  }
}

// 获取报告列表
const fetchReports = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      projectId: filters.projectId,
      startDate: filters.startDate,
      endDate: filters.endDate,
      status: filters.status
    }
    
    const response = await getReportList(params)
    reportList.value = response.data || []
    pagination.total = response.total || 0
  } catch (error) {
    console.error('获取报告列表失败:', error)
    // 使用模拟数据
    reportList.value = getMockReportData()
  } finally {
    loading.value = false
  }
}

// 模拟数据（用于开发和测试）
const getMockReportData = () => {
  return [
    { id: 'RPT-20240310-001', projectName: '电商支付系统', testTime: '2024-03-10 14:30', duration: '2分钟', passRate: 95, status: 'passed' },
    { id: 'RPT-20240309-002', projectName: '用户中心', testTime: '2024-03-09 09:15', duration: '3分钟', passRate: 88, status: 'passed' },
    { id: 'RPT-20240308-003', projectName: '物流管理平台', testTime: '2024-03-08 16:45', duration: '5分钟', passRate: 72, status: 'failed' },
    { id: 'RPT-20240307-004', projectName: '电商支付系统', testTime: '2024-03-07 11:30', duration: '2分钟', passRate: 100, status: 'passed' },
    { id: 'RPT-20240306-005', projectName: '物流管理平台', testTime: '2024-03-06 15:20', duration: '4分钟', passRate: 65, status: 'failed' },
    { id: 'RPT-20240305-006', projectName: '用户中心', testTime: '2024-03-05 10:45', duration: '3分钟', passRate: 92, status: 'passed' },
    { id: 'RPT-20240304-007', projectName: '电商支付系统', testTime: '2024-03-04 13:50', duration: '2分钟', passRate: 98, status: 'passed' },
    { id: 'RPT-20240303-008', projectName: '用户中心', testTime: '2024-03-03 09:00', duration: '3分钟', passRate: 78, status: 'failed' },
    { id: 'RPT-20240302-009', projectName: '物流管理平台', testTime: '2024-03-02 14:15', duration: '4分钟', passRate: 85, status: 'passed' },
    { id: 'RPT-20240301-010', projectName: '电商支付系统', testTime: '2024-03-01 16:30', duration: '2分钟', passRate: 94, status: 'passed' }
  ]
}

// 获取进度条颜色
const getProgressColor = (percentage) => {
  if (percentage >= 90) {
    return '#67c23a'
  } else if (percentage >= 70) {
    return '#e6a23c'
  } else {
    return '#f56c6c'
  }
}

// 导出报告
const handleExport = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要导出当前筛选条件下的报告吗？',
      '导出确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }
    )
    
    loading.value = true
    await exportReport(filters)
    ElMessage.success('导出成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('导出失败:', error)
      ElMessage.error('导出失败，请稍后重试')
    }
  } finally {
    loading.value = false
  }
}

// 查看详情
const handleViewDetail = (row) => {
  ElMessage.info(`查看报告详情：${row.id}`)
  // TODO: 跳转到详情页面或打开详情对话框
}

// 下载PDF
const handleDownloadPDF = async (row) => {
  try {
    ElMessage.info(`正在下载报告：${row.id}`)
    await downloadReportPDF(row.id)
    ElMessage.success('下载成功')
  } catch (error) {
    console.error('下载失败:', error)
    ElMessage.error('下载失败，请稍后重试')
  }
}

// 分页大小改变
const handleSizeChange = (size) => {
  pagination.pageSize = size
  fetchReports()
}

// 当前页改变
const handlePageChange = (page) => {
  pagination.currentPage = page
  fetchReports()
}

// 组件挂载时加载数据
onMounted(() => {
  fetchProjects()
  fetchReports()
})
</script>

<style scoped>
.reports-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100%;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 14px;
}

.breadcrumb-item {
  color: #606266;
}

.breadcrumb-item.active {
  color: #303133;
  font-weight: 500;
}

.breadcrumb-separator {
  color: #c0c4cc;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 24px 0;
}

.filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
}

.filter-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-item {
  width: 180px;
}

.date-separator {
  color: #909399;
  font-size: 14px;
  margin: 0 4px;
}

.filter-right {
  flex-shrink: 0;
}

.report-table {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.pass-rate-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pass-rate-text {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  min-width: 40px;
}

.status-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-icon {
  font-size: 16px;
}

.status-icon.success {
  color: #67c23a;
}

.status-icon.danger {
  color: #f56c6c;
}

.status-text {
  font-size: 14px;
  font-weight: 500;
}

.status-text.success {
  color: #67c23a;
}

.status-text.danger {
  color: #f56c6c;
}

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding: 16px 20px;
  background: #fff;
  border-radius: 8px;
}

.pagination-info {
  font-size: 14px;
  color: #606266;
}

:deep(.el-table) {
  font-size: 14px;
}

:deep(.el-table th) {
  background: #f5f7fa;
  color: #606266;
  font-weight: 500;
}

:deep(.el-table td) {
  padding: 16px 0;
}

:deep(.el-progress-bar__outer) {
  background-color: #ebeef5;
}

:deep(.el-button + .el-button) {
  margin-left: 12px;
}
</style>
