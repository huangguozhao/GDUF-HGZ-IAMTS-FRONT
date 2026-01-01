<template>
  <div class="tasks-container">
    <!-- 面包屑导航 -->
    <div class="breadcrumb">
      <span class="breadcrumb-item">首页</span>
      <span class="breadcrumb-separator">></span>
      <span class="breadcrumb-item">用例管理</span>
      <span class="breadcrumb-separator">></span>
      <span class="breadcrumb-item active">任务安排</span>
    </div>

    <!-- 页面标题和操作按钮 -->
    <div class="page-header">
      <h2 class="page-title">任务安排</h2>
      <el-button type="primary" :icon="Plus" @click="showCreateDialog">
        创建定时任务
      </el-button>
    </div>

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

        <el-select 
          v-model="filters.status" 
          placeholder="全部状态" 
          class="filter-item"
          clearable
        >
          <el-option label="全部状态" :value="null" />
          <el-option label="启用" value="enabled" />
          <el-option label="禁用" value="disabled" />
        </el-select>

        <div class="time-filter">
          <el-button 
            v-for="timeType in timeFilterTypes" 
            :key="timeType.value"
            :type="filters.timeType === timeType.value ? 'primary' : 'default'"
            @click="filters.timeType = timeType.value"
            class="time-filter-btn"
          >
            {{ timeType.label }}
          </el-button>
        </div>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 任务列表 -->
      <div class="task-list-container">
        <el-table
          :data="taskList"
          class="task-table"
          v-loading="loading"
          style="width: 100%"
        >
          <el-table-column prop="id" label="ID" width="100" />
          
          <el-table-column prop="name" label="任务名称" width="200" />
          
          <el-table-column prop="frequency" label="执行频率" width="100" />
          
          <el-table-column prop="lastExecution" label="最近执行时间" width="180" />
          
          <el-table-column prop="nextExecution" label="下次执行时间" width="180" />
          
          <el-table-column prop="caseCount" label="关联用例" width="100">
            <template #default="scope">
              {{ scope.row.caseCount }}个
            </template>
          </el-table-column>
          
          <el-table-column prop="creator" label="创建人" width="100" />
          
          <el-table-column label="状态" width="100">
            <template #default="scope">
              <el-tag 
                :type="scope.row.status === 'enabled' ? 'success' : 'info'"
                size="small"
              >
                {{ scope.row.status === 'enabled' ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="scope">
              <el-button 
                link 
                type="primary" 
                :icon="Edit"
                @click.stop="handleEdit(scope.row)"
              >
                编辑
              </el-button>
              <el-button 
                link 
                type="danger" 
                :icon="Delete"
                @click.stop="handleDelete(scope.row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-container">
          <div class="pagination-info">
            共 {{ pagination.total }} 条记录，当前显示 1-{{ taskList.length }} 条
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

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Plus,
  Edit,
  Delete,
  Calendar,
  SuccessFilled,
  CircleCloseFilled
} from '@element-plus/icons-vue'
import { getTaskList, createTask, updateTask, deleteTask } from '../api/task'
import { getProjects } from '../api/project'

// 筛选条件
const filters = reactive({
  projectId: null,
  status: null,
  timeType: 'all'
})

// 时间筛选类型
const timeFilterTypes = [
  { label: '全部', value: 'all' },
  { label: '每日', value: 'daily' },
  { label: '每周', value: 'weekly' },
  { label: '每月', value: 'monthly' },
  { label: '创建时间', value: 'created' }
]

// 分页信息
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 24
})

// 数据列表
const taskList = ref([])
const projects = ref([])
const loading = ref(false)

// 路由实例
const router = useRouter()

// 获取项目列表
const fetchProjects = async () => {
  try {
    const response = await getProjects()
    projects.value = response.data || []
  } catch (error) {
    console.error('获取项目列表失败:', error)
    projects.value = [
      { id: 1, name: '电商支付系统' },
      { id: 2, name: '用户中心' },
      { id: 3, name: '物流管理平台' }
    ]
  }
}

// 获取任务列表
const fetchTasks = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.currentPage,
      pageSize: pagination.pageSize,
      projectId: filters.projectId,
      status: filters.status,
      timeType: filters.timeType
    }
    
    const response = await getTaskList(params)
    taskList.value = response.data || []
    pagination.total = response.total || 0
  } catch (error) {
    console.error('获取任务列表失败:', error)
    // 使用模拟数据
    taskList.value = getMockTaskData()
  } finally {
    loading.value = false
  }
}

// 模拟数据
const getMockTaskData = () => {
  return [
    {
      id: 'TS-001',
      name: '用户登录接口每日检查',
      frequency: 'daily',
      lastExecution: '2024-03-15 09:00',
      nextExecution: '2024-03-16 09:00',
      caseCount: 3,
      creator: '张工程师',
      status: 'enabled',
      createTime: '2024-02-15 10:30',
      executionTime: '09:00',
      timeout: 30,
      cases: [
        { id: 'TC-001', name: '用户登录接口测试', status: 'passed' },
        { id: 'TC-002', name: '密码验证接口测试', status: 'passed' },
        { id: 'TC-003', name: '登录状态检查测试', status: 'failed' }
      ],
      executionResults: [
        {
          id: 1,
          time: '2024-03-15 09:00',
          duration: '2分30秒',
          passed: 2,
          failed: 1,
          warning: 0
        }
      ]
    },
    {
      id: 'TS-002',
      name: '支付系统接口周检',
      frequency: 'weekly',
      lastExecution: '2024-03-14 10:00',
      nextExecution: '2024-03-21 10:00',
      caseCount: 12,
      creator: '李测试',
      status: 'enabled',
      createTime: '2024-02-20 15:30',
      executionTime: '10:00',
      timeout: 60,
      cases: [
        { id: 'TC-001', name: '支付下单接口测试', status: 'passed' },
        { id: 'TC-008', name: '订单支付状态查询接口测试', status: 'passed' },
        { id: 'TC-015', name: '支付退款接口测试', status: 'failed' }
      ],
      executionResults: [
        {
          id: 1,
          time: '2024-03-14 10:00',
          duration: '3分20秒',
          passed: 10,
          failed: 1,
          warning: 1
        },
        {
          id: 2,
          time: '2024-03-07 10:00',
          duration: '3分05秒',
          passed: 11,
          failed: 0,
          warning: 1
        }
      ]
    },
    {
      id: 'TS-003',
      name: '订单系统完整性测试',
      frequency: 'monthly',
      lastExecution: '2024-03-01 08:30',
      nextExecution: '2024-04-01 08:30',
      caseCount: 25,
      creator: '王工程师',
      status: 'disabled',
      createTime: '2024-01-15 14:20',
      executionTime: '08:30',
      timeout: 120,
      cases: [],
      executionResults: []
    }
  ]
}

