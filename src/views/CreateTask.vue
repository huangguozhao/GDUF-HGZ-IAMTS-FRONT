<template>
  <div class="create-task-page">
    <div class="page-container">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="breadcrumb">
          <span class="breadcrumb-item" @click="$router.push('/tasks')">任务安排</span>
          <span class="breadcrumb-separator">›</span>
          <span class="breadcrumb-item active">创建定时任务</span>
        </div>
        <h1 class="page-title">创建定时任务</h1>
      </div>

      <!-- 表单区域 -->
      <div class="form-container">
        <el-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          label-width="140px"
          class="task-form"
        >
            <!-- 基本信息 -->
            <div class="form-section">
              <div class="section-header">
                <h3 class="section-title">基本信息</h3>
              </div>

              <div class="form-grid">
                <el-form-item label="任务名称" prop="name" class="form-item-full">
                  <el-input
                    v-model="formData.name"
                    placeholder="请输入任务名称"
                    maxlength="100"
                    show-word-limit
                  />
                </el-form-item>

                <el-form-item label="任务描述" prop="description" class="form-item-full">
                  <el-input
                    v-model="formData.description"
                    type="textarea"
                    :rows="4"
                    placeholder="请输入任务描述"
                    maxlength="500"
                    show-word-limit
                  />
                </el-form-item>

                <el-form-item label="所属项目" prop="projectId">
                  <el-select
                    v-model="formData.projectId"
                    placeholder="请选择项目"
                    filterable
                    style="width: 100%"
                  >
                    <el-option
                      v-for="project in projects"
                      :key="project.id"
                      :label="project.name"
                      :value="project.id"
                    />
                  </el-select>
                </el-form-item>

                <el-form-item label="任务状态" prop="status">
                  <el-switch v-model="formData.status" />
                  <span class="switch-label">{{ formData.status ? '启用' : '禁用' }}</span>
                </el-form-item>
              </div>
            </div>

            <!-- 执行计划 -->
            <div class="form-section">
              <div class="section-header">
                <h3 class="section-title">执行计划</h3>
              </div>

              <!-- 执行频率 -->
              <div class="frequency-section">
                <el-form-item label="执行频率" prop="frequency">
                  <div class="frequency-options">
                    <el-button
                      v-for="freq in frequencyOptions"
                      :key="freq.value"
                      :type="formData.frequency === freq.value ? 'primary' : 'default'"
                      @click="formData.frequency = freq.value"
                      class="frequency-btn"
                    >
                      <el-icon><Calendar /></el-icon>
                      {{ freq.label }}
                    </el-button>
                  </div>
                </el-form-item>
              </div>

              <!-- 执行周期设置 -->
              <div class="cycle-section" v-if="formData.frequency === 'weekly'">
                <el-form-item label="执行日期" prop="selectedDays">
                  <div class="weekday-options">
                    <el-button
                      v-for="day in weekdays"
                      :key="day.value"
                      :type="formData.selectedDays.includes(day.value) ? 'primary' : 'default'"
                      @click="toggleDay(day.value)"
                      class="weekday-btn"
                    >
                      {{ day.label }}
                    </el-button>
                  </div>
                </el-form-item>
              </div>

              <!-- 执行时间 -->
              <div class="time-section">
                <el-form-item label="执行时间" prop="executionTime">
                  <el-time-picker
                    v-model="formData.executionTime"
                    placeholder="选择执行时间"
                    format="HH:mm"
                    value-format="HH:mm"
                  />
                </el-form-item>
              </div>
            </div>

            <!-- 高级设置 -->
            <div class="form-section">
              <div class="section-header">
                <h3 class="section-title">高级设置</h3>
              </div>

              <div class="form-grid">
                <el-form-item label="超时时间(分钟)" prop="timeout">
                  <el-input-number
                    v-model="formData.timeout"
                    :min="1"
                    :max="1440"
                    placeholder="执行超时时间"
                  />
                </el-form-item>

                <el-form-item label="重试次数" prop="retryCount">
                  <el-input-number
                    v-model="formData.retryCount"
                    :min="0"
                    :max="10"
                    placeholder="失败重试次数"
                  />
                </el-form-item>

                <el-form-item label="邮件通知" prop="emailNotification">
                  <el-switch v-model="formData.emailNotification" />
                  <span class="switch-label">{{ formData.emailNotification ? '开启' : '关闭' }}</span>
                </el-form-item>

                <el-form-item label="微信通知" prop="wechatNotification">
                  <el-switch v-model="formData.wechatNotification" />
                  <span class="switch-label">{{ formData.wechatNotification ? '开启' : '关闭' }}</span>
                </el-form-item>
              </div>
            </div>

            <!-- 用例选择 -->
            <div class="form-section">
              <div class="section-header">
                <h3 class="section-title">选择测试用例</h3>
                <el-button type="primary" size="small" @click="showCaseSelector = true">
                  <el-icon><Plus /></el-icon>
                  添加用例
                </el-button>
              </div>

              <div v-if="selectedCases.length > 0" class="selected-cases">
                <div class="case-item" v-for="caseItem in selectedCases" :key="caseItem.id">
                  <div class="case-info">
                    <span class="case-name">{{ caseItem.name }}</span>
                    <span class="case-project">{{ caseItem.projectName }}</span>
                  </div>
                  <el-button type="danger" size="small" text @click="removeCase(caseItem.id)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
              <div v-else class="empty-cases">
                <div class="empty-icon">📋</div>
                <div class="empty-text">尚未选择测试用例</div>
                <el-button type="primary" size="small" @click="showCaseSelector = true">
                  立即添加
                </el-button>
              </div>
            </div>
          </el-form>

          <!-- 操作按钮 -->
          <div class="form-actions">
            <el-button @click="$router.go(-1)">取消</el-button>
            <el-button type="primary" @click="handleSubmit" :loading="submitting">
              创建任务
            </el-button>
          </div>

          <!-- 用例选择对话框 (懒加载) -->
          <CaseSelectorDialog
            v-model:visible="showCaseSelector"
            :project-id="formData.projectId"
            :selected-cases="selectedCases"
            @update:selected-cases="selectedCases = $event"
            @cancel="showCaseSelector = false"
          />
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Plus, Delete, Calendar, Search } from '@element-plus/icons-vue'
import { createTask } from '../api/task'
import { getProjects } from '../api/project'

