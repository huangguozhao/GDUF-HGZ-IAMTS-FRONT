<template>
  <div class="level-stats-panel">
    <!-- 头部 -->
    <div class="stats-header">
      <div class="header-left">
        <span class="level-icon">{{ getLevelIcon() }}</span>
        <h2 class="level-title">{{ node.name }}</h2>
      </div>
      <div class="header-right">
        <el-button 
          type="success" 
          size="small" 
          :icon="VideoPlay"
          @click="handleExecuteTest"
          :loading="executing"
        >
          执行测试
        </el-button>
        <el-button 
          v-if="level === 'project'" 
          size="small" 
          :icon="Setting"
          @click="handleConfigEnvironment"
        >
          环境配置
        </el-button>
        <el-button size="small" :icon="Edit" @click="$emit('edit', node)">
          编辑
        </el-button>
        <el-button size="small" type="danger" :icon="Delete" @click="$emit('delete', node)">
          删除
        </el-button>
      </div>
    </div>

    <!-- 描述 -->
    <div class="stats-description" v-if="node.description">
      <div class="section-title">描述</div>
      <p>{{ node.description }}</p>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <div class="stat-label">{{ level === 'project' ? '模块数' : '接口数' }}</div>
          <div class="stat-value">{{ getChildCount() }}</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">📝</div>
        <div class="stat-content">
          <div class="stat-label">用例总数</div>
          <div class="stat-value">{{ getTotalCases() }}</div>
        </div>
      </div>

      <div class="stat-card success">
        <div class="stat-icon">✓</div>
        <div class="stat-content">
          <div class="stat-label">通过</div>
          <div class="stat-value">{{ getPassedCount() }}</div>
        </div>
      </div>

      <div class="stat-card error">
        <div class="stat-icon">✗</div>
        <div class="stat-content">
          <div class="stat-label">失败</div>
          <div class="stat-value">{{ getFailedCount() }}</div>
        </div>
      </div>

      <div class="stat-card warning">
        <div class="stat-icon">⊙</div>
        <div class="stat-content">
          <div class="stat-label">未执行</div>
          <div class="stat-value">{{ getNotExecutedCount() }}</div>
        </div>
      </div>
    </div>

    <!-- 子项列表 -->
    <div class="children-list">
      <div class="section-title">
        {{ level === 'project' ? '模块列表' : '接口列表' }}
        <el-button size="small" type="primary" @click="handleAdd">
          + 新建{{ level === 'project' ? '模块' : '接口' }}
        </el-button>
      </div>

      <div class="list-table">
        <div class="table-header">
          <div class="col col-name">名称</div>
          <div class="col col-count" v-if="level === 'project'">接口数</div>
          <div class="col col-count">用例数</div>
          <div class="col col-status">通过率</div>
          <div class="col col-time">最后执行</div>
          <div class="col col-actions">操作</div>
        </div>

    <div class="table-body">
      <!-- 虚拟滚动容器：使用 RecycleScroller 渲染大量子项 -->
      <RecycleScroller
        v-if="children && children.length > 0"
        :items="children"
        :item-size="64"
        class="virtual-list"
        key-field="id"
        v-slot="{ item: child, index }"
      >
        <div
          :key="child.id"
          class="table-row"
          role="button"
          :aria-label="`跳转到 ${child.name}`"
          @click="handleSelectChild(child)"
        >
          <div class="col col-name">
            <span class="child-icon" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" focusable="false">
                <path d="M3 7C3 5.89543 3.89543 5 5 5H9L11 7H19C20.1046 7 21 7.89543 21 9V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V7Z" fill="#FFD666"/>
                <path d="M9 5L11 7H19C20.1046 7 21 7.89543 21 9V9V9" stroke="#F0A000" stroke-width="0" />
              </svg>
            </span>
            <span class="child-name">{{ child.name }}</span>
          </div>
          <div class="col col-count" v-if="level === 'project'">
            {{ child.apis?.length || 0 }}
          </div>
          <div class="col col-count">
            {{ getChildCaseCount(child) }}
          </div>
          <div class="col col-status" role="progressbar" :aria-valuenow="getPassRate(child)" :aria-valuemin="0" :aria-valuemax="100">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: getPassRate(child) + '%' }"></div>
            </div>
            <span class="progress-text">{{ getPassRate(child) }}%</span>
          </div>
          <div class="col col-time">
            {{ getLastExecutedTime(child) }}
          </div>
          <div class="col col-actions" @click.stop>
            <el-button size="small" text @click="$emit('edit-child', child)">编辑</el-button>
            <el-button size="small" text type="danger" @click="$emit('delete-child', child)">删除</el-button>
          </div>
        </div>
      </RecycleScroller>

      <div v-else class="empty-row">
        暂无数据
      </div>
    </div>
      </div>
    </div>

    <!-- 执行配置对话框 -->
    <ExecuteConfigDialog
      v-model="executeDialogVisible"
      :targetType="level"
      :targetId="node?.project_id || node?.projectId || node?.module_id || node?.moduleId || node?.id"
      :targetName="node?.name || node?.project_name || node?.module_name || ''"
      :caseCount="statistics?.caseCount || 0"
      :projectId="level === 'project' ? (node?.project_id || node?.projectId || node?.id) : (node?.project_id || node?.projectId)"
      @execute="handleConfirmExecute"
    />
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { RecycleScroller } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import { Setting, Edit, Delete, VideoPlay } from '@element-plus/icons-vue'
import { getProjectStatistics, getModuleStatistics } from '@/api/project'
import { executeModuleTest, executeProjectTest } from '@/api/testCase'
import { ElMessage } from 'element-plus'
import ExecuteConfigDialog from './ExecuteConfigDialog.vue'
import { donutOption, sparklineOption } from '@/utils/chartTheme'

