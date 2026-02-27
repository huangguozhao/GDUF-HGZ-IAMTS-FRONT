<template>
  <transition name="page-fade" appear>
    <Container type="inline-size" max-width="1400px" padding="20px" class="home-container">
      <div class="home-page">
        <!-- 欢迎区域 -->
        <transition name="welcome-slide" appear>
          <WelcomeSection />
        </transition>

        <!-- 指标卡片区域 -->
        <transition name="summary-fade" appear>
          <div class="summary-section">
            <!-- 通知提醒区域 -->
            <NotificationSection 
              :pending-tasks="pendingTasksCount" 
              :urgent-tasks="urgentTasksCount"
              @view-tasks="handleViewTasks" />
            <MetricsGrid :metrics="metricsData" :loading="loadingMetrics" :show-chart="false" />
          </div>
        </transition>

        <!-- 主内容区域 -->
        <transition name="content-grid-fade" appear>
          <ContentSection
            :projects="recentProjects"
            :time-range="timeRange"
            :loading="loadingProjects"
            @view-all-projects="handleViewAllProjects"
            @project-action="handleProjectAction"
            @time-range-change="handleTimeRangeChange"
            @create-project="handleCreateProject"
          />
        </transition>

        <!-- 底部区域 -->
        <transition name="bottom-grid-fade" appear>
          <BottomSection
            :resources="resourceData"
            :activities="recentActivities"
            :loading="loadingActivities"
            @view-more-activities="handleViewMoreActivities"
          />
        </transition>
      </div>
    </Container>
  </transition>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Container from '@/components/ui/Container.vue'
import WelcomeSection from '@/components/home/WelcomeSection.vue'
import MetricsGrid from '@/components/home/MetricsGrid.vue'
import NotificationSection from '@/components/home/NotificationSection.vue'
import ContentSection from '@/components/home/ContentSection.vue'
import BottomSection from '@/components/home/BottomSection.vue'
import toast from '@/utils/toast'
import { getDashboardSummary, getRecentProjects } from '@/api/home'

const router = useRouter()
const timeRange = ref('7days')
const loading = ref(false)
const loadingProjects = ref(true)
const loadingResources = ref(true)
const loadingActivities = ref(true)
const loadingMetrics = ref(true)

// Dashboard数据
const dashboardData = ref(null)

// 指标数据 - 从真实API获取
const metricsData = computed(() => {
  if (!dashboardData.value?.execution_stats) {
    return loadingMetrics.value ? [] : [
      {
        title: '总用例数',
        value: '0',
        change: '+0',
        changeUnit: '',
        subtitle: '暂无数据',
        showChart: false
      },
      {
        title: '测试通过率',
        value: '0%',
        change: '+0',
        changeUnit: '%',
        subtitle: '暂无数据',
        showChart: false
      },
      {
        title: '活跃项目',
        value: '0',
        change: '+0',
        changeUnit: '',
        subtitle: '暂无数据',
        showChart: false
      },
      {
        title: '接口覆盖率',
        value: '0%',
        change: '+0',
        changeUnit: '%',
        subtitle: '暂无数据',
        showChart: false
      }
    ]
  }

  const stats = dashboardData.value.execution_stats
  return [
    {
      title: '总用例数',
      value: String(stats.cases_created || 0),
      change: stats.change_percent ? String(stats.change_percent) : '+0',
      changeUnit: '',
      subtitle: stats.trend === 'up' ? '较上周增长' : (stats.trend === 'down' ? '较上周下降' : '与上周持平'),
      showChart: false
    },
    {
      title: '测试通过率',
      value: stats.success_rate ? `${stats.success_rate}%` : '0%',
      change: stats.change_percent ? String(stats.change_percent) : '+0',
      changeUnit: '%',
      subtitle: stats.trend === 'up' ? '质量持续提升' : (stats.trend === 'down' ? '质量有所下降' : '质量保持稳定'),
      showChart: false
    },
    {
      title: '活跃项目',
      value: String(dashboardData.value.project_stats?.length || dashboardData.value.system_status?.active_projects || 0),
      change: '+0',
      changeUnit: '',
      subtitle: '项目稳定运行',
      showChart: false
    },
    {
      title: '总执行次数',
      value: String(stats.total_executions || 0),
      change: stats.change_percent ? String(stats.change_percent) : '+0',
      changeUnit: '',
      subtitle: stats.trend === 'up' ? '执行次数增加' : (stats.trend === 'down' ? '执行次数减少' : '执行次数稳定'),
      showChart: false
    }
  ]
})

