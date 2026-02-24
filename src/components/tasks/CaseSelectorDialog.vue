<template>
  <el-dialog
    :model-value="visible"
    title="选择测试用例"
    width="900px"
    :close-on-click-modal="false"
    @open="handleOpen"
    @close="handleClose"
  >
    <div class="case-selector">
      <div class="selector-header">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索用例名称"
          clearable
          style="width: 300px"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <div class="stats">
          已选择 {{ selectedCases.length }} 个用例
        </div>
      </div>

      <!-- 树形结构展示 -->
      <div class="tree-container" v-loading="loading">
        <!-- 使用 div 代替 el-collapse，避免展开冲突 -->
        <div class="module-list">
          <div
            v-for="module in filteredTreeData"
            :key="module.id"
            class="module-item"
          >
            <!-- 模块标题 -->
            <div 
              class="module-header" 
              @click="toggleModuleExpand(module)"
            >
              <el-icon>
                <ArrowRight v-if="!module.expanded" />
                <ArrowDown v-else />
              </el-icon>
              <el-icon><Folder /></el-icon>
              <span class="module-name">{{ module.name }}</span>
              <el-tag size="small" type="info">{{ module.apiCount }} 个接口</el-tag>
            </div>

            <!-- 接口列表 -->
            <div v-if="module.expanded" class="api-list">
              <div
                v-for="api in module.apis"
                :key="api.id"
                class="api-item"
              >
                <div class="api-header" @click.stop="toggleApiCases(api, module)">
                  <el-icon>
                    <ArrowRight v-if="!api.expanded" />
                    <ArrowDown v-else />
                  </el-icon>
                  <el-tag :type="getMethodType(api.method)" size="small">
                    {{ api.method }}
                  </el-tag>
                  <span class="api-name">{{ api.name }}</span>
                  <span class="api-path">{{ api.path }}</span>
                  <el-tag size="small" type="info">{{ api.caseCount }} 个用例</el-tag>
                </div>

                <!-- 测试用例列表 -->
                <div v-if="api.expanded" class="case-list">
                  <div
                    v-for="caseItem in api.cases"
                    :key="caseItem.id"
                    class="case-item"
                    :class="{ 'is-selected': isSelected(caseItem.id) }"
                  >
                    <div class="case-info">
                      <span class="case-name">{{ caseItem.name }}</span>
                      <el-tag size="small" type="info">{{ caseItem.status }}</el-tag>
                    </div>
                    <el-button
                      :type="isSelected(caseItem.id) ? 'danger' : 'primary'"
                      size="small"
                      @click.stop="toggleCaseSelection(caseItem, module, api)"
                    >
                      {{ isSelected(caseItem.id) ? '移除' : '添加' }}
                    </el-button>
                  </div>
                  <div v-if="!api.cases || api.cases.length === 0" class="empty-cases">
                    该接口下暂无测试用例
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="filteredTreeData.length === 0 && !loading" class="empty-state">
          <div class="empty-icon">🔍</div>
          <div class="empty-text">未找到匹配的测试用例</div>
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="$emit('cancel')">关闭</el-button>
      <el-button type="primary" @click="handleConfirm">
        确定 ({{ selectedCases.length }})
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, Folder, ArrowRight, ArrowDown } from '@element-plus/icons-vue'
import { getModulesByProject } from '../../api/project'
import { getApisByModule } from '../../api/project'
import { getTestCasesByApi } from '../../api/testCase'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  projectId: {
    type: [Number, String],
    default: null
  },
  selectedCases: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:selectedCases', 'update:visible', 'cancel'])

const searchKeyword = ref('')
const loading = ref(false)
const treeData = ref([])

// 切换模块展开状态
const toggleModuleExpand = (module) => {
  module.expanded = !module.expanded
}

// 切换接口用例展开状态
const toggleApiCases = async (api, module) => {
  api.expanded = !api.expanded
  // 加载该接口的用例
  if (api.expanded && (!api.cases || api.cases.length === 0)) {
    await loadApiCases(api, module)
  }
}

// 计算属性：过滤树形数据
const filteredTreeData = computed(() => {
  if (!searchKeyword.value) return treeData.value
  
  const keyword = searchKeyword.value.toLowerCase()
  
  // 递归过滤
  const filterNode = (modules) => {
    return modules.reduce((result, module) => {
      // 过滤模块名称
      const moduleMatch = module.name.toLowerCase().includes(keyword)
      
      // 过滤接口
      const filteredApis = module.apis ? module.apis.filter(api => {
        const apiMatch = api.name.toLowerCase().includes(keyword) || 
                         api.path.toLowerCase().includes(keyword)
        // 过滤用例
        const filteredCases = api.cases ? api.cases.filter(c => 
          c.name.toLowerCase().includes(keyword)
        ) : []
        api.cases = filteredCases
        return apiMatch || filteredCases.length > 0
      }) : []
      
      module.apis = filteredApis
      
      if (moduleMatch || filteredApis.length > 0) {
        result.push(module)
      }
      return result
    }, [])
  }
  
  return filterNode(treeData.value)
})