const props = defineProps({
  node: {
    type: Object,
    required: true
  },
  level: {
    type: String, // 'project' | 'module'
    required: true
  }
})

const emit = defineEmits(['edit', 'delete', 'add', 'edit-child', 'delete-child', 'select-child', 'config-environment', 'execute-test'])

// 执行配置对话框
const executeDialogVisible = ref(false)
const executing = ref(false)

// 打开执行配置对话框
const handleExecuteTest = () => {
  executeDialogVisible.value = true
}

// 执行测试
const handleConfirmExecute = async (config) => {
  executing.value = true
  try {
    let response
    if (config.targetType === 'project') {
      response = await executeProjectTest(config.targetId, {
        environment: config.environment,
        executionType: config.executionType,
        executionStrategy: config.executionStrategy,
        priorityFilter: config.priorityFilter,
        tagFilter: config.tagFilter,
        async: config.async
      })
    } else if (config.targetType === 'module') {
      response = await executeModuleTest(config.targetId, {
        environment: config.environment,
        executionType: config.executionType,
        executionStrategy: config.executionStrategy,
        priorityFilter: config.priorityFilter,
        tagFilter: config.tagFilter,
        async: config.async
      })
    }
    
    if (response && response.code === 1) {
      ElMessage.success('测试执行完成')
      executeDialogVisible.value = false
      emit('execute-test', response.data)
      // 刷新统计数据
      if (props.level === 'project') {
        loadProjectStatistics()
      } else {
        loadModuleStatistics()
      }
    } else {
      ElMessage.error(response?.msg || '测试执行失败')
    }
  } catch (error) {
    console.error('执行测试失败:', error)
    ElMessage.error(error.message || '执行测试失败')
  } finally {
    executing.value = false
  }
}

// 环境配置对话框
const envDialogVisible = ref(false)

// 项目统计数据
const projectStats = ref(null)
const loadingStats = ref(false)

// 模块统计数据
const moduleStats = ref(null)
const loadingModuleStats = ref(false)

// 打开环境配置
const handleConfigEnvironment = () => {
  emit('config-environment', props.node)
}

// 加载项目统计数据
const loadProjectStatistics = async () => {
  if (props.level !== 'project' || !props.node) return
  
  const projectId = props.node.project_id || props.node.projectId || props.node.id
  if (!projectId) {
    console.warn('无法获取项目ID')
    return
  }
  
  try {
    loadingStats.value = true
    console.log('开始加载项目统计数据，项目ID:', projectId)
    
    const response = await getProjectStatistics(projectId)
    console.log('项目统计数据响应:', response)
    
    if (response.code === 1 && response.data) {
      projectStats.value = response.data
      console.log('项目统计数据已加载:', projectStats.value)
    } else {
      console.error('获取项目统计数据失败:', response.msg)
    }
  } catch (error) {
    console.error('加载项目统计数据失败:', error)
  } finally {
    loadingStats.value = false
  }
}

// 加载模块统计数据
const loadModuleStatistics = async () => {
  if (props.level !== 'module' || !props.node) return
  
  const moduleId = props.node.module_id || props.node.moduleId || props.node.id
  if (!moduleId) {
    console.warn('无法获取模块ID')
    return
  }
  
  try {
    loadingModuleStats.value = true
    console.log('开始加载模块统计数据，模块ID:', moduleId)
    
    const response = await getModuleStatistics(moduleId)
    console.log('模块统计数据响应:', response)
    
    if (response.code === 1 && response.data) {
      moduleStats.value = response.data
      console.log('模块统计数据已加载:', moduleStats.value)
    } else {
      console.error('获取模块统计数据失败:', response.msg)
    }
  } catch (error) {
    console.error('加载模块统计数据失败:', error)
  } finally {
    loadingModuleStats.value = false
  }
}

