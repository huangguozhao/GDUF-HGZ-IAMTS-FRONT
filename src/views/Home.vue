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
            <NotificationSection @view-tasks="handleViewTasks" />
            <MetricsGrid :metrics="metricsData" />
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
            @view-more-activities="handleViewMoreActivities"
          />
        </transition>
      </div>
    </Container>
  </transition>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Container from '@/components/ui/Container.vue'
import WelcomeSection from '@/components/home/WelcomeSection.vue'
import MetricsGrid from '@/components/home/MetricsGrid.vue'
import NotificationSection from '@/components/home/NotificationSection.vue'
import ContentSection from '@/components/home/ContentSection.vue'
import BottomSection from '@/components/home/BottomSection.vue'
import toast from '@/utils/toast'

const timeRange = ref('7days')
const loading = ref(false)
const loadingProjects = ref(true)
const loadingResources = ref(true)
const loadingActivities = ref(true)

// 指标数据
const metricsData = computed(() => [
  {
    title: '总用例数',
    value: '587',
    change: '+12',
    changeUnit: '',
    subtitle: '较上周增长',
    showChart: false
  },
  {
    title: '测试通过率',
    value: '92.7%',
    change: '+1.5',
    changeUnit: '%',
    subtitle: '质量持续提升',
    showChart: false
  },
  {
    title: '活跃项目',
    value: '14',
    change: '+0',
    changeUnit: '',
    subtitle: '项目稳定运行',
    showChart: false
  },
  {
    title: '接口覆盖率',
    value: '86.3%',
    change: '+0.8',
    changeUnit: '%',
    subtitle: '覆盖率稳步上升',
    showChart: false
  }
])

// 最近编辑的项目数据
const recentProjects = computed(() => [
  {
    id: 1,
    name: '电商支付系统',
    description: '支付接口与退款流程自动化测试',
    updateTime: '2024-03-10 14:30',
    coverage: 80,
    tags: ['支付', '电商'],
    owner: null
  },
  {
    id: 2,
    name: '用户中心系统',
    description: '用户注册、登录、权限管理接口测试',
    updateTime: '2024-03-09 11:20',
    coverage: 65,
    tags: ['用户', '权限'],
    owner: null
  },
  {
    id: 3,
    name: '物流管理平台',
    description: '订单追踪与配送状态更新接口测试',
    updateTime: '2024-03-08 16:45',
    coverage: 42,
    tags: ['物流', '订单'],
    owner: null
  }
])

// 处理查看全部项目
const handleViewAllProjects = () => {
  toast.info('正在跳转到项目列表页面...')
  console.log('查看全部项目')
  // TODO: 导航到项目列表页面
}

// 处理项目操作
const handleProjectAction = ({ command, project }) => {
  console.log('项目操作:', command, project)
  // TODO: 根据命令执行相应操作
}

// 处理创建项目
const handleCreateProject = () => {
  toast.info('正在跳转到项目创建页面...')
  console.log('创建新项目')
  // TODO: 导航到项目创建页面
}

// 处理时间范围变化
const handleTimeRangeChange = async (value) => {
  timeRange.value = value
  toast.info('正在更新图表数据...')

  try {
    // 模拟重新加载数据
    await new Promise(resolve => setTimeout(resolve, 800))
    toast.success('图表数据已更新')
  } catch (error) {
    toast.error('更新图表数据失败')
  }

  console.log('时间范围变化:', value)
}

// 系统资源数据（示例，可改为从 API 获取）
const resourceData = computed(() => {
  if (loadingResources.value) return []
  return [
    { label: 'CPU使用率', value: '28%', percent: 28, color: 'linear-gradient(90deg, #67c23a 28%, #f0f0f0 28%)' },
    { label: '内存使用率', value: '45%', percent: 45, color: 'linear-gradient(90deg, #409eff 45%, #f0f0f0 45%)' },
    { label: '磁盘空间', value: '62%', percent: 62, color: 'linear-gradient(90deg, #e6a23c 62%, #f0f0f0 62%)' }
  ]
})

// 最近活动数据（示例）
const recentActivities = computed(() => {
  if (loadingActivities.value) return []
  return [
    { id: 1, time: '10:30', title: 'API接口自动化测试执行', desc: '成功执行了支付系统的20个测试用例', origin: '系统自动' },
    { id: 2, time: '09:15', title: '新建测试用例', desc: '用户中心-权限校验接口测试用例', origin: '李测试' },
    { id: 3, time: '昨天', title: '系统部署更新', desc: '自动化测试引擎升级至v2.4.5', origin: '系统管理员' },
    { id: 4, time: '昨天', title: '接口变更检测', desc: '检测到用户服务3个接口参数变更', origin: '变更监控' },
    { id: 5, time: '3天前', title: '定时测试任务执行失败', desc: '物流系统接口连接超时', origin: '系统自动' }
  ]
})

const handleViewMoreActivities = () => {
  toast.info('正在跳转到活动历史页面...')
  console.log('查看更多活动')
  // TODO: 跳转到活动详情或历史页面
}

// 模拟数据加载
const loadProjects = async () => {
  loadingProjects.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1500))
    // 这里可以调用实际的API
  } catch (error) {
    toast.error('加载项目数据失败')
    console.error('Load projects error:', error)
  } finally {
    loadingProjects.value = false
  }
}

const loadResources = async () => {
  loadingResources.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    // 这里可以调用实际的API
  } catch (error) {
    toast.error('加载资源数据失败')
    console.error('Load resources error:', error)
  } finally {
    loadingResources.value = false
  }
}

const loadActivities = async () => {
  loadingActivities.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1200))
    // 这里可以调用实际的API
  } catch (error) {
    toast.error('加载活动数据失败')
    console.error('Load activities error:', error)
  } finally {
    loadingActivities.value = false
  }
}

// 页面加载时获取数据
onMounted(async () => {
  loading.value = true
  toast.info('正在加载首页数据...')

  try {
    // 并行加载数据
    await Promise.all([
      loadProjects(),
      loadResources(),
      loadActivities()
    ])

    toast.success('数据加载完成')
  } catch (error) {
    toast.error('数据加载失败，请刷新页面重试')
  } finally {
    loading.value = false
  }
})

const handleViewTasks = () => {
  console.log('查看待处理任务')
  toast.info('正在跳转到任务管理页面...')
  // TODO: 跳转到任务管理页面
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