// 最近编辑的项目数据 - 从真实API获取
const recentProjects = computed(() => {
  if (!dashboardData.value?.project_stats) {
    return loadingProjects.value ? [] : []
  }

  return dashboardData.value.project_stats.slice(0, 6).map((project, index) => ({
    id: project.project_id,
    name: project.project_name || `项目${project.project_id}`,
    description: `执行次数: ${project.executions || 0}，成功率: ${project.success_rate || 0}%`,
    updateTime: new Date().toISOString().split('T')[0],
    coverage: project.success_rate || 0,
    tags: [],
    owner: null
  }))
})

// 处理查看全部项目
const handleViewAllProjects = () => {
  router.push('/projects')
}

// 处理项目操作
const handleProjectAction = ({ command, project }) => {
  console.log('项目操作:', command, project)
  if (command === 'view') {
    router.push(`/projects/${project.id}`)
  }
}

// 处理创建项目
const handleCreateProject = () => {
  router.push('/projects/create')
}

// 处理时间范围变化
const handleTimeRangeChange = async (value) => {
  timeRange.value = value
  await loadDashboardData()
}

// 系统资源数据
// 根据使用率获取颜色
const getResourceColor = (percent) => {
  if (percent >= 90) return '#f56c6c'  // 红色 - 危险
  if (percent >= 70) return '#e6a23c'  // 橙色 - 警告
  return '#67c23a'  // 绿色 - 正常
}

const resourceData = computed(() => {
  if (!dashboardData.value?.system_status) {
    return loadingResources.value ? [] : [
      { label: 'CPU使用率', value: '0%', percent: 0, color: 'linear-gradient(90deg, #67c23a 0%, #f0f0f0 0%)' },
      { label: '内存使用率', value: '0%', percent: 0, color: 'linear-gradient(90deg, #67c23a 0%, #f0f0f0 0%)' },
      { label: '磁盘空间', value: '0%', percent: 0, color: 'linear-gradient(90deg, #67c23a 0%, #f0f0f0 0%)' }
    ]
  }

  const system = dashboardData.value.system_status
  const cpuPercent = system.cpu_usage || 0
  const memoryPercent = system.memory_usage || 0
  const diskPercent = system.disk_usage || 0

  return [
    { label: 'CPU使用率', value: `${cpuPercent}%`, percent: cpuPercent, color: `linear-gradient(90deg, ${getResourceColor(cpuPercent)} ${cpuPercent}%, #f0f0f0 ${cpuPercent}%)` },
    { label: '内存使用率', value: `${memoryPercent}%`, percent: memoryPercent, color: `linear-gradient(90deg, ${getResourceColor(memoryPercent)} ${memoryPercent}%, #f0f0f0 ${memoryPercent}%)` },
    { label: '磁盘空间', value: `${diskPercent}%`, percent: diskPercent, color: `linear-gradient(90deg, ${getResourceColor(diskPercent)} ${diskPercent}%, #f0f0f0 ${diskPercent}%)` }
  ]
})

// 待处理任务数量 - 从真实API获取
const pendingTasksCount = computed(() => {
  const tasks = dashboardData.value?.pending_tasks
  if (!tasks || !Array.isArray(tasks)) {
    return 0
  }
  return tasks.length
})

// 高优先级问题数量 - 从真实API获取
// priority: 1-紧急, 2-高, 3-中, 4-低
const urgentTasksCount = computed(() => {
  const tasks = dashboardData.value?.pending_tasks
  if (!tasks || !Array.isArray(tasks)) {
    return 0
  }
  // 高优先级: priority <= 2 (紧急或高优先级)
  return tasks.filter(task => {
    const priority = task.priority
    if (typeof priority === 'number') {
      return priority <= 2
    }
    if (typeof priority === 'string') {
      const p = priority.toLowerCase()
      return p === 'high' || p === 'urgent' || p === 'critical' || p === 'p1' || p === 'p2'
    }
    return false
  }).length
})