// 获取 HTTP 方法对应的类型
const getMethodType = (method) => {
  const methodMap = {
    'GET': 'success',
    'POST': 'primary',
    'PUT': 'warning',
    'DELETE': 'danger',
    'PATCH': 'info'
  }
  return methodMap[method?.toUpperCase()] || 'info'
}

// 检查用例是否已选择
const isSelected = (caseId) => {
  return props.selectedCases.some(item => item.id === caseId)
}

// 加载接口的测试用例
const loadApiCases = async (api, module) => {
  try {
    const response = await getTestCasesByApi(api.id, { pageSize: 1000 })
    const casesList = response.data?.items || response.data || []
    api.cases = casesList.map(item => ({
      id: item.id || item.caseId,
      name: item.name || item.caseName,
      status: item.status || '正常'
    }))
    api.caseCount = api.cases.length
  } catch (error) {
    console.error(`加载接口 ${api.id} 的用例失败:`, error)
    api.cases = []
    api.caseCount = 0
  }
}

// 切换用例选择
const toggleCaseSelection = (caseItem, module, api) => {
  const newSelected = [...props.selectedCases]
  const index = newSelected.findIndex(item => item.id === caseItem.id)

  if (index > -1) {
    newSelected.splice(index, 1)
  } else {
    // 添加用例时，同时保存模块和接口信息
    newSelected.push({
      ...caseItem,
      moduleId: module.id,
      moduleName: module.name,
      apiId: api.id,
      apiName: api.name
    })
  }

  emit('update:selectedCases', newSelected)
}

// 加载树形数据
const loadTreeData = async () => {
  if (!props.projectId) {
    ElMessage.warning('请先选择所属项目')
    emit('cancel')
    return
  }

  try {
    loading.value = true
    treeData.value = []
    
    // 1. 获取项目下的模块列表
    const moduleResponse = await getModulesByProject(props.projectId, { pageSize: 1000 })
    
    // 处理返回格式：可能是 { code: 1, data: { modules: [...] } }
    let modules = []
    if (moduleResponse.code === 1) {
      modules = moduleResponse.data?.modules || moduleResponse.data || []
    } else {
      // 如果没有 code 字段，直接使用 data
      modules = moduleResponse.data?.modules || moduleResponse.data || []
    }
    
    // 2. 加载每个模块下的接口
    for (const module of modules) {
      // 模块ID可能是 moduleId 或 module_id
      const moduleId = module.moduleId || module.module_id || module.id
      if (!moduleId) {
        console.warn('模块缺少ID:', module)
        continue
      }
      
      const apiList = {
        id: moduleId,
        name: module.name,
        apiCount: 0,
        apis: []
      }
      
      try {
        const apiResponse = await getApisByModule(moduleId)
        // 处理接口返回格式：分页格式 { code: 1, data: { items: [...] } }
        let apis = []
        if (apiResponse.code === 1) {
          apis = apiResponse.data?.items || apiResponse.data || []
        } else {
          apis = apiResponse.data?.items || apiResponse.data || []
        }
        
        apiList.apis = apis.map(api => ({
          id: api.id || api.api_id,
          name: api.name,
          method: api.method,
          path: api.path,
          caseCount: 0,
          cases: []
        }))
        apiList.apiCount = apiList.apis.length
      } catch (error) {
        console.error(`加载模块 ${module.name} 的接口失败:`, error)
      }
      
      treeData.value.push(apiList)
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载模块和接口数据失败')
  } finally {
    loading.value = false
  }
}

// 处理对话框打开
const handleOpen = () => {
  if (props.projectId) {
    loadTreeData()
  }
}

// 处理对话框关闭
const handleClose = () => {
  emit('update:visible', false)
}

// 确认选择
const handleConfirm = () => {
  emit('cancel')
}

// 监听项目变化
watch(() => props.projectId, (newVal) => {
  if (newVal && props.visible) {
    loadTreeData()
  }
})
</script>

<style scoped>
.case-selector {
  max-height: 600px;
}

.selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

.stats {
  font-size: 14px;
  color: #606266;
}

.tree-container {
  max-height: 500px;
  overflow-y: auto;
}

.module-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.module-item {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
}

.module-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background-color: #f5f7fa;
  cursor: pointer;
  transition: background-color 0.2s;
}

.module-header:hover {
  background-color: #eef1f5;
}

.module-title {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.module-name {
  flex: 1;
  font-weight: 500;
}

.api-list {
  padding-left: 20px;
}

.api-item {
  margin-bottom: 12px;
}

.api-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.api-header:hover {
  background-color: #eef1f5;
}

.api-name {
  font-weight: 500;
  color: #303133;
}

.api-path {
  flex: 1;
  color: #909399;
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.case-list {
  padding-left: 32px;
  margin-top: 8px;
}

.case-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  margin-bottom: 6px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background-color: #fafafa;
  transition: all 0.2s ease;
}

.case-item:hover {
  border-color: #c0c4cc;
}

.case-item.is-selected {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.case-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.case-name {
  font-weight: 500;
  color: #303133;
}

.empty-cases {
  text-align: center;
  padding: 16px;
  color: #909399;
  font-size: 13px;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-text {
  color: #909399;
  font-size: 14px;
}

:deep(.el-collapse-item__header) {
  font-size: 14px;
}

:deep(.el-collapse-item__content) {
  padding-bottom: 8px;
}
</style>
