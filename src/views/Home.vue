<template>
  <transition name="page-fade" appear>
    <div class="home-page">
      <!-- 欢迎区域 -->
      <transition name="welcome-slide" appear>
        <WelcomeSection />
      </transition>

      <!-- 指标卡片区域 -->
      <transition name="summary-fade" appear>
        <div class="summary-section">
          <transition name="summary-text-slide" appear>
            <div class="summary-text">
              您有5个待处理任务,2个高优先级问题待解决
            </div>
          </transition>
          <MetricsGrid :metrics="metricsData" />
        </div>
      </transition>

      <transition name="content-grid-fade" appear>
        <div class="content-grid">
          <transition name="left-section-slide" appear>
            <div class="left-section glass-card rounded-xl">
              <RecentProjects
                :projects="recentProjects"
                @view-all="handleViewAllProjects"
                @project-action="handleProjectAction"
              />
            </div>
          </transition>

          <transition name="right-section-slide" appear>
            <div class="right-section glass-card rounded-xl">
              <TestExecutionChart
                :time-range="timeRange"
                @time-range-change="handleTimeRangeChange"
              />
            </div>
          </transition>
        </div>
      </transition>

      <transition name="bottom-grid-fade" appear>
        <div class="bottom-grid">
          <transition name="bottom-left-slide" appear>
            <div class="bottom-left">
              <h3>系统资源状态</h3>
              <ResourceList :resources="resourceData" />
            </div>
          </transition>

          <transition name="bottom-right-slide" appear>
            <div class="bottom-right">
              <RecentActivities :activities="recentActivities" @view-more="handleViewMoreActivities" />
            </div>
          </transition>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed } from 'vue'
import WelcomeSection from '@/components/home/WelcomeSection.vue'
import MetricsGrid from '@/components/home/MetricsGrid.vue'
import RecentProjects from '@/components/home/RecentProjects.vue'
import TestExecutionChart from '@/components/home/TestExecutionChart.vue'
import ResourceList from '@/components/home/ResourceList.vue'
import RecentActivities from '@/components/home/RecentActivities.vue'

const timeRange = ref('7days')

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
  console.log('查看全部项目')
  // TODO: 导航到项目列表页面
}

// 处理项目操作
const handleProjectAction = ({ command, project }) => {
  console.log('项目操作:', command, project)
  // TODO: 根据命令执行相应操作
}

// 处理时间范围变化
const handleTimeRangeChange = (value) => {
  timeRange.value = value
  // TODO: 根据时间范围重新加载图表数据
  console.log('时间范围变化:', value)
}

// 系统资源数据（示例，可改为从 API 获取）
const resourceData = computed(() => ([
  { label: 'CPU使用率', value: '28%', percent: 28, color: 'linear-gradient(90deg, #67c23a 28%, #f0f0f0 28%)' },
  { label: '内存使用率', value: '45%', percent: 45, color: 'linear-gradient(90deg, #409eff 45%, #f0f0f0 45%)' },
  { label: '磁盘空间', value: '62%', percent: 62, color: 'linear-gradient(90deg, #e6a23c 62%, #f0f0f0 62%)' }
]))

// 最近活动数据（示例）
const recentActivities = computed(() => ([
  { id: 1, time: '10:30', title: 'API接口自动化测试执行', desc: '成功执行了支付系统的20个测试用例', origin: '系统自动' },
  { id: 2, time: '09:15', title: '新建测试用例', desc: '用户中心-权限校验接口测试用例', origin: '李测试' },
  { id: 3, time: '昨天', title: '系统部署更新', desc: '自动化测试引擎升级至v2.4.5', origin: '系统管理员' },
  { id: 4, time: '昨天', title: '接口变更检测', desc: '检测到用户服务3个接口参数变更', origin: '变更监控' },
  { id: 5, time: '3天前', title: '定时测试任务执行失败', desc: '物流系统接口连接超时', origin: '系统自动' }
]))

const handleViewMoreActivities = () => {
  console.log('查看更多活动')
  // TODO: 跳转到活动详情或历史页面
}
</script>

<style scoped>
.home-page {
  max-width: 1200px;
  margin: 0 auto;
}

.summary-section {
  margin-bottom: 32px;
}

.summary-text {
  font-size: 14px;
  color: #606266;
  margin-bottom: 20px;
  padding: 0 4px;
  font-weight: 500;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
}

.left-section {
  min-height: 400px;
}

/* 响应式 */
@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

.right-section {
  min-height: 400px;
}

.bottom-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.bottom-left h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  color: #303133;
}

.resource-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.resource-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: #fff;
  border-radius: 4px;
}

.resource-label {
  font-size: 14px;
  color: #606266;
  min-width: 80px;
}

.resource-value {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  min-width: 50px;
}

.resource-chart {
  flex: 1;
  height: 20px;
  border-radius: 10px;
  background: #f0f0f0;
}

.cpu-chart {
  background: linear-gradient(90deg, #67c23a 28%, #f0f0f0 28%);
}

.memory-chart {
  background: linear-gradient(90deg, #409eff 45%, #f0f0f0 45%);
}

.disk-chart {
  background: linear-gradient(90deg, #e6a23c 62%, #f0f0f0 62%);
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.activity-item {
  display: flex;
  gap: 15px;
  padding: 15px;
  background: #fff;
  border-radius: 4px;
}

.activity-time {
  font-size: 12px;
  color: #909399;
  min-width: 50px;
}

.activity-content {
  flex: 1;
}

.activity-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 5px;
}

.activity-desc {
  font-size: 13px;
  color: #606266;
  margin-bottom: 5px;
}

.activity-origin {
  font-size: 12px;
  color: #909399;
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

/* 摘要文字滑入 */
.summary-text-slide-enter-active,
.summary-text-slide-leave-active {
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.summary-text-slide-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.summary-text-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* 内容网格淡入 */
.content-grid-fade-enter-active,
.content-grid-fade-leave-active {
  transition: all 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.content-grid-fade-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.content-grid-fade-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

/* 左侧区域滑入 */
.left-section-slide-enter-active,
.left-section-slide-leave-active {
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.left-section-slide-enter-from {
  opacity: 0;
  transform: translateX(-40px);
}

.left-section-slide-leave-to {
  opacity: 0;
  transform: translateX(-40px);
}

/* 右侧区域滑入 */
.right-section-slide-enter-active,
.right-section-slide-leave-active {
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  transition-delay: 0.2s;
}

.right-section-slide-enter-from {
  opacity: 0;
  transform: translateX(40px);
}

.right-section-slide-leave-to {
  opacity: 0;
  transform: translateX(40px);
}

/* 底部网格淡入 */
.bottom-grid-fade-enter-active,
.bottom-grid-fade-leave-active {
  transition: all 1.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.bottom-grid-fade-enter-from {
  opacity: 0;
  transform: translateY(40px);
}

.bottom-grid-fade-leave-to {
  opacity: 0;
  transform: translateY(40px);
}

/* 底部左侧滑入 */
.bottom-left-slide-enter-active,
.bottom-left-slide-leave-active {
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  transition-delay: 0.1s;
}

.bottom-left-slide-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.bottom-left-slide-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* 底部右侧滑入 */
.bottom-right-slide-enter-active,
.bottom-right-slide-leave-active {
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  transition-delay: 0.3s;
}

.bottom-right-slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.bottom-right-slide-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