// 懒加载用例选择对话框组件
const CaseSelectorDialog = defineAsyncComponent(() =>
  import('../components/tasks/CaseSelectorDialog.vue')
)

const router = useRouter()
const formRef = ref(null)
const submitting = ref(false)
const showCaseSelector = ref(false)
const projects = ref([])
const selectedCases = ref([])

// 表单数据
const formData = reactive({
  name: '',
  description: '',
  projectId: null,
  status: true,
  frequency: 'weekly',
  selectedDays: ['thursday'],
  executionTime: '10:00',
  timeout: 60,
  retryCount: 3,
  emailNotification: true,
  wechatNotification: false
})

// 表单验证规则
const formRules = {
  name: [
    { required: true, message: '请输入任务名称', trigger: 'blur' },
    { min: 1, max: 100, message: '任务名称长度在1-100个字符', trigger: 'blur' }
  ],
  description: [
    { max: 500, message: '描述长度不能超过500个字符', trigger: 'blur' }
  ],
  projectId: [
    { required: true, message: '请选择所属项目', trigger: 'change' }
  ],
  frequency: [
    { required: true, message: '请选择执行频率', trigger: 'change' }
  ],
  executionTime: [
    { required: true, message: '请选择执行时间', trigger: 'change' }
  ]
}

// 频率选项
const frequencyOptions = [
  { label: '每日', value: 'daily' },
  { label: '每周', value: 'weekly' },
  { label: '每月', value: 'monthly' }
]

// 星期选项
const weekdays = [
  { label: '周一', value: 'monday' },
  { label: '周二', value: 'tuesday' },
  { label: '周三', value: 'wednesday' },
  { label: '周四', value: 'thursday' },
  { label: '周五', value: 'friday' },
  { label: '周六', value: 'saturday' },
  { label: '周日', value: 'sunday' }
]

// 计算属性

// 切换日期选择
const toggleDay = (day) => {
  const index = formData.selectedDays.indexOf(day)
  if (index > -1) {
    formData.selectedDays.splice(index, 1)
  } else {
    formData.selectedDays.push(day)
  }
}

// 移除用例
const removeCase = (caseId) => {
  const index = selectedCases.value.findIndex(item => item.id === caseId)
  if (index > -1) {
    selectedCases.value.splice(index, 1)
  }
}