// 监听 props.node 变化，重新加载统计数据
watch(
  () => props.node,
  (newNode) => {
    if (newNode) {
      if (props.level === 'project') {
        loadProjectStatistics()
      } else if (props.level === 'module') {
        loadModuleStatistics()
      }
    }
  },
  { immediate: true }
)

const children = computed(() => {
  if (props.level === 'project') {
    return props.node.modules || []
  } else {
    return props.node.apis || []
  }
})

// Chart refs & instances
const passedChart = ref(null)
const failedChart = ref(null)
let passedChartInstance = null
let failedChartInstance = null

const renderCharts = () => {
  const total = getTotalCases()
  const passed = getPassedCount()
  const failed = getFailedCount()
  const passedRate = total > 0 ? Math.round((passed / total) * 100) : 0
  const failedRate = total > 0 ? Math.round((failed / total) * 100) : 0

  if (passedChart.value) {
    try { passedChartInstance?.dispose() } catch (e) {}
    passedChartInstance = echarts.init(passedChart.value)
    passedChartInstance.setOption(donutOption(passedRate))
  }

  if (failedChart.value) {
    try { failedChartInstance?.dispose() } catch (e) {}
    failedChartInstance = echarts.init(failedChart.value)
    failedChartInstance.setOption(donutOption(failedRate))
  }
}

onMounted(() => {
  renderCharts()
})

watch([() => projectStats.value, () => children.value.length], () => {
  renderCharts()
})

onBeforeUnmount(() => {
  try { passedChartInstance?.dispose(); failedChartInstance?.dispose() } catch (e) {}
})

const getLevelIcon = () => {
  return props.level === 'project' ? '📁' : '📂'
}

const getChildCount = () => {
  // 如果是项目层级且有统计数据，使用后端数据
  if (props.level === 'project' && projectStats.value) {
    return projectStats.value.moduleCount || 0
  }
  // 如果是模块层级且有统计数据，使用后端数据
  if (props.level === 'module' && moduleStats.value) {
    return moduleStats.value.apiCount || 0
  }
  return children.value.length
}

const getTotalCases = () => {
  // 如果是项目层级且有统计数据，使用后端数据
  if (props.level === 'project' && projectStats.value) {
    return projectStats.value.testCaseCount || 0
  }
  // 如果是模块层级且有统计数据，使用后端数据
  if (props.level === 'module' && moduleStats.value) {
    return moduleStats.value.testCaseCount || 0
  }
  
  // 否则使用本地计算
  let total = 0
  if (props.level === 'project') {
    props.node.modules?.forEach(module => {
      module.apis?.forEach(api => {
        total += api.cases?.length || 0
      })
    })
  } else {
    props.node.apis?.forEach(api => {
      total += api.cases?.length || 0
    })
  }
  return total
}

const getPassedCount = () => {
  // 如果是项目层级且有统计数据，使用后端数据
  if (props.level === 'project' && projectStats.value) {
    return projectStats.value.passedCount || 0
  }
  // 如果是模块层级且有统计数据，使用后端数据
  if (props.level === 'module' && moduleStats.value) {
    return moduleStats.value.passedCount || 0
  }
  
  // 否则使用本地计算
  let count = 0
  if (props.level === 'project') {
    props.node.modules?.forEach(module => {
      module.apis?.forEach(api => {
        api.cases?.forEach(c => {
          if (c.status === 'passed') count++
        })
      })
    })
  } else {
    props.node.apis?.forEach(api => {
      api.cases?.forEach(c => {
        if (c.status === 'passed') count++
      })
    })
  }
  return count
}

const getFailedCount = () => {
  // 如果是项目层级且有统计数据，使用后端数据
  if (props.level === 'project' && projectStats.value) {
    return projectStats.value.failedCount || 0
  }
  // 如果是模块层级且有统计数据，使用后端数据
  if (props.level === 'module' && moduleStats.value) {
    return moduleStats.value.failedCount || 0
  }
  
  // 否则使用本地计算
  let count = 0
  if (props.level === 'project') {
    props.node.modules?.forEach(module => {
      module.apis?.forEach(api => {
        api.cases?.forEach(c => {
          if (c.status === 'failed') count++
        })
      })
    })
  } else {
    props.node.apis?.forEach(api => {
      api.cases?.forEach(c => {
        if (c.status === 'failed') count++
      })
    })
  }
  return count
}