// 获取频率文本
const getFrequencyText = (frequency) => {
  const frequencyMap = {
    'daily': '每日执行',
    'weekly': '每周执行',
    'monthly': '每月执行'
  }
  return frequencyMap[frequency] || frequency
}


// 编辑任务
const handleEdit = (row) => {
  ElMessage.info(`编辑任务：${row.name}`)
}

// 删除任务
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除任务"${row.name}"吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await deleteTask(row.id)
    ElMessage.success('删除成功')
    fetchTasks()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败，请稍后重试')
    }
  }
}

// 显示创建对话框
const showCreateDialog = () => {
  // 跳转到创建任务页面
  router.push('/tasks/create')
}


// 分页大小改变
const handleSizeChange = (size) => {
  pagination.pageSize = size
  fetchTasks()
}

// 当前页改变
const handlePageChange = (page) => {
  pagination.currentPage = page
  fetchTasks()
}

// 组件挂载时加载数据
onMounted(() => {
  fetchProjects()
  fetchTasks()
})
</script>

<style scoped>
.tasks-container {
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

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.filter-section {
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
  width: 150px;
}

.time-filter {
  display: flex;
  gap: 8px;
}

.time-filter-btn {
  padding: 8px 16px;
}

.main-content {
  display: flex;
  gap: 20px;
}

.task-list-container {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.task-table {
  font-size: 14px;
}

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-top: 1px solid #e4e7ed;
}

.pagination-info {
  font-size: 14px;
  color: #606266;
}

.task-detail-panel {
  width: 400px;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.detail-header {
  padding: 20px;
  border-bottom: 1px solid #e4e7ed;
}

.detail-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.detail-content {
  padding: 20px;
}

.task-summary {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.task-summary h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.task-summary p {
  margin: 0;
  font-size: 14px;
  color: #606266;
}

.info-section {
  margin-bottom: 24px;
}

.info-section h5 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 12px;
  color: #909399;
}

.info-value {
  font-size: 14px;
  color: #606266;
}

.plan-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.plan-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.plan-label {
  font-size: 14px;
  color: #606266;
}

.plan-value {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.case-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.case-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: #f5f7fa;
  border-radius: 4px;
}

.case-status {
  font-size: 16px;
}

.case-status.success {
  color: #67c23a;
}

.case-status.failed {
  color: #f56c6c;
}

.case-name {
  font-size: 14px;
  color: #606266;
}

.view-all-btn {
  margin-top: 8px;
  padding: 0;
}

.execution-results {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.execution-item {
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
}

.execution-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.execution-status {
  font-size: 16px;
  color: #67c23a;
}

.execution-time {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.execution-duration {
  font-size: 12px;
  color: #909399;
}

.execution-stats {
  display: flex;
  gap: 12px;
}

.stat-item {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 2px;
}

.stat-item.success {
  background: #f0f9ff;
  color: #67c23a;
}

.stat-item.failed {
  background: #fef0f0;
  color: #f56c6c;
}

.stat-item.warning {
  background: #fdf6ec;
  color: #e6a23c;
}

.history-btn {
  margin-top: 8px;
  padding: 0;
}

/* 创建任务对话框样式 */
.create-dialog-content {
  padding: 20px 0;
}

.steps-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32px;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.step-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  background: #409eff;
  color: white;
}

.step-item:not(.active) .step-circle {
  background: #e4e7ed;
  color: #909399;
}

.step-line {
  width: 60px;
  height: 2px;
  background: #409eff;
  margin: 0 16px;
}

.step-item:not(.active) + .step-line {
  background: #e4e7ed;
}

.step-content h4 {
  margin: 0 0 24px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.frequency-section {
  margin-bottom: 24px;
}

.frequency-section label {
  display: block;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 500;
  color: #606266;
}

.frequency-options {
  display: flex;
  gap: 12px;
}

.frequency-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.cycle-section {
  margin-bottom: 24px;
}

.cycle-item {
  margin-bottom: 20px;
}

.cycle-item label {
  display: block;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 500;
  color: #606266;
}

.weekday-options {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.weekday-btn {
  min-width: 60px;
}

.time-inputs {
  display: flex;
  align-items: center;
  gap: 12px;
}

.time-separator {
  color: #909399;
  font-size: 14px;
}

.advanced-section {
  margin-bottom: 24px;
}

.advanced-section h5 {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.advanced-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.advanced-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.advanced-item label {
  font-size: 14px;
  color: #606266;
}

.notification-section h5 {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.notification-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.el-table th) {
  background: #f5f7fa;
  color: #606266;
  font-weight: 500;
}

:deep(.el-table td) {
  padding: 16px 0;
}

:deep(.el-table .current-row) {
  background: #f0f9ff;
}
</style>