// 加载数据
const loadData = async () => {
  try {
    // 加载项目列表（分页格式，需要从 items 获取）
    const projectResponse = await getProjects({ pageSize: 100 })
    const projectList = projectResponse.data?.items || projectResponse.data || []
    // 转换项目数据，统一 id 字段名
    projects.value = projectList.map(project => ({
      id: project.projectId || project.project_id,
      name: project.name,
      project_id: project.projectId || project.project_id
    }))
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败')
  }
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
  } catch (error) {
    ElMessage.warning('请填写必填项')
    return
  }

  if (selectedCases.value.length === 0) {
    ElMessage.warning('请至少选择一个测试用例')
    return
  }

  // 验证执行时间
  if (!formData.executionTime) {
    ElMessage.warning('请选择执行时间')
    return
  }

  // 验证每周执行时的日期选择
  if (formData.frequency === 'weekly' && formData.selectedDays.length === 0) {
    ElMessage.warning('请选择至少一个执行日期')
    return
  }

  try {
    submitting.value = true

    console.log('=== 创建定时任务 ===')
    console.log('表单数据:', formData)
    console.log('选中的用例:', selectedCases.value)

    // 解析执行时间
    let dailyHour = null
    let dailyMinute = null
    if (formData.executionTime) {
      const timeParts = formData.executionTime.split(':')
      dailyHour = parseInt(timeParts[0])
      dailyMinute = parseInt(timeParts[1])
      console.log('解析时间:', dailyHour, dailyMinute)
    }

    // 转换星期格式 (前端: ['monday', 'tuesday'], 后端: '1,2')
    const weekDayMap = {
      'monday': '1',
      'tuesday': '2',
      'wednesday': '3',
      'thursday': '4',
      'friday': '5',
      'saturday': '6',
      'sunday': '7'
    }
    const weeklyDays = formData.frequency === 'weekly' && formData.selectedDays.length > 0
      ? formData.selectedDays.map(day => weekDayMap[day]).join(',')
      : null
    console.log('每周日期:', weeklyDays)

    // 转换月度日期
    const monthlyDay = formData.frequency === 'monthly' ? 1 : null

    // 构建后端需要的请求数据
    const submitData = {
      taskName: formData.name,
      description: formData.description,
      taskType: 'single_case', // 单个用例类型
      targetId: selectedCases.value[0]?.id || null, // 用例ID
      targetName: selectedCases.value[0]?.name || '未命名用例', // 用例名称
      triggerType: formData.frequency,
      dailyHour: dailyHour,
      dailyMinute: dailyMinute,
      weeklyDays: weeklyDays,
      monthlyDay: monthlyDay,
      executionEnvironment: 'test', // 默认测试环境
      timeoutSeconds: formData.timeout ? formData.timeout * 60 : 3600, // 分钟转秒
      retryEnabled: formData.retryCount > 0,
      maxRetryAttempts: formData.retryCount,
      notifyOnSuccess: formData.emailNotification,
      notifyOnFailure: formData.emailNotification,
      notificationRecipients: formData.emailNotification ? 'admin@example.com' : null
    }

    console.log('提交数据:', submitData)

    const response = await createTask(submitData)

    console.log('响应结果:', response)

    if (response.code === 200) {
      ElMessage.success('创建成功')
      router.push('/tasks')
    } else if (response.code === 403) {
      ElMessage.error('没有权限创建任务，请联系管理员分配 task:create 权限')
    } else if (response.code === 401) {
      ElMessage.error('登录已过期，请重新登录')
      router.push('/login')
    } else {
      ElMessage.error(response.msg || '创建失败')
    }
  } catch (error) {
    console.error('创建任务失败:', error)
    // 详细处理不同类型的错误
    if (error.response) {
      // 服务器返回了错误响应
      const status = error.response.status
      const data = error.response.data
      if (status === 403) {
        ElMessage.error('没有权限创建任务，请联系管理员')
      } else if (status === 401) {
        ElMessage.error('登录已过期，请重新登录')
        router.push('/login')
      } else if (status === 500) {
        ElMessage.error('服务器错误: ' + (data?.msg || '请稍后重试'))
      } else {
        ElMessage.error(data?.msg || '创建失败，请检查网络连接')
      }
    } else if (error.request) {
      // 网络错误
      ElMessage.error('网络错误，请检查后端服务是否已启动')
    } else {
      ElMessage.error(error?.msg || '创建失败，请检查网络连接或后端服务')
    }
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.create-task-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.page-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  margin-bottom: 24px;
}

.breadcrumb {
  margin-bottom: 8px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
}

.breadcrumb-item.active {
  color: #409eff;
  font-weight: 500;
}

.breadcrumb-separator {
  margin: 0 8px;
  color: #ccc;
}

.page-title {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin: 0;
}

.form-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 24px;
  margin-bottom: 24px;
}

.form-section {
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-item-full {
  grid-column: 1 / -1;
}

.frequency-section,
.cycle-section,
.time-section {
  margin-bottom: 20px;
}

.frequency-options,
.weekday-options {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.frequency-btn,
.weekday-btn {
  min-width: 80px;
}

.time-inputs {
  display: flex;
  align-items: center;
  gap: 12px;
}

.time-separator {
  color: #909399;
}

.switch-label {
  margin-left: 8px;
  color: #606266;
}

.selected-cases {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.case-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  background-color: #fafafa;
}

.case-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.case-name {
  font-weight: 500;
  color: #303133;
}

.case-project {
  font-size: 12px;
  color: #909399;
}

.empty-cases {
  text-align: center;
  padding: 40px 20px;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  background-color: #fafafa;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-text {
  color: #909399;
  margin-bottom: 16px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.case-selector {
  max-height: 500px;
  overflow-y: auto;
}

.selector-header {
  margin-bottom: 16px;
}

.case-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .frequency-options,
  .weekday-options {
    justify-content: center;
  }

  .time-inputs {
    flex-direction: column;
    gap: 8px;
  }

  .case-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