const getNotExecutedCount = () => {
  // 如果是项目层级且有统计数据，使用后端数据
  if (props.level === 'project' && projectStats.value) {
    return projectStats.value.notExecutedCount || 0
  }
  // 如果是模块层级且有统计数据，使用后端数据
  if (props.level === 'module' && moduleStats.value) {
    return moduleStats.value.notExecutedCount || 0
  }
  
  // 否则使用本地计算
  let count = 0
  if (props.level === 'project') {
    props.node.modules?.forEach(module => {
      module.apis?.forEach(api => {
        api.cases?.forEach(c => {
          if (c.status === 'not_executed') count++
        })
      })
    })
  } else {
    props.node.apis?.forEach(api => {
      api.cases?.forEach(c => {
        if (c.status === 'not_executed') count++
      })
    })
  }
  return count
}

const getChildCaseCount = (child) => {
  if (props.level === 'project') {
    let total = 0
    child.apis?.forEach(api => {
      total += api.cases?.length || 0
    })
    return total
  } else {
    return child.cases?.length || 0
  }
}

const getPassRate = (child) => {
  const cases = getAllCases(child)
  if (cases.length === 0) return 0
  const passed = cases.filter(c => c.status === 'passed').length
  return Math.round((passed / cases.length) * 100)
}

const getAllCases = (child) => {
  const cases = []
  if (props.level === 'project') {
    child.apis?.forEach(api => {
      cases.push(...(api.cases || []))
    })
  } else {
    cases.push(...(child.cases || []))
  }
  return cases
}

const getLastExecutedTime = (child) => {
  const cases = getAllCases(child)
  if (cases.length === 0) return '-'
  
  const times = cases
    .map(c => c.last_executed_time)
    .filter(Boolean)
    .sort()
    .reverse()
  
  return times[0] || '-'
}

const handleAdd = () => {
  emit('add', props.node)
}

const handleSelectChild = (child) => {
  emit('select-child', child)
}
</script>

<style scoped>
.level-stats-panel {
  padding: 24px;
  height: 100%;
  overflow-y: auto;
  background: white;
}

/* 头部 */
.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e4e7ed;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.level-icon {
  font-size: 32px;
}

.level-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

/* 描述 */
.stats-description {
  margin-bottom: 24px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 4px;
}

.stats-description p {
  margin: 0;
  color: #606266;
  line-height: 1.6;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 统计卡片 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  margin-bottom: 32px;
}

.stat-card {
  padding: 20px;
  background: var(--color-article, #ffffffcc);
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s;
}

.stat-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.stat-card.success {
  background: #e6f4ff; /* 轻薄蓝背景 */
  border: 1px solid #b3d8ff;
}

.stat-card.error {
  background: #fef0f0;
  border: 1px solid #fbc4c4;
}

.stat-card.warning {
  background: #fdf6ec;
  border: 1px solid #f5dab1;
}

.stat-icon {
  font-size: 32px;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 13px;
  color: #909399;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-primary, #303133);
}

.stat-chart {
  width: 72px;
  height: 48px;
  margin-left: 12px;
}

/* 列表表格 */
.list-table {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
}

.table-header {
  display: flex;
  background: #fafafa;
  border-bottom: 1px solid #e4e7ed;
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 600;
  color: #909399;
}

.table-body {
  background: white;
}

.table-row {
  display: flex;
  padding: 16px;
  border-bottom: 1px solid #e4e7ed;
  cursor: pointer;
  transition: all 0.3s;
}

.table-row:last-child {
  border-bottom: none;
}

.table-row:hover {
  background: #f5f7fa;
}

.col {
  padding: 0 8px;
}

.col-name {
  flex: 2;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #303133;
}

.child-icon {
  font-size: 16px;
}

.col-count {
  flex: 0 0 80px;
  text-align: center;
  font-size: 14px;
  color: #606266;
}

.col-status {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #e4e7ed;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(to right, #409eff, #7fbfff);
  transition: width 0.3s;
}

.progress-text {
  font-size: 13px;
  color: #606266;
  min-width: 40px;
}

.col-time {
  flex: 0 0 150px;
  font-size: 13px;
  color: #909399;
}

.col-actions {
  flex: 0 0 120px;
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.empty-row {
  padding: 40px;
  text-align: center;
  color: #909399;
  font-size: 14px;
}

/* 响应式 */
@media (max-width: 1400px) {
  .stats-cards {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 1000px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>