// 最近活动数据 - 从真实API获取
const recentActivities = computed(() => {
  if (!dashboardData.value?.recent_activity) {
    return loadingActivities.value ? [] : []
  }

  return dashboardData.value.recent_activity.slice(0, 5).map(activity => ({
    id: activity.activityId || Math.random(),
    time: activity.timestamp || '',
    title: activity.description || activity.type || '未知活动',
    desc: activity.targetName || '',
    origin: activity.type || '系统'
  }))
})

const handleViewMoreActivities = () => {
  router.push('/activities')
}

// 加载Dashboard数据
const loadDashboardData = async () => {
  try {
    const timeRangeMap = {
      '7days': '7d',
      '30days': '30d',
      '90days': '90d'
    }

    const response = await getDashboardSummary({
      timeRange: timeRangeMap[timeRange.value] || '7d',
      includeRecentActivity: true,
      includePendingTasks: true,
      includeQuickActions: true
    })

    console.log('Home - Dashboard API Response:', response)
    
    // 后端返回格式: { code: 1, msg: "success", data: { ... } }
    // 需要从 response.data 中获取实际数据
    const actualData = response.data?.data || response.data
    console.log('Home - Dashboard actual data:', actualData)

    if (actualData) {
      dashboardData.value = actualData
    }
  } catch (error) {
    console.error('加载Dashboard数据失败:', error)
  }
}

// 加载最近项目数据（备用方案）
const loadRecentProjects = async () => {
  try {
    const response = await getRecentProjects({ page: 1, pageSize: 6 })
    console.log('Home - Projects API Response:', response)
    
    // 后端返回格式: { code: 1, msg: "success", data: { items: [...] } }
    const actualData = response.data?.data || response.data
    
    if (actualData && actualData.items) {
      // 如果dashboard没有项目数据，使用这个
      if (!dashboardData.value?.project_stats) {
        dashboardData.value = dashboardData.value || {}
        dashboardData.value.project_stats = actualData.items.map(item => ({
          project_id: item.project_id || item.id,
          project_name: item.project_name || item.name,
          executions: 0,
          success_rate: 0
        }))
      }
    }
  } catch (error) {
    console.error('加载最近项目失败:', error)
  }
}

// 页面加载时获取数据
onMounted(async () => {
  loading.value = true

  try {
    // 并行加载数据
    await Promise.all([
      loadDashboardData(),
      loadRecentProjects()
    ])

    // 更新加载状态
    loadingMetrics.value = false
    loadingProjects.value = false
    loadingResources.value = false
    loadingActivities.value = false
  } catch (error) {
    console.error('数据加载失败:', error)
    toast.error('数据加载失败，请刷新页面重试')
  } finally {
    loading.value = false
  }
})

const handleViewTasks = () => {
  router.push('/tasks')
}
</script>

<style scoped>
.home-page {
  width: 100%;
  min-height: 100vh;
}

.summary-section {
  margin-bottom: 32px;
}

/* 容器查询自适应 */
@container (max-width: 1024px) {
  .summary-section {
    margin-bottom: 28px;
  }
}

@container (max-width: 768px) {
  .summary-section {
    margin-bottom: 24px;
  }
}

@container (max-width: 480px) {
  .summary-section {
    margin-bottom: 20px;
  }
}

/* 横屏优化 */
@container (orientation: landscape) and (max-height: 500px) {
  .home-page {
    padding-top: 8px;
    padding-bottom: 8px;
  }

  .summary-section {
    margin-bottom: 16px;
  }
}



/* ============================================
   页面进入动画
   ============================================ */

/* 页面整体淡入 */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
}

/* 欢迎区域滑入 */
.welcome-slide-enter-active,
.welcome-slide-leave-active {
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.welcome-slide-enter-from {
  opacity: 0;
  transform: translateY(-30px);
}

.welcome-slide-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

/* 摘要区域淡入 */
.summary-fade-enter-active,
.summary-fade-leave-active {
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.summary-fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.summary-fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

</style>
