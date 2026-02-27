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
          placeholder="所属项目" 
          class="filter-item"
          clearable
          @change="handleFilterChange"
        >
          <el-option label="全部项目" :value="null" />
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
          @change="handleFilterChange"
        >
          <el-option label="全部状态" :value="null" />
          <el-option label="启用" value="enabled" />
          <el-option label="禁用" value="disabled" />
        </el-select>

        <div class="frequency-filter">
          <span class="filter-label">执行频率：</span>
          <el-button 
            v-for="freq in frequencyTypes" 
            :key="freq.value"
            :type="filters.frequency === freq.value ? 'primary' : 'default'"
            @click="filters.frequency = freq.value; handleFilterChange()"
            class="frequency-btn"
          >
            {{ freq.label }}
          </el-button>
        </div>

        <el-date-picker
          v-model="filters.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          class="date-picker"
          value-format="YYYY-MM-DD"
          @change="handleFilterChange"
        />
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 任务列表 -->
      <div class="task-list-container">
        <!-- 加载状态 -->
        <TableSkeleton
          v-if="loading"
          :columns="tableColumns"
          :row-count="10"
          :action-count="2"
          show-pagination
        />
        <!-- 实际表格 -->
        <el-table
          v-else
          :data="taskList"
          class="task-table"
          style="width: 100%"
        >
          <el-table-column prop="id" label="ID" width="80" />
          
          <el-table-column prop="name" label="任务名称" min-width="180">
            <template #default="scope">
              <div class="task-name-cell">
                <span class="task-name">{{ scope.row.name }}</span>
                <span v-if="scope.row.targetName" class="task-target">{{ scope.row.targetName }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="taskType" label="任务类型" width="100">
            <template #default="scope">
              <el-tag size="small" :type="getTaskTypeTagType(scope.row.taskType)">
                {{ getTaskTypeText(scope.row.taskType) }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column prop="frequency" label="执行频率" width="100">
            <template #default="scope">
              {{ getFrequencyText(scope.row.frequency) }}
            </template>
          </el-table-column>
          
          <el-table-column prop="lastExecution" label="最近执行" width="160">
            <template #default="scope">
              <div class="execution-time-cell">
                <span>{{ scope.row.lastExecution }}</span>
                <el-tag v-if="scope.row.lastExecutionStatus" size="small" :type="getExecutionStatusType(scope.row.lastExecutionStatus)">
                  {{ getExecutionStatusText(scope.row.lastExecutionStatus) }}
                </el-tag>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column prop="nextExecution" label="下次执行" width="160" />
          
          <el-table-column prop="totalExecutions" label="执行次数" width="90">
            <template #default="scope">
              <div class="execution-count-cell">
                <span class="success-count">{{ scope.row.successfulExecutions || 0 }}</span> /
                <span class="total-count">{{ scope.row.totalExecutions || 0 }}</span>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column prop="executionEnvironment" label="执行环境" width="90">
            <template #default="scope">
              <el-tag v-if="scope.row.executionEnvironment" size="small" type="info">
                {{ scope.row.executionEnvironment }}
              </el-tag>
              <span v-else>-</span>
            </template>
          </el-table-column>
          
          <el-table-column label="状态" width="90">
            <template #default="scope">
              <el-tag 
                :type="scope.row.status === 'enabled' ? 'success' : 'info'"
                size="small"
              >
                {{ scope.row.status === 'enabled' ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="scope">
              <el-button 
                link 
                type="primary" 
                :icon="scope.row.status === 'enabled' ? VideoPause : VideoPlay"
                @click.stop="handleToggleStatus(scope.row)"
              >
                {{ scope.row.status === 'enabled' ? '禁用' : '启用' }}
              </el-button>
              <el-button 
                link 
                type="success" 
                :icon="Refresh"
                @click.stop="handleExecute(scope.row)"
              >
                执行
              </el-button>
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
  CircleCloseFilled,
  VideoPlay,
  VideoPause,
  Refresh
} from '@element-plus/icons-vue'
import { getTaskList, createTask, updateTask, deleteTask, enableTask, disableTask, executeTask } from '../api/task'
import { getProjects } from '../api/project'
import { TableSkeleton } from '../components/ui/skeletons'

// 筛选条件
const filters = reactive({
  projectId: null,
  status: null,
  frequency: 'all',
  dateRange: null
})

// 执行频率筛选类型
const frequencyTypes = [
  { label: '全部', value: 'all' },
  { label: '每日', value: 'daily' },
  { label: '每周', value: 'weekly' },
  { label: '每月', value: 'monthly' }
]

// 筛选变化处理
const handleFilterChange = () => {
  pagination.currentPage = 1
  fetchTasks()
}

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

// 表格列配置（用于骨架屏）
const tableColumns = [
  { key: 'id', type: 'text', width: '10%', contentWidth: 60 },
  { key: 'name', type: 'text', width: '20%', contentWidth: 150 },
  { key: 'frequency', type: 'text', width: '10%', contentWidth: 60 },
  { key: 'lastExecution', type: 'text', width: '18%', contentWidth: 120 },
  { key: 'nextExecution', type: 'text', width: '18%', contentWidth: 120 },
  { key: 'caseCount', type: 'text', width: '10%', contentWidth: 50 },
  { key: 'creator', type: 'text', width: '10%', contentWidth: 80 },
  { key: 'status', type: 'tag', width: '10%', contentWidth: 60 },
  { key: 'actions', type: 'actions', width: '14%', buttonCount: 3, buttonWidth: 50 }
]

// 路由实例
const router = useRouter()

// 获取项目列表
const fetchProjects = async () => {
  try {
    const response = await getProjects({ page: 1, pageSize: 100 })
    // 处理后端返回的分页格式：{ total, items, page, pageSize }
    if (response.data && response.data.items) {
      projects.value = response.data.items.map(item => ({
        id: item.projectId || item.id,
        name: item.projectName || item.name
      }))
    } else if (Array.isArray(response.data)) {
      projects.value = response.data.map(item => ({
        id: item.projectId || item.id,
        name: item.projectName || item.name
      }))
    } else {
      projects.value = []
    }
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
      page_size: pagination.pageSize,
      target_id: filters.projectId,
      is_enabled: filters.status === 'enabled' ? true : (filters.status === 'disabled' ? false : null),
      trigger_type: filters.frequency === 'all' ? null : filters.frequency
    }

    // 添加日期范围筛选参数
    if (filters.dateRange && filters.dateRange.length === 2) {
      params.start_date = filters.dateRange[0]
      params.end_date = filters.dateRange[1]
    }

    const response = await getTaskList(params)

    // 处理后端返回的数据结构
    if (response.data && response.data.items) {
      // 分页格式: { total, items, page, pageSize }
      taskList.value = response.data.items.map(item => transformBackendData(item))
      pagination.total = response.data.total || 0
    } else if (response.data && response.data.list) {
      // 兼容 list 格式
      taskList.value = response.data.list.map(item => transformBackendData(item))
      pagination.total = response.data.total || 0
    } else if (Array.isArray(response.data)) {
      taskList.value = response.data.map(item => transformBackendData(item))
      pagination.total = response.data.length || 0
    }
  } catch (error) {
    console.error('获取任务列表失败:', error)
    // 使用模拟数据
    taskList.value = getMockTaskData()
  } finally {
    loading.value = false
  }
}

// 转换后端数据为前端需要的格式
const transformBackendData = (item) => {
  return {
    id: item.task_id,
    name: item.task_name,
    description: item.description,
    taskType: item.task_type,
    targetId: item.target_id,
    targetName: item.target_name || '',
    frequency: item.trigger_type,
    lastExecution: item.last_execution_time ? formatDateTime(item.last_execution_time) : '-',
    nextExecution: item.next_trigger_time ? formatDateTime(item.next_trigger_time) : '-',
    caseCount: item.total_executions || 0,
    creator: item.created_by || '-',
    status: item.is_enabled ? 'enabled' : 'disabled',
    createTime: item.created_at ? formatDateTime(item.created_at) : '-',
    executionTime: item.daily_hour !== undefined ?
      `${String(item.daily_hour).padStart(2, '0')}:${String(item.daily_minute || 0).padStart(2, '0')}` : '-',
    timeout: item.timeout_seconds ? Math.ceil(item.timeout_seconds / 60) : 60,
    lastExecutionStatus: item.last_execution_status,
    successRate: item.success_rate || 0,
    totalExecutions: item.total_executions || 0,
    successfulExecutions: item.successful_executions || 0,
    failedExecutions: item.failed_executions || 0,
    weeklyDays: item.weekly_days,
    monthlyDay: item.monthly_day,
    triggerType: item.trigger_type,
    executionEnvironment: item.execution_environment,
    cronExpression: item.cron_expression,
    retryEnabled: item.retry_enabled,
    maxRetryAttempts: item.max_retry_attempts,
    notifyOnSuccess: item.notify_on_success,
    notifyOnFailure: item.notify_on_failure,
    notificationRecipients: item.notification_recipients,
    isEnabled: item.is_enabled
  }
}

// 格式化日期时间
const formatDateTime = (dateTime) => {
  if (!dateTime) return '-'
  const date = new Date(dateTime)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
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
    'monthly': '每月执行',
    'cron': 'Cron表达式',
    'simple': '简单重复',
    'once': '一次性执行'
  }
  return frequencyMap[frequency] || frequency || '-'
}

// 获取任务类型文本
const getTaskTypeText = (taskType) => {
  const typeMap = {
    'single_case': '单个用例',
    'module': '模块',
    'project': '项目',
    'test_suite': '测试套件',
    'api': 'API'
  }
  return typeMap[taskType] || taskType || '-'
}

// 获取任务类型标签类型
const getTaskTypeTagType = (taskType) => {
  const typeMap = {
    'single_case': '',
    'module': 'success',
    'project': 'warning',
    'test_suite': 'danger',
    'api': 'info'
  }
  return typeMap[taskType] || ''
}

// 获取执行状态类型
const getExecutionStatusType = (status) => {
  const statusMap = {
    'success': 'success',
    'failed': 'danger',
    'running': 'warning',
    'skipped': 'info'
  }
  return statusMap[status] || 'info'
}

// 获取执行状态文本
const getExecutionStatusText = (status) => {
  const statusMap = {
    'success': '成功',
    'failed': '失败',
    'running': '运行中',
    'skipped': '已跳过'
  }
  return statusMap[status] || status
}


// 编辑任务
const handleEdit = (row) => {
  // 跳转到编辑页面或打开编辑对话框
  router.push(`/tasks/${row.id}`)
}

// 切换任务状态（启用/禁用）
const handleToggleStatus = async (row) => {
  try {
    const action = row.status === 'enabled' ? '禁用' : '启用'
    await ElMessageBox.confirm(
      `确定要${action}任务"${row.name}"吗？`,
      `${action}确认`,
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    if (row.status === 'enabled') {
      await disableTask(row.id)
      ElMessage.success('任务已禁用')
    } else {
      await enableTask(row.id)
      ElMessage.success('任务已启用')
    }
    fetchTasks()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('操作失败:', error)
      // 检查是否是权限问题
      if (error.response?.data?.msg?.includes('permission') || error.response?.data?.msg?.includes('权限')) {
        ElMessage.error('没有操作权限，请联系管理员')
      } else {
        ElMessage.error('操作失败，请稍后重试')
      }
    }
  }
}

// 立即执行任务
const handleExecute = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要立即执行任务"${row.name}"吗？`,
      '执行确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }
    )

    await executeTask(row.id)
    ElMessage.success('任务已提交执行')
    fetchTasks()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('执行失败:', error)
      if (error.response?.data?.msg?.includes('permission') || error.response?.data?.msg?.includes('权限')) {
        ElMessage.error('没有执行权限，请联系管理员')
      } else {
        ElMessage.error('执行失败，请稍后重试')
      }
    }
  }
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
      if (error.response?.data?.msg?.includes('permission') || error.response?.data?.msg?.includes('权限')) {
        ElMessage.error('没有删除权限，请联系管理员')
      } else {
        ElMessage.error('删除失败，请稍后重试')
      }
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

.filter-label {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
}

.frequency-filter {
  display: flex;
  align-items: center;
  gap: 8px;
}

.frequency-btn {
  padding: 8px 16px;
}

.date-picker {
  width: 260px;
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

.task-name-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.task-name {
  font-weight: 500;
  color: #303133;
}

.task-target {
  font-size: 12px;
  color: #909399;
}

.execution-time-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.execution-count-cell {
  font-size: 13px;
}

.success-count {
  color: #67c23a;
  font-weight: 500;
}

.total-count {
  color: #606266;
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
